import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * FLYING DRESSES EGYPT — THE GENDER REVEAL PAGE.
 *
 * =========================================================================
 * THE THREE ABSENCES THIS PAGE IS BUILT AROUND
 * =========================================================================
 * This service has more unknowns than any other, and the page's whole shape
 * comes from stating them rather than filling them in. Each one has a box
 * here so the owner can replace the absence with a fact the day they set one,
 * and each box says what replacing it commits them to.
 *
 *   NO PHOTOGRAPH COUNT. How many there are depends on how many people come.
 *   NO DELIVERY DEADLINE. The easiest promise in photography to break.
 *   NO PAYMENT TERMS AT ALL. Not an unpublished figure: nothing has been
 *   agreed. The proposal's 25/75 split was supplied for the proposal and does
 *   not transfer, which is why it is not quietly reused here.
 *
 * =========================================================================
 * THE MECHANISM IS DELIBERATELY NOT A LIST OF PROPS
 * =========================================================================
 * What pops, sprays, burns or drifts is the venue's call and changes by date
 * and by wind. Publishing a named effect is how somebody arrives expecting
 * something that was never possible, so the page describes how the decision
 * is made instead. The boxes below are written that way; keep them that way.
 *
 * =========================================================================
 * WHAT IS NOT HERE
 * =========================================================================
 * `revealPayment.termsSet` and the team note beside it stay in the code: they
 * are the record that no terms exist, read by the check script, and not a
 * sentence for a visitor. The venue naming note is the same. Neither is a
 * field an editor should be able to contradict from a browser.
 */

export const fdRevealThemeObject = defineType({
  name: "fdRevealTheme",
  title: "Colour theme",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Short id",
      type: "string",
      description:
        "Lower-case, no spaces. It travels with the enquiry so the team knows which theme was " +
        "chosen, and it must not change once customers have used it.",
      validation: (r) =>
        r.required().regex(/^[a-z0-9-]+$/, { name: "lower-case letters, numbers and hyphens" }),
    }),
    defineField({ name: "label", title: "What you call it", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "detail",
      title: "What it means in practice",
      type: "text",
      rows: 3,
      description:
        "Remember who is reading. A parent who does not know the result cannot pick the revealing " +
        "colour, so these are really about whether the decoration is allowed to give anything " +
        "away and who decides it. A plain pink-or-blue chooser is incoherent for the person using it.",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "detail" } },
});

export const flyingDressRevealPage = defineType({
  name: "flyingDressRevealPage",
  title: "Flying Dresses — Gender reveal page",
  type: "document",
  groups: [
    { name: "secret", title: "The secret", default: true },
    { name: "included", title: "What is included" },
    { name: "mechanism", title: "How the moment happens" },
    { name: "themes", title: "Themes & decoration" },
    { name: "how", title: "The sequence" },
    { name: "photos", title: "Photographs & video" },
    { name: "practical", title: "Practical" },
  ],
  fields: [
    /* ---- The secret ---- */
    defineField({
      name: "secretLede",
      title: "The secret, introduced",
      type: "text",
      rows: 3,
      group: "secret",
      description:
        "The part of this service that is unlike anything else you sell. It is built around the " +
        "one person who knows.",
    }),
    defineField({
      name: "secretSteps",
      title: "How the secret is handled",
      type: "array",
      group: "secret",
      of: [defineArrayMember({ type: "fdInclusion" })],
    }),

    /* ---- Included ---- */
    defineField({
      name: "inclusions",
      title: "What is included",
      type: "array",
      group: "included",
      of: [defineArrayMember({ type: "fdInclusion" })],
    }),

    /* ---- The mechanism ---- */
    defineField({
      name: "mechanismLede",
      title: "How the moment happens, introduced",
      type: "text",
      rows: 3,
      group: "mechanism",
    }),
    defineField({
      name: "mechanismPoints",
      title: "Why no prop is promised here",
      type: "array",
      group: "mechanism",
      of: [defineArrayMember({ type: "fdInclusion" })],
      description:
        "DO NOT turn these into a list of named effects. What is allowed in the air is the " +
        "venue's call and changes by date and by wind; a named prop on this page is how somebody " +
        "arrives expecting something that was never possible.",
    }),
    defineField({
      name: "mechanismEvidenceNote",
      title: "What the photograph at the top actually proves",
      type: "text",
      rows: 3,
      group: "mechanism",
      description:
        "It is one real reveal this team ran: the decoration on one evening, not a design anybody " +
        "can order by name. Keep the distinction, because the picture is persuasive enough to be " +
        "read as a catalogue if the words let it.",
    }),

    /* ---- Themes and decoration ---- */
    defineField({
      name: "themes",
      title: "The colour themes",
      type: "array",
      group: "themes",
      of: [defineArrayMember({ type: "fdRevealTheme" })],
    }),
    defineField({
      name: "themeNote",
      title: "What the theme choice actually commits to",
      type: "text",
      rows: 3,
      group: "themes",
      description:
        "A starting point carried into the enquiry, not a confirmed design: the decoration is " +
        "agreed with the secret keeper and the venue. Say so.",
    }),
    defineField({
      name: "decorations",
      title: "The decoration designs",
      type: "array",
      group: "themes",
      of: [defineArrayMember({ type: "fdDecoration" })],
      description:
        "Empty today. Add one with its photograph and it appears as a real choice that carries " +
        "into the enquiry.",
    }),
    defineField({
      name: "decorationInterim",
      title: "What the page says while there are no designs",
      type: "text",
      rows: 4,
      group: "themes",
    }),

    /* ---- The sequence ---- */
    defineField({
      name: "steps",
      title: "The sequence, in order",
      type: "array",
      group: "how",
      of: [defineArrayMember({ type: "fdInclusion" })],
    }),

    /* ---- Photographs and video ---- */
    defineField({ name: "photographyHeading", title: "Photographs — heading", type: "string", group: "photos" }),
    defineField({
      name: "photographyCovers",
      title: "What the set covers",
      type: "array",
      group: "photos",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "photographyDelivery", title: "How they arrive", type: "text", rows: 3, group: "photos" }),
    defineField({
      name: "photographyNoCount",
      title: "Why no number of photographs is published",
      type: "text",
      rows: 3,
      group: "photos",
      description:
        "Replace this with a number only if you will hit it at every size of event. How many " +
        "there are depends on how many people come.",
    }),
    defineField({
      name: "photographyNoTurnaround",
      title: "Why no delivery deadline is published",
      type: "text",
      rows: 3,
      group: "photos",
    }),
    defineField({ name: "videoLede", title: "Video — introduction", type: "text", rows: 3, group: "photos" }),
    defineField({
      name: "videoPoints",
      title: "What the film includes",
      type: "array",
      group: "photos",
      of: [defineArrayMember({ type: "string" })],
      description: "This is yours in house rather than a supplier's, which is why it can be stated plainly.",
    }),
    defineField({ name: "videoNote", title: "How video is quoted", type: "text", rows: 3, group: "photos" }),

    /* ---- Practical ---- */
    defineField({
      name: "quoteNote",
      title: "How the quotation works",
      type: "text",
      rows: 3,
      group: "practical",
      description:
        "THERE IS NO PRICE FOR THIS SERVICE and no deposit or payment split has ever been agreed " +
        "for it. The proposal's terms were supplied for the proposal and do not transfer. If you " +
        "set terms for a gender reveal, tell the developer rather than writing them in here: the " +
        "booking flow has to agree with them.",
    }),
    defineField({ name: "venueHeading", title: "The venue — heading", type: "string", group: "practical" }),
    defineField({
      name: "venueGuestsNote",
      title: "How many people can come",
      type: "text",
      rows: 3,
      group: "practical",
      description: "A venue question rather than yours. Keep it that way until a number is confirmed.",
    }),
    defineField({ name: "durationNote", title: "How long it takes", type: "string", group: "practical" }),
    defineField({ name: "leadTimeNote", title: "How much notice is needed", type: "string", group: "practical" }),
    defineField({
      name: "whoItIsFor",
      title: "Who it is for",
      type: "array",
      group: "practical",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "maternityHeading", title: "Maternity cross-sell — heading", type: "string", group: "practical" }),
    defineField({
      name: "maternityDetail",
      title: "Maternity cross-sell — detail",
      type: "text",
      rows: 3,
      group: "practical",
      description:
        "This one is safe to state plainly because BOTH records carry it: the reveal lists the " +
        "maternity session and the maternity record lists the reveal. Do not add a cross-sell " +
        "here that the other page does not reciprocate.",
    }),
  ],
  preview: {
    select: { themes: "themes", decorations: "decorations" },
    prepare({ themes, decorations }) {
      const t = Array.isArray(themes) ? themes.length : 0;
      const d = Array.isArray(decorations) ? decorations.length : 0;
      return {
        title: "Flying Dresses — Gender reveal page",
        subtitle: `${t} colour theme${t === 1 ? "" : "s"}  ·  ${
          d === 0 ? "no decoration designs yet" : `${d} decoration design${d === 1 ? "" : "s"}`
        }`,
      };
    },
  },
});
