import Link from "next/link";
import type { ReviewTheme, Testimonial } from "@/content/types";
import { TestimonialCard } from "./TestimonialCard";
import { reviewMatchesProduct } from "@/lib/reviewAttribution";
import { pickRelevantReviews } from "@/lib/reviewThemes";
import { subjectReviewsHref, type ReviewSubjectType } from "@/lib/reviewSubjects";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";

// The reviews worth showing on THIS page.
//
// The thing this component exists to avoid is the same three testimonials
// pasted under every product, which is what most travel sites do and what
// makes a review wall read as decoration. Reviews are selected per page by
// relevance (see lib/reviewThemes): a review whose context names this exact
// product wins outright, then one that talks about what this page is about,
// with specificity as the tie-break — so "the photographer kept checking we
// were happy with the shots" outranks "great experience" on a photoshoot page
// even though both are five stars.
//
// When nothing is relevant enough, this renders nothing at all. An empty
// section is better than a padded one: a review that does not speak to the
// product is not evidence about the product, and showing it anyway is
// precisely how a site starts looking like it is manufacturing testimonials.

export async function ProductReviews({
  reviews,
  subject,
  themes,
  heading = "What travellers said",
  limit = 3,
}: {
  reviews: Testimonial[];
  /** The product this page is about, for exact-match attribution. */
  subject: { type: ReviewSubjectType; slug: string; title: string };
  /** What this page is about, for reviews that don't name the product. */
  themes?: ReviewTheme[];
  heading?: string;
  limit?: number;
}) {
  const picked = pickRelevantReviews(
    reviews,
    {
      matchesProduct: (r) => reviewMatchesProduct(r, { slug: subject.slug, title: subject.title }),
      themes,
    },
    limit
  );

  if (picked.length === 0) return null;

  const locale = await getLocale();

  // Whether these are reviews OF this product, or reviews of Egypt Eye that
  // happen to speak to what this page is about. The heading says which,
  // because quietly presenting the second as the first overstates the
  // evidence — and a visitor who clicks through to /testimonials would see
  // the difference anyway.
  const aboutThisProduct = picked.some((r) =>
    reviewMatchesProduct(r, { slug: subject.slug, title: subject.title })
  );

  return (
    <section className="py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{heading}</h2>
          {!aboutThisProduct && (
            <p className="mt-1.5 text-sm text-ink-soft/70">
              Reviews of Egypt Eye from travellers who did something similar.
            </p>
          )}
        </div>
        {/* Deep-link to this product's group only when it has one. Where
            these are themed stand-ins, the anchor would match nothing and
            the visitor would land on the whole wall with no explanation. */}
        <Link
          href={localePath(
            aboutThisProduct ? subjectReviewsHref({ type: subject.type, slug: subject.slug }) : "/testimonials",
            locale
          )}
          className="text-sm font-semibold text-gold-dark transition hover:translate-x-0.5"
        >
          {aboutThisProduct ? "All traveller reviews →" : "Browse all reviews →"}
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {picked.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
        ))}
      </div>
    </section>
  );
}
