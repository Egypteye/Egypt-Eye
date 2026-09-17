// The English dictionary — the source of truth every other language is
// translated from, and the shape they must all satisfy (see `Dictionary`).
//
// Interface strings live here rather than inline in components so a language
// can be added without touching a single component. Catalogue copy — tour
// descriptions, itineraries, article bodies — does NOT live here: it comes
// from Sanity and is translated per-locale in the CMS (see
// src/i18n/localizeContent.ts), because it grows every week and belongs to
// the editors, not the codebase.
//
// Nav labels are keyed by href, not by their English text, so translating a
// label never depends on the English string staying the same.

export const en = {
  language: {
    label: "Language",
    choose: "Choose your language",
    current: "Current language",
  },

  nav: {
    more: "More",
    toggleMenu: "Toggle menu",
    myJourney: "My Journey",
    planMyTrip: "Plan My Trip",
    account: "Account",
    skipToContent: "Skip to content",
    byHref: {
      "/": "Home",
      "/explore-egypt": "Explore Egypt",
      "/signature-experiences": "Signature Experiences",
      "/tours": "Best Seller Tours",
      "/experiences": "Extra Experiences",
      "/photoshoots": "Unique Photoshoots",
      "/transfers": "Transfers",
      "/hotel-deals": "Hotel Deals",
      "/customize": "Customize Your Tour",
      "/stories": "Stories",
      "/partners": "Partner With Us",
      "/testimonials": "Traveler Reviews",
      "/about": "About",
    } as Record<string, string>,
  },

  footer: {
    explore: "Explore",
    contact: "Contact",
    follow: "Follow",
    partnerWithUs: "Partner With Us",
    travelAgents: "Travel Agents",
    affiliateProgram: "Affiliate Program",
    creators: "Creators & Influencers",
    travelerReviews: "Traveler Reviews",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    rightsReserved: "All rights reserved.",
  },

  common: {
    bookOnWhatsApp: "Book on WhatsApp",
    emailEnquiry: "Email an Enquiry",
    addToJourney: "Add to My Journey",
    inMyJourney: "In My Journey",
    viewTour: "View tour",
    viewDetails: "View details",
    seeDetails: "See Details",
    seeFullExperience: "See the full experience",
    enquireForPricing: "Enquire for pricing",
    perPerson: "per person",
    from: "from",
    designYourTour: "Design Your Dream Tour",
    readyHeading: "Ready to write your own Egypt story?",
    readyBody: "Tell us what you have in mind and we'll build a private itinerary around it.",
    backToAllTours: "Back to all tours",
    backToAllExperiences: "Back to all experiences",
    youMightAlsoLike: "You might also like",
    moreExperiences: "More experiences to add",
    gallery: "Gallery",
    aboutThisTour: "About this tour",
    whatsIncluded: "What's included",
    notIncluded: "Not included",
    itinerary: "Itinerary",
    highlights: "Highlights",
    goodToKnow: "Good to know",
    availableOn: "Available On",
    whereYoullGo: "Where You'll Go",
    day: "Day",
  },

  physical: {
    label: "Physical level",
    easy: "Easy",
    moderate: "Moderate",
    active: "Active",
    challenging: "Challenging",
  },

  reviews: {
    chip: "Experience Rating",
    eyebrow: "Traveler Stories",
    heading: "What Our Travelers Say",
    intro:
      "Every review here comes from a real Egypt Eye trip — no invented or illustrative quotes. They're all on this page; use the filters to narrow them to a category or a single tour, shoot or service.",
    all: "All Reviews",
    photoshoots: "Photoshoots",
    tours: "Tours",
    services: "Services",
    filterByCategory: "Filter reviews by category",
    jumpTo: "Jump to",
    anyProduct: "Any tour, shoot or service",
    anyInCategory: "Anything in this category",
    clear: "Clear",
    showingAll: "Every review, newest arrivals included",
    showingProduct: "Reviews of {product}",
    showingCategory: "Every {category} review",
    none: "No reviews here yet.",
    seeAll: "See all reviews",
    onTheWay: "Reviews are on their way — check back soon, or",
    startPlanning: "start planning your own Egypt story",
  },

  tours: {
    filterHeading: "Filter Tours",
    searchPlaceholder: "Trip name or destination...",
    tripType: "Trip type",
    all: "All Tours",
    oneDay: "One-Day Tours",
    multiDay: "Multi-Day Tours",
    jordan: "Egypt & Jordan",
    matchCount: "{count} tours match",
    noMatches: "No tours match that search.",
    clearFilters: "Clear filters",
  },

  forms: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    send: "Send",
    sending: "Sending…",
    sent: "Thank you — we'll be in touch shortly.",
    error: "Something went wrong. Please try again, or message us on WhatsApp.",
    required: "Required",
    optional: "optional",
  },

  errors: {
    notFoundTitle: "We couldn't find that page",
    notFoundBody:
      "The page you're looking for has moved or never existed. Try the tours, or head back to the homepage.",
    backHome: "Back to homepage",
    browseTours: "Browse tours",
    somethingWrong: "Something went wrong",
    somethingWrongBody: "Sorry — that didn't load. Please try again.",
    tryAgain: "Try again",
  },


  /**
   * Per-page SEO title and description, keyed by path.
   *
   * These were literals in each page file, which meant a German or Arabic
   * page carried an English <title> — the single most visible thing a search
   * engine shows, and the one a translated site most obviously gets wrong.
   * Keyed by path so a page can be renamed without breaking its translation.
   */
  pages: {
    "/": {
      title: "Private Egypt Tours & Travel Experiences",
      description:
        "Private, guided tours across Egypt — Cairo, Luxor, Aswan, and the Red Sea — with professional photography built in. Custom itineraries, concierge support.",
    },
    "/tours": {
      title: "Private Tours Across Egypt & Jordan",
      description:
        "Private, guided tours across Egypt and Jordan — one-day trips, multi-day itineraries, and Nile cruises. Every tour includes a private vehicle and guide.",
    },
    "/photoshoots": {
      title: "Pyramids & Flying Dress Photoshoots in Egypt",
      description:
        "Professional photoshoot packages in Egypt, including the Exclusive Pyramids Photoshoot and Egypt's first Flying Dress experience.",
    },
    "/experiences": {
      title: "Things to Do in Egypt — Activities & Extra Experiences",
      description:
        "Camel rides at Giza, kayaking on the Nile, 4x4 safaris in Fayoum, ballooning over Luxor and Red Sea island days — Egypt Eye's activities, by destination.",
    },
    "/signature-experiences": {
      title: "Signature Experiences",
      description:
        "Curated Egypt travel experiences designed around a specific person and need — the destination is part of the answer, not the whole plan.",
    },
    "/explore-egypt": {
      title: "Explore Egypt — Interactive Destination Map",
      description:
        "An interactive map of Egypt's must-see destinations — Cairo, Luxor, Aswan, and the Red Sea coast — with real tours and experiences available at each.",
    },
    "/transfers": {
      title: "Private Transfers in Cairo & Giza",
      description:
        "Book a private airport, hotel, or intercity transfer in Cairo and Giza — choose your vehicle and request a quote in a few clicks.",
    },
    "/hotel-deals": {
      title: "Hotel Deals in Egypt",
      description:
        "Hotels with current Egypt Eye partner rates across Cairo, Giza, and the Red Sea coast.",
    },
    "/customize": {
      title: "Customize Your Tour",
      description:
        "Tell us your dates, interests, and pace — we'll design a private Egypt or Jordan itinerary around you.",
    },
    "/stories": {
      title: "Egypt Travel Stories & Journal",
      description:
        "Editorial travel writing from Egypt Eye — the history, the places, and the rare moments worth building a trip around.",
    },
    "/about": {
      title: "About Egypt Eye — Who Travels With Us, and Who Trusts Us",
      description:
        "Travel agencies, Bollywood actors, Olympians and creators have all handed Egypt Eye their trip to Egypt. The agencies, the guests, the trips and the dates — on one page.",
    },
    "/partners": {
      title: "Partner With Us",
      description:
        "Three ways to work with Egypt Eye: the Travel Agent Partner Program, the Affiliate Program, and Creators & Influencers collaborations.",
    },
    "/travel-agents": {
      title: "Travel Agent Partner Program",
      description:
        "Join the Egypt Eye Travel Agent Program for special partner rates, a dedicated specialist, and full booking support across Egypt & Jordan.",
    },
    "/affiliate": {
      title: "Affiliate Program",
      description:
        "Earn a commission recommending Egypt Eye's private Egypt & Jordan tours. Your own referral code, real-time-tracked bookings, and monthly payouts.",
    },
    "/collaborate": {
      title: "Collaborate With Egypt Eye",
      description:
        "Content creators and influencers — apply to collaborate with Egypt Eye for sponsored trips, content partnerships, and press coverage across Egypt & Jordan.",
    },
    "/privacy": {
      title: "Privacy Policy",
      description:
        "How Egypt Eye Travel & Tours collects, uses and protects the personal information you share when booking a trip or a photoshoot.",
    },
    "/terms": {
      title: "Terms of Service",
      description:
        "The booking, payment, cancellation and liability terms that apply to every Egypt Eye Travel & Tours trip, transfer and photoshoot.",
    },
    "/pharaoh-challenge": {
      title: "Pharaoh's Challenge — Play & Win",
      description:
        "Five Ancient-Egypt-inspired chambers, one attempt, and a discount reward that grows the deeper you go. Play the Pharaoh's Challenge.",
    },
  } as Record<string, { title: string; description: string }>,

  seo: {
    // {title} is the page's own title; the site name is appended by layout.
    homeTitle: "Private Egypt Tours, Photoshoots & Experiences",
    // Appended to every tour page title, after an em dash.
    privateTourSuffix: "Private Tour",
    localeSuffix: "",
  },
};

/** Every other language must provide exactly these keys. */
export type Dictionary = typeof en;
