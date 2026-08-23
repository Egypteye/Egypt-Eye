// Local fallback for the /customize page — used until the "Customize Page"
// singleton in Sanity is filled in, and as the seed data pushed there by
// the one-time migration (src/app/api/migrate/route.ts).
import type { ResolvedCustomizePage } from "./types";

export const customizePage: ResolvedCustomizePage = {
  eyebrow: "Customization · Inquiry-Only, No Obligation",
  headline: "Design Your Dream Tour",
  subtext:
    "A private itinerary built entirely around you — every tour, extra experience, and photoshoot in our catalog, combined however you like.",
  bannerImage: {
    tone: "nile",
    image: "/photos/pexels-15131486.jpg",
  },
  steps: [
    { title: "Tell us the basics", body: "Dates, guest count, and how packed or relaxed you want the pace." },
    { title: "Pick cities & activities", body: "Choose from Egypt's icons, Jordan, or the full add-on catalog." },
    { title: "We reply by email", body: "A proposed day-by-day itinerary and transparent pricing — no obligation." },
    { title: "Confirm with a 20% deposit", body: "Pay the rest in cash or PayPal at the end of your tour." },
  ],
  formIntroEyebrow: "How it works",
  formIntroTitle: "Tell us what you're after",
  formIntroDescription: "Fill in as much or as little as you know — we'll fill in the rest.",
  formSections: [
    {
      title: "About You",
      fields: [
        { label: "Full name", fieldKey: "fullName", fieldType: "text", required: true, placeholder: "Jane Traveler", width: "half" },
        { label: "Nationality", fieldKey: "nationality", fieldType: "text", required: true, placeholder: "American", width: "half" },
        { label: "Age", fieldKey: "age", fieldType: "number", placeholder: "34", width: "half" },
        { label: "Phone number", fieldKey: "phone", fieldType: "tel", placeholder: "+1 555 123 4567", width: "half" },
        { label: "Email", fieldKey: "email", fieldType: "email", required: true, placeholder: "jane@email.com", width: "half" },
        { label: "Instagram username", fieldKey: "instagram", fieldType: "text", placeholder: "@jane.travels", width: "half" },
      ],
    },
    {
      title: "Your Trip",
      fields: [
        { label: "Arrival date (if known)", fieldKey: "arrival", fieldType: "date", width: "half" },
        { label: "Departure date (if known)", fieldKey: "departure", fieldType: "date", width: "half" },
        { label: "Have you visited Egypt before?", fieldKey: "visitedBefore", fieldType: "select", options: ["No", "Yes"], width: "half" },
        { label: "Number of guests", fieldKey: "guests", fieldType: "number", required: true, placeholder: "2", width: "half" },
        {
          label: "Number of nights",
          fieldKey: "nights",
          fieldType: "select",
          options: Array.from({ length: 14 }, (_, i) => String(i + 1)),
          width: "half",
        },
      ],
    },
    {
      title: "Cities You'd Like to Visit",
      fields: [{ label: "Cities", fieldKey: "cities", fieldType: "chips-destinations", width: "full" }],
    },
    {
      title: "Activities You'd Like to Do",
      fields: [{ label: "Activities", fieldKey: "activities", fieldType: "chips-interests", width: "full" }],
    },
    {
      title: "Anything Else",
      fields: [
        { label: "Voucher / promo code", fieldKey: "voucher", fieldType: "text", placeholder: "Optional", width: "half" },
        { label: "Health conditions we should know about", fieldKey: "health", fieldType: "text", placeholder: "Optional", width: "half" },
        {
          label: "Special requests",
          fieldKey: "notes",
          fieldType: "textarea",
          placeholder: "Anniversary, dietary needs, accessibility, pace preferences...",
          width: "full",
        },
      ],
    },
  ],
};
