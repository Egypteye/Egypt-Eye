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

// A priced add-on a customer can tick in the booking popup — a camel ride, a
// video reel. Separate from the prose "Optional Add-Ons" list, which is what
// the page describes: these carry a price and a customer can select them.
//
// The price is read from here on the server when a booking arrives, never
// taken from the browser, so editing a figure here changes what is quoted and
// nothing a customer sends can change what they are charged.
//
// Extras are settled with the balance, not taken with the deposit: the PayPal
// payment link is one fixed amount per tier and cannot charge a variable
// total.
export const bookingExtraObject = defineType({
  name: "bookingExtra",
  title: "Bookable extra",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Extra",
      description: "What the customer sees, e.g. 'Camel Ride'.",
      type: "string",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "priceUsd",
      title: "Price (USD)",
      description:
        "What one of these costs. The customer picks a quantity and the line is price × quantity. It counts toward the booking total, so the deposit percentage applies to it. An extra with no price is hidden rather than offered free.",
      type: "number",
      validation: (r) => r.required().positive(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "priceUsd" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Extra",
      subtitle: typeof subtitle === "number" ? `$${subtitle}` : "No price — hidden",
    }),
  },
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

// Translations for one text field, keyed by locale.
//
// Sits beside the English field rather than replacing it — English stays where
// it has always been, so nothing an editor does in here can break the English
// site, and a field left empty simply falls back (see i18n/localizeContent.ts).
// Collapsed by default because most editing sessions are about the English
// copy and a seven-field block on every heading would bury it.
export function translationsField(name = "translations", title = "Translations") {
  return defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    description:
      "Optional. Leave a language empty and the English text is shown instead — a partly translated catalogue still reads correctly in every language.",
    fields: [
      defineField({ name: "ar", title: "العربية (Arabic)", type: "text", rows: 2 }),
      defineField({ name: "fr", title: "Français (French)", type: "text", rows: 2 }),
      defineField({ name: "es", title: "Español (Spanish)", type: "text", rows: 2 }),
      defineField({ name: "it", title: "Italiano (Italian)", type: "text", rows: 2 }),
      defineField({ name: "ru", title: "Русский (Russian)", type: "text", rows: 2 }),
    ],
  });
}

// An outfit in a product's collection — a Flying Dress colour, or a men's
// outfit beside it.
//
// There is NO price field here and that is the point. Everything in a
// collection is included in the experience price; an option that costs money
// belongs in "Bookable extras", which has a server-side quote behind it. A
// price here would be a number an editor could set that silently changes what
// a customer pays. See lib/booking/outfits.ts.
export const outfitObject = defineType({
  name: "outfit",
  title: "Outfit",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      description:
        "A short stable name used behind the scenes, e.g. 'cherry'. Lowercase, no spaces. Bookings are matched on this, so you can rename the outfit below without breaking past bookings — but changing THIS will orphan them, so set it once and leave it.",
      type: "string",
      validation: (r) =>
        r
          .required()
          .max(60)
          .regex(/^[a-z0-9][a-z0-9-]*$/, { name: "lowercase letters, numbers and hyphens" }),
    }),
    defineField({
      name: "name",
      title: "Name shown to customers",
      description: "e.g. 'Cherry'. Safe to change at any time.",
      type: "string",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "category",
      title: "Category",
      description:
        "Women's dresses and men's outfits are shown as two separate sections, on the page and in the booking popup.",
      type: "string",
      options: {
        list: [
          { title: "Women's flying dress", value: "womens-dress" },
          { title: "Men's outfit", value: "mens-outfit" },
        ],
        layout: "radio",
      },
      initialValue: "womens-dress",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Photograph",
      description:
        "The real garment. Upload this whenever you can — a customer choosing a dress wants to see the dress, not a coloured circle.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "hex",
      title: "Swatch colour (used only until a photo is uploaded)",
      description:
        "A hex colour like #9d2235. Shown as a circle, clearly labelled 'photo coming soon', until the photograph above exists. It is a placeholder, not a colour match.",
      type: "string",
      validation: (r) => r.regex(/^#[0-9a-fA-F]{6}$/, { name: "a hex colour like #9d2235" }).warning(),
    }),
    defineField({
      name: "note",
      title: "Short note (optional)",
      description: "A factual detail, e.g. 'long train'. Never a promise about availability.",
      type: "string",
      validation: (r) => r.max(160),
    }),
    defineField({
      name: "active",
      title: "Available to choose",
      description:
        "Switch off to retire an outfit. It disappears from the page and the booking popup, and bookings that already chose it still read back correctly.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", category: "category", media: "image", active: "active" },
    prepare: ({ title, category, media, active }) => ({
      title: title ?? "Outfit",
      subtitle:
        (category === "mens-outfit" ? "Men's outfit" : "Women's dress") +
        (active === false ? " — retired" : ""),
      media,
    }),
  },
});
