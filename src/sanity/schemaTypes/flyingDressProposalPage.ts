import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * FLYING DRESSES EGYPT — THE PROPOSALS PAGE.
 *
 * =========================================================================
 * THE THREE HELD FACTS ARE THE POINT OF THIS TYPE
 * =========================================================================
 * The venue name, the street address and the changing room were supplied by
 * the owner and are deliberately NOT on the page. Each was held for a reason
 * written beside it in content/flyingDressProposal.ts: publishing a hotel's
 * name is a claim about somebody else's business, a published street address
 * is what a couple types into a map on the morning of their proposal, and
 * "may be available" published as a promise is something a guest in a dress
 * discovers is untrue at the venue.
 *
 * Until now releasing one meant a developer editing TypeScript, which is
 * backwards: the owner is the only person who CAN verify them. So each is a
 * value plus a switch, and the switch carries the warning. Off, the page
 * prints the interim wording that is true either way. On, it prints the fact.
 *
 * =========================================================================
 * WHAT IS NOT HERE
 * =========================================================================
 * THE DEPOSIT. proposalPayment.depositPercent is 25 and stays in the code
 * with the rest of the money authorities, for the reason the settings schema
 * gives: a percentage that can be edited in one place while the sentence
 * spelling it out in words sits in another is two numbers that will disagree.
 * The same argument that keeps the rate card's display string derived.
 *
 * THE PRICE. There is none. No figure has been set for a proposal and the
 * page says so; a field here would be an invitation to invent one.
 *
 * =========================================================================
 * EMPTY MEANS "USE THE ONE IN THE CODE"
 * =========================================================================
 * mergeProposalPage falls back field by field, so clearing a box restores the
 * sentence in content/flyingDressProposal.ts rather than publishing a blank.
 * An EMPTY LIST is different: it is read as a deliberate clearing, because
 * that is the only way to remove an inclusion you no longer offer.
 */

export const fdDecorationObject = defineType({
  name: "fdDecoration",
  title: "Decoration design",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Short id",
      type: "string",
      description:
        "Lower-case, no spaces, e.g. “red-heart-arch”. It travels with the enquiry so the " +
        "team knows which design was chosen, and it must not change once customers have used it.",
      validation: (r) =>
        r
          .required()
          .regex(/^[a-z0-9-]+$/, { name: "lower-case letters, numbers and hyphens" }),
    }),
    defineField({
      name: "name",
      title: "What you call it",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "What it looks like",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "A photograph of this design",
      type: "image",
      options: { hotspot: true },
      description:
        "REQUIRED. A catalogue entry without a photograph is a list item pretending to be a " +
        "design, and a customer choosing between names cannot choose.",
      validation: (r) => r.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Describe it for somebody who cannot see it",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
    }),
  ],
  preview: { select: { title: "name", subtitle: "description", media: "image" } },
});

const heldFact = (
  name: string,
  title: string,
  valueDescription: string,
  switchTitle: string,
  switchDescription: string
) => [
  defineField({ name, title, type: "string", group: "venue", description: valueDescription }),
  defineField({
    name: `${name}Published`,
    title: switchTitle,
    type: "boolean",
    group: "venue",
    initialValue: false,
    description: switchDescription,
  }),
];

export const flyingDressProposalPage = defineType({
  name: "flyingDressProposalPage",
  title: "Flying Dresses — Proposals page",
  type: "document",
  groups: [
    { name: "hero", title: "Headline", default: true },
    { name: "included", title: "What is included" },
    { name: "how", title: "How it works" },
    { name: "venue", title: "The venue" },
    { name: "decorations", title: "Decoration designs" },
    { name: "photos", title: "The photographs" },
  ],
  fields: [
    /* ---- Headline ---- */
    defineField({
      name: "heroEyebrow",
      title: "The small line above the headline",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroHeadline",
      title: "The headline",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroLede",
      title: "The paragraph under it",
      type: "text",
      rows: 4,
      group: "hero",
    }),

    /* ---- What is included ---- */
    defineField({
      name: "inclusions",
      title: "What is included",
      type: "array",
      group: "included",
      of: [defineArrayMember({ type: "fdInclusion" })],
      description:
        "Emptying this list removes the section. That is on purpose: it is the only way to drop " +
        "something you have stopped offering.",
    }),
    defineField({
      name: "personalisation",
      title: "What you can personalise",
      type: "array",
      group: "included",
      of: [defineArrayMember({ type: "fdInclusion" })],
      description:
        "Only things you have actually confirmed you do. Anything else is handled as a request " +
        "when somebody asks, not advertised here as a service.",
    }),

    /* ---- How it works ---- */
    defineField({
      name: "steps",
      title: "The sequence, in order",
      type: "array",
      group: "how",
      of: [defineArrayMember({ type: "fdInclusion" })],
      description: "Rendered numbered, so the order of this list is the order on the page.",
    }),

    /* ---- The venue ---- */
    defineField({
      name: "venueDescription",
      title: "The rooftop, described",
      type: "text",
      rows: 3,
      group: "venue",
      description:
        "True of the service whichever roof is confirmed for a given date, so it survives the " +
        "venue changing.",
    }),
    defineField({
      name: "venueNotTheComplex",
      title: "Not inside the archaeological complex",
      type: "text",
      rows: 3,
      group: "venue",
      description:
        "Keep this. A rooftop overlooking the pyramids is not the site itself, competitors blur " +
        "it, and a visitor choosing between the two deserves the difference said plainly rather " +
        "than implied.",
    }),
    ...heldFact(
      "venueName",
      "The venue's name",
      "Recorded for the team. It only reaches the page when the switch below is on.",
      "Publish the venue's name",
      "Turn on ONLY once you have confirmed the hotel, that the rooftop arrangement is current, " +
        "and that they are happy to be named publicly. Naming them is a claim about somebody " +
        "else's business as well as ours."
    ),
    ...heldFact(
      "venueAddress",
      "The street address",
      "Recorded for the team. It only reaches the page when the switch below is on.",
      "Publish the street address",
      "Turn on ONLY once the exact address is confirmed. This is what somebody types into a map " +
        "on the morning of their proposal: if any part of it is approximate, a couple arrives at " +
        "the wrong gate on the day."
    ),
    ...heldFact(
      "changingRoom",
      "Somewhere to change",
      "Recorded for the team. It only reaches the page when the switch below is on.",
      "Publish the changing room as a promise",
      "Turn on ONLY if it is guaranteed rather than “may be available”. Published as an " +
        "unconditional promise, it becomes something a guest already in a dress discovers is " +
        "untrue at the venue."
    ),
    defineField({
      name: "changingRoomInterim",
      title: "What the page says while that switch is off",
      type: "text",
      rows: 3,
      group: "venue",
      description: "Has to be true whether or not the room turns out to be guaranteed.",
    }),

    /* ---- Decorations ---- */
    defineField({
      name: "decorations",
      title: "The decoration designs",
      type: "array",
      group: "decorations",
      of: [defineArrayMember({ type: "fdDecoration" })],
      description:
        "EMPTY TODAY, and the page handles that honestly: it explains how choosing works and " +
        "offers to send the current designs. Add one here with its photograph and it appears on " +
        "the page as a real choice that carries into the enquiry. This is the field that turns " +
        "“we will send you what is available” into a catalogue.",
    }),
    defineField({
      name: "decorationInterim",
      title: "What the page says while there are no designs",
      type: "text",
      rows: 4,
      group: "decorations",
    }),

    /* ---- The photographs ---- */
    defineField({
      name: "photographyCountNote",
      title: "How many photographs",
      type: "string",
      group: "photos",
      description:
        "Say it the way you can stand behind. “More than a hundred edited photographs” is a " +
        "floor; an exact number is a promise somebody will count.",
    }),
    defineField({
      name: "photographyCovers",
      title: "What the set covers",
      type: "array",
      group: "photos",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "photographyDelivery",
      title: "How they arrive",
      type: "text",
      rows: 3,
      group: "photos",
    }),
    defineField({
      name: "photographyNoTurnaround",
      title: "Why no delivery deadline is published",
      type: "text",
      rows: 3,
      group: "photos",
      description:
        "Replace this with a deadline only if you intend to meet it every time. A turnaround time " +
        "is the easiest promise in photography to break.",
    }),
  ],
  preview: {
    select: { headline: "heroHeadline", decorations: "decorations" },
    prepare({ headline, decorations }) {
      const count = Array.isArray(decorations) ? decorations.length : 0;
      return {
        title: "Flying Dresses — Proposals page",
        subtitle:
          (headline || "Plan it so she never sees it coming") +
          "  ·  " +
          (count === 0 ? "no decoration designs yet" : `${count} decoration design${count === 1 ? "" : "s"}`),
      };
    },
  },
});
