import type { Story, StoryCardData } from "@/content/types";

// Topical authority, derived rather than hand-maintained.
//
// The library is 182 published articles. Only 66 of them carried a
// `relatedStories` array, which meant 116 were orphans: a reader arriving from
// search read one page and left, and a crawler found no path onward. Nothing
// was wrong with the articles. There was simply no shape to the set.
//
// Hand-linking 182 articles is a job that is wrong the moment the 183rd is
// published, so this derives the shape instead. Two pieces:
//
//   1. CLUSTERS — eight declared topic areas, each with a pillar article and
//      the Egypt Eye service its readers should end up at. This is the only
//      hand-maintained part, and it is one line per cluster.
//   2. relatedStoriesFor — scores every other article against this one and
//      returns the closest few, so a new article is linked from the day it
//      ships without anyone editing a list.
//
// A manual `relatedStories` array still wins. Deriving is the default, not a
// replacement for judgement.

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
 * The eight clusters from docs/content-strategy.md.
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

function toCard(story: Story): StoryCardData {
  return {
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    image: story.image,
    imageTone: story.imageTone,
    category: story.category,
  };
}

/**
 * The articles closest to this one.
 *
 * Shared tags carry the most weight because they are the most specific signal
 * the library has — 351 distinct tags across 182 articles means a shared tag
 * usually means a genuinely shared subject, where a shared category can mean
 * only that both are travel guides. Cluster agreement is next, then category,
 * then a shared bookable tour, which catches pairs that use different
 * vocabulary for the same place.
 *
 * Returns fewer than `limit` rather than padding with weak matches: three
 * relevant links beat six that send a reader somewhere unrelated.
 */
function candidatesFor(story: Story, all: Story[]) {
  const tags = new Set((story.tags ?? []).map(lower));
  const cluster = clusterFor(story);
  const tourSlugs = new Set((story.relatedTours ?? []).map((t) => t.slug));

  return all
    .filter((other) => other.slug !== story.slug && other.status === "published")
    .map((other) => {
      let score = 0;
      for (const tag of other.tags ?? []) if (tags.has(lower(tag))) score += 12;
      if (cluster && clusterFor(other)?.id === cluster.id) score += 8;
      if (other.category && other.category === story.category) score += 4;
      for (const tour of other.relatedTours ?? []) if (tourSlugs.has(tour.slug)) score += 6;
      return { other, score };
    })
    // The floor is one shared tag (12), or agreement on the cluster (8),
    // which is a real relationship even when the vocabulary differs — two
    // photography articles that never use the same tag are still about
    // photography. Category alone (4) is not enough and never qualifies.
    .filter((entry) => entry.score >= 8)
    .sort((a, b) => b.score - a.score || a.other.slug.localeCompare(b.other.slug));
}

/**
 * Related links for the whole library at once, balanced so the links spread.
 *
 * Scoring each article independently produces a rich-get-richer graph: the few
 * broad articles win every tie and a long tail receives no inbound link at
 * all, which is precisely the orphan problem this is meant to solve. So the
 * index is built in one pass that tracks how many inbound links each article
 * has already collected and breaks ties towards the ones that have fewest.
 *
 * Relevance still decides. The balancing only chooses between articles that
 * scored equally, which is common — a shared tag is a shared tag.
 */
export function buildRelatedIndex(all: Story[], limit = 3): Map<string, StoryCardData[]> {
  const published = all.filter((s) => s.status === "published");
  const inbound = new Map<string, number>();
  const index = new Map<string, StoryCardData[]>();

  // Manual lists are decisions someone made, so they are honoured first and
  // their inbound links counted before anything is derived around them.
  for (const story of published) {
    if (story.relatedStories?.length) {
      index.set(story.slug, story.relatedStories);
      for (const r of story.relatedStories) inbound.set(r.slug, (inbound.get(r.slug) ?? 0) + 1);
    }
  }

  for (const story of published) {
    if (index.has(story.slug)) continue;
    const picked: StoryCardData[] = [];
    const pool = candidatesFor(story, published);
    while (picked.length < limit && pool.length > 0) {
      const topScore = pool[0].score;
      // Among everything comparably relevant, take whichever is least linked
      // to. The window is deliberately a band rather than an exact tie: a gap
      // of a few points is one category match, not a difference of subject,
      // and treating it as a tie is what stops a dense cluster leaving its
      // own long tail with no inbound link at all.
      let bestAt = 0;
      for (let i = 1; i < pool.length && pool[i].score >= topScore - 6; i++) {
        if ((inbound.get(pool[i].other.slug) ?? 0) < (inbound.get(pool[bestAt].other.slug) ?? 0)) bestAt = i;
      }
      const [chosen] = pool.splice(bestAt, 1);
      picked.push(toCard(chosen.other));
      inbound.set(chosen.other.slug, (inbound.get(chosen.other.slug) ?? 0) + 1);
    }
    index.set(story.slug, picked);
  }

  return index;
}

/** One article's related links. Prefer buildRelatedIndex when rendering many. */
export function relatedStoriesFor(story: Story, all: Story[], limit = 3): StoryCardData[] {
  // An explicit list is a decision someone made. Respect it.
  if (story.relatedStories?.length) return story.relatedStories;
  return buildRelatedIndex(all, limit).get(story.slug) ?? [];
}

/** The Egypt Eye service a reader of this article should be able to reach. */
export function serviceFor(story: Pick<Story, "slug" | "tags" | "category">): Cluster["service"] | undefined {
  return clusterFor(story)?.service;
}
