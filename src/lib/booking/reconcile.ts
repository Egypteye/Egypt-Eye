import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { paymentProvider } from "./activeProvider";
import { settleAttempt, type AttemptRow } from "./attempts";
import { fulfilAttempt } from "./fulfilment";

// The recovery layer.
//
// Everything else in this system assumes its messages arrive. This one assumes
// they do not. Webhooks are at-least-once, which also means at-most-never for
// any individual delivery: PayPal retries, but a retry can land while we are
// down, and a browser that was going to tell us can be closed.
//
// So this sweeps, and it has exactly two jobs.
//
// **Finish what was approved.** An attempt sitting in `created` or `approved`
// past the grace period is asked about directly. If PayPal says the buyer
// approved it, it is captured here — the same `settleAttempt` the webhook and
// the browser call, so there is still one routine that can move money.
//
// **Finish what was captured.** An attempt that holds money but has never been
// fulfilled gets its emails again. This is the other half of keeping fulfilment
// outside the capture commit: the payment is safe, and the telling is retried
// until it works.
//
// What it must not do is poll everything forever. PayPal rate-limits order
// lookups, so the batch is bounded and ordered oldest first — the oldest is
// the one closest to being lost.

/** How long an attempt is left alone before we go asking. */
const GRACE_MINUTES = 20;
/** Past this, an attempt nobody completed is not going to be completed. */
const ABANDON_HOURS = 72;
/**
 * How long seats stay claimed for a booking nobody has paid for.
 *
 * Far shorter than ABANDON_HOURS, and the difference is the whole point. An
 * unpaid photoshoot booking costs nothing to leave sitting for three days. An
 * unpaid seat on a departure reads as full to every real customer who looks,
 * so it is given back as soon as the checkout is plainly dead — long enough
 * for a slow PayPal round trip and a distracted customer, short enough that a
 * van is not held hostage by a closed tab.
 */
const SEAT_HOLD_MINUTES = 30;
const BATCH = 25;

export type ReconcileReport = {
  checked: number;
  captured: number;
  expired: number;
  fulfilled: number;
  stillPending: number;
  /** Seats given back to departures whose checkout was abandoned. */
  seatsReleased: number;
  problems: string[];
};

export async function reconcilePayments(): Promise<ReconcileReport> {
  const report: ReconcileReport = {
    checked: 0,
    captured: 0,
    expired: 0,
    fulfilled: 0,
    stillPending: 0,
    seatsReleased: 0,
    problems: [],
  };

  const provider = paymentProvider();
  // Seats first, and deliberately before this returns. Releasing a lapsed hold
  // reads nothing but our own database, so it must not be gated on PayPal
  // being configured — switching the provider off with holds outstanding
  // would otherwise strand those seats permanently.
  if (!provider.enabled) {
    report.seatsReleased += await releaseExpiredSeatHolds();
    return report;
  }

  const supabase = createAdminSupabaseClient();
  const now = Date.now();
  const graceCutoff = new Date(now - GRACE_MINUTES * 60_000).toISOString();
  const abandonCutoff = new Date(now - ABANDON_HOURS * 3_600_000).toISOString();

  // --- 1. Attempts that may have been paid and nobody told us --------------
  const { data: open } = await supabase
    .from("payment_attempts")
    .select("id, reservation_id, provider_order_id, status, amount_cents, currency, quote, create_request_id, capture_request_id, capture_id, authorization_id, fulfilled_at, captured_at, created_at")
    .in("status", ["created", "approved", "pending"])
    .lt("created_at", graceCutoff)
    .order("created_at", { ascending: true })
    .limit(BATCH);

  for (const row of (open ?? []) as (AttemptRow & { created_at: string })[]) {
    report.checked += 1;

    if (!row.provider_order_id) {
      // We opened a row and never got an order back. There is nothing at
      // PayPal to find, so after the abandon window it is simply closed.
      if (row.created_at < abandonCutoff) {
        await supabase
          .from("payment_attempts")
          .update({ status: "expired", failed_reason: "no PayPal order was ever created", updated_at: new Date().toISOString() })
          .eq("id", row.id);
        report.expired += 1;
      }
      continue;
    }

    const settled = await settleAttempt(row.provider_order_id);

    if (settled.ok && settled.state === "captured") {
      report.captured += 1;
      // Captured here means the customer paid and never came back, and nobody
      // has been told anything yet.
      const fulfilled = await fulfilAttempt(settled.attempt);
      if (fulfilled.ok) report.fulfilled += 1;
      else report.problems.push(`attempt ${row.id}: captured but ${fulfilled.message}`);
      continue;
    }

    if (!settled.ok && settled.reason === "pending") {
      report.stillPending += 1;
      continue;
    }

    // Nothing to collect. Past the abandon window an unsettled attempt is
    // closed so the sweep stops asking about it — PayPal's own approval
    // reversal would have done this sooner if it reached us.
    if (row.created_at < abandonCutoff) {
      await supabase
        .from("payment_attempts")
        .update({ status: "expired", failed_reason: "never completed", updated_at: new Date().toISOString() })
        .eq("id", row.id)
        .in("status", ["created", "approved", "pending"]);
      report.expired += 1;
    }
  }

  // --- 2. Money taken that nobody has been told about ----------------------
  const { data: unfulfilled } = await supabase
    .from("payment_attempts")
    .select("id, reservation_id, provider_order_id, status, amount_cents, currency, quote, create_request_id, capture_request_id, capture_id, authorization_id, fulfilled_at, captured_at")
    .eq("status", "captured")
    .is("fulfilled_at", null)
    .order("captured_at", { ascending: true })
    .limit(BATCH);

  for (const row of (unfulfilled ?? []) as AttemptRow[]) {
    const fulfilled = await fulfilAttempt(row);
    if (fulfilled.ok) report.fulfilled += 1;
    else report.problems.push(`attempt ${row.id}: ${fulfilled.message}`);
  }

  // --- 3. Anything disagreeing with itself ---------------------------------
  // Never resolved automatically in either direction. Marking it paid would be
  // wrong and marking it failed would hide real money, so it is reported until
  // a person looks.
  const { data: mismatched } = await supabase
    .from("payment_attempts")
    .select("id, failed_reason")
    .eq("status", "mismatch")
    .limit(BATCH);
  for (const row of (mismatched ?? []) as { id: string; failed_reason: string | null }[]) {
    report.problems.push(`attempt ${row.id} needs a person: ${row.failed_reason ?? "amount or reference mismatch"}`);
  }

  report.seatsReleased += await releaseExpiredSeatHolds();

  return report;
}

/**
 * Gives back seats claimed for a booking nobody paid for.
 *
 * Weekly Trips are the only product with a finite supply, so they are the only
 * one where an abandoned checkout costs somebody else a booking.
 * book_departure_seats claims the seat immediately — correctly, under a row
 * lock, so it cannot oversell — which means the seat is claimed before the
 * money arrives and has to be given back if it never does.
 *
 * Called from two places, and the second is the one that makes this reliable:
 *
 *   The nightly sweep, as a backstop.
 *
 *   The booking route itself, for the one departure being booked, BEFORE it
 *   tries to claim a seat. A stale hold only actually matters at the moment
 *   somebody else wants that seat, and that is exactly when this runs — so
 *   availability is correct when it counts, however often the cron fires.
 *   A daily cron would otherwise hold a seat for nineteen hours against a
 *   thirty-minute policy.
 *
 * Everything that decides whether a release is SAFE lives in the database
 * function: it re-reads the booking, refuses if any attempt holds or might
 * hold money, and gives the seat back by setting the status so the existing
 * seat-sync trigger does the arithmetic exactly once. This only chooses
 * candidates; it is never the thing that decides.
 */
export async function releaseExpiredSeatHolds(departureId?: string): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const cutoff = new Date(Date.now() - SEAT_HOLD_MINUTES * 60_000).toISOString();

  let query = supabase
    .from("reservations")
    .select("id, reference")
    .not("departure_id", "is", null)
    .not("seat_hold_expires_at", "is", null)
    .lt("seat_hold_expires_at", cutoff)
    .eq("status", "requested")
    .order("seat_hold_expires_at", { ascending: true })
    .limit(BATCH);

  // Scoped to one departure when called from the booking path: the customer
  // waiting on a response should not pay for sweeping the whole table.
  if (departureId) query = query.eq("departure_id", departureId);

  const { data, error } = await query;
  if (error) {
    console.error("seat holds could not be read:", error.message);
    return 0;
  }

  let released = 0;
  for (const row of (data ?? []) as { id: string; reference: string }[]) {
    const { data: result, error: callError } = await supabase.rpc("release_departure_seats", {
      p_reservation_id: row.id,
    });
    if (callError) {
      console.error(`seat hold ${row.reference} could not be released:`, callError.message);
      continue;
    }
    const first = Array.isArray(result) ? result[0] : result;
    if ((first as { outcome?: string } | null)?.outcome === "released") {
      released += (first as { released?: number }).released ?? 0;
    }
  }
  return released;
}
