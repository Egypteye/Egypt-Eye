import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { TestimonialCard } from "@/components/TestimonialCard";
import { getOverallRating } from "@/content/aggregate";
import { getExperiences, getPhotoshoots, getTestimonials, getTours } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Traveler Reviews & Testimonials",
  description:
    "Real words from real Egypt Eye travelers — private tours, photoshoots, and experiences across Egypt and Jordan.",
};

export default async function TestimonialsPage() {
  const [testimonials, tours, experiences, photoshoots] = await Promise.all([
    getTestimonials(),
    getTours(),
    getExperiences(),
    getPhotoshoots(),
  ]);
  const { average, reviewCount } = getOverallRating(tours, experiences, photoshoots);

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
          </p>

          {reviewCount > 0 && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-sand-dim px-5 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-gold" aria-hidden="true">
                <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
              </svg>
              <span className="text-sm font-semibold text-ink">
                {average.toFixed(2)} average
              </span>
              <span className="h-1 w-1 rounded-full bg-ink-soft/40" aria-hidden="true" />
              <span className="text-sm text-ink-soft/70">
                {reviewCount.toLocaleString()} review{reviewCount === 1 ? "" : "s"} across every tour, experience &amp; photoshoot
              </span>
            </div>
          )}
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {testimonials.length === 0 ? (
            <p className="py-16 text-center text-ink-soft/60">
              Reviews are on their way — check back soon, or{" "}
              <Link href="/customize" className="font-semibold text-gold-dark underline">
                start planning your own Egypt story
              </Link>
              .
            </p>
          ) : (
            <Reveal className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {testimonials.map((t, i) => (
                <div key={`${t.name}-${i}`} className="mb-6 break-inside-avoid">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </Reveal>
          )}
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
