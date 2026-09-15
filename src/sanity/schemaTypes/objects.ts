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

// How demanding a tour or experience actually is, shown as a four-segment
// bar on its page. The note is the part travelers act on — say what the
// effort consists of here specifically (stairs, deep sand, a boat ladder,
// hours in the saddle) rather than repeating the tier name back at them.
export const physicalLevelObject = defineType({
  name: "physicalLevel",
  title: "Physical activity level",
  type: "object",
  fields: [
    defineField({
      name: "tier",
      title: "Level",
      type: "string",
      options: {
        list: [
          { title: "Easy — little walking, no rough ground", value: "easy" },
          { title: "Moderate — a few hours on your feet, some uneven ground", value: "moderate" },
          { title: "Active — sustained walking, sand, stairs or water activity", value: "active" },
          { title: "Challenging — long climbs, early starts, or demanding terrain", value: "challenging" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "note",
      title: "What to expect",
      description:
        "One or two sentences on the physical side of this specific outing — walking time, stairs, sand, climbing, horseback, water entry.",
      type: "text",
      rows: 2,
      validation: (r) => r.required().max(240),
    }),
  ],
  preview: {
    select: { tier: "tier", note: "note" },
    prepare: (s: { tier?: string; note?: string }) => ({
      title: s.tier ? s.tier[0].toUpperCase() + s.tier.slice(1) : "(no level set)",
      subtitle: s.note,
    }),
  },
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

// A shared "SEO" field group — grouped into a collapsed object so it doesn't
// crowd the main editing fields, with sensible fallbacks handled on the
// frontend (page title/description/cover photo) so the site stays SEO-safe
// even when these are left blank.
export function seoFields() {
  return defineField({
    name: "seo",
    title: "SEO",
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({
        name: "seoTitle",
        title: "SEO title (optional override)",
        description: "Defaults to the page title. Aim for 30-60 characters.",
        type: "string",
      }),
      defineField({
        name: "seoDescription",
        title: "Meta description (optional override)",
        description: "Defaults to the page description. Aim for 50-160 characters.",
        type: "text",
      }),
      defineField({ name: "canonicalUrl", title: "Canonical URL (optional)", type: "url" }),
      defineField({
        name: "ogImage",
        title: "Social sharing image (optional override)",
        description: "Defaults to the page's own photo if left blank.",
        type: "image",
      }),
      defineField({
        name: "noindex",
        title: "Hide from search engines (noindex)",
        description: "Turn on to keep this specific page out of Google — most pages should leave this off.",
        type: "boolean",
        initialValue: false,
      }),
    ],
  });
}
