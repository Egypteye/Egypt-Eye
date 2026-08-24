import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones } from "./objects";

// Powers the "Explore Egypt" interactive map (/explore-egypt). Tours,
// Experiences, Photoshoots, and Stories are connected to a destination by
// their own `destinations`/`locations` tag fields matching one of the
// "Also matches" names below — not a reference field — so tagging a new
// tour "Aswan" is enough to make it appear on this hub automatically.
export const destinationHub = defineType({
  name: "destinationHub",
  title: "Destination",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (web address)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "region", title: "Region label (e.g. 'Red Sea Coast')", type: "string" }),
    defineField({ name: "tagline", title: "Tagline (one line)", type: "string" }),
    defineField({ name: "intro", title: "Introduction", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "matchNames",
      title: "Also matches (tags on tours/experiences/photoshoots/stories)",
      description:
        "Every name a tour, experience, photoshoot, or story might use in its own 'Destinations' field to mean this place — e.g. both 'Siwa' and 'Siwa Oasis'. Include this destination's own Name above as one of the entries.",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "mapX",
      title: "Map position — left %",
      description: "Horizontal position on the Explore Egypt map, 0 (west) to 100 (east).",
      type: "number",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "mapY",
      title: "Map position — top %",
      description: "Vertical position on the Explore Egypt map, 0 (north) to 100 (south).",
      type: "number",
      validation: (r) => r.min(0).max(100),
    }),
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
      initialValue: "giza",
    }),
    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "region", media: "image" },
  },
});
