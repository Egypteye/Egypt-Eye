import type { Experience } from "./types";
import { activities } from "./activities";

// Extra Experiences — short add-on activities. Prices and ratings on the six
// below are as listed on the current site.
//
// The wider activity catalogue — the researched day trips and overnights
// organised by destination — lives in ./activities.ts and is appended at the
// bottom of this file, so `experiences` stays the single list every fetcher,
// page and Journey lookup reads.

const houseExperiences: Experience[] = [
  {
    slug: "quiet-nile-felucca-tour",
    physicalLevel: {
      tier: "easy",
      note:
        "A step down into the boat, then seated sailing for the hour. No swimming and no walking involved.",
    },
    title: "Quiet Nile Felucca Tour",
    duration: "1 hour",
    price: { amount: 25, originalAmount: 45, currency: "USD" },
    imageLabel: "Felucca on the Nile",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1761421852464-463fb31f2dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "Drift along the Nile on a traditional wooden felucca as the sun sets over Cairo — a calm, scenic hour away from the noise of the city.",
    included: [
      "Private felucca sailing boat",
      "Hotel pickup and return",
      "Bottled water",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "atv-quad-bikes-sahara",
    physicalLevel: {
      tier: "active",
      note:
        "An hour riding a quad bike over open desert. No experience needed, but the terrain is bumpy and it works your arms and shoulders.",
    },
    title: "ATV Quad Bikes at Pyramids' Sahara Desert",
    duration: "1 hour",
    price: { amount: 40, originalAmount: 65, currency: "USD" },
    imageLabel: "Desert ATV Ride",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1708371147669-b9f89c8ae5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "Ride quad bikes across the dunes behind the Giza Plateau, with the Pyramids on the horizon — an adrenaline break that pairs perfectly with a Giza day tour.",
    included: [
      "ATV quad bike rental & safety briefing",
      "Private transportation",
      "Guide/instructor",
    ],
    destinations: ["Giza"],
  },
  {
    slug: "nile-cruise-dinner-show",
    physicalLevel: {
      tier: "easy",
      note:
        "Seated at a table for the evening, with a short step aboard at the dock.",
    },
    title: "Nile Cruise Dinner + Belly Dancer & Oriental Shows",
    duration: "1 hour",
    price: { amount: 45, originalAmount: 60, currency: "USD" },
    imageLabel: "Nile Dinner Cruise",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1664591930253-728be8868cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "An evening cruise along the Nile with a full dinner, live music, and belly dancing and Tanoura performances — a lively way to spend your last night in Cairo.",
    included: [
      "Dinner cruise ticket",
      "Live entertainment (belly dance & Tanoura)",
      "Hotel pickup and return",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "food-tour",
    physicalLevel: {
      tier: "moderate",
      note:
        "Several hours on foot between food stops, on uneven pavement and through busy streets — with plenty of sitting down along the way.",
    },
    title: "Food Tour",
    duration: "1 hour",
    price: { amount: 30, originalAmount: 60, currency: "USD" },
    imageLabel: "Egyptian Street Food",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1711187834800-0b50acb79725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "A guided walk through local markets and street-food spots to taste authentic Egyptian dishes, from koshari to fresh juices and pastries.",
    included: [
      "Local food guide",
      "Tastings at multiple stops",
      "Private transportation",
    ],
    destinations: ["Cairo"],
  },
  {
    slug: "pyramids-proposal-romance-setup",
    // The same product is also sold as a photoshoot, with the fuller record
    // (locations, add-ons, what gets delivered). Two URLs carrying one
    // product is duplicate content, and left alone Google picks a canonical
    // itself — often the weaker page. Both stay listed so either browsing
    // path still finds it; this just names which one is the real page.
    seo: { canonicalUrl: "https://egypteyetravel.com/photoshoots/pyramids-proposal-romance-setup" },
    physicalLevel: {
      tier: "easy",
      note:
        "A short walk from the vehicle to the setup on level ground. Everything is arranged before you arrive.",
    },
    title: "Pyramids Proposal Romance Setup",
    duration: "1 hour",
    price: { amount: 150, currency: "USD" },
    imageLabel: "Pyramids Proposal Setup",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "A private, beautifully styled proposal setup overlooking the Pyramids of Giza — romantic decorations, flowers, and candlelight, arranged and ready before you arrive, so all that's left is the moment itself. Pricing depends on the setup and style you choose. Want it captured too? Add the Pyramids Proposal Photoshoot for professional photography and fully edited photos. This is enquiry-only — our team confirms your setup, styling, and pricing directly with you.",
    included: [
      "Romantic decorations",
      "Flowers and floral arrangements",
      "Candles and romantic lighting",
      "Elegant proposal setup",
      "Personalized decoration options",
      "Professional setup completed before you arrive",
    ],
    destinations: ["Giza"],
  },
];

export function getExperienceBySlug(slug: string) {
  return experiences.find((e) => e.slug === slug);
}

// One list, two sources: the original Cairo/Giza add-ons first, then the
// destination activity catalogue.
export const experiences: Experience[] = [...houseExperiences, ...activities];
