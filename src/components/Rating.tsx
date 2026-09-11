import type { Rating as RatingType } from "@/content/types";

// Egypt Eye's traveler-review count.
//
// PULLED FROM TOURS AND EXPERIENCES (11 Sep 2026), at the owner's request,
// until the review programme is rebuilt on their own terms. The component,
// the Rating type, the Studio override field and the attribution pipeline
// all stay wired up and working — only the four render sites were removed
// (TourCard, ExperienceCard, and the tour/experience detail heroes), so
// putting it back is a one-line change at each. `aggregateRating` was taken
// out of those pages' TouristTrip JSON-LD at the same time: rating markup
// Google can't see on the page is a structured-data violation, so the two
// have to move together. Photoshoot cards and pages still show it.
//
// Reviews are collected in the WhatsApp follow-up after a trip or a shoot,
// so they're about the company rather than about one product — which is why
// every item shows the same real number, and why the label names Egypt Eye.
// That wording is what keeps "1,481 reviews" on a tour card an honest
// sentence rather than an implied claim that 1,481 people reviewed that one
// tour.
//
// Per-product counts are computed from each review's recorded context
// (lib/reviewAttribution.ts) and reported in /admin/reviews. They stay out of
// here until attribution covers enough of the catalogue to replace this
// everywhere at once: a grid where one card counts a tour and the next counts
// the company is worse than either number alone.
export function hasProductReviews(rating?: RatingType): boolean {
  return Boolean(rating && rating.count > 0);
}

export function Rating({ rating }: { rating?: RatingType }) {
  if (!rating || !rating.count) {
    return <span className="text-sm text-ink-soft/60">New experience</span>;
  }

  const plural = rating.count === 1 ? "" : "s";
  const reviews =
    rating.scope === "company"
      ? `${rating.count.toLocaleString()} Egypt Eye review${plural}`
      : `${rating.count.toLocaleString()} review${plural}`;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft"
      title="Egypt Eye's traveler reviews, collected in the follow-up after every trip and shoot."
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0 text-gold"
        aria-hidden="true"
      >
        <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
      </svg>
      {typeof rating.score === "number" ? (
        <>
          <span className="font-semibold text-ink">{rating.score.toFixed(1)}</span>
          <span className="text-ink-soft/60">({reviews})</span>
        </>
      ) : (
        <span className="font-semibold text-ink">{reviews}</span>
      )}
    </span>
  );
}
