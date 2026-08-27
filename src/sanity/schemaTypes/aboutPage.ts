import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones } from "./objects";

// Singleton — powers the /about page. The brand description, positioning
// quote, and pillars shown on this page come from Site Settings (they're
// shared with the homepage), not duplicated here.
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({ name: "heroEyebrow", title: "Hero eyebrow text", type: "string" }),
    defineField({ name: "heroHeadline", title: "Hero headline", type: "string" }),
    defineField({
      name: "heroImage",
      title: "Hero banner photo",
      type: "object",
      fields: [
        defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, fields: [imageCreditField()] }),
        defineField({
          name: "tone",
          title: "Placeholder color (used until a photo is uploaded)",
          type: "string",
          options: { list: imageTones },
          initialValue: "giza",
        }),
      ],
    }),
    defineField({ name: "storyEyebrow", title: "\"Our Story\" section eyebrow", type: "string" }),
    defineField({ name: "storyTitle", title: "\"Our Story\" section title", type: "string" }),
    defineField({ name: "whatWeDoEyebrow", title: "\"What We Do\" section eyebrow", type: "string" }),
    defineField({ name: "whatWeDoTitle", title: "\"What We Do\" section title", type: "string" }),
    defineField({ name: "whatWeDoDescription", title: "\"What We Do\" section description", type: "text" }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
