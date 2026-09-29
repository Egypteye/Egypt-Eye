import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { TestimonialCard } from "@/components/TestimonialCard";
import { WriteReviewForm, type ReviewProductOption } from "@/components/WriteReviewForm";
import { getExperiences, getPhotoshoots, getSignatureExperiences, getTours } from "@/sanity/fetchers";
import { collectReviewSubjects, subjectAnchor } from "@/lib/reviewSubjects";
import { HUB_REVIEWS_PER_PRODUCT, HUB_UNATTRIBUTED_LIMIT, productReviewsPath } from "@/lib/reviewPages";
import { PLATFORM_LABELS } from "@/lib/reviewPolicy";
import { THEME_LABELS } from "@/lib/reviewThemes";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { alternatesFor } from "@/i18n/alternates";
import { T, trAll } from "@/i18n/T";
import { t } from "@/i18n/format";
import { loadReviewData } from "@/lib/reviewData";
import { LegacyReviewHashRedirect } from "./LegacyReviewHashRedirect";

// The reviews hub.
//
// This used to be the reviews themselves — all 2,527 of them, in one 6.3MB
// document. It is now the way in: the weight of the evidence up top, then one
// panel per product showing its three most substantial reviews and a link to
// the rest. Each product's reviews live at their own address (see
// lib/reviewPages), so nothing is hidden behind a button and every review is
// still one link away and still crawlable — it just isn't all in one file.

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  return {
    title: dict.reviews.heading,
    description: dict.reviews.intro,
    alternates: alternatesFor("/testimonials", locale),
  };
}

const n = (value: number) => value.toLocaleString("en-US");

export default async function TestimonialsPage() {
  const [data, tours, photoshoots, experiences, signatureExperiences] = await Promise.all([
    loadReviewData(),
    getTours(),
    getPhotoshoots(),
    getExperiences(),
    getSignatureExperiences(),
  ]);

  const dict = await getDictionary();
  const locale = await getLocale();
  const to = (href: string) => localePath(href, locale);

  const s = await trAll([
    "{count} reviews, from travellers on {platforms}",
    "Read all {count} →",
    "{count} reviews",
    "and {count} more",
  ] as const);

  // Every product a traveller could have been on, for the form's dropdown —
  // not just the ones with reviews. The point of the form is the trip nobody
  // has written about yet.
  const productOptions: ReviewProductOption[] = [
    ...new Map(
      collectReviewSubjects({ tours, photoshoots, experiences, signatureExperiences }).map((subject) => [
        subjectAnchor(subject),
        { key: subjectAnchor(subject), mega: subject.mega, title: subject.title },
      ])
    ).values(),
  ].sort((a, b) => a.title.localeCompare(b.title));

  // Where an old `#reviews-…` deep link should now land.
  const legacyDestinations = Object.fromEntries(
    data.groups.map((g) => [subjectAnchor(g.subject), to(productReviewsPath(g.subject))])
  );

  return (
    <>
      <LegacyReviewHashRedirect destinations={legacyDestinations} />

      <section className="pb-10 pt-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">{dict.reviews.eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            {dict.reviews.heading}
          </h1>

          {data.total > 0 ? (
            <>
              <p className="mt-4 max-w-2xl text-lg text-ink-soft/80">
                {t(s["{count} reviews, from travellers on {platforms}"], {
                  count: n(data.total),
                  platforms: data.platforms.map(([p]) => PLATFORM_LABELS[p]).join(" & "),
                })}
              </p>

              {/* Said once, at the top, rather than repeated on every card:
                  how reviews from other platforms are handled. It is the
                  claim the whole wall rests on. */}
              <p className="mt-5 max-w-2xl text-xs text-ink-soft/55">
                <T>Every review here comes from a real Egypt Eye trip. Reviews written on another platform are quoted in part, never rewritten, and linked to the original so you can read them in full there. The names of our guides, hosts and photographers have been removed for their privacy — nothing else about a review has been changed.</T>
              </p>

              {data.themes.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm font-semibold text-ink">
                    <T>What travellers talk about</T>
                  </p>
                  {/* Counts, not filters. Each is a summary of the whole set —
                      "1,666 of these reviews mention the guides" is a stronger
                      thing to be able to say than a chip that hides the rest. */}
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {data.themes.slice(0, 8).map(([theme, count]) => (
                      <li
                        key={theme}
                        className="rounded-full bg-sand-dim px-3.5 py-1.5 text-sm text-ink-soft/80"
                      >
                        {THEME_LABELS[theme]}{" "}
                        <span className="font-semibold text-ink">{n(count)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="mt-10 rounded-2xl bg-sand-dim px-5 py-4 text-sm text-ink-soft/75">
              {dict.reviews.onTheWay}{" "}
              <Link href={to("/customize")} className="font-semibold text-gold-dark underline">
                {dict.reviews.startPlanning}
              </Link>
              .
            </p>
          )}
        </Container>
      </section>

      {data.groups.map((group) => (
        <section key={subjectAnchor(group.subject)} className="pb-14">
          <Container>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-black/5 pb-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                  <Link href={to(productReviewsPath(group.subject))} className="hover:text-gold-dark">
                    {group.subject.title}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-ink-soft/70">
                  {t(s["{count} reviews"], { count: n(group.entries.length) })}
                </p>
              </div>
              <Link
                href={to(productReviewsPath(group.subject))}
                className="shrink-0 text-sm font-semibold text-gold-dark transition hover:translate-x-0.5"
              >
                {t(s["Read all {count} →"], { count: n(group.entries.length) })}
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.entries.slice(0, HUB_REVIEWS_PER_PRODUCT).map((entry, i) => (
                <TestimonialCard
                  key={`${entry.testimonial.name}-${i}`}
                  testimonial={entry.testimonial}
                  productTitle={entry.productTitle}
                  productHref={entry.productHref}
                />
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* Reviews that named no trip. None today; they keep their place here
          rather than being dropped, because they are real reviews. */}
      {data.unattributed.length > 0 && (
        <section className="pb-14">
          <Container>
            <h2 className="mb-5 border-b border-black/5 pb-4 font-display text-2xl font-semibold text-ink">
              <T>Other reviews</T>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.unattributed.slice(0, HUB_UNATTRIBUTED_LIMIT).map((entry, i) => (
                <TestimonialCard key={`other-${i}`} testimonial={entry.testimonial} />
              ))}
            </div>
            {data.unattributed.length > HUB_UNATTRIBUTED_LIMIT && (
              <p className="mt-5 text-sm text-ink-soft/60">
                {t(s["and {count} more"], {
                  count: n(data.unattributed.length - HUB_UNATTRIBUTED_LIMIT),
                })}
              </p>
            )}
          </Container>
        </section>
      )}

      <section id="write-a-review" className="scroll-mt-28 pb-20">
        <Container>
          <WriteReviewForm products={productOptions} />
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="rounded-3xl bg-ink px-8 py-14 text-center sm:px-14">
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              {dict.common.readyHeading}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-cream/70">{dict.common.readyBody}</p>
            <Link
              href={to("/customize")}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              {dict.common.designYourTour}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
