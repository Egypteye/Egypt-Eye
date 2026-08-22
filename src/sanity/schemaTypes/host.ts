import { defineField, defineType } from "sanity";
import { imageCreditField } from "./objects";

// A reusable person profile — a host/guide who can be assigned to one or
// more Signature Experiences (see signatureExperience.ts's `hosts` field).
// Kept as its own document type (rather than embedded per-experience) so
// the same host can appear across multiple experiences as the catalog grows.
export const host = defineType({
  name: "host",
  title: "Host / Guide",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "role", title: "Role (e.g. 'Guest Experience Host')", type: "string" }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "A real photo of this person — please don't use a stock photo here.",
      fields: [imageCreditField()],
    }),
    defineField({ name: "bio", title: "Bio", type: "text", validation: (r) => r.required() }),
    defineField({ name: "languages", title: "Languages", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "experience",
      title: "Experience line (e.g. '12 years hosting private journeys across Egypt')",
      type: "string",
    }),
    defineField({
      name: "personality",
      title: "Personality / why they're part of this experience",
      type: "text",
    }),
    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
