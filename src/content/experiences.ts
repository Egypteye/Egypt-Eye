import type { Experience } from "./types";

// Extra Experiences — short add-on activities. Prices and ratings are as listed
// on the current site.

export const experiences: Experience[] = [
  {
    slug: "quiet-nile-felucca-tour",
    title: "Quiet Nile Felucca Tour",
    duration: "1 hour",
    rating: { score: 4.87, count: 3 },
    price: { amount: 25, originalAmount: 45, currency: "USD" },
    imageLabel: "Felucca on the Nile",
    imageTone: "nile",
    image: "/photos/pexels-35556386.jpg",
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
    title: "ATV Quad Bikes at Pyramids' Sahara Desert",
    duration: "1 hour",
    rating: { score: 4.98, count: 8 },
    price: { amount: 40, originalAmount: 65, currency: "USD" },
    imageLabel: "Desert ATV Ride",
    imageTone: "desert",
    image: "/photos/pexels-38513972.jpg",
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
    title: "Nile Cruise Dinner + Belly Dancer & Oriental Shows",
    duration: "1 hour",
    rating: { score: 4.92, count: 5 },
    price: { amount: 45, originalAmount: 60, currency: "USD" },
    imageLabel: "Nile Dinner Cruise",
    imageTone: "nile",
    image: "/photos/pexels-20954997.jpg",
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
    title: "Food Tour",
    duration: "1 hour",
    rating: null,
    price: { amount: 30, originalAmount: 60, currency: "USD" },
    imageLabel: "Egyptian Street Food",
    imageTone: "giza",
    image: "/photos/pexels-30119016.jpg",
    description:
      "A guided walk through local markets and street-food spots to taste authentic Egyptian dishes, from koshari to fresh juices and pastries.",
    included: [
      "Local food guide",
      "Tastings at multiple stops",
      "Private transportation",
    ],
    destinations: ["Cairo"],
  },
];

export function getExperienceBySlug(slug: string) {
  return experiences.find((e) => e.slug === slug);
}
