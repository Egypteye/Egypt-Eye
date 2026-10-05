// The sentences a customer reads about their deposit, in one place.
//
// They appear on the secure page, in the acknowledgement email and on the
// account page. Three copies of a sentence is three chances for one of them to
// drift into claiming a confirmation that has not happened, which is the one
// failure this whole design exists to avoid.
//
// Kept free of `server-only` imports on purpose, so scripts/check-booking.mts
// can assert the rules against the real strings rather than a paraphrase.

/**
 * What is instant, and what a person still does.
 *
 * This sentence replaced two things, and both changes are deliberate.
 *
 * It no longer names a reply window. There used to be a promised "48 hours"
 * here, repeated into the emails, the account page and the admin panel — a
 * number nobody at Egypt Eye had committed to, which the site was making on
 * their behalf, on every booking. A promise with a clock on it is only worth
 * making if somebody is accountable for the clock, and the honest version is
 * to say what happens rather than when.
 *
 * It also no longer opens with "This is not an instant booking." Booking here
 * IS instant in the sense a customer means: choose a date, pay the deposit,
 * done, in one popup, with no account and no waiting for a reply before you
 * can commit. The part that is not instant is narrower and worth stating
 * exactly — the date becomes final when a person has checked it. Saying
 * "not instant" about the whole thing undersold the product and, next to a
 * button that says Instant Booking, read as a contradiction.
 *
 * What must never appear is a claim that the date IS confirmed. That rule is
 * unchanged and is enforced by claimsConfirmation below.
 */
export const HUMAN_CONFIRMS =
  "Booking here is instant: you choose your date, add any extras and pay your deposit in one step. " +
  "Confirming the date is the one part a person does — a member of our team checks availability and " +
  "comes back to you personally. We would rather confirm properly than confirm quickly.";

/**
 * How the deposit is taken, which changes what is true about the money.
 *
 * - "none": no deposit is being collected at all.
 * - "paid": the money moves when the customer pays. A date we cannot do means
 *   a refund, and nothing may describe the money as merely held.
 * - "hold": an authorization. Nothing moves until a person confirms, and a
 *   date we cannot do is a void rather than a refund.
 *
 * This describes what happens to the MONEY, never which rail carried it. That
 * distinction is the whole point and it was nearly lost: the mode used to be
 * called "link", because a PayPal payment link was the only way money moved
 * at payment time. The moment a PayPal API order with CAPTURE intent exists,
 * "not a link" stops meaning "not charged" — and code picking the mode by
 * asking "is there a link?" would have told a customer their money was held
 * while PayPal had already taken it. That sentence is how disputes start.
 *
 * So the question is always "has the money moved?", and the refund promise
 * follows from the answer rather than from the plumbing.
 */
export type PaymentMode = "none" | "paid" | "hold";

/** What the money is doing. */
export function moneyState(depositLabel: string | null, mode: PaymentMode = "hold"): string {
  if (!depositLabel || mode === "none") {
    return "Nothing has been charged. Our team will come back to you with the details and what happens next.";
  }
  if (mode === "paid") {
    return (
      `Your ${depositLabel} deposit holds this date while we check it, and is credited toward your ` +
      "final price. " +
      "If we cannot confirm the date you asked for, we refund it in full."
    );
  }
  return (
    `Your deposit of ${depositLabel} is held, not charged. We only take it once your date is confirmed, ` +
    "and if we cannot confirm it the hold is released and you are not charged at all."
  );
}

/**
 * What happens next, with no clock on it.
 *
 * The alternatives half matters as much as the first: a customer whose date is
 * unavailable needs to hear the nearest dates in the same message, or the
 * answer is just a no and the booking is lost.
 */
export function replyPromise(): string {
  return (
    "We will come back to you with your confirmation, or with the nearest dates we can offer if that one " +
    "is not possible."
  );
}

/**
 * Whether a piece of copy asserts that a booking IS confirmed.
 *
 * The distinction that matters, and the one a blunt search for "confirmed"
 * gets wrong: a *condition* is fine and often necessary — "we only take it
 * once your date is confirmed" is exactly the sentence a customer needs — while
 * an *assertion* is the thing that must never appear before a person has
 * decided. So a claim preceded by once/until/when/if/after/unless is read as
 * the condition it is.
 */
const CONDITIONAL = "(?:once|until|when|if|after|unless|before)\\s+";
const CLAIMS = ["is confirmed", "are confirmed", "has been confirmed"];

export function claimsConfirmation(text: string): boolean {
  return CLAIMS.some((claim) => {
    const asClaim = new RegExp(`(?<!${CONDITIONAL})\\b[\\w ]*?\\b${claim}\\b`, "i");
    if (!asClaim.test(text)) return false;
    // Re-check the specific match in context: the lookbehind above only sees
    // the token immediately before the phrase, and "once your date is
    // confirmed" puts two words between them.
    const found = new RegExp(`([\\w' ]{0,40})\\b${claim}\\b`, "gi");
    for (const match of text.matchAll(found)) {
      if (!new RegExp(`\\b(?:once|until|when|if|after|unless|before)\\b`, "i").test(match[1])) {
        return true;
      }
    }
    return false;
  });
}
