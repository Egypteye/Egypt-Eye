import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { paymentReceivedCustomerEmail, paymentReceivedTeamEmail } from "@/lib/email/templates";
import { site } from "@/content/site";
import type { AttemptRow } from "./attempts";
import type { Quote } from "./quote";

// Telling people a payment arrived.
//
// Separate from taking the payment, and that separation is the whole point.
// Capturing money and sending an email have completely different failure
// modes: a capture either happened at PayPal or it did not, while an email can
// be accepted and never delivered, or time out after the provider already
// queued it. If the two shared a transaction, a flaky mail provider could
// un-take somebody's money, which is absurd — so capture commits first and
// this runs afterwards, on its own, as many times as it needs to.
//
// Three properties:
//
//   - **It never changes payment state.** The worst outcome here is that
//     `fulfilled_at` stays null and the sweep tries again.
//   - **It cannot double-send.** Each email is claimed in `notification_log`
//     on a unique key derived from the capture id before it is sent, so a
//     redelivered webhook, a sweep and an admin retry all converge on one
//     email.
//   - **It sends the snapshot, not today's prices.** The quote stored on the
//     attempt is what the customer agreed to, and it is what both emails show
//     however the Studio has been edited since.

export type FulfilResult =
  | { ok: true; alreadyDone: boolean; sent: { customer: boolean; team: boolean } }
  | { ok: false; message: string };

type ReservationRow = {
  id: string;
  reference: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  starts_at: string | null;
  slot_label: string | null;
  travelers_adults: number | null;
  product_type: string | null;
  addons: { label: string; priceUsd: number }[] | null;
  addons_total: number | null;
  customer_id: string | null;
};

/**
 * Sends the two emails for a captured attempt.
 *
 * Refuses outright on an attempt that is not captured. Nothing else in the
 * system may send a payment confirmation, and the check is here rather than at
 * the call sites so there is one place to be sure about.
 */
export async function fulfilAttempt(attempt: AttemptRow): Promise<FulfilResult> {
  if (attempt.status !== "captured") {
    return { ok: false, message: `Attempt ${attempt.id} is ${attempt.status}, not captured.` };
  }
  if (attempt.fulfilled_at) {
    return { ok: true, alreadyDone: true, sent: { customer: false, team: false } };
  }

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reservations")
    .select(
      "id, reference, guest_name, guest_email, guest_phone, starts_at, slot_label, " +
        "travelers_adults, product_type, addons, addons_total, customer_id"
    )
    .eq("id", attempt.reservation_id)
    .maybeSingle();

  if (!data) return { ok: false, message: "That payment's booking no longer exists." };
  const reservation = data as unknown as ReservationRow;

  // Everything both emails say comes from here: the agreed figures, not the
  // current ones. A capture id makes the keys unique per payment, so a second
  // attempt on the same booking (after a refund, say) is a different email.
  const quote = attempt.quote as Quote;
  const payment = {
    reference: reservation.reference,
    orderId: attempt.provider_order_id ?? "—",
    captureId: attempt.capture_id ?? "—",
    amountCents: attempt.amount_cents,
    currency: attempt.currency,
    status: "COMPLETED",
    paidAt: attempt.captured_at ?? new Date().toISOString(),
  };
  const booking = {
    guestName: reservation.guest_name,
    guestEmail: reservation.guest_email,
    guestPhone: reservation.guest_phone,
    productTitle: quote.productTitle,
    productType: reservation.product_type ?? quote.productType,
    startsAt: reservation.starts_at,
    slotLabel: reservation.slot_label,
    people: quote.people,
    extras: reservation.addons ?? [],
    extrasTotalUsd: reservation.addons_total,
  };

  const key = attempt.capture_id ?? attempt.id;
  let customerSent = false;
  let teamSent = false;
  const failures: string[] = [];

  // The customer only has an email if they gave one — booking as a guest with
  // just a phone number is supported, and is not a failure to report.
  if (reservation.guest_email) {
    try {
      const email = paymentReceivedCustomerEmail({ booking, payment, quote });
      const result = await sendIdempotentEmail({
        idempotencyKey: `payment-received:${key}:customer`,
        notificationType: "payment_received",
        to: reservation.guest_email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        customerId: reservation.customer_id ?? undefined,
        reservationId: reservation.id,
      });
      customerSent = result.sent;
      if (!result.sent && !result.alreadySent) failures.push("customer email was not accepted");
    } catch (err) {
      failures.push(`customer email threw: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  try {
    const email = paymentReceivedTeamEmail({ booking, payment, quote });
    const result = await sendIdempotentEmail({
      idempotencyKey: `payment-received:${key}:team`,
      notificationType: "payment_received_team",
      to: site.contact.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      reservationId: reservation.id,
    });
    teamSent = result.sent;
    if (!result.sent && !result.alreadySent) failures.push("team email was not accepted");
  } catch (err) {
    failures.push(`team email threw: ${err instanceof Error ? err.message : String(err)}`);
  }

  const now = new Date().toISOString();
  if (failures.length > 0) {
    // Recorded, not thrown. The payment stays captured, `fulfilled_at` stays
    // null, and the sweep will try again — which is the behaviour the whole
    // split exists to produce.
    await supabase
      .from("payment_attempts")
      .update({ fulfilment_error: failures.join("; "), updated_at: now })
      .eq("id", attempt.id);
    console.error(`fulfilment incomplete for attempt ${attempt.id}: ${failures.join("; ")}`);
    return { ok: false, message: failures.join("; ") };
  }

  await supabase
    .from("payment_attempts")
    .update({ fulfilled_at: now, fulfilment_error: null, updated_at: now })
    .eq("id", attempt.id);

  return { ok: true, alreadyDone: false, sent: { customer: customerSent, team: teamSent } };
}
