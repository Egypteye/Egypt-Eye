import type { Rating as RatingType } from "@/content/types";

// A product's OWN review count — reviews whose follow-up named this exact
// tour, experience or photoshoot (see lib/reviewAttribution.ts).
//
// It renders nothing otherwise, and that restraint is the point. A number in
// this slot always means "this product", so a card can never sit next to
// another card whose number means something else. Egypt Eye's company-wide
// total is real and worth showing, but it belongs on its own line once per
// page (components/CompanyReviews.tsx) — repeated across a grid it reads as
// a bug, and repeated next to a genuine per-tour count it reads as a
// contradiction.
//
// One or two reviews also render nothing: too thin to be evidence, and a
// lone "1 review" beside a tour with thirty looks like something broken
// rather than a young product.
const MIN_REVIEWS = 3;

/** Whether Rating will actually render something — for callers that wrap it
 *  in chrome (a pill, a divider) that shouldn't appear on its own. */
export function hasProductReviews(rating?: RatingType): boolean {
  return Boolean(rating && rating.scope === "product" && rating.count >= MIN_REVIEWS);
}

export function Rating({ rating }: { rating?: RatingType }) {
  if (!hasProductReviews(rating)) return null;
  const r = rating as NonNullable<RatingType>;

  const reviews = `${r.count.toLocaleString()} review${r.count === 1 ? "" : "s"}`;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft"
      title="Reviews from travelers who went on this exact trip, collected in the follow-up afterwards."
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0 text-gold"
        aria-hidden="true"
      >
        <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
      </svg>
      {typeof r.score === "number" ? (
        <>
          <span className="font-semibold text-ink">{r.score!.toFixed(1)}</span>
          <span className="text-ink-soft/60">({reviews})</span>
        </>
      ) : (
        <span className="font-semibold text-ink">{reviews}</span>
      )}
    </span>
  );
}
