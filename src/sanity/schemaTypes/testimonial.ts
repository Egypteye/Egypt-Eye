import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Reviewer name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "quote", title: "Quote", type: "text", validation: (r) => r.required() }),
    defineField({ name: "context", title: "Context (e.g. tour name)", type: "string" }),
    defineField({
      name: "subject",
      title: "Which tour / experience / photoshoot (optional)",
      description:
        "Only needed when the Context text above doesn't exactly name a product. Context is matched automatically against product titles, so \"6 Days: Cairo, Giza & Luxor\" already counts toward that tour. Set this for anything vaguer — \"Egypt itinerary\", \"Cairo city tour\" — and it wins over the text.",
      type: "reference",
      to: [{ type: "tour" }, { type: "experience" }, { type: "photoshoot" }],
    }),
    defineField({
      name: "score",
      title: "Star rating (optional)",
      description:
        "The star value this traveler gave, 1-5, if the WhatsApp follow-up captured one. Leave empty for a written-only review — the site then shows the review count without an average, and starts showing an average once enough reviews carry a score.",
      type: "number",
      validation: (r) => r.min(1).max(5),
    }),
    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "quote" },
  },
});
