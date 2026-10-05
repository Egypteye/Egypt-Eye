"use server";

import { revalidatePath } from "next/cache";
import { requireReservationsStaff } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { paymentProvider } from "@/lib/booking/paymentProvider";
import { bookingStateFromRow, canTransition } from "@/lib/booking/states";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { bookingConfirmedEmail, bookingDeclinedEmail } from "@/lib/email/templates";

// Confirming and declining a deposit booking — the two moments a person makes
// the decision the whole design reserves for a person.
//
// The money rule that shapes both: never tell a customer something about their
// payment that the payment provider has not actually done. So a confirmation
// that cannot capture does not claim to have charged, and nothing moves until
// the provider says it did.

export type BookingActionResult = { ok: true; message: string } | { ok: false; message: string };

type Row = {
  id: string;
  reference: string;
  status: string;
  deposit_held_at: string | null;
  guest_name: string;
  /** Null when the customer booked as a guest without one. */
  guest_email: string | null;
  deposit_amount: number | null;
  deposit_status: string;
  payment_authorization_id: string | null;
  journey_snapshot: unknown;
  starts_at: string | null;
  slot_label: string | null;
};

function productTitle(row: Row): string {
  const snapshot = Array.isArray(row.journey_snapshot) ? row.journey_snapshot : [];
  const first = snapshot[0] as { title?: unknown } | undefined;
  return typeof first?.title === "string" ? first.title : "your booking";
}

async function load(id: string): Promise<Row | null> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reservations")
    .select(
      "id, reference, status, guest_name, guest_email, deposit_amount, deposit_status, deposit_held_at, payment_authorization_id, journey_snapshot, starts_at, slot_label"
    )
    .eq("id", id)
    .maybeSingle();
  return (data as Row) ?? null;
}

function refresh(id: string) {
  revalidatePath(`/admin/reservations/${id}`);
  revalidatePath("/admin/reservations");
}

/**
 * Confirms the date and takes the deposit.
 *
 * Capture happens FIRST, and a failure stops everything. The alternative —
 * marking the booking confirmed and sorting the money out afterwards — would
 * send a customer an email saying their deposit has been charged when it has
 * not, which is the same class of untruth as confirming a booking nobody
 * checked. If the authorization has expired there is a real decision to make,
 * and it belongs to a person: confirm without a deposit, or go back to the
 * customer.
 */
export async function confirmBooking(reservationId: string): Promise<BookingActionResult> {
  await requireReservationsStaff();
  const row = await load(reservationId);
  if (!row) return { ok: false, message: "That booking no longer exists." };

  const from = bookingStateFromRow(row);
  if (!canTransition(from, "confirmed")) {
    return { ok: false, message: `A booking that is "${from}" cannot be confirmed.` };
  }

  const supabase = createAdminSupabaseClient();
  const now = new Date().toISOString();
  let captured = false;

  if (row.deposit_status === "authorized" && row.payment_authorization_id) {
    const result = await paymentProvider().capture(row.payment_authorization_id);
    if (!result.ok) {
      return {
        ok: false,
        message:
          result.reason === "expired"
            ? "The hold on this deposit has expired, so it cannot be charged. Confirm without a deposit, or ask the customer to pay again."
            : `The deposit could not be charged: ${result.message} Nothing has been changed.`,
      };
    }
    captured = true;
    await supabase
      .from("reservations")
      .update({
        deposit_status: "captured",
        deposit_paid_at: now,
        payment_capture_id: result.id,
        updated_at: now,
      })
      .eq("id", reservationId);
  }

  await supabase
    .from("reservations")
    .update({ status: "confirmed", updated_at: now })
    .eq("id", reservationId);

  // A guest booking has no address to write to. The decision still stands —
  // it is recorded either way — but the admin has to be told that nobody has
  // been notified, in the same message that reports the decision, or a
  // confirmed booking sits there with a customer who never heard.
  const noEmail = !row.guest_email;
  if (row.guest_email) try {
    const email = bookingConfirmedEmail({
      reference: row.reference,
      guestName: row.guest_name,
      productTitle: productTitle(row),
      startsAt: row.starts_at,
      slotLabel: row.slot_label,
      // Only ever true when the provider said so.
      depositChargedUsd: captured ? row.deposit_amount : null,
    });
    await sendIdempotentEmail({
      idempotencyKey: `booking-confirmed:${reservationId}`,
      notificationType: "booking_confirmed",
      to: row.guest_email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      reservationId,
    });
  } catch (err) {
    console.error("booking confirmation email failed (booking IS confirmed):", err);
  }

  refresh(reservationId);
  const tellThemYourself = noEmail
    ? " This booking has no email address — call or message the customer to tell them."
    : "";
  return {
    ok: true,
    message: captured
      ? `Confirmed, and the $${row.deposit_amount} deposit has been charged.${tellThemYourself}`
      : `Confirmed. No deposit was held, so nothing was charged.${tellThemYourself}`,
  };
}

/**
 * Egypt Eye cannot do this date.
 *
 * Distinct from cancelling: this is the house saying no, so the deposit is
 * never taken. The release is attempted, but a failure does not block the
 * decline — an authorization that is never captured expires on its own and the
 * customer is not charged either way, so the email's promise holds regardless.
 * A failed release is reported to the person doing this so they can clear it in
 * PayPal rather than discovering it later.
 */
export async function declineBooking(reservationId: string, reason?: string): Promise<BookingActionResult> {
  await requireReservationsStaff();
  const row = await load(reservationId);
  if (!row) return { ok: false, message: "That booking no longer exists." };

  const from = bookingStateFromRow(row);
  if (!canTransition(from, "declined")) {
    return { ok: false, message: `A booking that is "${from}" cannot be declined.` };
  }

  const supabase = createAdminSupabaseClient();
  const now = new Date().toISOString();
  let releaseNote = "";
  let depositStatus = row.deposit_status;

  if (row.deposit_status === "authorized" && row.payment_authorization_id) {
    const result = await paymentProvider().release(row.payment_authorization_id);
    if (result.ok) {
      depositStatus = "voided";
    } else {
      // Recorded as failed rather than voided, because claiming a release that
      // did not happen would hide a hold that somebody has to clear by hand.
      depositStatus = "failed";
      releaseNote = ` The hold could not be released automatically (${result.message}) — clear it in PayPal. The customer is not charged either way.`;
    }
    await supabase
      .from("reservations")
      .update({ deposit_status: depositStatus, updated_at: now })
      .eq("id", reservationId);
  }

  await supabase
    .from("reservations")
    .update({ status: "declined", updated_at: now })
    .eq("id", reservationId);

  const declineNoEmail = !row.guest_email;
  if (row.guest_email) try {
    const email = bookingDeclinedEmail({
      reference: row.reference,
      guestName: row.guest_name,
      productTitle: productTitle(row),
      startsAt: row.starts_at,
      slotLabel: row.slot_label,
      hadDeposit: row.deposit_amount !== null && row.deposit_status !== "not_required",
      reason: reason?.trim() || null,
    });
    await sendIdempotentEmail({
      idempotencyKey: `booking-declined:${reservationId}`,
      notificationType: "booking_declined",
      to: row.guest_email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      reservationId,
    });
  } catch (err) {
    console.error("booking declined email failed (booking IS declined):", err);
  }

  refresh(reservationId);
  // A captured deposit is money Egypt Eye is holding for a date it cannot do,
  // and the customer has just been emailed a promise of a full refund. The
  // refund itself happens in PayPal — this says so rather than letting the
  // booking look finished while someone is still owed.
  const owesRefund =
    row.deposit_status === "captured" && row.deposit_amount !== null
      ? ` Refund the $${row.deposit_amount} deposit in PayPal, then press "Refund recorded" — the customer has been promised it in full.`
      : "";
  return {
    ok: true,
    message: declineNoEmail
      ? `Declined. This booking has no email address, so nobody has been told — call or message the customer.${releaseNote}${owesRefund}`
      : `Declined, and the customer has been told.${releaseNote}${owesRefund}`,
  };
}

/** Marks that somebody has picked this up, so two people do not both chase it. */
export async function markBookingChecking(reservationId: string): Promise<BookingActionResult> {
  await requireReservationsStaff();
  const row = await load(reservationId);
  if (!row) return { ok: false, message: "That booking no longer exists." };
  if (!canTransition(bookingStateFromRow(row), "checking")) {
    return { ok: false, message: "Only a booking with a held deposit can be marked as being checked." };
  }
  await createAdminSupabaseClient()
    .from("reservations")
    .update({ status: "checking", updated_at: new Date().toISOString() })
    .eq("id", reservationId);
  refresh(reservationId);
  return { ok: true, message: "Marked as being checked." };
}

/**
 * Records that a PayPal payment link deposit arrived.
 *
 * Needed because a payment link tells the site nothing: PayPal takes the money
 * and the only connection back to a booking is the reference the customer was
 * asked to type into the note. So a person checks PayPal, finds the payment,
 * and records it here. That is the honest cost of the simple approach, and it
 * is one click per booking.
 *
 * Deliberately separate from confirming. Money arriving is not a decision
 * about whether the date can be done, and collapsing the two would put the
 * site back to confirming bookings nobody checked.
 */
export async function markDepositPaid(reservationId: string, note?: string): Promise<BookingActionResult> {
  await requireReservationsStaff();
  const row = await load(reservationId);
  if (!row) return { ok: false, message: "That booking no longer exists." };

  if (row.deposit_status === "captured") {
    return { ok: false, message: "This deposit is already recorded as paid." };
  }
  if (row.deposit_status !== "awaiting") {
    return { ok: false, message: `A deposit that is "${row.deposit_status}" cannot be marked paid.` };
  }

  const now = new Date().toISOString();
  await createAdminSupabaseClient()
    .from("reservations")
    .update({
      deposit_status: "captured",
      deposit_paid_at: now,
      deposit_held_at: row.deposit_held_at ?? now,
      // Whatever identifies the payment in PayPal, so the booking and the
      // payment can be tied together later without trusting memory.
      payment_capture_id: note?.trim() || null,
      updated_at: now,
    })
    .eq("id", reservationId);

  refresh(reservationId);
  return { ok: true, message: "Deposit recorded as paid. The date still needs confirming." };
}

/**
 * Records that a refund has actually been made in PayPal.
 *
 * The refund happens in PayPal, not here — but a booking that owes one must
 * not look settled until it is done. This is the difference between "we told
 * the customer we would refund" and "we did", and only the second is worth
 * anything to them.
 */
export async function markDepositRefunded(reservationId: string): Promise<BookingActionResult> {
  await requireReservationsStaff();
  const row = await load(reservationId);
  if (!row) return { ok: false, message: "That booking no longer exists." };
  if (row.deposit_status !== "captured") {
    return { ok: false, message: `A deposit that is "${row.deposit_status}" has nothing to refund.` };
  }
  await createAdminSupabaseClient()
    .from("reservations")
    .update({ deposit_status: "refunded", updated_at: new Date().toISOString() })
    .eq("id", reservationId);
  refresh(reservationId);
  return { ok: true, message: "Refund recorded." };
}
