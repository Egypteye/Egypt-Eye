import type { Rating as RatingType } from "@/content/types";

// The company's traveler-review figure, shown on every tour, experience and
// photoshoot.
//
// Egypt Eye collects reviews in the WhatsApp follow-up after a trip or a
// shoot, so a review is about the company rather than about one product —
// there is no per-tour review data, and this deliberately doesn't pretend
// otherwise. Naming Egypt Eye in the label is what keeps "1,247 reviews" on
// a tour card an honest sentence instead of an implied claim that 1,247
// people reviewed that one tour.
//
// Until reviews carry star values the count stands on its own, with no
// score: a written review is real and worth counting, but it isn't a number
// out of five. The average appears automatically once scores exist.
export function Rating({ rating }: { rating?: RatingType }) {
  if (!rating || !rating.count) {
    return <span className="text-sm text-ink-soft/60">New experience</span>;
  }

  const isCompany = rating.scope === "company";
  const plural = rating.count === 1 ? "" : "s";
  const reviews = isCompany
    ? `${rating.count.toLocaleString()} Egypt Eye review${plural}`
    : `${rating.count.toLocaleString()} review${plural}`;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft"
      title={
        isCompany
          ? "Egypt Eye's traveler reviews, collected after every trip and shoot — company-wide, not specific to this item."
          : "Reviews from travelers who went on this exact tour, collected in the follow-up afterwards."
      }
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
