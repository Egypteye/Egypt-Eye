import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { paymentProvider } from "@/lib/booking/activeProvider";
import { bookingStateFromRow, stateCopy } from "@/lib/booking/states";

// Turns "the customer pressed approve" into a fact.
//
// The browser calls this after PayPal's buttons report an approval. What it
// sends is an order id and a reference — both of which it was given by us —
// and nothing else. It does not say what was paid, how much, or whether it
// succeeded, because the browser is the one participant in a payment that the
// customer controls.
//
// So this route re-asks PayPal, with our own credentials, and compares the
// answer against the reservation:
//
//   - the order id must be the one we stored on this booking when we created
//     it, so an order from somebody else's booking cannot be redeemed here;
//   - PayPal's `custom_id` must still be this reference;
//   - the amount PayPal reports must equal the deposit we recorded.
//
// Any mismatch leaves the booking unpaid and tells a human. That is the right
// outcome even though it is the inconvenient one: a booking wrongly marked
// paid is money the desk will never chase, and a date held for free.
//
// What it still does NOT do, in either direction, is confirm anything. A
// captured deposit moves the money and nothing else; the booking stays a
// request until a person says otherwise. That rule is the reason this whole
// deposit system exists and nothing in this file may shorten it.

export const dynamic = "force-dynamic";

type Body = { reference?: unknown; orderId?: unknown };

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Bookings aren't set up on this deployment yet." }, { status: 500 });
  }

  // Looser than the booking limit — a customer legitimately retries a failed
  // payment — but not unlimited, because this route makes an outbound call to
  // PayPal for every request.
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

  const reference = typeof body.reference === "string" ? body.reference.trim().toUpperCase() : "";
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!reference || !orderId) {
    return NextResponse.json({ error: "That payment could not be matched to a booking." }, { status: 400 });
  }

  const provider = paymentProvider();
  if (!provider.enabled) {
    return NextResponse.json({ error: "Online payments are not switched on." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, reference, status, deposit_amount, deposit_status, payment_order_id, payment_capture_id, payment_authorization_id")
    .eq("reference", reference)
    .maybeSingle();

  if (!reservation) {
    return NextResponse.json({ error: "We could not find that booking." }, { status: 404 });
  }

  // The order must be the one we created for THIS booking. Without this check
  // an order id is a bearer token: anyone holding one could redeem it against
  // any reference they could guess.
  if (reservation.payment_order_id && reservation.payment_order_id !== orderId) {
    console.error(
      `paypal capture: order ${orderId} presented for ${reference}, which expects ${reservation.payment_order_id}`
    );
    return NextResponse.json({ error: "That payment does not belong to this booking." }, { status: 409 });
  }

  const amountUsd = Number(reservation.deposit_amount ?? 0);
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "That booking has no deposit to pay." }, { status: 400 });
  }

  // Already settled — by a webhook that beat the browser back, or by the
  // customer double-tapping. Reporting the current state is correct and is
  // not an error: the money is where it should be.
  if (reservation.deposit_status === "captured" || reservation.deposit_status === "authorized") {
    return NextResponse.json({
      ok: true,
      reference,
      alreadySettled: true,
      state: bookingStateFromRow(reservation),
      message: stateCopy(bookingStateFromRow(reservation), provider.moneyMode).message,
    });
  }

  const result = await provider.finalizeApproval(orderId, { reference, amountUsd });

  if (!result.ok) {
    // A mismatch is the serious one. It means the money and the booking
    // disagree, which a customer cannot fix and must not be asked to.
    console.error(`paypal capture failed for ${reference}:`, result.reason, result.message);
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
    if (result.reason === "pending") {
      return NextResponse.json({
        ok: true,
        reference,
        pending: true,
        message: result.message,
      });
    }
    return NextResponse.json(
      { error: "We could not complete that payment. Please try again, or message us on WhatsApp." },
      { status: 502 }
    );
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("reservations")
    .update({
      deposit_status: result.state,
      payment_order_id: orderId,
      // A capture id is what a refund needs; an authorization id is what a
      // capture or a void needs. Storing the right one in the right column is
      // what makes the admin decision work later.
      payment_capture_id: result.state === "captured" ? result.id : reservation.payment_capture_id,
      payment_authorization_id:
        result.state === "authorized" ? result.id : reservation.payment_authorization_id,
      deposit_held_at: now,
      deposit_paid_at: result.state === "captured" ? now : null,
      updated_at: now,
    })
    .eq("id", reservation.id)
    // Only from 'awaiting'. If a webhook settled this row in the moment
    // between our read and this write, its answer stands and ours is dropped
    // rather than overwriting it.
    .eq("deposit_status", "awaiting");

  if (updateError) {
    // The money moved and we could not record it. That is the one failure here
    // that costs a customer real money, so it is logged loudly with everything
    // needed to reconcile by hand.
    console.error(
      `paypal capture: PAYMENT ${result.state.toUpperCase()} ${result.id} FOR ${reference} BUT THE BOOKING COULD NOT BE UPDATED`,
      updateError
    );
    return NextResponse.json({
      ok: true,
      reference,
      recorded: false,
      message:
        "Your payment went through. We hit a problem writing it to your booking, so our team is checking it — " +
        `please quote ${reference} if you get in touch.`,
    });
  }

  // Deliberately not 'confirmed', and deliberately not a congratulation. The
  // money side is done; the date is not, and only a person moves that.
  const row = { status: reservation.status as string, deposit_status: result.state };
  const state = bookingStateFromRow(row);
  return NextResponse.json({
    ok: true,
    reference,
    recorded: true,
    state,
    message: stateCopy(state, provider.moneyMode).message,
  });
}
