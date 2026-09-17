import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { getExperiences, getPhotoshoots, getSignatureExperiences, getTestimonials, getTours } from "@/sanity/fetchers";
import { buildReviewEntries, collectReviewSubjects } from "@/lib/reviewSubjects";
import { siteUrl } from "@/content/seo";
import { TestimonialsBrowser } from "./TestimonialsBrowser";

export const metadata: Metadata = {
  title: "Traveler Reviews & Testimonials",
  description:
    "Every Egypt Eye review in one place — filter by photoshoots, tours or services, or jump straight to the one you're booking.",
  alternates: { canonical: `${siteUrl}/testimonials` },
};

export default async function TestimonialsPage() {
  const [testimonials, tours, photoshoots, experiences, signatureExperiences] = await Promise.all([
    getTestimonials(),
    getTours(),
    getPhotoshoots(),
    getExperiences(),
    getSignatureExperiences(),
  ]);

  const subjects = collectReviewSubjects({ tours, photoshoots, experiences, signatureExperiences });
  const { entries, options } = buildReviewEntries(testimonials, subjects);

  return (
    <>
      <section className="py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">Traveler Stories</p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            What Our Travelers Say
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft/75">
            Every review here comes from a real Egypt Eye trip — no invented or illustrative quotes.
            They&rsquo;re all on this page; use the filters to narrow them to a category or a single
            tour, shoot or service.
          </p>

          <div className="mt-10">
            {entries.length === 0 ? (
              <p className="rounded-2xl bg-sand-dim px-5 py-4 text-sm text-ink-soft/75">
                Reviews are on their way — check back soon, or{" "}
                <Link href="/customize" className="font-semibold text-gold-dark underline">
                  start planning your own Egypt story
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
              Ready to write your own Egypt story?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-cream/70">
              Tell us what you have in mind and we&rsquo;ll build a private itinerary around it.
            </p>
            <Link
              href="/customize"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              Design Your Dream Tour
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
