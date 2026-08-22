import { defineField, defineType } from "sanity";

// A reusable editorial byline for Stories — separate from `host` (which
// represents in-person guides/hosts on Signature Experiences).
export const author = defineType({
  name: "author",
  title: "Story Author",
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
    defineField({ name: "role", title: "Role (e.g. 'Editorial Team')", type: "string" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", title: "Short bio", type: "text" }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
