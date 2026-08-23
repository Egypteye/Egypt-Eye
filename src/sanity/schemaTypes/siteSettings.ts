import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones } from "./objects";

// Shared shape for a single banner photo with a placeholder-color fallback,
// reused across the homepage's individual (non-slideshow) feature banners.
function bannerImageField(name: string, title: string) {
  return defineField({
    name,
    title,
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
  });
}

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
      name: "heroImages",
      title: "Homepage hero slides",
      description:
        "The auto-rotating slideshow at the top of the homepage (advances every 6 seconds). Each slide has its own headline, subtext, and a link to somewhere else on the site — a tour, a story, an experience, a Signature Experience. Upload up to 5-6 real photos — until a slide has a photo, it shows a gradient placeholder instead.",
      type: "array",
      of: [
        {
          type: "object",
          name: "heroImage",
          fields: [
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              fields: [imageCreditField()],
            }),
            defineField({
              name: "tone",
              title: "Placeholder color (used until a photo is uploaded)",
              type: "string",
              options: { list: imageTones },
              initialValue: "giza",
            }),
            defineField({
              name: "headline",
              title: "Headline",
              type: "string",
              description: "This slide's own big headline — shown only while this slide is active.",
            }),
            defineField({
              name: "subtext",
              title: "Supporting line",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "linkLabel",
              title: "Button text",
              type: "string",
              description: "E.g. \"Explore Nile Cruises\" or \"Read the Luxor Guide\".",
            }),
            defineField({
              name: "linkHref",
              title: "Button link",
              type: "string",
              description:
                "A path on this site the button goes to, e.g. /tours/8-day-essential-egypt-nile-cruise, /stories/luxor-travel-guide, /experiences/atv-quad-bikes-sahara, or /signature-experiences/her-egypt.",
            }),
          ],
          preview: {
            select: { title: "headline", media: "image" },
            prepare: ({ title, media }) => ({ title: title || "Hero slide", media }),
          },
        },
      ],
    }),

    bannerImageField("flyingDressImage", "Flying Dress banner photo"),
    bannerImageField("redSeaImage", "Red Sea Luxe Yachts banner photo"),
    bannerImageField("ninePyramidsImage", "Nine Pyramids View photo"),
    bannerImageField("customizeImage", "Customize Your Tour banner photo"),

    defineField({
      name: "destinationPhotos",
      title: "Destinations panel photos",
      description:
        "Real photos for the homepage destination grid (Cairo, Giza, Red Sea, etc.). Match the Destination name exactly — until a name has a photo here, it shows a gradient placeholder instead.",
      type: "array",
      of: [
        {
          type: "object",
          name: "destinationPhoto",
          fields: [
            defineField({
              name: "name",
              title: "Destination name (must match exactly, e.g. 'Giza', 'Red Sea')",
              type: "string",
            }),
            defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, fields: [imageCreditField()] }),
          ],
          preview: {
            select: { title: "name", media: "image" },
          },
        },
      ],
    }),

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
      name: "trustStats",
      title: "Trust stats bar (homepage, before Reviews)",
      description:
        "Only enter numbers you can actually stand behind — years operating, a real guest count, and a genuine TripAdvisor (or Google) rating with a link to it. Leave a field blank to hide that tile rather than showing a placeholder; the tour/destination counts are computed automatically from the live catalog and don't need to be entered here.",
      type: "object",
      fields: [
        defineField({ name: "yearsInEgypt", title: "Years operating in Egypt", type: "number" }),
        defineField({
          name: "happyGuestsLabel",
          title: "Guests served (as displayed, e.g. \"2,500+\")",
          type: "string",
        }),
        defineField({ name: "reviewPlatformName", title: "Review platform name (e.g. \"TripAdvisor\")", type: "string" }),
        defineField({ name: "reviewPlatformRating", title: "Review platform rating (e.g. 4.9)", type: "number" }),
        defineField({ name: "reviewPlatformReviewCount", title: "Review platform review count", type: "number" }),
        defineField({ name: "reviewPlatformUrl", title: "Link to the real reviews page", type: "url" }),
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
