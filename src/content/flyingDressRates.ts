/**
 * THE RATE CARD, confirmed by the owner in October 2026.
 *
 * =========================================================================
 * WHY THIS IS ONE FILE
 * =========================================================================
 * Three figures now appear across several pages, and the only way two pages
 * quote different numbers at the same customer is if two pages hold their own
 * copy of a number. They do not. Everything that shows a rate reads it from
 * here, including the music session, which had its own `rooftopRate` until
 * this file existed.
 *
 * The owner's words, which is what everything below is derived from:
 *
 *   "Location reservation is $150 per hour. Flying dresses photoshoot at the
 *    rooftop is $200 per person. The regular photoshoot is $100 per person.
 *    All happens in the rooftop overlooking the pyramids. Photography for
 *    events are with extra fees. Yet decoration in these services are
 *    included."
 *
 * =========================================================================
 * THESE VALUES ARE NOW THE FALLBACK, NOT THE ONLY SOURCE
 * =========================================================================
 * October 2026: the owner asked to run this brand's backend themselves, so a
 * Sanity singleton (flyingDressRateCard) can override the three amounts and
 * the sentences below. `mergeRateCard` in _lib/contentMerge.ts does the
 * merging, field by field, and what is in this file is what the site shows
 * when no document exists or a field is left empty.
 *
 * TWO THINGS DID NOT MOVE INTO THE STUDIO, on purpose:
 *
 *   The UNIT. $150 is per hour because the rooftop is let by the hour, and
 *   $199 is per person because a session is priced per head. That is the
 *   charging model, not a price: flipping one would make the "a session is
 *   priced per person, an event is the room by the hour" sentence on every
 *   occasion page false, and the pages would not know. A change there is a
 *   change to the copy around it, which is a code change.
 *
 *   The DISPLAY STRING. It is derived from the amount and the unit by
 *   `displayFor` below, never typed and never stored. An editable "$150 per
 *   hour" field beside an editable `150` is two places to change one number,
 *   and the failure is silent: the page keeps saying $150 while the amount
 *   says 200. Derivation makes that unrepresentable.
 *
 * =========================================================================
 * THE TWO THINGS THAT ARE EASY TO GET WRONG
 * =========================================================================
 * 1. A RATE IS NOT A PRICE. $150 is per HOUR and $199 is per PERSON. Rendered
 *    as a bare figure, each is wrong by a factor of however many hours or
 *    however many people. Every entry here carries its unit, and the unit is
 *    part of the string a page renders.
 *
 * 2. A SESSION IS NOT AN EVENT. A photoshoot is charged per person. A
 *    ceremony or a party is the location by the hour, and the owner was
 *    explicit that photography for an EVENT carries an additional fee. The
 *    boundary between the two is not always obvious from the outside, so no
 *    page here decides it silently: each says which applies to it and leaves
 *    the edge cases to the quotation.
 *
 * DECORATION IS INCLUDED. Stated plainly by the owner, and it is a real
 * competitive advantage: the comparable services found in research either
 * charge for styling separately or do not offer it at all.
 */

export type RateUnit = "hour" | "person";

export type Rate = {
  id: string;
  amountUsd: number;
  unit: RateUnit;
  /** What a page renders. The unit is never separated from the figure. */
  display: string;
  label: string;
  detail: string;
};

export type RateId = "location" | "flyingDress" | "regular";

export type RateCard = {
  location: Rate;
  flyingDress: Rate;
  regular: Rate;
  decorationIncluded: string;
  eventPhotography: string;
  termsNotSet: string;
};

/**
 * The one place a figure becomes a sentence.
 *
 * Exported because the Studio preview and the check script both need to say
 * what a given amount will read as, and a second implementation of this is a
 * second answer.
 */
export function displayFor(amountUsd: number, unit: RateUnit): string {
  return `$${amountUsd} per ${unit}`;
}

function rate(
  id: string,
  amountUsd: number,
  unit: RateUnit,
  label: string,
  detail: string
): Rate {
  return { id, amountUsd, unit, display: displayFor(amountUsd, unit), label, detail };
}

export const rates: Record<RateId, Rate> = {
  /**
   * The rooftop itself. The same figure the music session publishes, which is
   * why that page now reads it from here: it was never a music-specific rate,
   * it is what the location costs.
   */
  location: rate(
    "location",
    150,
    "hour",
    "Rooftop reservation",
    "The rooftop above Giza, for the hours you book, with the pyramids across the skyline. Confirmed with the venue for your date."
  ),

  /**
   * A flying dress session on that rooftop.
   *
   * $199, NOT $200. The owner first said two hundred and then confirmed the
   * exact figure when asked, which matters because the Pyramids Rooftop
   * package in flyingDresses.ts has carried $199 with a verified flag all
   * along. Two figures a dollar apart for one product is worse than either,
   * because it is the kind of difference nobody notices until a customer does.
   */
  flyingDress: rate(
    "flying-dress",
    199,
    "person",
    "Flying dress photoshoot",
    "A dress from the collection in the colour you choose, an assistant throwing the fabric, and the directed session that goes with it."
  ),

  /** A session without the flying dress. */
  regular: rate(
    "regular",
    100,
    "person",
    "Regular photoshoot",
    "The same rooftop and the same direction, in your own clothes rather than one of ours."
  ),
};

/**
 * ONLY WHERE IT IS TRUE. The owner confirmed decoration is included in the
 * anniversary, maternity and vow renewal services, and confirmed separately
 * that it is NOT included in birthdays and private celebrations, where it is
 * arranged and priced in the quotation.
 *
 * So this sentence is rendered behind `pricing.decorationIncluded` rather than
 * printed on anything that imports the rate card. A shared module stating a
 * blanket "decoration is included" is one import away from making a false
 * claim on the birthday page.
 */
export const RATES_INCLUDE_DECORATION =
  "Decoration is included in this service. You choose a setup from the designs we are running for your date and it is part of what you are paying, not an extra on top.";

export const RATES_EVENT_PHOTOGRAPHY =
  "Photography for an event is charged separately. A photoshoot is priced per person; a ceremony or a party is the rooftop by the hour, with the photography quoted on top of it.";

/**
 * Deliberately absent, because none of it has been set: a minimum booking, a
 * deposit, an overtime rate, a cancellation policy, how many photographs a
 * session delivers, or when they arrive.
 */
export const RATES_TERMS_NOT_SET =
  "We do not publish a minimum booking, a deposit, an overtime rate or a cancellation policy, because none has been set. You get the terms for your booking in writing with the quotation.";

/** The whole card as the site reads it when the Studio holds nothing. */
export const localRateCard: RateCard = {
  location: rates.location,
  flyingDress: rates.flyingDress,
  regular: rates.regular,
  decorationIncluded: RATES_INCLUDE_DECORATION,
  eventPhotography: RATES_EVENT_PHOTOGRAPHY,
  termsNotSet: RATES_TERMS_NOT_SET,
};

/* ------------------------------------------------------------------------ */
/* Prose that quotes a rate                                                  */
/* ------------------------------------------------------------------------ */

/**
 * WHY THE FAQ ANSWERS CARRY A TOKEN INSTEAD OF A FIGURE.
 *
 * Several answers quote a rate inside a sentence: "a regular photoshoot is
 * $100 per person and a flying dress photoshoot is $199 per person". Those
 * strings used to be built with `${rates.regular.display}` at module load,
 * which was correct while the only source was this file and silently wrong
 * the moment the Studio could change a price: the money section would render
 * the new figure from Sanity and the answer below it would keep the old one,
 * baked in at import. Two numbers for one product on one page, which is the
 * exact failure this file was created to prevent.
 *
 * So prose holds `{{flyingDress}}` and the figure arrives at render, from
 * whichever card is in force. `fillRates` is pure and has no idea Sanity
 * exists, so the check script can test it.
 *
 * An unknown token is LEFT ALONE rather than replaced with a blank. A visitor
 * seeing `{{dress}}` is a bug report; a sentence that silently loses its price
 * is a quotation nobody questions.
 */
export const RATE_TOKENS: readonly RateId[] = ["location", "flyingDress", "regular"];

export function fillRates(text: string, card: RateCard): string {
  return text.replace(/\{\{(location|flyingDress|regular)\}\}/g, (_match, key: RateId) =>
    card[key].display
  );
}

/** Every token used in a string, so a check can prove each one resolves. */
export function rateTokensIn(text: string): string[] {
  return [...text.matchAll(/\{\{([a-zA-Z]+)\}\}/g)].map((m) => m[1]);
}
