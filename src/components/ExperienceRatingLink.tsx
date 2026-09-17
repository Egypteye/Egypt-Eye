"use client";

import Link from "next/link";
import { subjectReviewsHref, type ReviewSubjectType } from "@/lib/reviewSubjects";
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
// Shown on every product, with no exceptions. It always has somewhere real to
// land: /testimonials gives every product an anchor, either its own group of
// reviews or its entry among its siblings in "Other Tours" / "Other
// Photoshoots" / "Other Services" — so a product nobody has reviewed yet
// still takes the visitor to reviews of its neighbours rather than nowhere.

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
  const { locale, dict } = useLocale();
  const palette =
    tone === "dark"
      ? "bg-cream/15 text-cream backdrop-blur-sm hover:bg-cream/25"
      : "text-ink-soft hover:text-ink";

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
