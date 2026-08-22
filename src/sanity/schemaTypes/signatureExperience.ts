import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones } from "./objects";

const ITEM_CATEGORIES = [
  "Wellness",
  "Dining",
  "Culture",
  "Scenic",
  "Free Time",
  "Social",
  "Travel",
  "Shopping",
  "Photography",
];

// Signature Experiences is a distinct product category from the tour
// catalog: emotionally-led, curated experiences built around a specific
// guest rather than a destination. Each is its own document (not a
// singleton) so the catalog can grow to many over time — see structure.ts
// for where this shows up in the Studio, and
// src/app/(site)/signature-experiences/ for the frontend.
export const signatureExperience = defineType({
  name: "signatureExperience",
  title: "Signature Experience",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      description:
        "Draft: only visible in the Studio. Coming Soon: visible on the site with a waitlist-style CTA. Published: fully live and bookable. Archived: hidden from the site but kept for reference.",
      type: "string",
      options: {
        list: [
          { title: "Draft (not visible on the site)", value: "draft" },
          { title: "Coming Soon", value: "comingSoon" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "draft",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", initialValue: 0 }),

    defineField({ name: "name", title: "Experience name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (web address)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "forWhom",
      title: "Who it's for (short line, shown on the card)",
      type: "string",
      description: "E.g. 'For women who've spent years taking care of everyone else.'",
    }),
    defineField({ name: "emotionalHeadline", title: "Hero headline", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "shortDescription",
      title: "Short description (card + listing)",
      type: "text",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "heroImage",
      title: "Hero photo",
      type: "image",
      options: { hotspot: true },
      fields: [imageCreditField()],
    }),
    defineField({
      name: "heroImageTone",
      title: "Placeholder color (used until a photo is uploaded)",
      type: "string",
      options: { list: imageTones },
      initialValue: "desert",
    }),
    defineField({
      name: "gallery",
      title: "Gallery photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true }, fields: [imageCreditField()] }],
    }),

    defineField({ name: "duration", title: "Duration (display text, e.g. '5 days / 4 nights')", type: "string" }),
    defineField({ name: "groupSize", title: "Group size (e.g. 'Private, just for you' or 'Max 6 guests')", type: "string" }),
    defineField({ name: "luxuryLevel", title: "Luxury level tag (e.g. 'Ultra-Luxury')", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "price", title: "Price", type: "price" }),

    defineField({
      name: "whoIsThisForTitle",
      title: '"Who Is This For" title',
      type: "string",
      initialValue: "Who This Was Designed For",
    }),
    defineField({ name: "whoIsThisForBody", title: '"Who Is This For" body', type: "text" }),

    defineField({
      name: "whyWeCreatedThisTitle",
      title: '"Why We Created This" title',
      type: "string",
      initialValue: "Why We Created This",
    }),
    defineField({ name: "whyWeCreatedThisBody", title: '"Why We Created This" body', type: "text" }),

    defineField({
      name: "experienceIntro",
      title: '"The Experience" intro copy',
      type: "text",
    }),
    defineField({
      name: "experienceHighlights",
      title: '"The Experience" visual highlights',
      description: "Short visual-storytelling moments (not a full itinerary) shown as an editorial grid.",
      type: "array",
      of: [
        {
          type: "object",
          name: "highlight",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text" }),
            defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, fields: [imageCreditField()] }),
          ],
          preview: { select: { title: "title", media: "image" } },
        },
      ],
    }),

    defineField({
      name: "itineraryDays",
      title: "Itinerary",
      description: "One entry per day. Build each day as a time-based journey, not a list of stops.",
      type: "array",
      of: [
        {
          type: "object",
          name: "itineraryDay",
          fields: [
            defineField({ name: "dayNumber", title: "Day number", type: "number", validation: (r) => r.required() }),
            defineField({ name: "title", title: "Day title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "description", title: "Day description", type: "text" }),
            defineField({ name: "image", title: "Day photo", type: "image", options: { hotspot: true }, fields: [imageCreditField()] }),
            defineField({
              name: "items",
              title: "Moments in the day",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "itineraryItem",
                  fields: [
                    defineField({ name: "time", title: "Time (e.g. '09:00')", type: "string" }),
                    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
                    defineField({ name: "duration", title: "Duration (e.g. '90 minutes')", type: "string" }),
                    defineField({ name: "description", title: "Description", type: "text" }),
                    defineField({ name: "location", title: "Location", type: "string" }),
                    defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true } }),
                    defineField({
                      name: "category",
                      title: "Category",
                      type: "string",
                      options: { list: ITEM_CATEGORIES },
                    }),
                    defineField({
                      name: "includedOrOptional",
                      title: "Included or optional",
                      type: "string",
                      options: {
                        list: [
                          { title: "Included", value: "included" },
                          { title: "Optional add-on", value: "optional" },
                        ],
                      },
                      initialValue: "included",
                    }),
                    defineField({
                      name: "notes",
                      title: "Notes (why this is part of the experience, booking info, etc.)",
                      type: "text",
                    }),
                  ],
                  preview: {
                    select: { title: "title", subtitle: "time", media: "image" },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "dayNumber", media: "image" },
            prepare: ({ title, subtitle, media }) => ({ title, subtitle: `Day ${subtitle}`, media }),
          },
        },
      ],
    }),

    defineField({
      name: "careTitle",
      title: '"Everything Is Taken Care Of" title',
      type: "string",
      initialValue: "You Enjoy the Experience. We Handle the Details.",
    }),
    defineField({ name: "careIntro", title: "Care section intro", type: "text" }),
    defineField({
      name: "careItems",
      title: "What we take care of",
      description: "E.g. 'Airport arrival & transfers', 'Every restaurant reservation', 'Your photography, start to finish'",
      type: "array",
      of: [{ type: "string" }],
    }),

    defineField({
      name: "hosts",
      title: "Hosts / Guides",
      type: "array",
      of: [{ type: "reference", to: [{ type: "host" }] }],
    }),

    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text" }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),

    defineField({
      name: "testimonials",
      title: "Testimonials",
      description: "Pick from your existing testimonials, or add new ones under Testimonials first.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "testimonial" }] }],
    }),

    defineField({
      name: "relatedStory",
      title: "Related story",
      description: "A Story that gives background on this experience — shown as a \"Read the Story\" link on the page.",
      type: "reference",
      to: [{ type: "story" }],
    }),

    defineField({ name: "seoTitle", title: "SEO title (optional override)", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description (optional override)", type: "text" }),
    defineField({ name: "canonicalUrl", title: "Canonical URL (optional)", type: "url" }),
    defineField({
      name: "ogImage",
      title: "Social sharing image (optional override)",
      description: "Defaults to the hero photo if left blank.",
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
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "status", media: "heroImage" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle === "draft" ? "🔒 Draft" : subtitle === "comingSoon" ? "🕓 Coming Soon" : subtitle === "archived" ? "🗄 Archived" : "✅ Published",
      media,
    }),
  },
});
