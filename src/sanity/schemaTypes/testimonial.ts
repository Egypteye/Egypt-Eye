import { defineField, defineType } from "sanity";
import { imageCreditField } from "./objects";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  groups: [
    { name: "review", title: "The review", default: true },
    { name: "source", title: "Where it came from" },
    { name: "linking", title: "What it's about" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Reviewer name",
      type: "string",
      group: "review",
      description:
        "Exactly as the traveller gave it. Never invent a name, never change one, and never put one person's name on another person's words — that is the specific thing the FTC's Consumer Review Rule prohibits.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Review headline (optional)",
      description: "The traveller's own title, where the platform has one. Tripadvisor reviews usually do.",
      type: "string",
      group: "review",
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      group: "review",
      description:
        "The traveller's words, copied exactly. Do not tidy the grammar, shorten for punch, merge two reviews, or translate — a review is evidence, and edited evidence is not evidence. Long reviews from another platform are shortened automatically for display, with a link to the full original.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "score",
      title: "Star rating (optional)",
      description:
        "1-5, as the traveller gave it. Leave empty for a written-only review — the site then shows the review count without an average, and starts showing an average once enough reviews carry a score.",
      type: "number",
      group: "review",
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "featured",
      title: "Feature this review",
      description:
        "Promotes it onto the homepage and the top of Customer Stories. Feature for how useful and specific a review is, not only for how glowing — a wall of nothing but five-star superlatives reads as manufactured and is exactly what regulators look at.",
      type: "boolean",
      group: "review",
      initialValue: false,
    }),

    // ---- Source -----------------------------------------------------------
    defineField({
      name: "source",
      title: "Source",
      type: "object",
      group: "source",
      description:
        "Where the traveller wrote this. It decides what the site may legally do with the review, so it is not cosmetic.",
      fields: [
        defineField({
          name: "platform",
          title: "Platform",
          type: "string",
          options: {
            list: [
              { title: "Direct to Egypt Eye (WhatsApp, email)", value: "direct" },
              { title: "Tripadvisor", value: "tripadvisor" },
              { title: "Airbnb", value: "airbnb" },
              { title: "Google", value: "google" },
              { title: "Viator", value: "viator" },
              { title: "GetYourGuide", value: "getyourguide" },
            ],
            layout: "dropdown",
          },
          initialValue: "direct",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "url",
          title: "Link to the original review",
          description:
            "Required for anything not collected directly. Two reasons: it lets a reader verify the words are real, and quoting an excerpt with a link back is the defensible way to show another platform's copyrighted content — copying reviews wholesale is not.",
          type: "url",
        }),
        defineField({
          name: "reviewedAt",
          title: "Date the traveller posted it",
          type: "date",
          options: { dateFormat: "YYYY-MM-DD" },
        }),
      ],
      options: { collapsible: true, collapsed: false },
    }),
    defineField({
      name: "photos",
      title: "Traveller photos",
      group: "source",
      description:
        "Only for reviews collected directly, and only where the traveller agreed the photo can be published. A photo attached to a Tripadvisor or Airbnb review belongs to the traveller under that platform's terms — re-hosting it here is a bigger problem than quoting the text, so the site drops photos on any review that came from another platform.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true }, fields: [imageCreditField()] }],
    }),

    // ---- What it's about --------------------------------------------------
    defineField({
      name: "context",
      title: "Context (e.g. tour name)",
      type: "string",
      group: "linking",
      description: "What the follow-up recorded the trip as. Matched automatically against product titles.",
    }),
    defineField({
      name: "subject",
      title: "Which tour / experience / photoshoot (optional)",
      group: "linking",
      description:
        "Only needed when the Context text above doesn't exactly name a product. Context is matched automatically against product titles, so \"6 Days: Cairo, Giza & Luxor\" already counts toward that tour. Set this for anything vaguer — \"Egypt itinerary\", \"Cairo city tour\" — and it wins over the text.",
      type: "reference",
      to: [{ type: "tour" }, { type: "experience" }, { type: "photoshoot" }],
    }),
    defineField({
      name: "themes",
      title: "Themes (optional override)",
      group: "linking",
      description:
        "What the traveller talked about, which decides where the review is worth showing. Left empty, the site reads these from the review's own words — set them only to correct that. Tagging never changes what a review says.",
      type: "array",
      options: {
        list: [
          { title: "Photography", value: "photography" },
          { title: "Flying dress", value: "flying-dress" },
          { title: "Guides", value: "guide" },
          { title: "Pickups & transfers", value: "pickup" },
          { title: "Communication", value: "communication" },
          { title: "Proposals", value: "proposal" },
          { title: "Celebrations", value: "birthday" },
          { title: "Families", value: "family" },
          { title: "Couples", value: "couples" },
          { title: "Solo travellers", value: "solo" },
          { title: "Desert", value: "desert" },
          { title: "The Nile", value: "nile" },
          { title: "Diving & snorkelling", value: "diving" },
          { title: "Trip planning", value: "planning" },
          { title: "Value", value: "value" },
        ],
      },
      of: [{ type: "string" }],
    }),

    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", group: "review", initialValue: 0 }),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
    { title: "Newest review", name: "reviewedDesc", by: [{ field: "source.reviewedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "quote", platform: "source.platform" },
    prepare({ title, subtitle, platform }) {
      const tag = platform && platform !== "direct" ? ` · ${platform}` : "";
      return { title: `${title}${tag}`, subtitle };
    },
  },
});
