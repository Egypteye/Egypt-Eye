import type { Photoshoot } from "./types";

// Photoshoot Packages — Egypt Eye's signature products.

export const photoshoots: Photoshoot[] = [
  {
    slug: "exclusive-pyramids-photoshoot",
    title: "Exclusive Pyramids Photoshoot",
    duration: "1–2 hours",
    rating: { score: 5, count: 4 },
    price: { amount: 75, originalAmount: 100, currency: "USD" },
    locations: ["Giza Pyramids", "Nine Pyramids View"],
    imageLabel: "Pyramids Photoshoot",
    imageTone: "giza",
    description:
      "A private, professionally directed photoshoot at the Pyramids of Giza — built for travelers who want cinematic, Instagram-ready memories, not just snapshots.",
    goodFor: ["Solo travelers", "Couples", "Families", "Influencers & content creators"],
    included: [
      "Private professional photographer",
      "Professional camera equipment",
      "Private transportation",
      "Parking & road tolls",
      "80+ edited pictures",
      "24-hour follow-up service",
    ],
    addOns: [
      "Professional video Reel",
      "Arabian horse photography",
      "Camel experience",
      "Group photoshoot",
    ],
    delivery: [
      "80+ edited pictures",
      "Raw, unedited photos the same day",
      "Optional larger gallery: 100+ high-resolution edited images within 5 days",
    ],
  },
  {
    slug: "flying-dress-photoshoot",
    title: "Flying Dress Photoshoot",
    duration: "1 hour",
    rating: { score: 5, count: 1 },
    price: { amount: 199, originalAmount: 250, currency: "USD" },
    locations: ["Pyramids Rooftop", "Sand Castle / Sand Dunes", "Fayoum Oasis"],
    imageLabel: "Flying Dress at the Pyramids",
    imageTone: "desert",
    description:
      "Egypt's first Flying Dress experience — a dramatic, editorial-style shoot in a flowing dress of your chosen color, directed by our photographers at secret, uncrowded locations away from the crowds.",
    goodFor: [
      "Solo travelers",
      "Engagements & proposals",
      "Couples",
      "Fashion shoots",
      "Personal content",
    ],
    included: [
      "Flying dress in your chosen color",
      "Professional photographer & posing direction",
      "Private transportation, pickup and return",
      "Secret, less crowded locations",
      "Edited images",
      "Egyptian souvenir",
    ],
    addOns: ["High-end retouching upgrade"],
    delivery: ["Professionally edited image gallery", "Optional high-end retouching"],
  },
];

export function getPhotoshootBySlug(slug: string) {
  return photoshoots.find((p) => p.slug === slug);
}
