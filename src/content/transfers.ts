import type { TransfersPageContent } from "./types";

// Private car transfers within Cairo & Giza, plus short intercity runs and
// hourly/daily private-driver hire. Prices are one-way in USD, researched
// against current listings from Cairo airport-transfer operators and
// private-driver rental services (sedan/van/minibus airport runs, Cairo-
// Alexandria and Cairo-Ain Sokhna transfer listings, hourly/daily driver
// rates), then positioned as a private, vetted Egypt Eye service rather
// than the cheapest budget-taxi rate — consistent with how the tours
// catalog is priced. See src/lib/transferPricing.ts for how these tables
// turn into an instant quote or a "Request a Quote" fallback.
export const transfersPage: TransfersPageContent = {
  heroEyebrow: "Transfers",
  heroTitle: "Private Transfers Across Cairo & Giza",
  heroDescription:
    "Airport pickups, hotel-to-hotel transfers, and day trips out of the city — a private, air-conditioned vehicle and driver, booked in a couple of minutes.",

  categories: [
    {
      id: "airport",
      label: "Airport Transfer",
      description:
        "Private pickup or drop-off at Cairo International Airport, with flight tracking and a driver waiting at arrivals.",
    },
    {
      id: "hotel",
      label: "Hotel Transfer",
      description: "Point-to-point transfers between hotels, or from your hotel to any Cairo or Giza attraction.",
    },
    {
      id: "intercity",
      label: "Intercity Transfer",
      description: "One-way private transfers between Cairo/Giza and Alexandria, Ain Sokhna, or Fayoum.",
    },
    {
      id: "private-driver",
      label: "Private Driver",
      description: "Hire a private driver and vehicle by the hour or the day, for full flexibility around Cairo and Giza.",
    },
    {
      id: "custom",
      label: "Custom Transfer",
      description: "Multi-stop routes, unusual pickup points, or anything outside the above — tell us what you need.",
    },
  ],

  vehicles: [
    { id: "sedan", name: "Sedan", tagline: "Comfortable & efficient", passengers: 3, luggage: 2 },
    { id: "suv", name: "SUV", tagline: "Extra space & comfort", passengers: 4, luggage: 3 },
    { id: "van", name: "Van", tagline: "For families & small groups", passengers: 8, luggage: 6 },
    { id: "minibus", name: "Minibus", tagline: "For larger groups", passengers: 14, luggage: 10 },
    { id: "vip", name: "VIP Luxury", tagline: "Premium Mercedes-class car", passengers: 3, luggage: 2 },
  ],

  zones: [
    { id: "cairo-airport", label: "Cairo International Airport (CAI)", group: "Cairo & Giza" },
    { id: "downtown-cairo", label: "Downtown Cairo / Garden City Hotels", group: "Cairo & Giza" },
    { id: "zamalek", label: "Zamalek Hotels", group: "Cairo & Giza" },
    { id: "new-cairo", label: "New Cairo / Nile-View Hotels", group: "Cairo & Giza" },
    { id: "giza-pyramids", label: "Giza / Pyramids Area Hotels", group: "Cairo & Giza" },
    { id: "october-city", label: "6th of October City", group: "Cairo & Giza" },
    { id: "alexandria", label: "Alexandria", group: "Intercity" },
    { id: "ain-sokhna", label: "Ain Sokhna", group: "Intercity" },
    { id: "fayoum", label: "Fayoum", group: "Intercity" },
    { id: "other", label: "Other — I'll specify the location", group: "Intercity", isCustom: true },
  ],

  tierPricing: {
    airport: { sedan: 30, suv: 40, van: 50, minibus: 70, vip: 95 },
    hotel: { sedan: 20, suv: 28, van: 38, minibus: 55, vip: 75 },
  },

  intercityPricing: [
    { zoneId: "alexandria", prices: { sedan: 110, suv: 130, van: 155, minibus: 190, vip: 220 } },
    { zoneId: "ain-sokhna", prices: { sedan: 65, suv: 80, van: 95, minibus: 120, vip: 150 } },
    { zoneId: "fayoum", prices: { sedan: 60, suv: 75, van: 90, minibus: 115, vip: 145 } },
  ],

  privateDriverRates: [
    { vehicle: "sedan", hourly: 15, daily: 75 },
    { vehicle: "suv", hourly: 20, daily: 95 },
    { vehicle: "van", hourly: 28, daily: 130 },
    { vehicle: "minibus", hourly: 40, daily: 180 },
    { vehicle: "vip", hourly: 50, daily: 220 },
  ],

  included: [
    "Private, air-conditioned vehicle",
    "Professional, English-speaking driver",
    "Meet & greet at arrivals (airport transfers)",
    "Live flight tracking, so we adjust for delays (airport transfers)",
    "Bottled water",
    "All tolls and parking fees",
  ],

  faqs: [
    {
      question: "What if my flight is delayed?",
      answer:
        "We track your flight and adjust your pickup time automatically for airport transfers — no need to contact us unless the delay is more than a few hours.",
    },
    {
      question: "Why does my route show \"Request a Quote\" instead of a price?",
      answer:
        "Most Cairo/Giza routes and our three intercity destinations (Alexandria, Ain Sokhna, Fayoum) price instantly. Anything else — a different city, a multi-stop route, or an unusual pickup point — needs a quick check before we can quote it, so we'll follow up by email or WhatsApp with a firm price, usually within a few hours.",
    },
    {
      question: "Can I book a round trip?",
      answer:
        "Yes — submit this form for your first leg, then send us the return details (or just mention it in the notes) and we'll confirm both together, often at a small discount over two one-way bookings.",
    },
    {
      question: "What's the difference between a Hotel Transfer and a Private Driver?",
      answer:
        "A Hotel Transfer takes you directly from one point to another. A Private Driver stays with you and the vehicle for a block of hours or a full day, so you can make multiple stops on your own schedule.",
    },
  ],
};
