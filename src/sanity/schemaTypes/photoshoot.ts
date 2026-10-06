import { defineField, defineType } from "sanity";
import { translationsField } from "./objects";
import { imageCreditField, imageTones, seoFields } from "./objects";

export const photoshoot = defineType({
  name: "photoshoot",
  title: "Photoshoot Package",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    translationsField("titleTranslations", "Title translations"),
    defineField({
      name: "slug",
      title: "Slug (web address)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({
      name: "rating",
      title: "Rating (optional override)",
      description:
        "Overrides what this item shows. Leave empty and it falls back to the Site Settings review figure, or to the live count of Testimonials. Enter only numbers you can stand behind — this is shown to customers as a review count.",
      type: "rating",
    }),
    defineField({ name: "price", title: "Price", type: "price" }),
    defineField({
      name: "bookable",
      title: "Instant Booking",
      description:
        "Offers this online, paying the deposit on the spot. Needs a Price above — with no price there is nothing to take a percentage of, so the button stays hidden however this is set. Setting a price alone does NOT put a product on sale: price with this off shows the price and no button.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "depositPercent",
      title: "Deposit percentage (overrides the site default)",
      description:
        "The share of the booking taken online, e.g. 25 for 25%. Leave empty to use the site-wide default. The rest is never charged through the website. Whole or half percents only; must be above 0 and below 100.",
      type: "number",
      validation: (r) =>
        r
          .min(0.5)
          .max(99.5)
          .custom((value) =>
            typeof value !== "number" || Math.abs(value * 2 - Math.round(value * 2)) < 1e-9
              ? true
              : "Use whole or half percents — 25 or 12.5, not 25.3."
          ),
    }),
    defineField({
      name: "paypalLink",
      title: "PayPal payment link for the deposit",
      description:
        "Paste the PayPal link for this deposit amount, e.g. https://www.paypal.com/ncp/payment/XXXX or a paypal.me link. Must be a PayPal address — anything else is ignored and no pay button appears.",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["https"] }).custom((value) =>
          !value || /(^|\.)paypal\.(com|me)$/i.test(new URL(value).hostname)
            ? true
            : "This must be a PayPal link (paypal.com or paypal.me)."
        ),
    }),

    defineField({
      name: "timeSlots",
      title: "Start times offered in the booking popup",
      description:
        "e.g. '9:00 AM', '11:00 AM'. Shown as a dropdown. A customer can always pick \"Request another time\", so this is the shortlist rather than the limit. Leave empty and the popup asks for a preferred time in words.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "extras",
      title: "Bookable extras (priced)",
      description:
        "Optional add-ons a customer can tick while booking, each with its own price. Added to the final price and settled with the balance — the deposit payment link is a fixed amount and does not charge these.",
      type: "array",
      of: [{ type: "bookingExtra" }],
    }),
    defineField({ name: "locations", title: "Locations", type: "array", of: [{ type: "string" }] }),
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
      name: "gallery",
      title: "Gallery photos",
      description: "Extra photos shown in a gallery on this package's page, beyond the main photo above.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true }, fields: [imageCreditField()] }],
    }),
    defineField({ name: "description", title: "Description", type: "text", validation: (r) => r.required() }),
    translationsField("descriptionTranslations", "Description translations"),
    defineField({ name: "goodFor", title: "Good For", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "included", title: "Included", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "addOns", title: "Optional Add-Ons", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "delivery", title: "What You Receive", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "destinations",
      title: "Destinations",
      description: "E.g. 'Giza' — connects this photoshoot to the Explore Egypt map.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      description:
        "Renders as an accordion on the package page and is also emitted as FAQPage structured data. Only answer what is actually true of this package — structured data that doesn't match the page is a manual-action risk.",
      type: "array",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4 }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),
    defineField({ name: "order", title: "Sort order (lower shows first)", type: "number", initialValue: 0 }),
    seoFields(),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "duration", media: "image" },
  },
});
