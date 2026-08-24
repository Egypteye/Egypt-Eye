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
      title: "Map position — X",
      description:
        "Horizontal position on the Explore Egypt map's coordinate grid (0 = west edge, 100 = east edge) — matches the map's real geographic projection, so this should line up with the destination's true position. Ask a developer before changing unless you're nudging a pin slightly.",
      type: "number",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "mapY",
      title: "Map position — Y",
      description:
        "Vertical position on the Explore Egypt map's coordinate grid (0 = north edge, ~87 = south edge — the grid is wider than it is tall, matching Egypt's real shape).",
      type: "number",
      validation: (r) => r.min(0).max(90),
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
    defineField({
      name: "mood",
      title: "Mood tags (shown as filter buttons above the map)",
      description: "What kind of trip is this place good for? Used to highlight matching pins when a visitor clicks a mood button.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "History & Monuments", value: "history" },
          { title: "Red Sea & Beaches", value: "beaches" },
          { title: "Desert & Oases", value: "desert" },
          { title: "Diving & Snorkeling", value: "diving" },
          { title: "Nile & River Towns", value: "nile" },
          { title: "Mediterranean Coast", value: "coast" },
        ],
      },
    }),
    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "region", media: "image" },
  },
});
