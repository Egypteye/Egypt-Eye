// Local fallback for every static homepage marketing block — used until the
// "Homepage" singleton in Sanity is filled in, and as the seed data pushed
// there by the one-time migration (src/app/api/migrate/route.ts).
import type { ResolvedHomepage } from "./types";

export const homepage: ResolvedHomepage = {
  popularTours: {
    eyebrow: "Popular Tours",
    title: "Tours Travelers Book Most",
    description:
      "A curated set of our most-loved itineraries — the ones we'd recommend first if you told us nothing else about your trip.",
    primaryButtonLabel: "See Popular Tours",
    secondaryButtonLabel: "Browse All Tours",
  },
  destinationsSection: {
    eyebrow: "Where We Take You",
    title: "Every Corner of Egypt, and Jordan Too",
    description: "Tap a destination to see the tour built around it.",
  },
  flyingDress: {
    badge: "First Flying Dresses in Egypt",
    title: "Egypt's First Flying Dress Photoshoot",
    body:
      "A flowing dress, a private photographer, and secret, uncrowded locations at the Pyramids Rooftop, sand dunes, or Fayoum Oasis — Egypt Eye's signature photoshoot.",
    buttonLabel: "See the Flying Dress Experience",
  },
  redSea: {
    badge: "Red Sea Luxe Yachts",
    title: "Sail into Opulence on the Red Sea",
    body: "A private yacht on calm turquoise water, white sand within reach, and a pace built entirely around you.",
    buttonLabel: "Explore Red Sea Experiences",
  },
  ninePyramids: {
    eyebrow: "Iconic Nine Pyramids View",
    title: "Capture Your Adventure at the Nine Pyramids of Giza",
    description:
      "Beyond the three main Pyramids — the full panorama, and a professional photoshoot built into the experience. This is the shot every traveler wants and few tours actually deliver.",
    buttonLabel: "Book the Pyramids Photoshoot",
  },
  photoshootsSection: {
    eyebrow: "Photoshoot Packages",
    title: "Travel + Professional Photography, In One Booking",
    description:
      "Egypt Eye's strongest signature: private, professionally directed photoshoots woven into your trip, not booked separately.",
  },
  customCta: {
    eyebrow: "Customization",
    title: "Design Your Dream Tour",
    description:
      "Not sure what to book? Tell us your dates, interests, and pace, and we'll build a private itinerary around you — combining any tour, experience, or photoshoot in our catalog.",
    buttonLabel: "Start Customizing",
  },
  reviewsSection: {
    eyebrow: "What Travelers Say",
    title: "Personal, Safe, Flexible, and Photographed",
  },
  faqSection: {
    eyebrow: "Good to Know",
    title: "Frequently Asked Questions",
  },
  storiesSection: {
    eyebrow: "Stories",
    title: "From the Journal",
    linkLabel: "Read all stories →",
  },
  finalCta: {
    title: "Ready to see Egypt through our eyes?",
    body: "Message us on WhatsApp and we'll help you build the right trip — no pressure, just answers.",
    buttonLabel: "Chat With Us on WhatsApp",
  },
};
