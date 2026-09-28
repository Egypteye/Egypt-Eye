"use client";

import Link from "next/link";
import { subjectAnchor, subjectReviewsHref, type ReviewSubjectType } from "@/lib/reviewSubjects";
import { useLocale } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/locales";

// The small star that says "people have reviewed this", and takes you to
// their words.
//
// Deliberately carries no score and no review count. It isn't a rating
// readout, it's a door: the proof is the testimonials themselves, one click
// away and grouped under this exact product. That also keeps it honest —
// a chip that asserts no number can't overstate one — and it's why no
// AggregateRating markup goes with it.
//
// Shown only on a product that actually has reviews, because the chip is a
// promise: it says "people have reviewed THIS", and it lands on that
// product's own group on /testimonials. With reviews imported for a handful
// of products and none for the rest, a global "are there reviews anywhere"
// check would put a star on every card and send fifty of them to an anchor
// that matches nothing.
//
// The set of products that have reviews comes from context (see
// i18n/LocaleProvider and the root layout), resolved once per request rather
// than passed down by each of this component's dozen callers.

export function ExperienceRatingLink({
  type,
  slug,
  tone = "light",
  className = "",
}: {
  type: ReviewSubjectType;
  slug: string;
  /** "dark" for the cream-on-photo treatment used in detail-page heroes. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const { locale, dict, reviewedKeys } = useLocale();
  const palette =
    tone === "dark"
      ? "bg-cream/15 text-cream backdrop-blur-sm hover:bg-cream/25"
      : "text-ink-soft hover:text-ink";

  // Only where it leads somewhere true. A star on a product nobody has
  // reviewed yet links to an anchor that matches nothing, and drops the
  // visitor into the full wall having implied reviews of the thing they were
  // actually looking at.
  if (!reviewedKeys.includes(subjectAnchor({ type, slug }))) return null;

  return (
    <Link
      href={localePath(subjectReviewsHref({ type, slug }), locale)}
      // relative z-20 lifts it above the card's full-bleed overlay link, so
      // the chip wins the click on a card that is otherwise one big link.
      className={`relative z-20 inline-flex items-center gap-1.5 rounded-full text-sm font-medium transition ${palette} ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-gold" aria-hidden="true">
        <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
      </svg>
      <span className="underline-offset-4 hover:underline">{dict.reviews.chip}</span>
    </Link>
  );
}
