import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * THE THINGS THAT COST MONEY.
 *
 * Three photoshoots, the optional extras, and the three hire services.
 *
 * =========================================================================
 * THE PRICE RULE, WHICH IS THE WHOLE REASON THIS NEEDS CARE
 * =========================================================================
 * The owner confirmed three prices and said, in terms, that they must remain
 * unchanged unless they approve a change. So the price field is editable —
 * it is their business and their number — but it carries a warning rather
 * than sitting silently next to the intro text, because the one field on this
 * form that can cost real money should not look like the others.
 *
 * `priceUsd` is INTEGER DOLLARS. This brand takes no payment: the Book button
 * hands over to egypteyetravel.com/secure/..., where the deposit is computed
 * in integer CENTS by productRail(), from the Egypt Eye photoshoot document.
 * That is one authority for money, per CLAUDE.md §5, and nothing here may
 * become a second one. This figure is the brochure price a visitor reads; it
 * is not what a card is charged.
 *
 * =========================================================================
 * eyeSlug IS A JOIN, NOT A LABEL
 * =========================================================================
 * It names the Egypt Eye photoshoot document that IS this shoot. Both brands
 * sell the same session, run by the same team, from the same wardrobe. Break
 * the slug and the deposit becomes unavailable and the page falls back to the
 * enquiry button — no crash, no error, just a quietly dead Book button. So it
 * is a fixed dropdown here, and check-flying-dresses.mts asserts all three
 * still resolve against the live Sanity data.
 */

export const flyingDressPackage = defineType({
  name: "flyingDressPackage",
  title: "Flying Dresses — Photoshoot",
  type: "document",
  groups: [
    { name: "main", title: "The shoot", default: true },
    { name: "price", title: "Price" },
    { name: "words", title: "Words & search" },
    { name: "faq", title: "Questions" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "main",
      options: { source: "name", maxLength: 40 },
      description:
        "This becomes the web address: /experiences/sand-dunes. CHANGING IT BREAKS EVERY LINK ANYONE HAS EVER SHARED and loses whatever the page has earned in search. Set it once.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Short name",
      type: "string",
      group: "main",
      description: "For cards and buttons: \"Sand Dunes\".",
      validation: (r) => r.required().max(30),
    }),
    defineField({
      name: "title",
      title: "Full title",
      type: "string",
      group: "main",
      description: "The heading on the page itself: \"Fayoum: the Lakes and the White Dunes\".",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "The small line above the title",
      type: "string",
      group: "main",
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: "order",
      title: "Position",
      type: "number",
      group: "main",
      description:
        "Lowest first, everywhere the three are listed. Use 10, 20, 30 so you can slot one in between later without renumbering.",
      initialValue: 10,
      validation: (r) => r.required().integer().min(0),
    }),

    /* ---- Price ---- */
    defineField({
      name: "priceUsd",
      title: "Price per person, US dollars",
      type: "number",
      group: "price",
      description:
        "⚠️ THE NUMBER A CUSTOMER READS. Whole dollars, no cents. Changing it changes what the site quotes immediately, on the home page, the photoshoots page, this page and the structured data Google reads. It does NOT change what a card is charged — the deposit is calculated on the Egypt Eye side from its own product.\n\nLEAVE IT EMPTY if nobody has set a price. Empty renders as \"Price on request\", which is honest, and the Book button steps aside for an enquiry. A zero would render as free.",
      validation: (r) =>
        r
          .integer()
          .min(1)
          .max(10000)
          .custom((v) =>
            typeof v === "number" && !Number.isInteger(v)
              ? "Whole dollars only. A price with cents in it will not match the figure shown elsewhere on the site."
              : true
          ),
    }),
    defineField({
      name: "durationNote",
      title: "How long this one takes",
      type: "string",
      group: "main",
      description:
        "Shown next to the price everywhere this shoot is listed. Write it the way you would say it: \"About forty-five minutes on the roof\". The site used to print \"30 to 45 minutes\" for every shoot, which was right for the rooftop and wrong for the desert, Fayoum and the yacht.",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "eyeSlug",
      title: "Which Egypt Eye photoshoot is this?",
      type: "string",
      group: "price",
      description:
        "How the Book button finds the real product to take a deposit against. Leave it empty for a shoot with no Egypt Eye counterpart — the Red Sea yacht has none — and the page offers an enquiry instead. If it is filled in but stops matching a published photoshoot, the Book button quietly disappears, which is exactly why it is checked.",
    }),
    defineField({
      name: "priceStoryHeading",
      title: "Explain the price? Heading",
      type: "string",
      group: "price",
      description:
        "Only fill this in for a price that looks surprising next to the others. Fayoum is $349 against $179, and the reason used to be buried in an FAQ three screens below the number it explains.",
    }),
    defineField({
      name: "priceStoryBody",
      title: "Explain the price? Paragraphs",
      type: "array",
      group: "price",
      of: [defineArrayMember({ type: "text" })],
      description:
        "It may never introduce a second figure. The only price on this page is the one above, and a check script holds that line.",
    }),

    /* ---- Words ---- */
    defineField({
      name: "intro",
      title: "Opening paragraph",
      type: "text",
      rows: 4,
      group: "words",
      validation: (r) => r.required().min(60),
    }),
    defineField({
      name: "metaDescription",
      title: "The line Google shows under the title",
      type: "text",
      rows: 3,
      group: "words",
      description:
        "110 to 160 characters. Leave it empty and the opening paragraph is used instead, which runs long and gets cut off mid-sentence.",
      validation: (r) =>
        r.custom((v) => {
          if (!v) return true;
          if (typeof v !== "string") return true;
          if (v.length < 110) return `${v.length} characters. Under 110 leaves half the line empty.`;
          if (v.length > 160) return `${v.length} characters. Over 160 gets cut off.`;
          return true;
        }),
    }),
    defineField({
      name: "whyThis",
      title: "Why this one rather than the other two",
      type: "array",
      group: "words",
      of: [defineArrayMember({ type: "string" })],
      description: "Three is the right number. These are what a visitor compares across the three shoots.",
    }),
    defineField({
      name: "gettingThere",
      title: "Where it is and how far",
      type: "text",
      rows: 2,
      group: "words",
      description:
        "Reproduce what is actually known rather than naming a site. \"Approximately 45 minutes from central Cairo towards New Cairo\" is the kind of sentence that gets silently turned into a named place that is then wrong.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "visualDirection",
      title: "What the photographs look like here",
      type: "text",
      rows: 3,
      group: "words",
    }),
    defineField({
      name: "image",
      title: "Hero photograph",
      type: "image",
      group: "main",
      options: { hotspot: true },
      description:
        "Landscape. Leave it empty and the page shows a designed gradient rather than a stock photograph — which is the house rule: a labelled gap beats a picture a visitor might mistake for your work.",
    }),
    defineField({
      name: "imageAlt",
      title: "Describe the photograph",
      type: "string",
      group: "main",
      description: "For someone who cannot see it, and for Google. Describe what is happening, never the filename.",
    }),
    defineField({
      name: "tone",
      title: "Gradient to use when there is no photograph",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "Dunes — warm sand", value: "dunes" },
          { title: "Rooftop — Giza haze", value: "rooftop" },
          { title: "Fayoum — pale sand and water", value: "fayoum" },
        ],
        layout: "radio",
      },
      initialValue: "rooftop",
      validation: (r) => r.required(),
    }),

    /* ---- Timeline + FAQ ---- */
    defineField({
      name: "timeline",
      title: "The shoot in order",
      type: "array",
      group: "main",
      of: [
        defineArrayMember({
          type: "object",
          name: "fdTimelineStep",
          fields: [
            defineField({ name: "when", title: "When", type: "string", validation: (r) => r.required() }),
            defineField({ name: "what", title: "What happens", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "when", subtitle: "what" } },
        }),
      ],
      description:
        "Confirmed facts only. Anything nobody has verified belongs in the enquiry conversation, not on the page.",
    }),
    defineField({
      name: "faqs",
      title: "Questions about this shoot",
      type: "array",
      group: "faq",
      of: [defineArrayMember({ type: "fdFaq" })],
      description:
        "These are marked up for Google as well as shown on the page, so they must be questions this page genuinely answers.",
    }),
  ],
  orderings: [
    { title: "Position", name: "order", by: [{ field: "order", direction: "asc" }] },
    { title: "Price", name: "price", by: [{ field: "priceUsd", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", price: "priceUsd", media: "image" },
    prepare: ({ title, price, media }) => ({
      title,
      subtitle: typeof price === "number" ? `$${price} per person` : "No price set",
      media,
    }),
  },
});

export const flyingDressAddOn = defineType({
  name: "flyingDressAddOn",
  title: "Flying Dresses — Extra",
  type: "document",
  fields: [
    defineField({
      name: "addOnId",
      title: "Identifier",
      type: "slug",
      options: { source: "label", maxLength: 40 },
      description: "Used in links that pre-fill the enquiry form. Set it once and leave it.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "What it is",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "priceUsd",
      title: "Price, US dollars",
      type: "number",
      description:
        "LEAVE THIS EMPTY if nobody has set a price. Empty renders as \"price on request\", which is honest. A zero renders as free, which is not the same thing and is the mistake this field is worded to prevent.",
      validation: (r) =>
        r.integer().min(1).max(10000).custom((v) =>
          v === 0 ? "Use an empty field for \"price on request\". Zero means free." : true
        ),
    }),
    defineField({
      name: "priceIsFrom",
      title: "Is that a starting price?",
      type: "boolean",
      initialValue: false,
      description: "Shows it as \"from $X\" rather than a flat figure.",
    }),
    defineField({
      name: "homeNote",
      title: "One line, for the home page table",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "detail",
      title: "The fuller description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "order",
      title: "Position",
      type: "number",
      initialValue: 10,
      validation: (r) => r.required().integer().min(0),
    }),
  ],
  orderings: [{ title: "Position", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "label", price: "priceUsd", from: "priceIsFrom", note: "homeNote" },
    prepare: ({ title, price, from, note }) => ({
      title,
      subtitle:
        typeof price === "number" ? `${from ? "from " : ""}$${price}` : `Price on request — ${note ?? ""}`,
    }),
  },
});

export const flyingDressRental = defineType({
  name: "flyingDressRental",
  title: "Flying Dresses — Hire service",
  type: "document",
  groups: [
    { name: "main", title: "The service", default: true },
    { name: "words", title: "Words & search" },
    { name: "faq", title: "Questions" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "main",
      options: { source: "name", maxLength: 40 },
      description: "Becomes /rentals/<this>. Changing it breaks shared links.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "name", title: "Short name", type: "string", group: "main", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Full title", type: "string", group: "main", validation: (r) => r.required() }),
    defineField({
      name: "order",
      title: "Position",
      type: "number",
      group: "main",
      initialValue: 10,
      validation: (r) => r.required().integer().min(0),
    }),
    defineField({
      name: "priceUsd",
      title: "Price, US dollars",
      type: "number",
      group: "main",
      description:
        "Leave empty until a per-day price is decided. Empty reads as \"ask us\", which is true. A number here is a commitment.",
      validation: (r) => r.integer().min(1).max(10000),
    }),
    defineField({
      name: "intro",
      title: "Opening paragraph",
      type: "text",
      rows: 4,
      group: "words",
      validation: (r) => r.required().min(40),
    }),
    defineField({
      name: "eyebrow",
      title: "The small line above the title",
      type: "string",
      group: "main",
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "summary",
      title: "One sentence — used on cards and by Google",
      type: "text",
      rows: 3,
      group: "words",
      description:
        "This is both the card blurb and the line Google shows under the title, so it has two jobs: say what the service is, and be worth clicking. 110 to 160 characters is the band Google renders.",
      validation: (r) =>
        r.required().custom((v) => {
          if (typeof v !== "string") return true;
          if (v.length < 60) return `${v.length} characters. Too short to say what this is.`;
          if (v.length > 200) return `${v.length} characters. Google will cut this off well before the end.`;
          return true;
        }),
    }),
    defineField({
      name: "howItWorks",
      title: "How it works, in order",
      type: "array",
      group: "main",
      of: [
        defineArrayMember({
          type: "object",
          name: "fdRentalStep",
          fields: [
            defineField({ name: "title", title: "Step", type: "string", validation: (r) => r.required() }),
            defineField({ name: "detail", title: "What happens", type: "text", rows: 2, validation: (r) => r.required() }),
          ],
          preview: { select: { title: "title", subtitle: "detail" } },
        }),
      ],
    }),
    defineField({
      name: "youGet",
      title: "What you get",
      type: "array",
      group: "main",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "notIncluded",
      title: "What you do NOT get",
      type: "array",
      group: "main",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Keep this honest and keep it on the page. A hire is not a photoshoot: no transport, no photographer, and no rooftop access — a roof with a pyramid view is a private roof, not a public one. This list is what stops somebody arriving expecting a session.",
    }),
    defineField({
      name: "faqs",
      title: "Questions",
      type: "array",
      group: "faq",
      of: [defineArrayMember({ type: "fdFaq" })],
    }),
  ],
  orderings: [{ title: "Position", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", price: "priceUsd" },
    prepare: ({ title, price }) => ({
      title,
      subtitle: typeof price === "number" ? `$${price}` : "Price on request",
    }),
  },
});
