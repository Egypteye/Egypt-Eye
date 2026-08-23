import type { Rating as RatingType } from "@/content/types";

// Star + real review count only — no decimal average score. Counts come
// straight from each Tour/Experience/Photoshoot's own `rating.count` field;
// nothing here is invented, so anything without real reviews yet falls back
// to "New experience" rather than showing a fabricated number.
export function Rating({ rating }: { rating: RatingType }) {
  if (!rating || !rating.count) {
    return <span className="text-sm text-ink-soft/60">New experience</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft">
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 text-gold"
        aria-hidden="true"
      >
        <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
      </svg>
      {rating.count.toLocaleString()} review{rating.count === 1 ? "" : "s"}
    </span>
  );
}
