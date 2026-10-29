import { defineField, defineType } from "sanity";

/**
 * FLYING DRESSES EGYPT — THE RATE CARD.
 *
 * =========================================================================
 * WHAT AN EDITOR CAN CHANGE HERE, AND WHAT THEY CANNOT
 * =========================================================================
 * Can: the three amounts, the label and the explanation beside each one, and
 * the three sentences the occasion pages print under the money.
 *
 * Cannot, deliberately:
 *
 *   THE UNIT. The rooftop is let by the hour and a session is priced per
 *   head. That is the charging model rather than a price, and every occasion
 *   page has copy built on it ("a session is priced per person, an event is
 *   the room by the hour"). A field that let somebody flip one would make
 *   that copy false without the page noticing. Changing it is a change to the
 *   writing around it, which is a code change.
 *
 *   THE DISPLAY STRING. "$150 per hour" is derived from the amount and the
 *   unit by displayFor() in content/flyingDressRates.ts, never typed and
 *   never stored. A text field beside a number field is two places to change
 *   one price, and the failure is silent: the page keeps reading $150 while
 *   the amount says 200. Derivation makes that impossible to represent.
 *
 * =========================================================================
 * EMPTY MEANS "USE THE ONE IN THE CODE"
 * =========================================================================
 * mergeRateCard falls back field by field, so clearing a field restores the
 * value in content/flyingDressRates.ts rather than publishing a blank or a
 * zero. An amount of 0 is NOT a way to say "free": validation refuses it,
 * because a rooftop at $0 per hour reads as a mistake to a customer and as a
 * price to a crawler.
 */

const amountField = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "number",
    description,
    validation: (Rule) =>
      Rule.required()
        .integer()
        .min(1)
        .max(100000)
        .error(
          "A whole number of US dollars, at least 1. Leave the field empty to go back to the " +
            "figure in the code; 0 is not a way to say free."
        ),
  });

const labelField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    description: "The short name beside the figure, e.g. “Flying dress photoshoot”.",
  });

const detailField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "text",
    rows: 3,
    description: "One or two sentences saying what the figure buys.",
  });

export const flyingDressRateCard = defineType({
  name: "flyingDressRateCard",
  title: "Flying Dresses — Rates",
  type: "document",
  groups: [
    { name: "rates", title: "The three rates", default: true },
    { name: "sentences", title: "What is said beside them" },
  ],
  fields: [
    /* ---- The rooftop, by the hour ---- */
    amountField(
      "locationAmountUsd",
      "Rooftop reservation — US dollars per HOUR",
      "Charged per hour. The site writes the unit itself, so enter 150 and not “$150 per hour”."
    ),
    labelField("locationLabel", "Rooftop reservation — label"),
    detailField("locationDetail", "Rooftop reservation — what it buys"),

    /* ---- A flying dress session, per person ---- */
    amountField(
      "flyingDressAmountUsd",
      "Flying dress photoshoot — US dollars per PERSON",
      "Charged per person, not per booking. Enter 199, not “$199 per person”."
    ),
    labelField("flyingDressLabel", "Flying dress photoshoot — label"),
    detailField("flyingDressDetail", "Flying dress photoshoot — what it buys"),

    /* ---- A session without the dress, per person ---- */
    amountField(
      "regularAmountUsd",
      "Regular photoshoot — US dollars per PERSON",
      "Charged per person. Enter 100, not “$100 per person”."
    ),
    labelField("regularLabel", "Regular photoshoot — label"),
    detailField("regularDetail", "Regular photoshoot — what it buys"),

    /* ---- The three sentences ---- */
    defineField({
      name: "decorationIncluded",
      title: "Decoration is included",
      type: "text",
      rows: 3,
      group: "sentences",
      description:
        "Printed ONLY on the occasions where decoration really is included: anniversaries, " +
        "maternity and vow renewals. Birthdays and private celebrations do not show it, because " +
        "the decoration there is quoted separately. That is set per occasion in the code, so " +
        "nothing you write here can put the claim on the birthday page.",
    }),
    defineField({
      name: "eventPhotography",
      title: "Event photography is charged separately",
      type: "text",
      rows: 3,
      group: "sentences",
      description:
        "Printed on the occasions that are EVENTS rather than photoshoots, which today is the " +
        "vow renewal. Keep both halves of the point: that a photoshoot is per person while an " +
        "event is the room by the hour, and that the photography is on top.",
    }),
    defineField({
      name: "termsNotSet",
      title: "Terms that have not been set",
      type: "text",
      rows: 3,
      group: "sentences",
      description:
        "The minimum booking, deposit, overtime rate and cancellation policy are not published " +
        "because none has been set. If you set one, say so here AND tell the developer, because " +
        "a published deposit changes what the booking flow is allowed to do.",
    }),
  ],
  preview: {
    select: {
      location: "locationAmountUsd",
      dress: "flyingDressAmountUsd",
      regular: "regularAmountUsd",
    },
    prepare({ location, dress, regular }) {
      // Shows the figures WITH their units, because a bare "150 / 199 / 100"
      // in a document list is three numbers whose meaning the reader has to
      // remember, and the unit is the half that is easy to get wrong.
      const part = (amount: number | undefined, unit: string, fallback: number) =>
        `$${amount ?? fallback} per ${unit}`;
      return {
        title: "Flying Dresses — Rates",
        subtitle: [
          part(location, "hour", 150),
          part(dress, "person", 199),
          part(regular, "person", 100),
        ].join("  ·  "),
      };
    },
  },
});
