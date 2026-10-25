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
 * THE TWO THINGS THAT ARE EASY TO GET WRONG
 * =========================================================================
 * 1. A RATE IS NOT A PRICE. $150 is per HOUR and $200 is per PERSON. Rendered
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

export type Rate = {
  id: string;
  amountUsd: number;
  unit: "hour" | "person";
  /** What a page renders. The unit is never separated from the figure. */
  display: string;
  label: string;
  detail: string;
};

export const rates = {
  /**
   * The rooftop itself. The same figure the music session publishes, which is
   * why that page now reads it from here: it was never a music-specific rate,
   * it is what the location costs.
   */
  location: {
    id: "location",
    amountUsd: 150,
    unit: "hour",
    display: "$150 per hour",
    label: "Rooftop reservation",
    detail:
      "The rooftop above Giza, for the hours you book, with the pyramids across the skyline. Confirmed with the venue for your date.",
  },

  /**
   * A flying dress session on that rooftop.
   *
   * $199, NOT $200. The owner first said two hundred and then confirmed the
   * exact figure when asked, which matters because the Pyramids Rooftop
   * package in flyingDresses.ts has carried $199 with a verified flag all
   * along. Two figures a dollar apart for one product is worse than either,
   * because it is the kind of difference nobody notices until a customer does.
   */
  flyingDress: {
    id: "flying-dress",
    amountUsd: 199,
    unit: "person",
    display: "$199 per person",
    label: "Flying dress photoshoot",
    detail:
      "A dress from the collection in the colour you choose, an assistant throwing the fabric, and the directed session that goes with it.",
  },

  /** A session without the flying dress. */
  regular: {
    id: "regular",
    amountUsd: 100,
    unit: "person",
    display: "$100 per person",
    label: "Regular photoshoot",
    detail:
      "The same rooftop and the same direction, in your own clothes rather than one of ours.",
  },
} as const satisfies Record<string, Rate>;

/**
 * Said beside any rate. Both halves are the owner's own words and both matter:
 * decoration being included is unusual enough to be worth stating, and event
 * photography carrying a fee is the thing a customer should not discover in a
 * quotation.
 */
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
