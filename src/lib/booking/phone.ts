// The phone number a booking is reachable on.
//
// This became load-bearing the moment email stopped being required. A guest
// booking with no email has exactly one way back to the customer, so an
// unusable number is not a cosmetic problem — it is a booking the desk cannot
// fulfil and a deposit they may have to refund for no reason.
//
// Deliberately not a full E.164 validator. Guessing national number lengths
// per country gets a real traveller's real number rejected, which is worse
// than accepting one that needs a second look: a human reads these. The rules
// here only catch what is certainly unusable — no country code, or too few
// digits to be anybody's phone number.

import { DIAL_CODES, dialCodeFor } from "./countryCodes";

/** Digits only, so spaces, dashes, brackets and dots a customer types are fine. */
export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

export type PhoneResult =
  | { ok: true; e164: string; display: string }
  | { ok: false; message: string };

/**
 * A dial code and a national number, combined.
 *
 * Leading zeros are dropped from the national part: Egyptians write their
 * mobile as 010…, and "+20 010…" is not dialable. This is the single most
 * common way an international number arrives broken, so it is handled rather
 * than rejected.
 */
export function composePhone(iso: unknown, national: unknown): PhoneResult {
  const code = dialCodeFor(iso);
  if (!code) {
    return { ok: false, message: "Please choose your country code." };
  }
  if (typeof national !== "string") {
    return { ok: false, message: "Please enter your phone number." };
  }

  const digits = digitsOnly(national).replace(/^0+/, "");
  if (digits === "") {
    return { ok: false, message: "Please enter your phone number." };
  }
  if (digits.length < 6) {
    return { ok: false, message: "That phone number looks too short. Please include the full number." };
  }
  // E.164 caps the whole number at 15 digits including the country code.
  const dialDigits = digitsOnly(code.dial);
  if (dialDigits.length + digits.length > 15) {
    return { ok: false, message: "That phone number looks too long. Please check it." };
  }

  return {
    ok: true,
    e164: `+${dialDigits}${digits}`,
    // What the desk reads, and what goes in the emails: the code kept separate
    // so somebody scanning a list can see which country a booking came from.
    display: `${code.dial} ${digits}`,
  };
}

/**
 * The reverse of composePhone, for prefilling only.
 *
 * A form rendering a number somebody already gave us — a saved profile, a
 * draft enquiry — has one string and needs the two controls that produced it.
 * This is the only reason it exists, so it validates nothing.
 *
 * AN UNREADABLE NUMBER GETS NO COUNTRY, deliberately. A stored "07911 123456"
 * could be British, and a stored "010 1234 5678" could be Egyptian, and
 * nothing in the string says which. Defaulting such a value to Egypt and then
 * composing it on save would rewrite a British mobile as +207911123456 and
 * store the result as though the customer had said so. So the country comes
 * back empty, the select opens unchosen, and composePhone answers "Please
 * choose your country code" until a human picks one. The digits are handed
 * back untouched, so nothing is lost while they decide.
 *
 * LONGEST DIAL CODE FIRST. Otherwise "+971..." matches "+9" on the way past
 * and the United Arab Emirates becomes whichever country owns the shorter
 * code. Sorted once per call rather than kept as module state, because this
 * runs when a form mounts and not again.
 */
export function splitPhone(value: unknown): { iso: string; national: string } {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (trimmed.startsWith("+")) {
    const longestFirst = [...DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
    for (const entry of longestFirst) {
      if (trimmed.startsWith(entry.dial)) {
        return { iso: entry.iso, national: trimmed.slice(entry.dial.length).trim() };
      }
    }
  }
  return { iso: "", national: trimmed };
}
