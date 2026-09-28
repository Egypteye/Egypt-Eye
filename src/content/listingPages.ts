// Local fallback for the hero + intro copy on the 5 catalog listing pages —
// used until the "Listing Pages" singleton in Sanity is filled in, and as
// the seed data pushed there by the one-time migration
// (src/app/api/migrate/route.ts).
import type { ResolvedListingPages } from "./types";

export const listingPages: ResolvedListingPages = {
  tours: {
    heroEyebrow: "Best Seller Tours",
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
    sectionTitle: "Activities across Egypt, by destination",
    sectionDescription:
      "Everything from a one-hour camel ride at Giza to two nights camping in the White Desert. Add one to a tour, or build a trip around it — every activity below is one we run ourselves.",
  },
  photoshoots: {
    heroEyebrow: "Photoshoot Packages",
    heroTitle: "Travel, Professionally Captured",
    sectionTitle: "Our signature products",
    sectionDescription:
      "Egypt Eye began as a travel company — but our photography is what travelers remember most. Every package includes a private photographer and professional editing.",
    // The questions travelers actually search before booking a photoshoot —
    // price, photo count, delivery, payment, pickup, what happens if the
    // weather turns. These are published as FAQ structured data, so every
    // answer states only what we actually provide: the numbers come straight
    // from content/photoshoots.ts and must be updated with it.
    faqs: [
      {
        question: "How much does a photoshoot at the Pyramids cost?",
        answer:
          "The Exclusive Pyramids Photoshoot is $75 — a 1–2 hour private session at the Giza Pyramids and the Nine Pyramids View. Our six packages run from $75 to $219, the upper end being the Fayoum Flying Dress shoot at Wadi El Rayan. The price is for the session, and add-ons like an Arabian horse, a camel or a video Reel are priced separately.",
      },
      {
        question: "How many photos do I get, and how soon?",
        answer:
          "The Pyramids package delivers 80+ edited pictures, and you get the raw, unedited photos the same day as your shoot — you leave with your images rather than waiting a fortnight. A larger gallery of 100+ high-resolution edited images is available within 5 days as an option.",
      },
      {
        question: "What's included — and are entrance tickets included?",
        answer:
          "Included: a private professional photographer, professional camera equipment, private transportation with pickup and drop-off, parking and road tolls, your edited gallery, and 24-hour follow-up after the shoot. Site entrance tickets are not included — you buy those at the gate, and they are the only cost you should expect on the day beyond the package itself.",
      },
      {
        question: "How does payment work?",
        answer:
          "A deposit secures your date. The balance is paid on the same day, after the photoshoot, in cash or by transfer — so you settle up once you have seen what we shot, not before.",
      },
      {
        question: "Do you pick me up from my hotel?",
        answer:
          "Yes. Pickup and drop-off are included, along with parking and road tolls, so you do not need to arrange transport or negotiate a taxi to the site.",
      },
      {
        question: "What happens if the weather is bad, or I'm running late?",
        answer:
          "We reschedule. A photoshoot depends on light and conditions, and there is no sense spending your session in weather that will not produce the photos you came for.",
      },
      {
        question: "Do I need to bring anything, or know how to pose?",
        answer:
          "No. We bring all the equipment needed, and the photographer directs the session throughout — where to stand, how to move, where the light is. Most people who book have never been professionally photographed before.",
      },
      {
        question: "Can I combine a photoshoot with a tour?",
        answer:
          "Yes. A photoshoot can be arranged alongside any of our tours, and several multi-day itineraries already build a Giza photoshoot into the Pyramids day.",
      },
      {
        question: "Can couples, families and groups book a photoshoot?",
        answer:
          "Yes. Sessions are private, so it is your group and the photographer rather than a shared slot, and a group photoshoot add-on covers larger parties. The Pyramids Proposal Romance Setup is a separate package for proposals, at $150.",
      },
      {
        question: "Can I add a horse, a camel or video?",
        answer:
          "Yes. Arabian horse photography, a camel experience, a professional video Reel and a group photoshoot are all available as add-ons. There are also two dedicated horse packages: the Jumping Horse Photoshoot at $120, and the Running Horse Video + Jumping Horse Photoshoot at $160.",
      },
    ],
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
    heroTitle: "One Country, Thirteen Unforgettable Places to Start",
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
