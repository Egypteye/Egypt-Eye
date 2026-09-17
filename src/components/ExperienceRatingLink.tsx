import Link from "next/link";
import { subjectReviewsHref, type ReviewSubjectType } from "@/lib/reviewSubjects";

// The small star that says "people have reviewed this", and takes you to
// their words.
//
// Deliberately carries no score and no review count. It isn't a rating
// readout, it's a door: the proof is the testimonials themselves, one click
// away and grouped under this exact product. That also keeps it honest —
// a chip that asserts no number can't overstate one — and it's why no
// AggregateRating markup goes with it.
//
// Renders nothing when the product has no reviews yet (`hasReviews` is set at
// fetch time in sanity/fetchers.ts), so the link can never open an empty
// group, and a brand-new tour simply stays quiet until its first review
// lands.

export function ExperienceRatingLink({
  type,
  slug,
  hasReviews,
  tone = "light",
  className = "",
}: {
  type: ReviewSubjectType;
  slug: string;
  hasReviews?: boolean;
  /** "dark" for the cream-on-photo treatment used in detail-page heroes. */
  tone?: "light" | "dark";
  className?: string;
}) {
  if (!hasReviews) return null;

  const palette =
    tone === "dark"
      ? "bg-cream/15 text-cream backdrop-blur-sm hover:bg-cream/25"
      : "text-ink-soft hover:text-ink";

  return (
    <Link
      href={subjectReviewsHref({ type, slug })}
      // relative z-20 lifts it above the card's full-bleed overlay link, so
      // the chip wins the click on a card that is otherwise one big link.
      className={`relative z-20 inline-flex items-center gap-1.5 rounded-full text-sm font-medium transition ${palette} ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-gold" aria-hidden="true">
        <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
      </svg>
      <span className="underline-offset-4 hover:underline">Experience Rating</span>
    </Link>
  );
}
