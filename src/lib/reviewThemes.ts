import type { ReviewTheme, Testimonial } from "@/content/types";
import { REVIEW_THEMES } from "@/content/types";

// What a review is actually about, read out of the traveller's own words.
//
// This is the difference between a review wall and a trust layer. "The
// photographer kept showing us the back of the camera so we knew what we were
// getting" is strong evidence on a photoshoot page and noise on a transfers
// page; "great experience, highly recommend" is evidence of very little
// anywhere. Tagging by what was mentioned is what lets each page show the
// handful of reviews that actually speak to it.
//
// Two hard rules, because this touches customer words:
//
//   1. It only ever CLASSIFIES. Nothing here rewrites, trims or reorders the
//      inside of a review. A theme is a label attached to the record, not an
//      edit of it.
//   2. It is beaten by a human. `themes` set in Studio wins outright, because
//      a person reading the review knows things a keyword list does not.
//
// Matching is word-boundary anchored on purpose. An earlier substring match
// elsewhere in this codebase put food photos on fifteen stories because "eat"
// appears inside "weather", "beaten" and "great" — the same mistake here
// would put a proposal review on a family tour.

type ThemeRule = { theme: ReviewTheme; patterns: RegExp[] };

/** `\b` around each term, so "guide" never matches "guided by" inside "misguided". */
function words(...terms: string[]): RegExp[] {
  return terms.map((t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
}

const RULES: ThemeRule[] = [
  {
    theme: "photography",
    patterns: words(
      "photo", "photos", "photograph", "photographer", "photography", "photoshoot",
      "shoot", "camera", "pose", "posed", "posing", "edited", "edits", "retouch", "gallery"
    ),
  },
  {
    theme: "flying-dress",
    patterns: words("flying dress", "dress", "gown", "fabric", "tulle"),
  },
  {
    theme: "guide",
    patterns: words("guide", "guides", "egyptologist", "knowledge", "knowledgeable", "history", "explained"),
  },
  {
    theme: "pickup",
    patterns: words(
      "pick up", "pickup", "picked up", "drop off", "dropped", "transfer", "transfers",
      "driver", "airport", "vehicle", "van", "car", "punctual", "on time"
    ),
  },
  {
    theme: "communication",
    patterns: words(
      "whatsapp", "responsive", "replied", "reply", "communication", "communicated",
      "answered", "organised", "organized", "arranged", "seamless"
    ),
  },
  {
    theme: "proposal",
    patterns: words("proposal", "proposed", "engagement", "engaged", "she said yes", "surprise"),
  },
  { theme: "birthday", patterns: words("birthday", "anniversary", "honeymoon", "celebration", "celebrate") },
  { theme: "family", patterns: words("family", "kids", "children", "son", "daughter", "parents", "grandmother") },
  { theme: "couples", patterns: words("couple", "husband", "wife", "boyfriend", "girlfriend", "partner", "honeymoon") },
  { theme: "solo", patterns: words("solo", "alone", "by myself", "on my own") },
  { theme: "desert", patterns: words("desert", "dune", "dunes", "sand", "camp", "camping", "stars", "bedouin", "safari") },
  { theme: "nile", patterns: words("nile", "cruise", "felucca", "dahabiya", "boat", "sailing") },
  { theme: "diving", patterns: words("dive", "diving", "snorkel", "snorkelling", "snorkeling", "reef", "red sea") },
  {
    theme: "planning",
    patterns: words("itinerary", "planned", "planning", "custom", "customised", "customized", "tailored", "flexible"),
  },
  { theme: "value", patterns: words("value", "worth", "price", "affordable", "cheap", "expensive", "cost") },
];

/**
 * Themes a review mentions, from its own text plus its context line.
 *
 * Context is included because the follow-up records which trip it was —
 * "Exclusive Pyramids Photoshoot" is itself evidence the review is about
 * photography even if the traveller only wrote "loved every minute".
 */
export function deriveThemes(review: Testimonial): ReviewTheme[] {
  if (review.themes && review.themes.length > 0) return review.themes;

  const haystack = [review.title, review.quote, review.context].filter(Boolean).join(" \n ");
  const found: ReviewTheme[] = [];
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) found.push(rule.theme);
  }
  return found;
}

export const THEME_LABELS: Record<ReviewTheme, string> = {
  photography: "Photography",
  "flying-dress": "Flying dress",
  guide: "Guides",
  pickup: "Pickups & transfers",
  communication: "Communication",
  proposal: "Proposals",
  birthday: "Celebrations",
  family: "Families",
  couples: "Couples",
  solo: "Solo travellers",
  desert: "Desert",
  nile: "The Nile",
  diving: "Diving & snorkelling",
  planning: "Trip planning",
  value: "Value",
};

export function isReviewTheme(value: string): value is ReviewTheme {
  return (REVIEW_THEMES as readonly string[]).includes(value);
}

/**
 * How specific a review is — roughly, how much it tells a reader they did not
 * already assume.
 *
 * "Great experience, highly recommend" and a paragraph naming what the
 * photographer did are both five stars and are not equally useful. This is
 * what sorts the second above the first everywhere reviews are shown, so the
 * strongest evidence leads instead of whatever happens to be newest.
 *
 * Length is a proxy and a crude one, so it is capped and paired with two
 * better signals: how many distinct things the review talks about, and
 * whether it names a person. A review that names the guide who looked after
 * them is almost always a real account of a real day.
 */
export function specificityScore(review: Testimonial): number {
  const text = review.quote.trim();
  const themes = deriveThemes(review);

  // 0–3 for length, flattening out past a couple of sentences.
  const lengthPoints = Math.min(3, Math.floor(text.length / 120));
  // 0–4 for breadth: a review touching pickup AND guide AND photos is a
  // fuller account than one repeating a single note.
  const themePoints = Math.min(4, themes.length);
  // Names a team member — "Mahmoud was", "our guide Ahmed" — which is the
  // single strongest tell of a genuine, specific review.
  const namesSomeone = /\b[A-Z][a-z]{2,}\b\s+(was|made|took|showed|helped|knew|drove|picked)/.test(text) ? 2 : 0;

  return lengthPoints + themePoints + namesSomeone;
}

/**
 * How well a review speaks to a given page.
 *
 * Product match dominates: a review whose context names this exact shoot is
 * the best possible evidence for it, and nothing about wording beats that.
 * Theme overlap comes next, then specificity as the tie-break — which is what
 * stops a page filling up with "great experience" when a better review of the
 * same product exists.
 *
 * Returns 0 for a review with nothing to say about this page, and callers
 * drop those rather than pad with them: showing a review that doesn't speak
 * to the product is how a site starts looking like it is manufacturing
 * testimonials, which is the exact impression this whole system exists to
 * avoid.
 */
export function relevanceScore(
  review: Testimonial,
  target: { matchesProduct?: boolean; themes?: ReviewTheme[] }
): number {
  let score = 0;
  if (target.matchesProduct) score += 100;

  if (target.themes && target.themes.length > 0) {
    const reviewThemes = deriveThemes(review);
    const overlap = target.themes.filter((t) => reviewThemes.includes(t)).length;
    score += overlap * 10;
  }

  if (score === 0) return 0;
  return score + specificityScore(review);
}

/**
 * The best reviews for a page, strongest first.
 *
 * `fallbackToGeneral` exists for one honest case: a product with no reviews of
 * its own yet. Rather than an empty section or a fabricated one, the caller
 * can fall back to the company's strongest reviews — clearly labelled as being
 * about Egypt Eye rather than about this product, which is the caller's job.
 */
export function pickRelevantReviews(
  reviews: Testimonial[],
  target: { matchesProduct?: (r: Testimonial) => boolean; themes?: ReviewTheme[] },
  limit = 3
): Testimonial[] {
  const scored = reviews
    .map((review) => ({
      review,
      score: relevanceScore(review, {
        matchesProduct: target.matchesProduct?.(review) ?? false,
        themes: target.themes,
      }),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((r) => r.review);
}
