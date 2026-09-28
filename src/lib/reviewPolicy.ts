import type { ReviewPlatform, Testimonial } from "@/content/types";

// The rules about third-party reviews, in code.
//
// Three separate regimes apply to a review Egypt Eye did not collect itself,
// and all three are easy to breach by accident with a copy and paste:
//
//   1. COPYRIGHT. The text of a TripAdvisor or Airbnb review is that
//      platform's content. They license republication through an official
//      widget or their Content API to approved partners — not by pasting.
//      What is defensible is what every reputable operator does: a short
//      attributed excerpt with a link to the original. So this module caps
//      the displayed length of a third-party review and requires the link.
//
//   2. SEARCH. Google's review-snippet documentation says "Don't aggregate
//      reviews or ratings from other websites", and separately, reviews a
//      business publishes about itself are not eligible for star snippets at
//      all. Emitting Review or AggregateRating markup over imported reviews
//      is therefore a policy breach that buys nothing. `schemaEligible`
//      below is the only thing allowed to decide what reaches structured
//      data, and it answers false for everything not collected directly.
//
//   3. CONSUMER LAW. The FTC's Consumer Review Rule (in force since 2024,
//      first enforcement letters December 2025, penalties per violation)
//      turns on authenticity and completeness: not attributing words to
//      someone who did not write them, and not curating a wall of praise
//      that misrepresents the whole. That is why nothing here rewrites a
//      review, why the source link is mandatory, and why the ratings summary
//      carries the date it was checked.
//
// None of this is legal advice, and it is the conservative reading. The
// unambiguously safe upgrade is for Egypt Eye to ask travellers who already
// reviewed elsewhere to leave the same words directly — those become
// "direct", publish in full, and are the only ones that can ever earn stars.

/** How much of a third-party review may be shown before it stops being a quote. */
export const THIRD_PARTY_EXCERPT_CHARS = 450;

export function platformOf(review: Testimonial): ReviewPlatform {
  return review.source?.platform ?? "direct";
}

/** A review Egypt Eye collected itself, and may publish in full. */
export function isFirstParty(review: Testimonial): boolean {
  return platformOf(review) === "direct";
}

/**
 * Whether this review may appear in Review/AggregateRating structured data.
 *
 * First-party only. Every caller that builds review markup must gate on this
 * rather than on the raw list, which is why it exists as its own named
 * function instead of an inline check.
 */
export function schemaEligible(review: Testimonial): boolean {
  return isFirstParty(review);
}

/** The subset of a review list that may legitimately drive structured data. */
export function schemaEligibleReviews(reviews: Testimonial[]): Testimonial[] {
  return reviews.filter(schemaEligible);
}

export const PLATFORM_LABELS: Record<ReviewPlatform, string> = {
  direct: "Direct to Egypt Eye",
  tripadvisor: "Tripadvisor",
  airbnb: "Airbnb",
  google: "Google",
  viator: "Viator",
  getyourguide: "GetYourGuide",
};

/**
 * A review with the display rules already applied.
 *
 * Components render this rather than the raw testimonial, so a page cannot
 * show the full text of a third-party review or a photo lifted from one by
 * forgetting a check. Truncation is on a word boundary with an ellipsis and
 * the link beside it, which is a quote pointing at its source rather than a
 * substitute for it.
 */
export type DisplayReview = {
  review: Testimonial;
  platform: ReviewPlatform;
  platformLabel: string;
  /** The text as it may be shown — never reworded, only ever shortened. */
  text: string;
  truncated: boolean;
  sourceUrl: string | null;
  firstParty: boolean;
  /** Empty for anything not first-party, whatever the record carries. */
  photos: NonNullable<Testimonial["photos"]>;
};

function excerpt(text: string, limit: number): { text: string; truncated: boolean } {
  if (text.length <= limit) return { text, truncated: false };
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return { text: `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd()}…`, truncated: true };
}

export function toDisplayReview(review: Testimonial): DisplayReview {
  const platform = platformOf(review);
  const firstParty = platform === "direct";
  const { text, truncated } = firstParty
    ? { text: review.quote, truncated: false }
    : excerpt(review.quote, THIRD_PARTY_EXCERPT_CHARS);

  return {
    review,
    platform,
    platformLabel: PLATFORM_LABELS[platform],
    text,
    truncated,
    sourceUrl: review.source?.url ?? null,
    firstParty,
    // A traveller's photo on someone else's platform is the traveller's, under
    // that platform's terms. Re-hosting it is a worse problem than quoting the
    // text, so it is dropped here regardless of what the record says.
    photos: firstParty ? (review.photos ?? []) : [],
  };
}

/**
 * Problems an editor needs to fix, for /admin/reviews.
 *
 * Returned rather than thrown: a review missing its source link should be
 * findable and fixable, not a crash, and it is already live either way.
 */
export function reviewComplianceIssues(review: Testimonial): string[] {
  const issues: string[] = [];
  const platform = platformOf(review);

  if (platform !== "direct" && !review.source?.url) {
    issues.push(
      "Third-party review with no link to the original — required, so a reader can verify the words are real."
    );
  }
  if (platform !== "direct" && (review.photos?.length ?? 0) > 0) {
    issues.push("Photos are attached to a third-party review; they will not be shown.");
  }
  if (!review.name.trim()) {
    issues.push("No reviewer name.");
  }
  return issues;
}
