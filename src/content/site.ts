// Global site configuration. Edit brand copy, contact info, and policies here —
// changes here update every page that references them.

export const site = {
  name: "Egypt Eye Travel and Tours",
  shortName: "Egypt Eye",
  tagline: "Unveiling Egypt's Treasures",
  heroHeadline: "Unveiling Egypt's Treasures",
  heroSubheadline: "Journey Across the Land of Pharaohs",
  description:
    "Egypt Eye Travel and Tours turns a trip to Egypt into a personalized, memorable experience — combining private tours, professional photography, and concierge-level hospitality, tailored just for you.",
  positioning:
    "We show you Egypt, take care of you, customize the experience, and professionally capture it — Tour Operator, Experience Company, Photography Studio, and Concierge, all in one.",
  contact: {
    email: "info@egypteyetravel.com",
    whatsapp: "+20 127 414 4599",
    whatsappLink: "https://wa.me/201274144599",
    urgentBooking: "+20 122 907 9801",
  },
  socials: {
    instagram: "https://instagram.com/egypteyetravel",
    facebook: "https://facebook.com/egypteyetravel",
    tiktok: "https://tiktok.com/@egypteyetravel",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Popular Tours", href: "/tours" },
    { label: "Extra Experiences", href: "/experiences" },
    { label: "Photoshoots", href: "/photoshoots" },
    { label: "Customize Your Tour", href: "/customize" },
    { label: "Stories", href: "/stories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  policies: {
    deposit:
      "A 20% down payment secures your reservation. The remaining balance can be paid in cash or via PayPal at the end of the day or tour.",
    currency:
      "Prices are displayed in USD. You may pay in USD, Euro, or British Pound. Once your tour is confirmed, the price is guaranteed not to change.",
    children: [
      { age: "1–4 years", price: "Free" },
      { age: "5–8 years", price: "25% of tour price" },
      { age: "8+ years", price: "Full adult price" },
    ],
    childrenNote:
      "If airfare is involved, an additional child airfare charge may apply.",
    voucher:
      "After confirmation, we email you a final confirmation and voucher containing your tour information, operator contact numbers, customer-care information, and other useful details.",
    cancellation:
      "For force majeure situations (e.g. volcanoes, earthquakes, or other circumstances outside our control), we do not charge a cancellation fee. If you cancel for personal or business reasons after we have incurred costs on your behalf, those costs may be transferred to you.",
  },
  pillars: [
    {
      title: "Travel",
      description: "Private, expertly guided journeys across Egypt and Jordan.",
    },
    {
      title: "Photography",
      description:
        "Professional photographers and content creators built into every tour.",
    },
    {
      title: "Personalization",
      description: "Every itinerary tailored just for you — nothing off the shelf.",
    },
    {
      title: "Hospitality",
      description: "A team that treats you like family, from pickup to farewell.",
    },
  ],
} as const;
