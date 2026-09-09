import type { Experience, Photoshoot, Rating, Testimonial, Tour } from "./types";

// Derives real stats from whatever content is passed in (local files or
// Sanity, via the fetchers) instead of hardcoding numbers — keeps homepage
// stat tiles honest as content is added or edited.

/**
 * The company's review figure, computed from the testimonials actually
 * collected — one number for the whole site.
 *
 * Reviews arrive through the WhatsApp follow-up after a trip or a shoot and
 * are about Egypt Eye rather than about a single tour, so there is nothing to
 * average per product. `count` is simply how many real reviews exist.
 *
 * `average` is deliberately absent until reviews carry a `score`: a written
 * review with no star value is still a review worth counting, but it cannot
 * be averaged into one. As scores get filled in in Studio, the average
 * appears on its own — computed only from the reviews that have one, so it is
 * never diluted by the ones that don't.
 */
export function getCompanyRating(testimonials: Testimonial[]): Rating {
  if (testimonials.length === 0) return null;

  const scored = testimonials
    .map((t) => t.score)
    .filter((s): s is number => typeof s === "number" && s > 0);

  return {
    scope: "company",
    source: "computed",
    count: testimonials.length,
    score:
      scored.length > 0
        ? Math.round((scored.reduce((sum, s) => sum + s, 0) / scored.length) * 100) / 100
        : undefined,
  };
}

export function getCatalogStats(tours: Tour[], experiences: Experience[], photoshoots: Photoshoot[]) {
  return {
    tourCount: tours.length,
    experienceCount: experiences.length,
    photoshootCount: photoshoots.length,
    destinationCount: new Set(tours.flatMap((t) => t.destinations)).size,
  };
}

/**
 * How the company review figure reads in prose — "1,247 traveler reviews",
 * or "4.9★ average across 1,247 traveler reviews" once scores exist. One
 * place, so the homepage, the trust bar and /testimonials can never describe
 * the same number differently.
 */
export function describeCompanyRating(rating: Rating): string | null {
  if (!rating || rating.count === 0) return null;
  const reviews = `${rating.count.toLocaleString()} traveler review${rating.count === 1 ? "" : "s"}`;
  return typeof rating.score === "number"
    ? `${rating.score.toFixed(1)}★ average across ${reviews}`
    : reviews;
}
