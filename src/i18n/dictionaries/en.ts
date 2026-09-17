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

  seo: {
    // {title} is the page's own title; the site name is appended by layout.
    homeTitle: "Private Egypt Tours, Photoshoots & Experiences",
    localeSuffix: "",
  },
};

/** Every other language must provide exactly these keys. */
export type Dictionary = typeof en;
