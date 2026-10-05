import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { paymentProvider } from "./activeProvider";
import type { Quote } from "./quote";
import { isTerminal } from "./attemptStates";

export { isTerminal };

// The lifecycle of one attempt at paying for a booking.
//
// Everything that can change what a customer's money is doing goes through
// here, and there is exactly one routine that does it — `settleAttempt` —
// called identically by the browser's callback and by PayPal's webhook. That
// is the whole design. Two code paths that both "handle a payment" eventually
// disagree about one case, and the case they disagree about is always the one
// that costs money.
//
// The hard guarantees are not in this file. They are two partial unique
// indexes in 0022: one captured attempt per reservation, one attempt per
// PayPal order. This file is written assuming it will lose those races, and
// treats losing as a normal outcome rather than an error — the winner's row is
// the answer, and reporting it is correct.
//
// What is in this file is the ordering, which matters as much:
//
//   1. the attempt row exists before PayPal is asked for anything, so an order
//      we created but never recorded cannot happen;
//   2. nothing is believed because it arrived — the order is re-read from
//      PayPal and compared against the attempt before any state moves;
//   3. capture is committed before fulfilment is attempted, so an email that
//      fails cannot un-take money.

export type AttemptRow = {
  id: string;
  reservation_id: string;
  provider_order_id: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  quote: Quote;
  create_request_id: string;
  capture_request_id: string;
  capture_id: string | null;
  authorization_id: string | null;
  fulfilled_at: string | null;
  captured_at: string | null;
};

const SELECT =
  "id, reservation_id, provider_order_id, status, amount_cents, currency, quote, " +
  "create_request_id, capture_request_id, capture_id, authorization_id, fulfilled_at, captured_at";



export type CreateAttemptInput = {
  reservationId: string;
  reference: string;
  quote: Quote;
  description: string;
  returnUrl: string;
  cancelUrl: string;
};

export type CreateAttemptResult =
  | { ok: true; attempt: AttemptRow; orderId: string; clientId: string | null }
  | { ok: false; message: string };

/**
 * Opens an attempt and asks PayPal for an order against it.
 *
 * The row is written first, with its request ids, and the order is created
 * second using them. That ordering is the reason a PayPal order can never
 * exist that we have no record of: if the second step fails, there is a row in
 * `created` with no order id, which the sweep can see and close. The other
 * order — order first, row second — loses the order id on any crash in
 * between, and the money that follows it.
 */
export async function createAttempt(input: CreateAttemptInput): Promise<CreateAttemptResult> {
  const provider = paymentProvider();
  if (!provider.enabled) return { ok: false, message: "No payment provider is configured." };

  const supabase = createAdminSupabaseClient();
  const { data: attempt, error } = await supabase
    .from("payment_attempts")
    .insert({
      reservation_id: input.reservationId,
      provider: provider.name,
      amount_cents: input.quote.totalCents,
      currency: input.quote.currency,
      quote: input.quote,
      status: "created",
    })
    .select(SELECT)
    .single();

  if (error || !attempt) {
    console.error("payment attempt insert failed:", error);
    return { ok: false, message: "Could not open a payment." };
  }

  const row = attempt as unknown as AttemptRow;
  const hold = await provider.createHold({
    reference: input.reference,
    amountUsd: row.amount_cents / 100,
    description: input.description,
    returnUrl: input.returnUrl,
    cancelUrl: input.cancelUrl,
    // Per attempt, never per booking. PayPal replays the result of the first
    // call made with a given id for up to 45 days, so a booking-scoped key
    // would answer a genuine retry with the first attempt's failure.
    requestId: row.create_request_id,
  });

  if (!hold.ok) {
    await supabase
      .from("payment_attempts")
      .update({ status: "failed", failed_reason: hold.message, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ok: false, message: hold.message };
  }

  const { data: updated } = await supabase
    .from("payment_attempts")
    .update({ provider_order_id: hold.orderId, updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .select(SELECT)
    .single();

  return {
    ok: true,
    attempt: (updated ?? { ...row, provider_order_id: hold.orderId }) as unknown as AttemptRow,
    orderId: hold.orderId,
    clientId: provider.clientId,
  };
}

export type SettleOutcome =
  | { ok: true; state: "captured" | "authorized"; attempt: AttemptRow; alreadySettled: boolean }
  | { ok: false; reason: "unknown" | "terminal" | "pending" | "mismatch" | "provider"; message: string };

/**
 * Turns an approval into a recorded fact — the only routine that does.
 *
 * Called by the browser's callback, by the CHECKOUT.ORDER.APPROVED webhook,
 * and by the reconciliation sweep. All three hand it an order id; none of them
 * tells it what happened, because none of them knows. It asks PayPal.
 *
 * Safe to call any number of times, from any number of processes, in any
 * order. The second caller finds the attempt already captured and reports that,
 * which is the truth rather than an error.
 */
export async function settleAttempt(orderId: string): Promise<SettleOutcome> {
  const provider = paymentProvider();
  if (!provider.enabled) return { ok: false, reason: "provider", message: "No payment provider is configured." };

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("payment_attempts")
    .select(SELECT)
    .eq("provider_order_id", orderId)
    .maybeSingle();

  if (!data) {
    // An order we have no row for. It is not ours to settle, and guessing
    // which booking it belongs to is exactly the guess this design refuses.
    return { ok: false, reason: "unknown", message: "That payment does not match a booking we opened." };
  }
  const attempt = data as unknown as AttemptRow;

  if (attempt.status === "captured") {
    return { ok: true, state: "captured", attempt, alreadySettled: true };
  }
  if (isTerminal(attempt.status)) {
    return { ok: false, reason: "terminal", message: `That payment is already ${attempt.status}.` };
  }

  // The booking's reference, read from our own row rather than from whoever
  // called us, so the comparison below is against something the caller could
  // not have chosen.
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, reference, status")
    .eq("id", attempt.reservation_id)
    .maybeSingle();
  if (!reservation) {
    return { ok: false, reason: "unknown", message: "That payment's booking no longer exists." };
  }

  const result = await provider.finalizeApproval(orderId, {
    reference: reservation.reference as string,
    amountUsd: attempt.amount_cents / 100,
    requestId: attempt.capture_request_id,
  });

  const now = new Date().toISOString();

  if (!result.ok) {
    if (result.reason === "pending") {
      await supabase
        .from("payment_attempts")
        .update({ status: "pending", updated_at: now })
        .eq("id", attempt.id)
        .in("status", ["created", "approved"]);
      return { ok: false, reason: "pending", message: result.message };
    }
    if (result.reason === "mismatch") {
      // Never resolved automatically in either direction. Marking it paid
      // would be wrong; marking it failed would hide real money.
      await supabase
        .from("payment_attempts")
        .update({ status: "mismatch", failed_reason: result.message, updated_at: now })
        .eq("id", attempt.id)
        .in("status", ["created", "approved", "pending"]);
      console.error(`payment mismatch on attempt ${attempt.id}: ${result.message}`);
      return { ok: false, reason: "mismatch", message: result.message };
    }
    if (result.reason === "rejected") {
      await supabase
        .from("payment_attempts")
        .update({ status: "failed", failed_reason: result.message, updated_at: now })
        .eq("id", attempt.id)
        .in("status", ["created", "approved", "pending"]);
    }
    return { ok: false, reason: "provider", message: result.message };
  }

  const captured = result.state === "captured";
  const { error: writeError } = await supabase
    .from("payment_attempts")
    .update({
      status: captured ? "captured" : "approved",
      capture_id: captured ? result.id : attempt.capture_id,
      authorization_id: captured ? attempt.authorization_id : result.id,
      captured_at: captured ? now : null,
      approved_at: now,
      updated_at: now,
    })
    .eq("id", attempt.id)
    // Only from a state that has not already settled. If a webhook won this
    // race while we were talking to PayPal, its answer stands and ours is
    // dropped rather than written over it.
    .in("status", ["created", "approved", "pending"]);

  if (writeError) {
    // The unique index refusing a second capture for this reservation is this
    // working, not failing: somebody else already recorded one.
    console.error(`payment attempt ${attempt.id} could not be written as ${result.state}:`, writeError);
  }

  // Re-read rather than assume. Whatever is in the row now — ours or the
  // winner's — is the answer everybody should be given.
  const { data: fresh } = await supabase.from("payment_attempts").select(SELECT).eq("id", attempt.id).single();
  const settled = (fresh ?? attempt) as unknown as AttemptRow;

  if (settled.status === "captured") {
    // The money side of the booking only. The booking itself stays a request
    // until a person confirms it, which is the rule this whole system exists
    // to hold, so nothing here touches `status`.
    await supabase
      .from("reservations")
      .update({
        deposit_status: "captured",
        deposit_amount: settled.amount_cents / 100,
        deposit_quote: settled.quote,
        deposit_paid_at: settled.captured_at ?? now,
        payment_order_id: orderId,
        payment_capture_id: settled.capture_id,
        paid_attempt_id: settled.id,
        updated_at: now,
      })
      .eq("id", attempt.reservation_id);
  }

  return {
    ok: true,
    state: captured ? "captured" : "authorized",
    attempt: settled,
    alreadySettled: settled.status === "captured" && !captured,
  };
}

/** Records a state PayPal reported that is not a settlement. */
export async function markAttempt(
  orderIdOrCaptureId: { orderId?: string; captureId?: string },
  status: "cancelled" | "expired" | "failed" | "refunded" | "reversed" | "pending",
  reason?: string
): Promise<AttemptRow | null> {
  const supabase = createAdminSupabaseClient();
  const query = supabase.from("payment_attempts").select(SELECT);
  const { data } = orderIdOrCaptureId.orderId
    ? await query.eq("provider_order_id", orderIdOrCaptureId.orderId).maybeSingle()
    : await query.eq("capture_id", orderIdOrCaptureId.captureId ?? "").maybeSingle();
  if (!data) return null;

  const attempt = data as unknown as AttemptRow;
  // A refund or a reversal is news about money that moved, so it applies even
  // to a captured attempt. Everything else only moves an attempt that has not
  // settled — a late "cancelled" must never un-capture a payment.
  const movesTerminal = status === "refunded" || status === "reversed";
  if (isTerminal(attempt.status) && !movesTerminal) return attempt;

  const now = new Date().toISOString();
  await supabase
    .from("payment_attempts")
    .update({ status, failed_reason: reason ?? null, updated_at: now })
    .eq("id", attempt.id);

  if (movesTerminal) {
    await supabase
      .from("reservations")
      .update({ deposit_status: status === "refunded" ? "refunded" : "voided", updated_at: now })
      .eq("id", attempt.reservation_id);
  }

  return { ...attempt, status };
}
