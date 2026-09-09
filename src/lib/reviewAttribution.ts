import type { Rating, Testimonial } from "@/content/types";

// Egypt Eye's reviews arrive over WhatsApp, and the follow-up records which
// trip or shoot the traveler was on in the testimonial's `context` — "6 Days:
// Cairo, Giza & Luxor", "Exclusive Pyramids Photoshoot". This turns that text
// back into a per-product review count, so a tour can show its own real
// number instead of the company-wide total.
//
// Matching is deliberately strict: a review counts for a product only when
// its context names that product, never when it merely sounds related. A
// context like "Egypt itinerary" or "Cairo city tour" matches nothing,
// because guessing which of several Cairo tours a traveler meant would invent
// attribution rather than read it. Those reviews still count toward the
// company total — they're real reviews, just not evidence about one product.
//
// The escape hatch for anything the text can't resolve is the testimonial's
// optional `subject` reference in Studio, set by hand and always trusted over
// the text.

const STOPWORDS = new Set(["and", "the", "a", "an", "of", "at", "in", "on", "for", "to", "with"]);

/**
 * A comparison key that survives the difference between a title and a slug:
 * "6 Days: Cairo, Giza & Luxor" and "6-days-cairo-giza-luxor" both reduce to
 * "6dayscairogizaluxor", so punctuation, casing, ampersands and joining words
 * can't cause a real match to be missed.
 */
function key(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word && !STOPWORDS.has(word))
    .join("");
}

type ProductLike = { slug: string; title: string };

/** Whether this review is about this specific product. */
export function reviewMatchesProduct(review: Testimonial, product: ProductLike): boolean {
  // An explicitly linked review wins outright — it's a human saying so.
  if (review.subjectSlug) return review.subjectSlug === product.slug;

  if (!review.context) return false;
  const context = key(review.context);
  if (!context) return false;
  return context === key(product.title) || context === key(product.slug);
}

/**
 * This product's own rating, from the reviews whose context names it, or null
 * when none do — in which case the caller falls back to the company-wide
 * figure rather than showing a product nobody has reviewed yet as "0".
 *
 * As with the company figure, the average is reported only from reviews that
 * carry a star value; a written-only review still counts toward the total.
 */
export function getProductRating(product: ProductLike, reviews: Testimonial[]): Rating {
  const matched = reviews.filter((review) => reviewMatchesProduct(review, product));
  if (matched.length === 0) return null;

  const scored = matched
    .map((r) => r.score)
    .filter((s): s is number => typeof s === "number" && s > 0);

  return {
    scope: "product",
    source: "computed",
    count: matched.length,
    score:
      scored.length > 0
        ? Math.round((scored.reduce((sum, s) => sum + s, 0) / scored.length) * 100) / 100
        : undefined,
  };
}

/**
 * How well the imported contexts actually resolve — the numbers behind
 * /admin/reviews, so unmatched reviews can be found and fixed rather than
 * silently sitting in the company total forever.
 */
export function getAttributionCoverage(reviews: Testimonial[], products: ProductLike[]) {
  const unmatchedContexts = new Map<string, number>();
  let attributed = 0;

  for (const review of reviews) {
    if (products.some((p) => reviewMatchesProduct(review, p))) {
      attributed += 1;
      continue;
    }
    const label = review.context?.trim() || "(no context set)";
    unmatchedContexts.set(label, (unmatchedContexts.get(label) ?? 0) + 1);
  }

  return {
    total: reviews.length,
    attributed,
    unattributed: reviews.length - attributed,
    // Biggest buckets first: fixing the top few contexts moves the most
    // reviews onto products.
    topUnmatched: [...unmatchedContexts.entries()]
      .map(([context, count]) => ({ context, count }))
      .sort((a, b) => b.count - a.count),
  };
}
