import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { Rating } from "@/components/Rating";
import { PriceTag } from "@/components/PriceTag";
import { Badge } from "@/components/Badge";
import { TourCard } from "@/components/TourCard";
import { getAllTourSlugs, getSiteSettings, getTourBySlug, getTours } from "@/sanity/fetchers";

export async function generateStaticParams() {
  const slugs = await getAllTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return {};
  return { title: tour.title, description: tour.tagline };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tour, site] = await Promise.all([getTourBySlug(slug), getSiteSettings()]);
  if (!tour) notFound();

  const allTours = await getTours();
  const related = allTours.filter((t) => t.slug !== tour.slug && t.category === tour.category).slice(0, 3);

  return (
    <>
      <section className="relative">
        <SmartImage image={tour.image} tone={tour.imageTone} alt={tour.title} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[46vh] flex-col justify-end gap-3 pb-14 pt-32">
          {tour.badge && <Badge>{tour.badge}</Badge>}
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold text-cream sm:text-5xl">
            {tour.title}
          </h1>
          <p className="max-w-xl text-cream/80">{tour.tagline}</p>
        </Container>
      </section>

      <section className="py-14">
        <Container className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-black/5 pb-6 text-sm text-ink-soft/70">
              <span>⏱ {tour.duration}</span>
              <span>📍 {tour.destinations.join(", ")}</span>
              <Rating rating={tour.rating} />
            </div>

            <div className="mt-8">
              <h2 className="font-display text-2xl font-semibold text-ink">
                About this tour
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft/80">
                {tour.description}
              </p>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Highlights
              </h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ink-soft/80">
                    <span className="mt-1 text-gold-dark">✦</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {tour.itinerary && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Itinerary
                </h2>
                <ol className="mt-6 space-y-6 border-l border-gold/30 pl-6">
                  {tour.itinerary.map((day) => (
                    <li key={day.day} className="relative">
                      <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">
                        {day.day}
                      </span>
                      <p className="font-semibold text-ink">{day.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft/75">
                        {day.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  Included
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft/80">
                  {tour.included.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-nile">✓</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  Not Included
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft/80">
                  {tour.excluded.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-terracotta">✕</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="h-fit rounded-2xl border border-black/5 bg-cream p-6 shadow-sm lg:sticky lg:top-24">
            <PriceTag price={tour.price} />
            <p className="mt-1 text-xs text-ink-soft/60">per person, private tour</p>
            <a
              href={site.contact.whatsappLink}
              target="_blank"
              className="mt-5 block w-full rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"
            >
              Book on WhatsApp
            </a>
            <a
              href={`mailto:${site.contact.email}?subject=${encodeURIComponent(
                "Enquiry: " + tour.title
              )}`}
              className="mt-3 block w-full rounded-full border border-black/10 py-3 text-center text-sm font-semibold text-ink-soft transition hover:bg-sand-dim"
            >
              Email an Enquiry
            </a>

            <div className="mt-6 space-y-3 border-t border-black/5 pt-6 text-xs text-ink-soft/60">
              <p>{site.policies.deposit}</p>
              <p>{site.policies.currency}</p>
            </div>
          </aside>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-sand-dim py-20">
          <Container>
            <h2 className="font-display text-2xl font-semibold text-ink">
              You might also like
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <TourCard key={t.slug} tour={t} />
              ))}
            </div>
            <Link
              href="/tours"
              className="mt-8 inline-block text-sm font-semibold text-gold-dark hover:underline"
            >
              ← Back to all tours
            </Link>
          </Container>
        </section>
      )}
    </>
  );
}
