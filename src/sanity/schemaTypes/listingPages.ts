import { defineField, defineType } from "sanity";

// Singleton — hero + intro copy for the 5 catalog listing pages
// (/tours, /experiences, /photoshoots, /signature-experiences, /stories).
// The cards on each page (tours, experiences, etc.) come from their own
// content types, not from here — this only covers the surrounding chrome.
export const listingPages = defineType({
  name: "listingPages",
  title: "Listing Pages",
  type: "document",
  fields: [
    defineField({
      name: "tours",
      title: "/tours page",
      type: "object",
      fields: [
        defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
        defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
        defineField({
          name: "sectionTitleTemplate",
          title: "Section title (use \"{count}\" for the live tour count)",
          description: "E.g. \"{count} private, guided itineraries\" — {count} is replaced with the real, current number of tours.",
          type: "string",
        }),
        defineField({ name: "sectionDescription", title: "Section description", type: "text", rows: 2 }),
        defineField({
          name: "faqs",
          title: "FAQ (this page only, separate from the site-wide FAQ list)",
          type: "array",
          of: [
            {
              type: "object",
              name: "faqItem",
              fields: [
                defineField({ name: "question", title: "Question", type: "string", validation: (r) => r.required() }),
                defineField({ name: "answer", title: "Answer", type: "text", validation: (r) => r.required() }),
              ],
              preview: { select: { title: "question" } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "experiences",
      title: "/experiences page",
      type: "object",
      fields: [
        defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
        defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
        defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
        defineField({ name: "sectionDescription", title: "Section description", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "photoshoots",
      title: "/photoshoots page",
      type: "object",
      fields: [
        defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
        defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
        defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
        defineField({ name: "sectionDescription", title: "Section description", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "signatureExperiences",
      title: "/signature-experiences page",
      type: "object",
      fields: [
        defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
        defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
        defineField({ name: "heroDescription", title: "Hero description", type: "text", rows: 2 }),
        defineField({ name: "collectionEyebrow", title: "Collection section eyebrow", type: "string" }),
        defineField({
          name: "collectionTitleSingular",
          title: "Collection section title (when there's exactly 1 experience)",
          type: "string",
        }),
        defineField({
          name: "collectionTitlePlural",
          title: "Collection section title (when there's more than 1)",
          type: "string",
        }),
        defineField({ name: "collectionDescription", title: "Collection section description", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "stories",
      title: "/stories page",
      type: "object",
      fields: [
        defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
        defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
        defineField({ name: "heroDescription", title: "Hero description", type: "text", rows: 2 }),
        defineField({ name: "emptyStateText", title: "Text shown if there are no stories yet", type: "string" }),
        defineField({ name: "moreStoriesEyebrow", title: "\"More stories\" section eyebrow", type: "string" }),
        defineField({ name: "moreStoriesTitle", title: "\"More stories\" section title", type: "string" }),
        defineField({ name: "readStoryLabel", title: "Featured story's \"read more\" label", type: "string" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Listing Pages" }) },
});
