import { defineArrayMember, defineField, defineType } from "sanity";
import { imageCreditField, imageTones } from "./objects";

const STORY_CATEGORIES = [
  "Celestial Events",
  "History & Culture",
  "Travel Guides",
  "Behind the Scenes",
  "News",
];

// Story body: standard rich text + images, plus a small set of reusable
// editorial blocks so future articles can be built visually in the Studio
// without any code changes. Each block type below is intentionally generic
// (not eclipse-specific) — see components/StoryBody.tsx for their renderers.
const bodyBlockTypes = [
  defineArrayMember({ type: "block" }),
  defineArrayMember({
    type: "image",
    options: { hotspot: true },
    fields: [defineField({ name: "caption", title: "Caption (optional)", type: "string" }), imageCreditField()],
  }),
  defineArrayMember({
    type: "object",
    name: "quoteBlock",
    title: "Pull Quote",
    fields: [
      defineField({ name: "quote", title: "Quote", type: "text", validation: (r) => r.required() }),
      defineField({ name: "attribution", title: "Attribution (optional)", type: "string" }),
    ],
    preview: { select: { title: "quote" } },
  }),
  defineArrayMember({
    type: "object",
    name: "calloutBlock",
    title: "Callout",
    description: "A boxed-out note — good for safety info, tips, or key facts.",
    fields: [
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "body", title: "Body", type: "text", validation: (r) => r.required() }),
      defineField({
        name: "tone",
        title: "Tone",
        type: "string",
        options: { list: ["Info", "Safety", "Highlight"] },
        initialValue: "Info",
      }),
    ],
    preview: { select: { title: "title", subtitle: "tone" } },
  }),
  defineArrayMember({
    type: "object",
    name: "galleryBlock",
    title: "Gallery",
    fields: [
      defineField({
        name: "images",
        title: "Images",
        type: "array",
        of: [{ type: "image", options: { hotspot: true }, fields: [imageCreditField()] }],
      }),
    ],
    preview: { select: {}, prepare: () => ({ title: "Gallery" }) },
  }),
  defineArrayMember({
    type: "object",
    name: "videoEmbedBlock",
    title: "Video Embed",
    fields: [
      defineField({
        name: "url",
        title: "Video URL (YouTube or Vimeo)",
        type: "url",
        validation: (r) => r.required(),
      }),
      defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
    ],
    preview: { select: { title: "url" } },
  }),
  defineArrayMember({
    type: "object",
    name: "countdownBlock",
    title: "Countdown",
    fields: [
      defineField({
        name: "event",
        title: "Event",
        type: "reference",
        to: [{ type: "event" }],
        validation: (r) => r.required(),
      }),
    ],
    preview: {
      select: { title: "event.name" },
      prepare: (selection: { title?: string }) => ({
        title: `Countdown: ${selection.title || "(choose an event)"}`,
      }),
    },
  }),
  defineArrayMember({
    type: "object",
    name: "experienceCardBlock",
    title: "Experience Card",
    description: "Links this story to a bookable Signature Experience.",
    fields: [
      defineField({
        name: "experience",
        title: "Experience",
        type: "reference",
        to: [{ type: "signatureExperience" }],
        validation: (r) => r.required(),
      }),
      defineField({ name: "eyebrow", title: "Eyebrow text (optional override)", type: "string" }),
    ],
    preview: {
      select: { title: "experience.name" },
      prepare: (selection: { title?: string }) => ({
        title: `Experience card: ${selection.title || "(choose an experience)"}`,
      }),
    },
  }),
  defineArrayMember({
    type: "object",
    name: "ctaBlock",
    title: "Call to Action",
    fields: [
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "body", title: "Body", type: "text" }),
      defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
      defineField({ name: "buttonHref", title: "Button link", type: "string" }),
    ],
    preview: { select: { title: "title" } },
  }),
];

export const story = defineType({
  name: "story",
  title: "Story",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft (Studio only)", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "draft",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured (shown large at the top of Stories)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (web address)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: STORY_CATEGORIES },
    }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }] }),
    defineField({
      name: "excerpt",
      title: "Excerpt (short summary shown on listing cards & hero)",
      type: "text",
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: "image",
      title: "Cover photo",
      type: "image",
      options: { hotspot: true },
      fields: [imageCreditField()],
    }),
    defineField({
      name: "imageTone",
      title: "Placeholder color (used until a photo is uploaded)",
      type: "string",
      options: { list: imageTones },
      initialValue: "giza",
    }),
    defineField({
      name: "body",
      title: "Article body",
      type: "array",
      of: bodyBlockTypes,
    }),
    defineField({
      name: "relatedExperience",
      title: "Related Experience",
      description: "If this story is connected to a bookable Signature Experience, link it here.",
      type: "reference",
      to: [{ type: "signatureExperience" }],
    }),
    defineField({
      name: "relatedTours",
      title: "Related Tours",
      description: "Tours this story should send readers toward — shown as a \"Where This Takes You\" section.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tour" }] }],
    }),
    defineField({
      name: "relatedStories",
      title: "Related Stories (\"Continue Exploring\")",
      type: "array",
      of: [{ type: "reference", to: [{ type: "story" }] }],
    }),
    defineField({
      name: "destinations",
      title: "Destinations covered",
      description: "E.g. 'Luxor', 'Cairo', 'Aswan' — used to connect this story to the right tours and experiences.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "badge",
      title: "Editorial badge (optional)",
      description: "Used to curate the Stories index without relying purely on publish date.",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Editor's Pick", value: "editorsPick" },
          { title: "Most Helpful", value: "mostHelpful" },
          { title: "Popular", value: "popular" },
        ],
      },
      initialValue: "none",
    }),
    defineField({ name: "publishedAt", title: "Published date", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({
      name: "primaryKeyword",
      title: "Primary keyword (internal — SEO strategy, not shown on the site)",
      type: "string",
    }),
    defineField({
      name: "secondaryKeywords",
      title: "Secondary keywords (internal — SEO strategy, not shown on the site)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "contentReviewDate",
      title: "Next content review due",
      description: "Set this for any story containing prices, opening hours, visa rules, or other information that can go stale — a reminder to re-verify before it quietly goes out of date.",
      type: "date",
    }),
    defineField({ name: "seoTitle", title: "SEO title (optional override)", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description (optional override)", type: "text" }),
    defineField({
      name: "ogImage",
      title: "Social sharing image (optional override)",
      description: "Defaults to the cover photo if left blank.",
      type: "image",
    }),
    defineField({ name: "canonicalUrl", title: "Canonical URL (optional)", type: "url" }),
    defineField({
      name: "noindex",
      title: "Hide from search engines (noindex)",
      description: "Turn on to keep this specific story out of Google — most stories should leave this off.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    { title: "Newest first", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle === "draft" ? "🔒 Draft" : subtitle === "archived" ? "🗄 Archived" : "✅ Published",
      media,
    }),
  },
});
