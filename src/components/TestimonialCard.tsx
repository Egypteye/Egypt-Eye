import Link from "next/link";
import type { Testimonial } from "@/content/types";
import { SmartImage } from "./SmartImage";
import { toDisplayReview } from "@/lib/reviewPolicy";

// One review, as the site is allowed to show it.
//
// Everything about provenance runs through toDisplayReview() rather than being
// decided here: whether the full text or an excerpt may be shown, whether the
// photos may be used, and what the source link is. A component that reached
// into `testimonial.quote` directly would quietly republish a third-party
// review in full the first time someone forgot, so it doesn't.
//
// The source line is the point of the card, not a footnote. "Real customer →
// real source" is the whole claim, and a quote with a platform badge and a
// link to the original is a fundamentally different object from an unsourced
// testimonial — it is checkable, which is what makes it worth believing.

const PLATFORM_STYLES: Record<string, string> = {
  direct: "bg-gold/15 text-gold-dark",
  tripadvisor: "bg-emerald-50 text-emerald-800",
  airbnb: "bg-rose-50 text-rose-800",
  google: "bg-sky-50 text-sky-800",
  viator: "bg-indigo-50 text-indigo-800",
  getyourguide: "bg-orange-50 text-orange-900",
};

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          aria-hidden
          className={`h-3.5 w-3.5 ${n <= rounded ? "text-gold" : "text-black/15"}`}
          fill="currentColor"
        >
          <path d="M10 15.27 16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      ))}
    </span>
  );
}

export function TestimonialCard({
  testimonial,
  productTitle,
  productHref,
  /** Hides the source line where the surrounding block already states it. */
  showSource = true,
}: {
  testimonial: Testimonial;
  /** The tour, shoot or service this review is about, where it's known. */
  productTitle?: string | null;
  productHref?: string | null;
  showSource?: boolean;
}) {
  const d = toDisplayReview(testimonial);
  const reviewedAt = testimonial.source?.reviewedAt;

  return (
    <figure className="flex h-full flex-col justify-between rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          {typeof testimonial.score === "number" ? (
            <Stars score={testimonial.score} />
          ) : (
            <svg viewBox="0 0 32 24" className="h-6 w-6 text-gold/40" fill="currentColor" aria-hidden="true">
              <path d="M0 24V14.4C0 6.4 4.8 1.2 12.8 0l1.6 3.2C9.6 4.8 7.2 8 7.2 11.6h6.4V24H0Zm17.6 0V14.4c0-8 4.8-13.2 12.8-14.4l1.6 3.2c-4.8 1.6-7.2 4.8-7.2 8.4h6.4V24H17.6Z" />
            </svg>
          )}
          {showSource && !d.firstParty && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${PLATFORM_STYLES[d.platform] ?? "bg-black/5 text-ink-soft"}`}
            >
              {d.platformLabel}
            </span>
          )}
        </div>

        {testimonial.title && (
          <p className="mt-3 font-display text-base font-semibold leading-snug text-ink">{testimonial.title}</p>
        )}

        <blockquote className="mt-3 text-[15px] leading-relaxed text-ink-soft/85">
          {/* Never reworded — only ever shortened, and then only for a review
              written on someone else's platform, with the link alongside. */}
          &ldquo;{d.text}&rdquo;
        </blockquote>

        {d.truncated && d.sourceUrl && (
          <a
            href={d.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-2 inline-block text-xs font-semibold text-gold-dark underline underline-offset-2"
          >
            Read the full review on {d.platformLabel}
          </a>
        )}

        {d.photos.length > 0 && (
          <div className="mt-4 flex gap-2">
            {d.photos.slice(0, 3).map((photo, i) => (
              <SmartImage
                key={i}
                image={photo}
                tone="giza"
                alt=""
                className="h-16 w-16 rounded-lg"
                sizes="64px"
              />
            ))}
          </div>
        )}
      </div>

      <figcaption className="mt-5 border-t border-black/5 pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
          {reviewedAt && (
            <time dateTime={reviewedAt} className="text-xs text-ink-soft/50">
              {new Date(`${reviewedAt}T12:00:00Z`).toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
          )}
        </div>

        {/* What this review is about. The linked product name is the useful
            version; `context` is the raw follow-up text and only stands in
            when the review couldn't be resolved to a product. */}
        {productTitle ? (
          <p className="mt-1.5">
            {productHref ? (
              <Link
                href={productHref}
                className="inline-block rounded-full bg-sand-dim px-3 py-1 text-xs font-medium text-ink-soft transition hover:text-ink"
              >
                {productTitle}
              </Link>
            ) : (
              <span className="inline-block rounded-full bg-sand-dim px-3 py-1 text-xs font-medium text-ink-soft">
                {productTitle}
              </span>
            )}
          </p>
        ) : (
          testimonial.context && <p className="mt-1 text-xs text-ink-soft/60">{testimonial.context}</p>
        )}

        {showSource && !d.firstParty && d.sourceUrl && !d.truncated && (
          <a
            href={d.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-2 inline-block text-xs text-ink-soft/60 underline underline-offset-2 transition hover:text-ink"
          >
            View on {d.platformLabel}
          </a>
        )}
      </figcaption>
    </figure>
  );
}
