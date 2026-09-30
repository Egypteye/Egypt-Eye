import type { Story } from "@/content/types";

// What an article is ABOUT, and where its reader should go next.
//
// This is deliberately not a related-articles system. That already exists and
// predates this file: `withDerivedRelatedStories` in sanity/fetchers.ts gives
// every article a "keep reading" row at request time using the same ring
// rotation the tour catalogue uses, so links spread evenly rather than piling
// onto whichever articles sort first. Nothing here duplicates it.
//
// What was missing is the other half of internal linking. An article had
// siblings but no sense of hierarchy: no page it supported, and no route to
// the thing Egypt Eye actually does about its subject. A reader finishing
// "what to wear for a pyramids photoshoot" could reach three more articles
// and not the photoshoot.
//
// So this declares ten clusters — a topic area, the pillar article it
// concentrates on, and the service its readers should be able to reach — and
// derives which cluster an article belongs to from its own tags, slug and
// category. One line per cluster is the whole maintenance cost, and a new
// article joins the right one on the day it ships.

export type Cluster = {
  id: string;
  label: string;
  /** The article this cluster's supporting pages point at. */
  pillarSlug: string;
  /** Tags that place an article in this cluster, matched case-insensitively. */
  tags: string[];
  /** Substrings in a slug that place an article here when tags do not. */
  slugHints?: string[];
  /** Story categories that fall here when nothing more specific matches. */
  categories?: string[];
  /** Where a reader of this cluster should be able to go next, on the site. */
  service: { label: string; href: string };
};

/**
 * The ten clusters from docs/content-strategy.md.
 *
 * Pillars were chosen as the article that already ranks broadest for the
 * cluster's head term, not the newest one — the point is to concentrate
 * signal on a page that has some, not to start again.
 */
export const CLUSTERS: Cluster[] = [
  {
    id: "photography",
    label: "Photography in Egypt",
    pillarSlug: "private-photographer-egypt",
    tags: [
      "Egypt Photoshoots", "Pyramids Photoshoot", "Photoshoot", "Photography",
      "Flying Dress Photoshoot", "Flying Dress", "Giza Photoshoot",
    ],
    slugHints: ["photoshoot", "photographer", "photo-spots", "flying-dress"],
    service: { label: "See photoshoot options", href: "/photoshoots" },
  },
  {
    id: "celebrations",
    label: "Celebrations & Milestones",
    pillarSlug: "celebrating-a-milestone-in-egypt",
    tags: ["Proposals", "Proposal", "Birthdays", "Anniversaries", "Gender Reveal", "Celebrations", "Couples"],
    slugHints: ["proposal", "birthday", "gender-reveal", "anniversary", "milestone"],
    service: { label: "Plan a celebration", href: "/customize" },
  },
  {
    id: "desert",
    label: "The Western Desert",
    pillarSlug: "western-desert-oases-guide",
    tags: ["White Desert", "Black Desert", "Bahariya", "Siwa", "Western Desert", "Desert", "Stargazing", "Camping"],
    slugHints: ["desert", "bahariya", "siwa", "oasis", "oases"],
    service: { label: "See desert trips", href: "/weekly-trips" },
  },
  {
    id: "transfers",
    label: "Getting Around Egypt",
    pillarSlug: "cairo-airport-transfer-guide",
    tags: ["Transfers", "Airport Transfer", "Cairo Airport", "Private Driver", "Transport", "Flight Delays"],
    slugHints: ["transfer", "airport", "getting-around"],
    service: { label: "See transfer options", href: "/transfers" },
  },
  {
    id: "planning",
    label: "Planning a Trip to Egypt",
    pillarSlug: "how-to-plan-a-trip-to-egypt",
    tags: [
      "Trip Planning", "Itinerary", "Egypt Travel Tips", "Egypt Travel", "Booking", "Safety", "Budget",
      "Bucket List", "Must-See Egypt", "Travel Goals", "Luxury Travel", "Private Tours", "VIP Experiences",
      "Planning", "City Guide",
    ],
    slugHints: ["how-to-plan", "itinerary", "first-time", "mistakes", "private-tour", "bucket-list", "travel-agenc"],
    categories: ["Travel Guides", "Behind the Scenes"],
    service: { label: "Build your trip", href: "/customize" },
  },
  {
    id: "beyond-cairo",
    label: "Beyond Cairo",
    pillarSlug: "best-day-trips-from-cairo",
    tags: [
      "Day Trips", "Weekend Trips", "Fayoum", "Alexandria", "Ain Sokhna", "Red Sea", "Yacht",
      "Sinai", "Hiking", "Nile Cruise", "Nile", "Cairo Nightlife", "Night Tourism", "Religious Sites",
    ],
    slugHints: ["day-trips", "weekend", "hidden", "ain-sokhna", "yacht", "alexandria", "sinai", "nile-dinner", "after-dark"],
    service: { label: "See trips from Cairo", href: "/weekly-trips" },
  },
  {
    id: "ancient-egypt",
    label: "Ancient Egypt",
    pillarSlug: "memphis-saqqara-dahshur-egypts-first-pyramids",
    tags: [
      "Ancient Egypt", "Pyramids", "Temples", "Luxor", "Aswan", "Hieroglyphs", "Tomb Art", "History",
      "Egyptian Museum", "Valley of the Kings", "Archaeology", "Tutankhamun", "Ramesses II", "Abu Simbel",
      "UNESCO", "Nubia", "Middle Kingdom", "New Kingdom", "Burial", "Egyptian Literature", "Hatshepsut",
      "Egyptomania", "Sound and Light Show", "Sphinx",
    ],
    slugHints: ["pyramid", "temple", "tomb", "pharaoh", "hieroglyph", "mummies", "abu-simbel", "tutankhamun", "hatshepsut", "ushabti", "sinuhe", "egyptomania"],
    categories: ["Ancient Egypt", "History & Culture"],
    service: { label: "See Egypt tours", href: "/tours" },
  },
  {
    id: "culture-food",
    label: "Egyptian Culture & Food",
    pillarSlug: "egyptian-food-guide-what-to-eat",
    tags: [
      "Egyptian Food", "Food", "Food Travel", "Egyptian Cuisine", "Culture", "Local Culture",
      "Khan el-Khalili", "Old Cairo", "Islamic Cairo", "Architecture", "Authentic Travel",
      "Egypt Through Local Eyes", "Bedouin",
    ],
    slugHints: ["food", "eat", "taste", "khan-el-khalili", "local-eyes", "bedouin", "islamic-cairo", "coptic"],
    categories: ["Culture", "Culture & Trends"],
    service: { label: "See Cairo tours", href: "/tours" },
  },
  {
    id: "jordan",
    label: "Jordan",
    pillarSlug: "amman-jordan-travel-guide",
    tags: ["Jordan", "Amman", "Dead Sea", "Petra", "Wadi Rum"],
    slugHints: ["jordan", "amman", "dead-sea", "petra", "wadi-rum"],
    service: { label: "See Jordan tours", href: "/tours" },
  },
  {
    id: "traveler-stories",
    label: "Traveller Stories",
    pillarSlug: "why-travelers-choose-egypt-eye-travel",
    tags: ["Traveler Stories"],
    slugHints: [],
    service: { label: "Read traveller reviews", href: "/testimonials" },
  },
];

const lower = (s: string) => s.toLowerCase();

/** The cluster an article belongs to, or undefined when none fits. */
export function clusterFor(story: Pick<Story, "slug" | "tags" | "category">): Cluster | undefined {
  // Category is the strongest single signal where it is specific enough.
  if (story.category === "Traveler Stories") {
    return CLUSTERS.find((c) => c.id === "traveler-stories");
  }

  const tags = new Set((story.tags ?? []).map(lower));
  const slug = lower(story.slug);

  let best: { cluster: Cluster; score: number } | undefined;
  for (const cluster of CLUSTERS) {
    let score = 0;
    for (const tag of cluster.tags) if (tags.has(lower(tag))) score += 3;
    for (const hint of cluster.slugHints ?? []) if (slug.includes(hint)) score += 2;
    // Category is the weakest signal and only ever a fallback: it breaks the
    // tie for an article whose tags say nothing, without ever outvoting one
    // whose tags say something.
    if (story.category && (cluster.categories ?? []).includes(story.category)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { cluster, score };
  }
  return best?.cluster;
}

/** The pillar an article should point at — never itself. */
export function pillarFor(story: Pick<Story, "slug" | "tags" | "category">, all: Story[]): Story | undefined {
  const cluster = clusterFor(story);
  if (!cluster || cluster.pillarSlug === story.slug) return undefined;
  return all.find((s) => s.slug === cluster.pillarSlug && s.status === "published");
}

/** The Egypt Eye service a reader of this article should be able to reach. */
export function serviceFor(story: Pick<Story, "slug" | "tags" | "category">): Cluster["service"] | undefined {
  return clusterFor(story)?.service;
}
