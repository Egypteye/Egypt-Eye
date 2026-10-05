import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { paymentProvider } from "@/lib/booking/activeProvider";
import { stateAfterPaymentHeld, bookingStateFromRow } from "@/lib/booking/states";

// What PayPal says happened, which is the authoritative record.
//
// The capture route already settles the common case while the customer is
// still looking at the page. This exists because that path is the one that can
// be interrupted: a closed tab, a dropped connection, a payment that PayPal
// reviews for an hour, a refund issued from the PayPal dashboard rather than
// from admin. Every one of those is a real change to a customer's money that
// nothing in the browser will ever tell us about.
//
// Three properties hold it together.
//
// Verification first, always. An unverified body is not an event — it is a
// POST from the internet to a public URL, and acting on one would let anyone
// mark any booking as paid. The provider refuses outright when no webhook id
// is configured.
//
// Idempotent by construction. Every delivery is recorded in `payment_events`
// keyed by PayPal's own event id with a unique index, so a duplicate insert
// fails and the second delivery becomes a no-op rather than a second state
// change. PayPal retries for days; this will see the same event many times.
//
// It still cannot confirm a booking. A payment event moves the money and
// nothing else — `stateAfterPaymentHeld` enforces that, and check-booking
// asserts it against every state.

export const dynamic = "force-dynamic";

type PayPalEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    invoice_id?: string;
    status?: string;
    amount?: { value?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
};

export async function POST(request: NextRequest) {
  const provider = paymentProvider();
  if (!provider.enabled || !supabaseAdminConfigured) {
    // 200 rather than an error: PayPal retries anything else for days, and a
    // deployment with no payment rail has nothing to retry into.
    return NextResponse.json({ ok: true, ignored: "not configured" });
  }

  // The signature covers the bytes we received, so the body is read raw and
  // never re-serialized before it is verified.
  const rawBody = await request.text();
  const verified = await provider.verifyWebhook(request.headers, rawBody);
  if (!verified) {
    console.error("paypal webhook: signature verification failed — ignoring");
    return NextResponse.json({ error: "unverified" }, { status: 401 });
  }

  let event: PayPalEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "unparseable" }, { status: 400 });
  }

  const eventId = typeof event.id === "string" ? event.id : "";
  const eventType = typeof event.event_type === "string" ? event.event_type : "";
  if (!eventId || !eventType) {
    return NextResponse.json({ error: "incomplete event" }, { status: 400 });
  }

  // custom_id is what we set when the order was created, which is why a
  // payment can find its booking without a customer typing anything.
  const reference = (event.resource?.custom_id ?? event.resource?.invoice_id ?? "").trim().toUpperCase();
  const supabase = createAdminSupabaseClient();

  const { data: reservation } = reference
    ? await supabase
        .from("reservations")
        .select("id, reference, status, deposit_status, deposit_amount, payment_capture_id, payment_authorization_id")
        .eq("reference", reference)
        .maybeSingle()
    : { data: null };

  // Recorded before anything is acted on, and before we know whether we care
  // about this event type. An event we did not handle is still evidence of
  // what PayPal told us, and that is what an argument about a charge is
  // settled with.
  const { error: logError } = await supabase.from("payment_events").insert({
    provider: "paypal",
    event_id: eventId,
    event_type: eventType,
    reservation_id: reservation?.id ?? null,
    reference: reference || null,
    payload: event as unknown as Record<string, unknown>,
  });

  if (logError) {
    // The unique index on (provider, event_id) rejecting the insert IS the
    // idempotency mechanism working: PayPal has sent this one before and it
    // has already been acted on.
    if (logError.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("paypal webhook: could not record event", logError);
    // 500 so PayPal retries — an event we failed to record is one we would
    // rather see again.
    return NextResponse.json({ error: "could not record" }, { status: 500 });
  }

  if (!reservation) {
    // Logged, not acted on. A payment with no booking is a real thing that
    // happens (a stale link, a manual PayPal invoice) and the desk finds it in
    // payment_events rather than in a silence.
    console.error(`paypal webhook: ${eventType} for unknown reference ${reference || "(none)"}`);
    return NextResponse.json({ ok: true, matched: false });
  }

  const now = new Date().toISOString();
  const resourceId = event.resource?.id ?? null;

  // Only the event types that change what a customer's money is doing. Anything
  // else is logged above and ignored here, deliberately — a handler that tries
  // to interpret every PayPal event type is a handler that will one day
  // mis-interpret one.
  const patch: Record<string, unknown> = { updated_at: now };
  switch (eventType) {
    case "PAYMENT.CAPTURE.COMPLETED":
      patch.deposit_status = "captured";
      patch.payment_capture_id = resourceId;
      patch.deposit_paid_at = now;
      break;
    case "PAYMENT.AUTHORIZATION.CREATED":
      patch.deposit_status = "authorized";
      patch.payment_authorization_id = resourceId;
      patch.deposit_held_at = now;
      break;
    case "PAYMENT.AUTHORIZATION.VOIDED":
    case "PAYMENT.CAPTURE.REVERSED":
      patch.deposit_status = "voided";
      break;
    case "PAYMENT.CAPTURE.REFUNDED":
      patch.deposit_status = "refunded";
      break;
    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.DECLINED":
      patch.deposit_status = "failed";
      break;
    default:
      return NextResponse.json({ ok: true, handled: false, eventType });
  }

  // Note what is NOT here: nothing touches `status`. The two columns are
  // separate on purpose — `deposit_status` carries the money and `status`
  // carries the booking — and a payment event is only ever evidence about the
  // money. The customer-facing state follows from both via
  // bookingStateFromRow, so writing the deposit column is enough to move a
  // booking from "awaiting deposit" to "deposit paid" without any part of this
  // route being able to reach 'confirmed'.
  //
  // The assertion is kept rather than assumed: stateAfterPaymentHeld is the
  // rule that a payment can never confirm a booking, and if it ever returns
  // one, this refuses to write rather than quietly confirming a date nobody
  // checked.
  if (patch.deposit_status === "captured" || patch.deposit_status === "authorized") {
    const before = bookingStateFromRow(reservation);
    if (stateAfterPaymentHeld(before) === "confirmed" && before !== "confirmed") {
      console.error(
        `paypal webhook: refusing ${eventType} for ${reference} — it would have confirmed a booking nobody checked`
      );
      return NextResponse.json({ error: "refused" }, { status: 500 });
    }
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update(patch)
    .eq("id", reservation.id);

  if (updateError) {
    console.error(`paypal webhook: could not apply ${eventType} to ${reference}`, updateError);
    return NextResponse.json({ error: "could not apply" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, handled: true, eventType, reference });
}
