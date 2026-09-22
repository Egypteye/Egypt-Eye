// Global site configuration. Edit brand copy, contact info, and policies here —
// changes here update every page that references them.
import { cancellationSummary } from "./cancellationPolicy";
import { destinations } from "./destinations";
import { interests } from "./interests";

export const site = {
  name: "Egypt Eye Travel and Tours",
  shortName: "Egypt Eye",
  tagline: "Unveiling Egypt's Treasures",
  heroHeadline: "Unveiling Egypt's Treasures",
  heroSubheadline: "Journey Across the Land of Pharaohs",
  // The homepage hero slideshow's default slides, shown until real photos
  // are uploaded to Site Settings > Homepage hero slides. Kept here rather
  // than beside the fetcher so the extraction pipeline — which only reads
  // src/content/*.ts — actually sees these strings and can translate them.
  // Named heroSlides, not heroImages — see the comment on
  // ResolvedSiteSettings["heroSlides"] in content/types.ts for why.
  heroSlides: [
    {
      tone: "giza",
      image: "/photos/pexels-10124763.jpg",
      headline: "Where It All Begins: Giza",
      subtext: "Stand before the last surviving wonder of the ancient world, then climb inside the Great Pyramid itself.",
      linkLabel: "See the Giza Tour",
      linkHref: "/tours/1-day-giza-tour",
    },
    {
      tone: "nile",
      image: "/photos/pexels-15131486.jpg",
      headline: "Temples That Rise Straight From the Water",
      subtext: "A private cruise between Luxor and Aswan — the most scenic way to see ancient Egypt.",
      linkLabel: "Explore Nile Cruises",
      linkHref: "/tours/8-day-essential-egypt-nile-cruise",
    },
    {
      tone: "luxor",
      image: "/photos/pexels-18934702.jpg",
      headline: "Ancient Thebes, Properly Explored",
      subtext: "Karnak, the Valley of the Kings, and everything in between — how to actually see Luxor.",
      linkLabel: "Read the Luxor Guide",
      linkHref: "/stories/luxor-travel-guide",
    },
    {
      tone: "redsea",
      image: "/photos/pexels-36221985.jpg",
      headline: "Turquoise Water, White Sand, Nothing on the Agenda",
      subtext: "A slower few days on Egypt's Red Sea coast.",
      linkLabel: "Explore the Red Sea",
      linkHref: "/tours/red-sea-relaxation",
    },
    {
      tone: "desert",
      image: "/photos/pexels-20189345.jpg",
      headline: "A Sahara Sunset by Quad Bike",
      subtext: "Golden dunes, a private guide, and a ride you'll actually remember.",
      linkLabel: "See the Desert Experience",
      linkHref: "/experiences/atv-quad-bikes-sahara",
    },
  ],
  description:
    "Egypt Eye Travel and Tours turns a trip to Egypt into a personalized, memorable experience — combining private tours, professional photography, and concierge-level hospitality, tailored just for you.",
  positioning:
    "We show you Egypt, take care of you, customize the experience, and professionally capture it — Tour Operator, Experience Company, Photography Studio, and Concierge, all in one.",
  contact: {
    email: "info@egypteyetravel.com",
    whatsapp: "+20 127 414 4599",
    whatsappLink: "https://wa.me/201274144599",
  },
  // The real accounts. Share-sheet tracking parameters (mibextid, igsi,
  // _r/_t, feature=shared) are stripped — they identify whoever copied the
  // link, add nothing for visitors, and these bare profile URLs are the
  // canonical ones. Also feed the Organization JSON-LD's `sameAs` in
  // src/app/layout.tsx, which is how search engines tie these profiles to
  // the business, so they must stay real and current.
  socials: {
    instagram: "https://www.instagram.com/egypt_eye_/",
    facebook: "https://www.facebook.com/egypteyess",
    tiktok: "https://www.tiktok.com/@egypt.eye1",
    youtube: "https://www.youtube.com/@egypt_eye_",
    pinterest: "https://www.pinterest.com/EgyptEyeTours/",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Explore Egypt", href: "/explore-egypt" },
    { label: "Signature Experiences", href: "/signature-experiences" },
    { label: "Best Seller Tours", href: "/tours" },
    { label: "Extra Experiences", href: "/experiences" },
    { label: "Unique Photoshoots", href: "/photoshoots" },
    { label: "Transfers", href: "/transfers" },
    { label: "Hotel Deals", href: "/hotel-deals" },
    { label: "Customize Your Tour", href: "/customize" },
    { label: "Stories", href: "/stories" },
    { label: "Partner With Us", href: "/partners" },
    { label: "Traveler Reviews", href: "/testimonials" },
    { label: "About", href: "/about" },
  ],
  trustBadges: [
    {
      icon: "shield",
      title: "Private, Not Pooled",
      body: "Every tour is your own vehicle and guide — we never merge bookings into larger group tours.",
    },
    {
      icon: "coin",
      title: "One Price, Nothing Added Later",
      body: "Once your tour is confirmed, the price is guaranteed. No surprise add-ons, no shop-stop detours.",
    },
    {
      icon: "chat",
      title: "A Real Reply, Fast",
      body: "Message us on WhatsApp and hear back from an actual person — not a bot — usually within hours.",
    },
  ],
  destinations,
  interests,
  footer: {
    exploreLabel: "Explore",
    contactLabel: "Contact",
    followLabel: "Follow",
    whatsappPrefix: "WhatsApp: ",
    location: "Cairo, Egypt",
  },
  policies: {
    deposit:
      "A 20% down payment secures your reservation and is non-refundable. The remaining balance can be paid in cash or via PayPal at the end of the day or tour.",
    currency:
      "You may pay in USD, Euro, or British Pound. Once your tour is confirmed, the rate we quote you is guaranteed not to change.",
    children: [
      { age: "1–4 years", price: "Free" },
      { age: "5–8 years", price: "25% of tour price" },
      { age: "8+ years", price: "Full adult price" },
    ],
    childrenNote:
      "If airfare is involved, an additional child airfare charge may apply.",
    voucher:
      "After confirmation, we email you a final confirmation and voucher containing your tour information, operator contact numbers, customer-care information, and other useful details.",
    // Short form only — the binding text lives in content/cancellationPolicy.ts
    // and is published at /cancellation-policy, which every surface quoting
    // this summary links to. Imported rather than duplicated so the two can
    // never drift apart.
    cancellation: cancellationSummary,
  },
  // Intentionally empty until real numbers are supplied (years operating,
  // an actual guest count, a genuine review-platform rating) — the trust
  // bar hides any tile whose value isn't set here rather than showing a
  // placeholder. Fill in via the Studio (Site Settings → Trust stats bar)
  // or edit this object directly.
  trustStats: {},
  pillars: [
    {
      title: "Travel",
      description: "Private, guided journeys across Egypt and Jordan.",
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
