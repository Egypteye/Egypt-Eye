import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones, seoFields, translationsField } from "./objects";

// Take Egypt Home — the shopping section, managed from the Studio.
//
// ONE PRICING MODEL, NOT FOUR. The obvious reading of the brief is a
// different price shape per category: karat and weight for cartouches, base
// plus personalisation for papyrus, size for clothing, bottle for oils. That
// would be four schemas, four editing experiences and four places to fix a
// bug, and it falls apart the first time a cartouche is sold in two chain
// lengths.
//
// What those four actually have in common is the same three ideas:
//
//   Variants  — the same piece at a different price: 18k or silver, 50ml or
//               15ml, S/M/L. Each carries its own price and stock signal.
//   Options   — a paid extra on top: photo personalisation, a chain, a
//               presentation box.
//   Specs     — label/value facts that describe but do not price: karat,
//               weight, dimensions, scent, fabric.
//
// Every category's pricing falls out of those three, so there is one product
// type, one form, and adding a fifth category needs no schema work at all.

export const treasureSpec = defineType({
  name: "treasureSpec",
  title: "Specification",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "value", title: "Value", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "value" } },
});

export const availabilityStates = [
  { title: "In stock", value: "inStock" },
  { title: "Limited", value: "limited" },
  { title: "Out of stock", value: "outOfStock" },
  { title: "Check availability", value: "checkAvailability" },
];

export const treasureVariant = defineType({
  name: "treasureVariant",
  title: "Variant",
  type: "object",
  description: "The same piece at a different price — a metal, a size, a bottle.",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      description: 'What the customer picks: "18k gold", "50ml", "Medium".',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "price", title: "Price", type: "price" }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      options: { list: availabilityStates },
      initialValue: "checkAvailability",
    }),
  ],
  preview: { select: { title: "label", subtitle: "price.amount" } },
});

export const treasureOption = defineType({
  name: "treasureOption",
  title: "Paid extra",
  type: "object",
  description: "An addition on top of the price — personalisation, a chain, a box.",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "price", title: "Price", type: "price" }),
    defineField({ name: "note", title: "Note", type: "string" }),
  ],
  preview: { select: { title: "label", subtitle: "price.amount" } },
});

export const productStatuses = [
  { title: "Available — Reserve / Purchase", value: "available" },
  { title: "Pre-order — Pre-order for My Trip", value: "preorder" },
  { title: "On request — Request Availability", value: "onRequest" },
  { title: "Sold out — Currently Unavailable", value: "soldOut" },
  { title: "Hidden — not shown on the site at all", value: "hidden" },
];

export const treasureProduct = defineType({
  name: "treasureProduct",
  title: "Take Egypt Home — Product",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    translationsField("nameTranslations", "Name translations"),
    defineField({
      name: "slug",
      title: "Slug (web address)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "treasureCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      description: "Decides the button the customer sees, and whether the product appears at all.",
      type: "string",
      options: { list: productStatuses },
      initialValue: "onRequest",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "placeholder",
      title: "Sample listing (not a real product yet)",
      description:
        "Marks the card as a sample and keeps it out of structured data. Untick once the real name, photo and price are in — a sample with a price on it is a quote nobody authorised, and the build check will reject it.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({
      name: "order",
      title: "Display order",
      description: "Lower numbers first.",
      type: "number",
      initialValue: 100,
    }),
    defineField({
      name: "blurb",
      title: "Short description",
      description: "One or two lines, shown on the card.",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    translationsField("blurbTranslations", "Short description translations"),
    defineField({
      name: "description",
      title: "Full description",
      description: "Shown on the product's own panel. Optional.",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "image",
      title: "Main photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        imageCreditField(),
        defineField({ name: "alt", title: "Alt text", type: "string" }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ],
    }),
    defineField({
      name: "imageTone",
      title: "Placeholder colour (used until a photo is uploaded)",
      type: "string",
      options: { list: imageTones },
      initialValue: "desert",
    }),
    defineField({
      name: "gallery",
      title: "Gallery photos",
      description: "Drag to reorder. The first is used if no main photo is set.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            imageCreditField(),
            defineField({ name: "alt", title: "Alt text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({
      name: "price",
      title: "Price",
      description:
        "Leave the amount empty to show the note instead — that is the honest state for a commissioned piece with no fixed price. Fill 'Original price' only for a genuine former price.",
      type: "price",
    }),
    defineField({
      name: "variants",
      title: "Variants",
      description: "Metals, bottle sizes, clothing sizes. Each carries its own price and stock.",
      type: "array",
      of: [{ type: "treasureVariant" }],
    }),
    defineField({
      name: "options",
      title: "Paid extras",
      type: "array",
      of: [{ type: "treasureOption" }],
    }),
    defineField({
      name: "specs",
      title: "Specifications",
      description:
        "Karat, weight, dimensions, fabric, scent, bottle size. Facts that describe rather than price.",
      type: "array",
      of: [{ type: "treasureSpec" }],
    }),
    defineField({
      name: "availability",
      title: "Availability",
      description: "A stock signal shown as a badge. Mostly useful for clothing and oils.",
      type: "string",
      options: { list: availabilityStates },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "faqs",
      title: "Product FAQs",
      description: "Questions specific to this piece. Category-level questions belong on the category.",
      type: "array",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4 }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),
    seoFields(),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "status", media: "image" },
  },
});

export const treasureCategory = defineType({
  name: "treasureCategory",
  title: "Take Egypt Home — Category",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Name", type: "string", validation: (r) => r.required() }),
    translationsField("titleTranslations", "Name translations"),
    defineField({
      name: "slug",
      title: "Slug (web address)",
      description: "Changing this changes the URL and breaks existing links. Do it deliberately.",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "active", title: "Active", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 100 }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "heroHeadline", title: "Hero headline", type: "string" }),
    defineField({ name: "heroSub", title: "Hero subtitle", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Hero / featured photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        imageCreditField(),
        defineField({ name: "alt", title: "Alt text", type: "string" }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ],
    }),
    defineField({
      name: "imageTone",
      title: "Placeholder colour",
      type: "string",
      options: { list: imageTones },
      initialValue: "desert",
    }),
    defineField({ name: "cardHook", title: "Card hook", description: "The bold line on the landing card.", type: "string" }),
    defineField({ name: "cardBlurb", title: "Card description", type: "text", rows: 3 }),
    defineField({
      name: "story",
      title: "Cultural context",
      description: "Why this object means anything. Two or three blocks reads best.",
      type: "array",
      of: [
        {
          type: "object",
          name: "storyBlock",
          fields: [
            defineField({ name: "title", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Body", type: "text", rows: 5 }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
    defineField({
      name: "beforeYouArrive",
      title: "Before you arrive — steps",
      type: "array",
      of: [{ type: "treasureStep" }],
    }),
    defineField({
      name: "inEgypt",
      title: "Already in Egypt (optional)",
      description:
        "Fill this in only where visiting in person is genuinely the better route — clothing and fragrance. Leaving it empty hides the whole section.",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "title", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 4 }),
        defineField({ name: "steps", title: "Steps", type: "array", of: [{ type: "treasureStep" }] }),
      ],
    }),
    defineField({
      name: "trust",
      title: "Trust statements",
      description: "What is and is not settled before anyone commits.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "faqs",
      title: "Category FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4 }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),
    seoFields(),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "eyebrow", media: "image" } },
});

export const treasureStep = defineType({
  name: "treasureStep",
  title: "Step",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const takeEgyptHomePage = defineType({
  name: "takeEgyptHomePage",
  title: "Take Egypt Home — Landing Page",
  type: "document",
  fields: [
    defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
    defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
    defineField({ name: "heroSubtitle", title: "Hero subtitle", type: "text", rows: 3 }),
    defineField({
      name: "heroImage",
      title: "Hero photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        imageCreditField(),
        defineField({ name: "alt", title: "Alt text", type: "string" }),
      ],
    }),
    defineField({ name: "intro", title: "Intro paragraph", type: "text", rows: 5 }),
    defineField({ name: "categoriesTitle", title: "Categories section — title", type: "string" }),
    defineField({ name: "categoriesEyebrow", title: "Categories section — eyebrow", type: "string" }),
    defineField({ name: "journeysTitle", title: "How it works — title", type: "string" }),
    defineField({ name: "giftsTitle", title: "Gifts section — title", type: "string" }),
    defineField({ name: "giftsBody", title: "Gifts section — body", type: "text", rows: 5 }),
    defineField({ name: "giftsCtaLabel", title: "Gifts section — button label", type: "string" }),
    defineField({
      name: "featuredProducts",
      title: "Featured products",
      description: "Optional. Shown on the landing page above the category cards.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "treasureProduct" }] }],
    }),
    defineField({
      name: "faqs",
      title: "Landing page FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4 }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),
    seoFields(),
  ],
  preview: { select: { title: "heroTitle" } },
});
