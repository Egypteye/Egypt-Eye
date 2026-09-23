import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { getExperiences, getPhotoshoots, getSignatureExperiences, getTestimonials, getTours } from "@/sanity/fetchers";
import { buildReviewEntries, collectReviewSubjects } from "@/lib/reviewSubjects";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { alternatesFor } from "@/i18n/alternates";
import { TestimonialsBrowser } from "./TestimonialsBrowser";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  return {
    title: dict.reviews.heading,
    description: dict.reviews.intro,
    alternates: alternatesFor("/testimonials", locale),
  };
}

export default async function TestimonialsPage() {
  const [testimonials, tours, photoshoots, experiences, signatureExperiences] = await Promise.all([
    getTestimonials(),
    getTours(),
    getPhotoshoots(),
    getExperiences(),
    getSignatureExperiences(),
  ]);

  const dict = await getDictionary();
  const locale = await getLocale();
  const to = (href: string) => localePath(href, locale);
  const subjects = collectReviewSubjects({ tours, photoshoots, experiences, signatureExperiences });
  const { entries, options } = buildReviewEntries(testimonials, subjects);

  return (
    <>
      <section className="py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">{dict.reviews.eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            {dict.reviews.heading}
          </h1>
          {/* The intro ends with "use the filters to narrow them to a
              category or a single tour" — true of a populated page, a
              contradiction on an empty one, where there is no browser and
              nothing to filter. Suppressed rather than reworded so the empty
              state needs no new string in six languages; the heading and the
              "reviews are on their way" line below read on their own. */}
          {entries.length > 0 && (
            <p className="mt-4 max-w-xl text-ink-soft/75">
              {dict.reviews.intro}
            </p>
          )}

          <div className="mt-10">
            {entries.length === 0 ? (
              <p className="rounded-2xl bg-sand-dim px-5 py-4 text-sm text-ink-soft/75">
                {dict.reviews.onTheWay}{" "}
                <Link href={to("/customize")} className="font-semibold text-gold-dark underline">
                  {dict.reviews.startPlanning}
                </Link>
                .
              </p>
            ) : (
              <TestimonialsBrowser entries={entries} options={options} />
            )}
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="rounded-3xl bg-ink px-8 py-14 text-center sm:px-14">
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              {dict.common.readyHeading}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-cream/70">
              {dict.common.readyBody}
            </p>
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
