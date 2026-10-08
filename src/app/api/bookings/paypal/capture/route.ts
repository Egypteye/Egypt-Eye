import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { settleAttempt } from "@/lib/booking/attempts";
import { fulfilAttempt } from "@/lib/booking/fulfilment";
import { paymentProvider } from "@/lib/booking/activeProvider";
import { bookingStateFromRow, stateCopy } from "@/lib/booking/states";

// The browser telling us the customer pressed approve.
//
// What this route is NOT is the mechanism by which a payment gets collected.
// It used to be, and that was the most serious thing wrong with the old
// design: with CAPTURE intent the buyer's approval authorises the charge and
// the capture call collects it, so a customer who approved and then closed the
// tab had agreed to pay and we never took the money — silently.
//
// PayPal's own guidance is to run the capture leg off CHECKOUT.ORDER.APPROVED.
// So this is now an accelerator: somebody watching the screen gets an answer
// in two seconds rather than whenever a webhook lands, and if they never come
// back the webhook does the identical thing. Both call `settleAttempt`, which
// asks PayPal what happened rather than being told.
//
// It carries no authority of its own. The only thing the browser supplies is
// an order id that we issued, and settleAttempt re-reads that order from
// PayPal, matches it to the attempt we opened, and compares the amount in
// whole cents before anything moves.

export const dynamic = "force-dynamic";

type Body = { orderId?: unknown };

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Bookings aren't set up on this deployment yet." }, { status: 500 });
  }

  // Looser than the booking limit — a customer legitimately retries a failed
  // payment — but not unlimited, because each call reaches out to PayPal.
  const { allowed } = await checkRateLimit({
    bucket: "paypal-capture",
    key: getClientIp(request),
    max: 30,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please message us on WhatsApp and we will sort this out." },
      { status: 429 }
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!orderId) {
    return NextResponse.json({ error: "That payment could not be matched to a booking." }, { status: 400 });
  }

  const result = await settleAttempt(orderId);

  if (!result.ok) {
    if (result.reason === "pending") {
      // PayPal has it but has not credited it. That is not money in the
      // account and must not be reported as though it were.
      return NextResponse.json({ ok: true, pending: true, message: result.message });
    }
    if (result.reason === "mismatch") {
      return NextResponse.json(
        {
          error:
            "Something does not match between your payment and this booking, so we have not marked it paid. " +
            "Our team has been alerted — please message us and we will sort it out.",
        },
        { status: 409 }
      );
    }
    if (result.reason === "unknown") {
      return NextResponse.json({ error: "We could not find that payment." }, { status: 404 });
    }
    if (result.reason === "terminal") {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }
    // A declined card is the customer's problem to solve, not ours, and it is
    // the one failure here they can actually act on — so it says so.
    //
    // A real customer hit this three times in thirteen minutes, each attempt
    // creating a fresh booking, and was told only "we could not complete that
    // payment" every time. Nothing in that sentence suggests trying a
    // different card, so it reads as a broken website rather than a bank
    // declining. The reason was in payment_attempts.failed_reason the whole
    // time; it just never reached the person who could do something about it.
    //
    // The 502 and the dead-end stay: PayPal will not let a declined order be
    // captured with another instrument, so a new card genuinely needs a new
    // order, which is what "Start a new payment" gives them.
    const declined = /INSTRUMENT_DECLINED/i.test(result.message);
    return NextResponse.json(
      {
        error: declined
          ? "Your bank declined that payment method. Try a different card, or pay with your PayPal balance — " +
            "press “Start a new payment” below. Nothing has been charged. If it keeps failing, message us on WhatsApp."
          : "We could not complete that payment. Please try again, or message us on WhatsApp.",
      },
      { status: 502 }
    );
  }

  // Fulfilment runs after the capture is committed, never inside it, so an
  // email that fails cannot un-take somebody's money. A failure here leaves
  // the payment captured and the sweep retries.
  if (result.state === "captured") {
    const fulfilled = await fulfilAttempt(result.attempt);
    if (!fulfilled.ok) {
      console.error(`capture ${result.attempt.id} succeeded but fulfilment did not:`, fulfilled.message);
    }
  }

  const state = bookingStateFromRow({ status: "requested", deposit_status: result.state });
  return NextResponse.json({
    ok: true,
    reference: null,
    state,
    alreadySettled: result.alreadySettled,
    message: stateCopy(state, paymentProvider().moneyMode).message,
  });
}
