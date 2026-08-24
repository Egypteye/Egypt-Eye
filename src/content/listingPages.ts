// Local fallback for the hero + intro copy on the 5 catalog listing pages —
// used until the "Listing Pages" singleton in Sanity is filled in, and as
// the seed data pushed there by the one-time migration
// (src/app/api/migrate/route.ts).
import type { ResolvedListingPages } from "./types";

export const listingPages: ResolvedListingPages = {
  tours: {
    heroEyebrow: "Popular Tours",
    heroTitle: "Tours Across All Egypt & Jordan",
    sectionTitleTemplate: "{count} private, guided itineraries",
    sectionDescription:
      "Every tour includes a private vehicle and an English-speaking guide. Search by destination, filter by trip length or travel style, or reach out and we'll help you choose.",
    faqs: [
      {
        question: "How many days do I need in Egypt?",
        answer:
          "Most first-time travelers find 10 days the sweet spot — enough time for Cairo and Giza plus a proper Nile stretch between Luxor and Aswan, without every hour being scheduled. A week is workable if you accept choosing between Cairo and the Nile Valley rather than both. Two weeks or more lets you add Alexandria, the Red Sea, or a desert oasis without rushing the rest.",
      },
      {
        question: "What's the difference between a private and a group tour?",
        answer:
          "Every tour on this page is private: your own vehicle, your own English-speaking Egyptologist, and a schedule that moves at your pace rather than a bus timetable. It costs more than joining a group, but it's the difference between seeing a site and actually experiencing it — no waiting on 20 other people to finish photos.",
      },
      {
        question: "Can I customize one of these tours?",
        answer:
          "Yes. Every itinerary here is a starting point, not a fixed package — swap a destination, add an experience, or change the pace, and we'll rebuild it around you. If nothing here matches what you have in mind, use Customize Your Tour to start from a blank page instead.",
      },
      {
        question: "What's included in the price?",
        answer:
          "Every tour includes private transportation and a private guide as standard; most also include entrance fees and lunch. Flights, hotels, and your Egypt visa are handled separately so you can book accommodation and airfare on your own terms — each tour page lists exactly what's included and what isn't.",
      },
    ],
  },
  experiences: {
    heroEyebrow: "Extra Experiences",
    heroTitle: "Make Any Tour More Memorable",
    sectionTitle: "Short experiences, big memories",
    sectionDescription:
      "Add one of these to any tour, or book it on its own — each runs about an hour and is easy to slot into your schedule.",
  },
  photoshoots: {
    heroEyebrow: "Photoshoot Packages",
    heroTitle: "Travel, Professionally Captured",
    sectionTitle: "Our signature products",
    sectionDescription:
      "Egypt Eye began as a travel company — but our photography is what travelers remember most. Both packages include a private photographer and professional editing.",
  },
  signatureExperiences: {
    heroEyebrow: "Signature Experiences",
    heroTitle: "Built Around How You Want to Feel — Not Just Where You Want to Go",
    heroDescription:
      "A different kind of product from our tours. Each Signature Experience is designed around a specific person and a specific need — the destination is part of the solution, not the whole plan.",
    collectionEyebrow: "The Collection",
    collectionTitleSingular: "Our first Signature Experience",
    collectionTitlePlural: "Signature Experiences",
    collectionDescription:
      "Each one starts with a person, not a place — read through and see which one was built with you in mind.",
  },
  exploreEgypt: {
    heroEyebrow: "Explore Egypt",
    heroTitle: "One Country, Ten Unforgettable Places to Start",
    heroDescription:
      "Tap a destination on the map to see the real tours, experiences, photoshoots, and stories we offer there — then add whatever catches your eye to My Journey.",
  },
  stories: {
    heroEyebrow: "Stories",
    heroTitle: "The Journal",
    heroDescription:
      "Editorial travel writing from Egypt Eye — the history, the places, and the rare moments worth building a trip around.",
    emptyStateText: "Stories are coming soon.",
    moreStoriesEyebrow: "More Stories",
    moreStoriesTitle: "Continue Exploring",
    readStoryLabel: "Read the story",
  },
};
