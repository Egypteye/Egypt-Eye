import { GOOGLE_PROFILE_URL } from "@/content/googleReviews";
import type { GoogleReview } from "@/lib/google/businessProfile";

/**
 * Published Google reviews, shown as Google's, not as Egypt Eye's.
 *
 * =========================================================================
 * WHAT IS DELIBERATELY NOT HERE: STRUCTURED DATA
 * =========================================================================
 * No Review or AggregateRating markup is emitted from this component, and
 * none should ever be added to it.
 *
 * Google's review-snippet guidance says not to aggregate reviews or ratings
 * from other sites, and reviews about a business on its own pages are not
 * eligible for star snippets anyway. src/lib/reviewPolicy.ts already encodes
 * this for the testimonials wall: `schemaEligible` answers false for anything
 * not collected directly, and Google reviews are not. Marking these up would
 * breach the guidance to gain nothing.
 *
 * The number shown here is Google's own total across every review, including
 * ratings left with no words. It is not a count of the cards below, and the
 * label says so — a figure that looks like it describes what you can see, but
 * doesn't, is the kind of thing the FTC's Consumer Review Rule is about.
 */

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          aria-hidden
          className={`h-4 w-4 ${n <= rating ? "fill-gold" : "fill-black/15"}`}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export function GoogleReviewsPanel({
  reviews,
  averageRating,
  heading,
  summaryLabel,
  readOnGoogleLabel,
  attribution,
  locale,
}: {
  reviews: GoogleReview[];
  averageRating: number | null;
  heading: string;
  summaryLabel: string;

  readOnGoogleLabel: string;
  /**
   * Google's own total, already formatted by the caller — "from 312
   * reviews on Google". The count belongs in this sentence rather than
   * beside the cards, because it counts ratings left with no words too and
   * must never read as a count of what is on screen.
   */
  attribution: string;
  locale: string;
}) {
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="google-reviews-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="google-reviews-heading" className="font-display text-2xl text-ink">
          {heading}
        </h2>
        <a
          href={GOOGLE_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink-soft underline decoration-gold underline-offset-4 transition hover:text-ink"
        >
          {readOnGoogleLabel}
        </a>
      </div>

      {averageRating !== null && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink">
          <Stars rating={Math.round(averageRating)} />
          <span className="font-semibold tabular-nums">{averageRating.toFixed(1)}</span>
          <span className="text-ink-soft">{summaryLabel}</span>
        </p>
      )}

      <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex flex-col rounded-2xl border border-black/5 bg-cream p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              {/* Google serves these; they are the reviewer's own avatar and
                  are referenced, never copied onto this origin. Plain <img>
                  rather than next/image on purpose: the host is Google's and
                  a reviewer's avatar is not worth adding a remote pattern and
                  an optimisation round trip for. */}
              {review.authorPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.authorPhotoUrl}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-semibold text-ink">
                  {review.authorName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{review.authorName}</p>
                <Stars rating={review.rating} />
              </div>
            </div>

            <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {review.text}
            </p>

            {review.createdAt && (
              <time
                dateTime={review.createdAt}
                className="mt-3 text-xs text-ink-soft/80"
              >
                {new Date(review.createdAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                })}
              </time>
            )}
          </li>
        ))}
      </ul>

      {/* Attribution. Google's policies require review content to be
          attributed to Google; the total is labelled as Google's figure so it
          is never read as a count of the cards above. */}
      <p className="mt-6 text-xs leading-relaxed text-ink-soft">{attribution}</p>
    </section>
  );
}
