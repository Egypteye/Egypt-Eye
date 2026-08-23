import { defineField, defineType } from "sanity";

// Singleton — every static marketing block on the homepage that isn't
// already covered by Site Settings (hero slides, trust stats, trust
// badges) or a live content query (Popular Tours' cards, Reviews'
// testimonials, FAQ items, Stories' cards). Photos for the Flying Dress,
// Red Sea, Nine Pyramids, and Customize blocks live in Site Settings
// (they're shared banner images), not duplicated here.
function block(name: string, title: string, fields: ReturnType<typeof defineField>[]) {
  return defineField({ name, title, type: "object", fields });
}

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    block("popularTours", "Popular Tours section", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
      defineField({ name: "primaryButtonLabel", title: "Primary button label", type: "string" }),
      defineField({ name: "secondaryButtonLabel", title: "Secondary button label", type: "string" }),
    ]),
    block("destinationsSection", "Destinations panel section", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    ]),
    block("flyingDress", "Flying Dress feature block", [
      defineField({ name: "badge", title: "Badge", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
      defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
    ]),
    block("redSea", "Red Sea Luxe Yachts block", [
      defineField({ name: "badge", title: "Badge", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
      defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
    ]),
    block("ninePyramids", "Nine Pyramids View block", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
      defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
    ]),
    block("photoshootsSection", "Photoshoots section", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    ]),
    block("customCta", "Custom Tours CTA block", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
      defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
    ]),
    block("reviewsSection", "Reviews section", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
    ]),
    block("faqSection", "FAQ section", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
    ]),
    block("storiesSection", "Stories section", [
      defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "linkLabel", title: "\"See all\" link label", type: "string" }),
    ]),
    block("finalCta", "Final CTA (bottom of page)", [
      defineField({ name: "title", title: "Title", type: "string" }),
      defineField({ name: "body", title: "Body", type: "text", rows: 2 }),
      defineField({ name: "buttonLabel", title: "Button label (WhatsApp)", type: "string" }),
    ]),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});
