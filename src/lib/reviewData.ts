import "server-only";
import { getExperiences, getPhotoshoots, getSignatureExperiences, getTestimonials, getTours } from "@/sanity/fetchers";
import { buildReviewEntries, collectReviewSubjects } from "@/lib/reviewSubjects";
import { groupReviewsByProduct, type ProductReviewGroup } from "@/lib/reviewPages";
import { platformOf } from "@/lib/reviewPolicy";
import { deriveThemes } from "@/lib/reviewThemes";
import type { ReviewEntry } from "@/lib/reviewSubjects";
import type { ReviewPlatform, ReviewTheme } from "@/content/types";

// The one place the review pages load from.
//
// The hub, every product page and every page of pagination all need the same
// thing — every review, resolved to its product — so it is assembled once
// here rather than four times with four chances to drift. Next dedupes the
// underlying fetches, so the whole set is built once per request and once per
// route at build time.

export type ReviewData = {
  groups: ProductReviewGroup[];
  unattributed: ReviewEntry[];
  total: number;
  /** Where the reviews were written, most first. */
  platforms: [ReviewPlatform, number][];
  /** What travellers talked about, most first. */
  themes: [ReviewTheme, number][];
};

export async function loadReviewData(): Promise<ReviewData> {
  const [testimonials, tours, photoshoots, experiences, signatureExperiences] = await Promise.all([
    getTestimonials(),
    getTours(),
    getPhotoshoots(),
    getExperiences(),
    getSignatureExperiences(),
  ]);

  const subjects = collectReviewSubjects({ tours, photoshoots, experiences, signatureExperiences });
  const { entries } = buildReviewEntries(testimonials, subjects);
  const { groups, unattributed } = groupReviewsByProduct(entries, subjects);

  const platformCounts = new Map<ReviewPlatform, number>();
  const themeCounts = new Map<ReviewTheme, number>();
  for (const entry of entries) {
    const platform = platformOf(entry.testimonial);
    platformCounts.set(platform, (platformCounts.get(platform) ?? 0) + 1);
    for (const theme of deriveThemes(entry.testimonial)) {
      themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
    }
  }

  const byCount = <K,>(m: Map<K, number>): [K, number][] =>
    [...m.entries()].sort((a, b) => b[1] - a[1]);

  return {
    groups,
    unattributed,
    total: entries.length,
    platforms: byCount(platformCounts),
    themes: byCount(themeCounts),
  };
}
