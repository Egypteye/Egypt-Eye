// The sentences a customer reads about their deposit, in one place.
//
// They appear on the secure page, in the acknowledgement email and on the
// account page. Three copies of a sentence is three chances for one of them to
// drift into claiming a confirmation that has not happened, which is the one
// failure this whole design exists to avoid.
//
// Kept free of `server-only` imports on purpose, so scripts/check-booking.mts
// can assert the rules against the real strings rather than a paraphrase.

/** How long a customer is told they will wait. Said once, used everywhere. */
export const REPLY_WINDOW = "48 hours";

export const NOT_INSTANT =
  "This is not an instant booking. A member of our team checks availability for your date and confirms it personally — usually within " +
  REPLY_WINDOW +
  ". We would rather confirm properly than confirm quickly.";

/**
 * How the deposit is taken, which changes what is true about the money.
 *
 * - "none": no deposit is being collected at all.
 * - "link": a PayPal payment link. The money moves when the customer pays, so
 *   nothing may describe it as held, and a date we cannot do means a refund.
 * - "hold": an authorization. Nothing moves until a person confirms.
 *
 * The distinction is not pedantry. Telling a customer their money is "held"
 * when PayPal has actually taken it is the kind of sentence that produces a
 * dispute, and the refund promise has to match whichever is true.
 */
export type PaymentMode = "none" | "link" | "hold";

/** What the money is doing. */
export function moneyState(depositLabel: string | null, mode: PaymentMode = "hold"): string {
  if (!depositLabel || mode === "none") {
    return "Nothing has been charged. Our team will come back to you with the details and what happens next.";
  }
  if (mode === "link") {
    return (
      `Your ${depositLabel} deposit secures this date and is credited toward your final price. ` +
      "If we cannot confirm the date you asked for, we refund it in full."
    );
  }
  return (
    `Your deposit of ${depositLabel} is held, not charged. We only take it once your date is confirmed, ` +
    "and if we cannot confirm it the hold is released and you are not charged at all."
  );
}

export function replyPromise(): string {
  return (
    `You will hear from us within ${REPLY_WINDOW} with your confirmation, or with the nearest dates we can ` +
    "offer if that one is not possible."
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
