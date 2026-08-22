import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones } from "./objects";

// Singleton — powers the /contact page. Actual contact details and booking
// policy text come from Site Settings (shared with other pages); this
// singleton only holds this page's own copy: hero, banner, and small card
// captions.
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
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
          initialValue: "redsea",
        }),
      ],
    }),
    defineField({ name: "whatsappCardDescription", title: "WhatsApp card caption", type: "string" }),
    defineField({ name: "emailCardDescription", title: "Email card caption", type: "string" }),
    defineField({ name: "urgentCardDescription", title: "Urgent Booking card caption", type: "string" }),
    defineField({ name: "policiesEyebrow", title: "Policies section eyebrow", type: "string" }),
    defineField({ name: "policiesTitle", title: "Policies section title", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
