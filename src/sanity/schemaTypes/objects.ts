import { defineField, defineType } from "sanity";

export const ratingObject = defineType({
  name: "rating",
  title: "Rating",
  type: "object",
  fields: [
    defineField({ name: "score", title: "Score (e.g. 4.98)", type: "number" }),
    defineField({ name: "count", title: "Review count", type: "number" }),
  ],
});

export const priceObject = defineType({
  name: "price",
  title: "Price",
  type: "object",
  fields: [
    defineField({
      name: "amount",
      title: "Price (USD)",
      type: "number",
      description: "Leave empty to show 'Ask us for today's rate' instead of a price.",
    }),
    defineField({
      name: "originalAmount",
      title: "Original price (for a strikethrough discount)",
      type: "number",
    }),
    defineField({
      name: "note",
      title: "Note shown instead of a price",
      type: "string",
      initialValue: "Ask us for today's rate",
    }),
  ],
});

export const itineraryDayObject = defineType({
  name: "itineraryDay",
  title: "Itinerary Day",
  type: "object",
  fields: [
    defineField({ name: "day", title: "Day number", type: "number", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "title", subtitle: "day" },
    prepare: ({ title, subtitle }) => ({ title, subtitle: `Day ${subtitle}` }),
  },
});

// Fallback gradient tone, used only until a real photo is uploaded.
export const imageTones = [
  { title: "Giza (gold)", value: "giza" },
  { title: "Nile (deep teal)", value: "nile" },
  { title: "Desert (terracotta)", value: "desert" },
  { title: "Luxor (gold/dusk)", value: "luxor" },
  { title: "Jordan (rose)", value: "jordan" },
  { title: "Red Sea (turquoise)", value: "redsea" },
];

// A factory (not a shared object literal) so every image field that uses
// this gets its own independent field definition — spread into any `image`
// field's `fields: [...]` array to add source/license tracking. Collapsed
// by default so it doesn't clutter the editing experience; only needs
// filling in when the photo comes from outside your own photography.
export function imageCreditField() {
  return defineField({
    name: "credit",
    title: "Image Credit / Source",
    description: "Where this photo came from — keep this filled in for anything that isn't your own photography.",
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({
        name: "source",
        title: "Source",
        type: "string",
        options: {
          list: [
            "Own Photography",
            "Unsplash",
            "Pexels",
            "Wikimedia Commons",
            "AI Generated",
            "Other Licensed Source",
          ],
        },
      }),
      defineField({ name: "creator", title: "Photographer / Creator", type: "string" }),
      defineField({ name: "sourceUrl", title: "Source URL", type: "url" }),
      defineField({ name: "license", title: "License (e.g. 'Unsplash License', 'CC BY 4.0')", type: "string" }),
      defineField({
        name: "attributionText",
        title: "Attribution text (only if the license requires it)",
        type: "string",
      }),
    ],
  });
}
