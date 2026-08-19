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
