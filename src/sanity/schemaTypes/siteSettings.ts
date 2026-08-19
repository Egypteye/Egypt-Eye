import { defineField, defineType } from "sanity";

// Singleton document — one instance holds all global site copy, contact
// info, and booking policies. The Studio structure (structure.ts) pins this
// to a single, always-visible entry instead of a list.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Full brand name", type: "string" }),
    defineField({ name: "shortName", title: "Short brand name (navbar/footer)", type: "string" }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "heroHeadline", title: "Hero eyebrow text", type: "string" }),
    defineField({ name: "heroSubheadline", title: "Hero headline", type: "string" }),
    defineField({ name: "description", title: "Brand description", type: "text" }),
    defineField({ name: "positioning", title: "Positioning statement (About page quote)", type: "text" }),

    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      fields: [
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({ name: "whatsapp", title: "WhatsApp (display)", type: "string" }),
        defineField({ name: "whatsappLink", title: "WhatsApp link (https://wa.me/...)", type: "url" }),
        defineField({ name: "urgentBooking", title: "Urgent booking phone", type: "string" }),
      ],
    }),

    defineField({
      name: "socials",
      title: "Social links",
      type: "object",
      fields: [
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "facebook", title: "Facebook", type: "url" }),
        defineField({ name: "tiktok", title: "TikTok", type: "url" }),
      ],
    }),

    defineField({
      name: "pillars",
      title: "Brand pillars (Travel / Photography / etc.)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "string" }),
          ],
        },
      ],
    }),

    defineField({
      name: "policies",
      title: "Booking policies",
      type: "object",
      fields: [
        defineField({ name: "deposit", title: "Deposit & payment", type: "text" }),
        defineField({ name: "currency", title: "Currency", type: "text" }),
        defineField({
          name: "children",
          title: "Children's pricing",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "age", title: "Age range", type: "string" }),
                defineField({ name: "price", title: "Price", type: "string" }),
              ],
            },
          ],
        }),
        defineField({ name: "childrenNote", title: "Children's pricing note", type: "text" }),
        defineField({ name: "voucher", title: "Voucher / confirmation", type: "text" }),
        defineField({ name: "cancellation", title: "Cancellation policy", type: "text" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
