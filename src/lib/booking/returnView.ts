/**
 * WHAT THE PAGE AFTER PAYPAL IS ALLOWED TO SAY, SHAPED ONCE.
 *
 * =========================================================================
 * THE LINE THAT IS NOT IN THIS FILE
 * =========================================================================
 * Nothing about payment state is read from the URL. A customer landing on a
 * return page means their browser was redirected, which is not the same as a
 * payment having succeeded: the redirect can be replayed, bookmarked, shared,
 * or reached by someone who abandoned the payment and pressed back. The
 * booking is looked up by reference and the state comes from the database,
 * which is only ever written by a verified webhook or a person.
 *
 * So this reports. It never decides, and it never congratulates.
 *
 * =========================================================================
 * WHY IT IS A MODULE AND NOT A PAGE
 * =========================================================================
 * Two brands now have a return page, because Flying Dresses takes deposits on
 * its own domain and a customer must not be thrown onto another company's
 * chrome at the moment they come back from paying.
 *
 * The chrome is all that differs. The reading of the row is the dangerous
 * part and must not be done twice: whether a booking may be called confirmed,
 * and whether its deposit may be called charged, are answers that come from
 * states.ts via this shaping, not from whichever page is rendering. A second
 * copy of this function is a second place for "charged" to drift away from
 * what the money actually did.
 *
 * Kept free of `server-only` imports so scripts/check-booking.mts can run it
 * over real rows. The Supabase read that feeds it lives in returnLookup.ts,
 * which is server-only because the service-role client has to be.
 * CLAUDE.md section 6.
 */

import { bookingStateFromRow, stateCopy } from "./states";

/** The columns the return page reads. Nothing else is selected. */
export type ReturnRow = {
  reference: string;
  status: string;
  deposit_status?: string | null;
  deposit_amount?: number | null;
  starts_at?: string | null;
  slot_label?: string | null;
  journey_snapshot?: unknown;
};

export type ReturnView = {
  reference: string;
  copy: ReturnType<typeof stateCopy>;
  title: string;
  when: string | null;
  depositAmount: number | null;
  /**
   * The heading. Computed here rather than in a page, because this is the
   * sentence the whole design exists to get right: on the way back from a
   * payment the only state that may claim a confirmation is one a person put
   * the booking into.
   */
  heading: string;
  /** "charged" or "not charged", from the state rather than from the redirect. */
  depositStatusLabel: string | null;
};

export function shapeReturnView(row: ReturnRow): ReturnView {
  const copy = stateCopy(bookingStateFromRow(row));
  const snapshot = Array.isArray(row.journey_snapshot) ? row.journey_snapshot : [];
  const first = snapshot[0] as { title?: unknown } | undefined;
  const depositAmount = row.deposit_amount ?? null;

  return {
    reference: row.reference,
    copy,
    title: typeof first?.title === "string" ? first.title : "Your booking",
    when: row.starts_at
      ? `${new Date(row.starts_at).toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}${row.slot_label ? ` · ${row.slot_label}` : ""}`
      : null,
    depositAmount,
    heading: copy.isConfirmed ? "Your date is confirmed" : "Thank you — we have your booking",
    depositStatusLabel: depositAmount === null ? null : copy.charged ? "charged" : "not charged",
  };
}

/** What either brand says when the reference matches nothing. */
export function missingBookingCopy(reference: string): { heading: string; body: string[] } {
  return {
    heading: "We could not find that booking",
    body: [
      reference
        ? `Nothing here matches ${reference}. If you have just paid, your email is the reliable record, so please check your inbox.`
        : "This page needs a booking reference. The email we sent has yours.",
      "If something looks wrong, message us and we will sort it out, quoting that reference if you have it.",
    ],
  };
}
