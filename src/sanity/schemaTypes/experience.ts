import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones, seoFields } from "./objects";

export const experience = defineType({
  name: "experience",
  title: "Extra Experience",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (web address)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({ name: "rating", title: "Rating", type: "rating" }),
    defineField({ name: "price", title: "Price", type: "price" }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [imageCreditField()],
    }),
    defineField({
      name: "imageTone",
      title: "Placeholder color (used until a photo is uploaded)",
      type: "string",
      options: { list: imageTones },
      initialValue: "desert",
    }),
    defineField({
      name: "gallery",
      title: "Gallery photos",
      description: "Extra photos shown in a gallery on this experience's page, beyond the main photo above.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true }, fields: [imageCreditField()] }],
    }),
    defineField({ name: "description", title: "Description", type: "text", validation: (r) => r.required() }),
    defineField({ name: "included", title: "Included", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "destinations",
      title: "Destinations",
      description: "E.g. 'Cairo', 'Giza' — connects this experience to the Explore Egypt map.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "relatedTours",
      title: "Related Tours",
      description: "Tours this experience pairs naturally with — shown as \"Available On\" on this page.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tour" }] }],
    }),
    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", initialValue: 0 }),
    seoFields(),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "duration", media: "image" },
  },
});
