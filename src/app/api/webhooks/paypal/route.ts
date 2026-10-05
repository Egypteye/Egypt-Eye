import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { paymentProvider } from "@/lib/booking/activeProvider";
import { markAttempt, settleAttempt } from "@/lib/booking/attempts";
import { fulfilAttempt } from "@/lib/booking/fulfilment";

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

  // The order id, which is what everything downstream is keyed on. A capture
  // event carries it in supplementary_data; an order event is itself the
  // order.
  const orderId =
    event.resource?.supplementary_data?.related_ids?.order_id ??
    (eventType.startsWith("CHECKOUT.ORDER") ? event.resource?.id : undefined) ??
    null;

  if (!orderId) {
    console.error(`paypal webhook: ${eventType} carried no order id`);
    return NextResponse.json({ ok: true, handled: false, reason: "no order id" });
  }

  switch (eventType) {
    // THE important one, and the reason this route stopped being a backstop.
    //
    // With CAPTURE intent the buyer approving authorises the charge; the
    // capture call collects it. If that call only ever came from the
    // customer's browser, somebody who approved and closed the tab would have
    // agreed to pay and we would never take the money. So the capture leg runs
    // here, and the browser's callback is an accelerator that happens to be
    // faster when it is there.
    case "CHECKOUT.ORDER.APPROVED": {
      const settled = await settleAttempt(orderId);
      if (!settled.ok) {
        // 'terminal' means somebody already settled it — the browser got there
        // first, which is the common case and not a problem.
        const expected = settled.reason === "terminal" || settled.reason === "pending";
        if (!expected) console.error(`paypal webhook: could not settle ${orderId}: ${settled.message}`);
        return NextResponse.json({ ok: true, handled: true, settled: false, reason: settled.reason });
      }
      if (settled.state === "captured") {
        const fulfilled = await fulfilAttempt(settled.attempt);
        if (!fulfilled.ok) {
          console.error(`paypal webhook: captured ${orderId} but fulfilment did not complete`);
        }
      }
      return NextResponse.json({ ok: true, handled: true, state: settled.state });
    }

    // The money is in the account. Usually we already know — the approval
    // event or the browser captured it — but this is the event PayPal
    // considers authoritative for fulfilment, so it settles and fulfils too.
    // Both are idempotent, so arriving second costs nothing.
    case "PAYMENT.CAPTURE.COMPLETED": {
      const settled = await settleAttempt(orderId);
      const attempt = settled.ok ? settled.attempt : null;
      if (attempt && attempt.status === "captured") {
        await fulfilAttempt(attempt);
      }
      return NextResponse.json({ ok: true, handled: true });
    }

    // PayPal has it but has not credited it. Explicitly NOT a fulfilment: an
    // email saying the deposit arrived would be wrong until it clears.
    case "PAYMENT.CAPTURE.PENDING":
      await markAttempt({ orderId }, "pending", "PayPal has not credited this yet");
      return NextResponse.json({ ok: true, handled: true });

    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.DECLINED":
      await markAttempt({ orderId }, "failed", eventType);
      return NextResponse.json({ ok: true, handled: true });

    case "PAYMENT.CAPTURE.REFUNDED":
      await markAttempt({ orderId }, "refunded", eventType);
      return NextResponse.json({ ok: true, handled: true });

    case "PAYMENT.CAPTURE.REVERSED":
      await markAttempt({ orderId }, "reversed", eventType);
      return NextResponse.json({ ok: true, handled: true });

    // Approved and never captured, now void. Without this an abandoned
    // approval sits in 'approved' forever and the sweep keeps asking about it.
    case "CHECKOUT.PAYMENT-APPROVAL.REVERSED":
      await markAttempt({ orderId }, "expired", eventType);
      return NextResponse.json({ ok: true, handled: true });

    default:
      // Logged above and deliberately not interpreted. A handler that tries to
      // understand every PayPal event type is one that will misunderstand one.
      return NextResponse.json({ ok: true, handled: false, eventType });
  }
}
