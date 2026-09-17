import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { TestimonialCard } from "@/components/TestimonialCard";
import { getExperiences, getPhotoshoots, getSignatureExperiences, getTestimonials, getTours } from "@/sanity/fetchers";
import { collectReviewSubjects, groupTestimonials, megaAnchor, subjectAnchor } from "@/lib/reviewSubjects";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Traveler Reviews & Testimonials",
  description:
    "Real words from real Egypt Eye travelers, grouped by the photoshoot, tour or service each one is about.",
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
  const { sections, unattributed } = groupTestimonials(testimonials, subjects);

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
            They&rsquo;re filed below under the photoshoot, tour or service each traveler actually booked.
          </p>

          {sections.length > 1 && (
            <nav aria-label="Jump to a category" className="mt-8 flex flex-wrap gap-2">
              {sections.map((section) => (
                <a
                  key={section.mega}
                  href={`#${megaAnchor(section.mega)}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-gold/40 hover:text-ink"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          )}

          {testimonials.length === 0 && (
            <p className="mt-8 max-w-xl rounded-2xl bg-sand-dim px-5 py-4 text-sm text-ink-soft/75">
              Reviews are on their way — check back soon, or{" "}
              <Link href="/customize" className="font-semibold text-gold-dark underline">
                start planning your own Egypt story
              </Link>
              .
            </p>
          )}
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="space-y-20">
            {sections.map((section) => (
              // scroll-mt clears the sticky header so a jump link doesn't park
              // the heading underneath it.
              <div key={section.mega} id={megaAnchor(section.mega)} className="scroll-mt-28">
                <h2 className="font-display text-3xl font-semibold text-ink">{section.label}</h2>

                <div className="mt-10 space-y-14">
                  {section.groups.map((group) => (
                    // The anchor a product's star chip links to. `target:`
                    // gives an arriving visitor a visible "this is the one you
                    // asked for" without a line of JavaScript, which also
                    // keeps the page fully static.
                    <div
                      key={subjectAnchor(group.subject)}
                      id={subjectAnchor(group.subject)}
                      className="scroll-mt-28 rounded-3xl px-5 py-5 transition-colors target:bg-sand-dim target:ring-1 target:ring-gold/30"
                    >
                      <h3 className="font-display text-xl font-semibold text-ink">
                        <Link href={group.subject.href} className="hover:text-gold-dark">
                          {group.subject.title}
                        </Link>
                      </h3>

                      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {group.testimonials.map((t, i) => (
                          <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Everything in this category nobody has reviewed yet.
                      Each one keeps its own anchor, so the star chip on an
                      unreviewed product still lands exactly on it — it just
                      lands here, among its siblings, instead of on a group of
                      its own. */}
                  {section.others.length > 0 && (
                    <div className="rounded-3xl border border-black/5 bg-sand-dim/50 px-5 py-6">
                      <h3 className="font-display text-lg font-semibold text-ink-soft">
                        {section.otherLabel}
                      </h3>
                      <p className="mt-1 text-sm text-ink-soft/65">
                        No reviews collected for these yet.
                      </p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {section.others.map((subject) => (
                          <li
                            key={subjectAnchor(subject)}
                            id={subjectAnchor(subject)}
                            className="scroll-mt-28 rounded-full transition-colors target:ring-2 target:ring-gold/50"
                          >
                            <Link
                              href={subject.href}
                              className="inline-block rounded-full border border-black/10 bg-cream px-4 py-2 text-sm text-ink-soft transition hover:border-gold/40 hover:text-ink"
                            >
                              {subject.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Reviews whose follow-up never recorded which trip they were
                about. They're real, so they're shown rather than dropped —
                they simply can't be filed under one product yet. Assigning a
                subject in Studio moves one into its group automatically. */}
            {unattributed.length > 0 && (
              <div id="reviews-more" className="scroll-mt-28">
                <h2 className="font-display text-3xl font-semibold text-ink">More Reviews</h2>
                <p className="mt-2 max-w-xl text-sm text-ink-soft/70">
                  From travelers whose follow-up didn&rsquo;t record which trip they were on.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {unattributed.map((t, i) => (
                    <TestimonialCard key={`other-${t.name}-${i}`} testimonial={t} />
                  ))}
                </div>
              </div>
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
