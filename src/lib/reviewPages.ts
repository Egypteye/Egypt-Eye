import type { Testimonial } from "@/content/types";
import { specificityScore } from "./reviewThemes";
import {
  subjectAnchor,
  type ReviewEntry,
  type ReviewSubject,
  type ReviewSubjectType,
} from "./reviewSubjects";

// How the reviews are laid out across URLs.
//
// They used to be one page: every review the site had, in one document, with
// the filters narrowing what was visible. At a few dozen reviews that was the
// right shape — everything was one Ctrl+F away. At 2,527 it stopped being: the
// page measured 6.3MB, of which the review text itself was 717KB. The rest was
// card markup, carried twice — an App Router page embeds the flight payload
// for its tree alongside the HTML, so whatever a page renders it also ships as
// serialised React. That doubling is not something you can optimise away; the
// only lever is how much a page renders in the first place.
//
// So the wall is now a hub plus one page per product, paginated by URL. Not a
// "show more" button and not infinite scroll: every review sits at an address
// that can be linked, crawled and opened directly, which is the property the
// single page had and the one worth keeping.
//
// The ordering is the other half of the answer. With 928 reviews on one tour,
// nobody reaches page 12 — so the first page has to be the best page, which
// means sorting by how much a review actually says rather than by date.

/**
 * Reviews per page.
 *
 * 48 divides into 2, 3 and 4 columns evenly, and at the observed median
 * review length (235 characters) keeps a page near 150KB — about the size of
 * an ordinary article, and around 2% of what the single wall weighed.
 */
export const REVIEWS_PER_PAGE = 48;

/** How many of a product's reviews the hub shows before linking through. */
export const HUB_REVIEWS_PER_PRODUCT = 3;

/**
 * Reviews that resolved to no product at all.
 *
 * There are none today — every imported review carries the trip it was
 * written about. If that changes, the hub shows this many and states the rest
 * as a count rather than silently dropping them; past that they need a home
 * of their own.
 */
export const HUB_UNATTRIBUTED_LIMIT = 12;

const SUBJECT_TYPES: ReviewSubjectType[] = ["tour", "photoshoot", "experience", "service"];

export function isReviewSubjectType(value: string): value is ReviewSubjectType {
  return (SUBJECT_TYPES as string[]).includes(value);
}

/**
 * Where a product's reviews live.
 *
 * Type-prefixed for the same reason the old anchor was: slugs are only unique
 * within a catalogue, and the pyramids proposal setup exists as both an
 * experience and a photoshoot.
 */
export function productReviewsPath(subject: Pick<ReviewSubject, "type" | "slug">): string {
  return `/testimonials/${subject.type}/${subject.slug}`;
}

/**
 * Page 1 is the bare product path, never `/page/1`.
 *
 * Two URLs for one page of reviews is the classic self-inflicted duplicate,
 * so `/page/1` is not generated and not accepted — see `parseReviewPage`.
 */
export function productReviewsPagePath(
  subject: Pick<ReviewSubject, "type" | "slug">,
  page: number
): string {
  const base = productReviewsPath(subject);
  return page <= 1 ? base : `${base}/page/${page}`;
}

export function reviewPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
}

/**
 * The `/page/[n]` segment, or null if it isn't a page number we serve.
 *
 * Rejects 1 (that page is the bare path), zero, negatives, decimals, and
 * anything padded or non-numeric — so `/page/01` and `/page/2.0` 404 rather
 * than quietly rendering page 2 at a third URL.
 */
export function parseReviewPage(raw: string): number | null {
  // Digits with no leading zero, then the value test. Spelling "two or more"
  // into the pattern itself is the tempting shortcut and it is wrong: a
  // leading-digit class excludes 10 through 19 along with 1.
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const page = Number(raw);
  return page >= 2 ? page : null;
}

/** The slice of a sorted list that belongs on `page`. */
export function reviewPageSlice<T>(list: T[], page: number): T[] {
  const start = (page - 1) * REVIEWS_PER_PAGE;
  return list.slice(start, start + REVIEWS_PER_PAGE);
}

/**
 * Featured first, then whichever review says the most.
 *
 * Deliberately not newest-first. 43% of the imported reviews are under 200
 * characters — "Overall good experience" and its cousins — and ordering by
 * date puts those above a paragraph describing the day. Nothing is hidden by
 * this: every review is still on some page, this only decides which page.
 */
export function sortByPull<T extends { testimonial: Testimonial }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const featured = Number(Boolean(b.testimonial.featured)) - Number(Boolean(a.testimonial.featured));
    if (featured !== 0) return featured;
    return specificityScore(b.testimonial) - specificityScore(a.testimonial);
  });
}

export type ProductReviewGroup = {
  subject: ReviewSubject;
  /** Already sorted, so a caller can slice a page straight out of it. */
  entries: ReviewEntry[];
};

/**
 * The reviews, filed under the product each is about.
 *
 * Products with no reviews are left out entirely rather than given an empty
 * page — an address promising reviews of something nobody has reviewed is a
 * worse outcome than no address at all.
 */
export function groupReviewsByProduct(
  entries: ReviewEntry[],
  subjects: ReviewSubject[]
): { groups: ProductReviewGroup[]; unattributed: ReviewEntry[] } {
  const byKey = new Map<string, ReviewEntry[]>();
  const unattributed: ReviewEntry[] = [];

  for (const entry of entries) {
    if (!entry.productKey) {
      unattributed.push(entry);
      continue;
    }
    const bucket = byKey.get(entry.productKey);
    if (bucket) bucket.push(entry);
    else byKey.set(entry.productKey, [entry]);
  }

  const groups: ProductReviewGroup[] = [];
  for (const subject of subjects) {
    const found = byKey.get(subjectAnchor(subject));
    if (found?.length) groups.push({ subject, entries: sortByPull(found) });
  }

  // Most-reviewed first: on a hub whose job is to show the weight of the
  // evidence, the product with 928 reviews leads.
  groups.sort((a, b) => b.entries.length - a.entries.length);
  return { groups, unattributed: sortByPull(unattributed) };
}

/** Find one product's group by its URL parts. */
export function findReviewGroup(
  groups: ProductReviewGroup[],
  type: string,
  slug: string
): ProductReviewGroup | undefined {
  return groups.find((g) => g.subject.type === type && g.subject.slug === slug);
}
