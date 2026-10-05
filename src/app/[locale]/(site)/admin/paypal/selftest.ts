"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { settleAttempt } from "@/lib/booking/attempts";
import { fulfilAttempt } from "@/lib/booking/fulfilment";
import { quoteDeposit } from "@/lib/booking/quote";

// The guarantees, exercised against the real database.
//
// Half of the payment test list needs a person approving in PayPal's own
// window: a normal payment, a cancellation, closing the tab mid-flight. Those
// have to be done by hand and no amount of code replaces them.
//
// The other half is the opposite — nobody can test it by hand, because it is
// about what happens when two processes race. You cannot double-click your way
// into a reliable test of "two webhooks and a browser callback arrive at once",
// and the guarantees that cover it live in the database rather than in code
// anybody can read. So they are asserted here, against the real tables, with
// the real constraints.
//
// Everything it creates is deleted before it returns, and is marked EE-SELFTEST
// in the meantime so a leftover is obvious. It never touches PayPal, never
// sends an email, and never creates a row anybody would mistake for a booking.

export type SelfTestResult = {
  ok: boolean;
  checks: { label: string; ok: boolean; detail: string }[];
};

export async function runPaymentSelfTest(): Promise<SelfTestResult> {
  await requireAdmin();

  const supabase = createAdminSupabaseClient();
  const checks: SelfTestResult["checks"] = [];
  const add = (label: string, ok: boolean, detail: string) => checks.push({ label, ok, detail });

  const reference = `EE-SELFTEST-${Date.now().toString(36).toUpperCase()}`;
  let reservationId: string | null = null;

  try {
    // ---- The quote, which is pure and needs nothing ----------------------
    const product = {
      slug: "selftest",
      title: "Self test",
      bookable: true,
      depositUsd: 25,
      depositBasis: "perPerson",
      extras: [{ label: "Reel", priceUsd: 25, depositUsd: 10, depositBasis: "booking" as const }],
    };
    const q = quoteDeposit(product, "photoshoot", { people: 3, extraLabels: ["Reel"] });
    add(
      "The deposit is calculated from the booking",
      q.ok && q.quote.totalCents === 8500,
      q.ok ? `3 people x $25 + $10 reel = $${q.quote.totalCents / 100}` : "no quote was produced"
    );
    const forged = quoteDeposit(product, "photoshoot", {
      people: 3,
      extraLabels: [{ label: "Reel", depositUsd: 0 } as unknown as string],
    });
    add(
      "A price sent from the browser is ignored",
      forged.ok && forged.quote.totalCents === 7500,
      "a selection carrying its own price bought nothing"
    );
    if (!q.ok) return { ok: false, checks };

    // ---- A throwaway booking to hang the rest on -------------------------
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        reference,
        guest_name: "SELF TEST — delete me",
        guest_phone: "+20 000000000",
        product_type: "photoshoot",
        product_slug: "selftest",
        starts_at: new Date(Date.now() + 86_400_000).toISOString(),
        travelers_adults: 3,
        status: "requested",
        deposit_status: "awaiting",
      })
      .select("id")
      .single();

    if (reservationError || !reservation) {
      add("A booking can be written", false, reservationError?.message ?? "insert returned nothing");
      return { ok: false, checks };
    }
    reservationId = reservation.id as string;
    add("A booking can be written", true, "and will be deleted before this finishes");

    const attemptRow = (status: string, orderId: string | null) => ({
      reservation_id: reservationId,
      provider: "selftest",
      provider_order_id: orderId,
      status,
      amount_cents: q.quote.totalCents,
      currency: "USD",
      quote: q.quote,
    });

    // ---- THE guarantee: one captured payment per booking ------------------
    const first = await supabase.from("payment_attempts").insert(attemptRow("captured", "SELFTEST-A")).select("id").single();
    const second = await supabase.from("payment_attempts").insert(attemptRow("captured", "SELFTEST-B")).select("id").single();
    add(
      "One booking cannot have two captured payments",
      Boolean(first.data) && second.error?.code === "23505",
      second.error
        ? `the database refused the second capture (${second.error.code})`
        : "A SECOND CAPTURE WAS ACCEPTED — this is the guarantee that stops a customer being charged twice",
    );

    // A second *attempt* that has not captured is legitimate — a customer who
    // abandoned one checkout and started another.
    const retry = await supabase.from("payment_attempts").insert(attemptRow("created", "SELFTEST-C")).select("id").single();
    add(
      "A second unpaid attempt is still allowed",
      Boolean(retry.data) && !retry.error,
      "a customer who abandons a checkout can start another"
    );

    // ---- One PayPal order is one attempt ----------------------------------
    const duplicateOrder = await supabase.from("payment_attempts").insert(attemptRow("created", "SELFTEST-A")).select("id").single();
    add(
      "One PayPal order cannot become two attempts",
      duplicateOrder.error?.code === "23505",
      duplicateOrder.error
        ? "the database refused a second row for the same order"
        : "A DUPLICATE ORDER ROW WAS ACCEPTED — a webhook and a browser callback could diverge"
    );

    // ---- Duplicate webhook deliveries -------------------------------------
    const eventId = `SELFTEST-EVT-${Date.now()}`;
    const event = {
      provider: "selftest",
      event_id: eventId,
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      reservation_id: reservationId,
      reference,
      payload: { selftest: true },
    };
    await supabase.from("payment_events").insert(event);
    const replay = await supabase.from("payment_events").insert(event);
    add(
      "The same webhook delivered twice is handled once",
      replay.error?.code === "23505",
      replay.error
        ? "the second delivery was refused by the unique index, so the handler returns early"
        : "A REPLAYED WEBHOOK WAS ACCEPTED — PayPal retries for days, so this would double-handle"
    );

    // ---- An email is claimed once ----------------------------------------
    const emailKey = `selftest:${eventId}`;
    await supabase.from("notification_log").insert({
      idempotency_key: emailKey,
      notification_type: "selftest",
      reservation_id: reservationId,
      status: "sent",
    });
    const replayEmail = await supabase.from("notification_log").insert({
      idempotency_key: emailKey,
      notification_type: "selftest",
      reservation_id: reservationId,
      status: "sent",
    });
    add(
      "The same email cannot be sent twice",
      replayEmail.error?.code === "23505",
      replayEmail.error
        ? "claimed before sending, so a retry finds it already claimed"
        : "A DUPLICATE EMAIL CLAIM WAS ACCEPTED — a redelivered webhook would email the customer again"
    );

    // ---- Settling things that should not settle ---------------------------
    const unknown = await settleAttempt("SELFTEST-NO-SUCH-ORDER");
    add(
      "An order we never opened cannot be settled",
      !unknown.ok && unknown.reason === "unknown",
      "an order id that matches no attempt is refused rather than guessed at"
    );

    const alreadyCaptured = await settleAttempt("SELFTEST-A");
    add(
      "An already-captured payment reports itself, not an error",
      alreadyCaptured.ok && alreadyCaptured.alreadySettled,
      "the second caller reads the first caller's row and reports the same truth"
    );

    // ---- Fulfilment refuses anything unpaid -------------------------------
    const unpaid = await fulfilAttempt({
      id: retry.data?.id ?? "x",
      reservation_id: reservationId,
      provider_order_id: "SELFTEST-C",
      status: "created",
      amount_cents: q.quote.totalCents,
      currency: "USD",
      quote: q.quote,
      create_request_id: "x",
      capture_request_id: "x",
      capture_id: null,
      authorization_id: null,
      fulfilled_at: null,
      captured_at: null,
    });
    add(
      "No email can be sent for a payment that has not completed",
      !unpaid.ok,
      "fulfilment refuses any attempt that is not captured — this is the rule that stopped emails going out before payment"
    );
  } catch (err) {
    add("The self test ran to completion", false, err instanceof Error ? err.message : String(err));
  } finally {
    // Always, including after a throw. A test that leaves rows behind in a
    // payments table is worse than no test.
    if (reservationId) {
      await supabase.from("payment_events").delete().eq("reservation_id", reservationId);
      await supabase.from("notification_log").delete().eq("reservation_id", reservationId);
      await supabase.from("payment_attempts").delete().eq("reservation_id", reservationId);
      await supabase.from("reservations").delete().eq("id", reservationId);
    }
  }

  // Proves the cleanup rather than assuming it.
  const { count } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("reference", reference);
  checks.push({
    label: "Everything the test created was deleted",
    ok: count === 0,
    detail: count === 0 ? "no test rows remain" : `${count} test booking(s) still present — reference ${reference}`,
  });

  return { ok: checks.every((c) => c.ok), checks };
}
