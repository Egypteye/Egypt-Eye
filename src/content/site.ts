// Global site configuration. Edit brand copy, contact info, and policies here —
// changes here update every page that references them.
import { destinations } from "./destinations";
import { interests } from "./interests";

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
    // Pinterest's own share shortlink — it redirects to the profile. Left as
    // issued because the canonical profile URL wasn't available to verify.
    pinterest: "https://pin.it/6sBXRcNyB",
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
      "A 20% down payment secures your reservation. The remaining balance can be paid in cash or via PayPal at the end of the day or tour.",
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
    cancellation:
      "For force majeure situations (e.g. volcanoes, earthquakes, or other circumstances outside our control), we do not charge a cancellation fee. If you cancel for personal or business reasons after we have incurred costs on your behalf, those costs may be transferred to you.",
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
