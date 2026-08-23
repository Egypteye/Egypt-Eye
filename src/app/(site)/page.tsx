import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { Badge } from "@/components/Badge";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { SearchBar } from "@/components/SearchBar";
import { TrustBar } from "@/components/TrustBar";
import { StatsBar } from "@/components/StatsBar";
import { TourCard } from "@/components/TourCard";
import { DestinationsPanel } from "@/components/DestinationsPanel";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";
import { FaqAccordion } from "@/components/FaqAccordion";
import { StoryCard } from "@/components/StoryCard";
import { Reveal } from "@/components/Reveal";
import { getCatalogStats, getOverallRating } from "@/content/aggregate";
import {
  getExperiences,
  getFaqs,
  getHomepage,
  getPhotoshoots,
  getSiteSettings,
  getStories,
  getTestimonials,
  getTours,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Private Egypt Tours & Travel Experiences",
  description:
    "Private, guided tours across Egypt — Cairo, Luxor, Aswan, and the Red Sea — with professional photography built in. Custom itineraries, concierge support.",
};

export default async function Home() {
  const [site, home, tours, experiences, photoshoots, testimonials, stories, faqs] = await Promise.all([
    getSiteSettings(),
    getHomepage(),
    getTours(),
    getExperiences(),
    getPhotoshoots(),
    getTestimonials(),
    getStories(),
    getFaqs(),
  ]);
  const { average, reviewCount } = getOverallRating(tours, experiences, photoshoots);
  const { tourCount, destinationCount } = getCatalogStats(tours, experiences, photoshoots);
  // A small curated set for the homepage teaser — the full searchable
  // catalog lives on /tours, not inline here.
  const popularTours = tours.filter((t) => t.featured).slice(0, 4);
  // Prefer editor-flagged Stories for the homepage teaser; fall back to the
  // most recent if none are flagged yet.
  const featuredStories = stories.filter((s) => s.featured);
  const homepageStories = (featuredStories.length > 0 ? featuredStories : stories).slice(0, 2);

  return (
    <>
      {/* Hero — an auto-rotating slideshow; each slide carries its own
          headline, subtext, and link, fully editable in the Studio. */}
      <section className="relative min-h-[82vh]">
        <HeroSlideshow slides={site.heroImages} eyebrow={site.tagline} />

        {/* Search bar, straddling the hero/content boundary */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-1/2 px-5 sm:px-8">
          <SearchBar className="mx-auto max-w-4xl" destinations={site.destinations} />
        </div>
      </section>

      {/* Trust bar */}
      <section className="pb-14 pt-14 sm:pt-16">
        <Container>
          <Reveal>
            <TrustBar tours={tours} experiences={experiences} photoshoots={photoshoots} badges={site.trustBadges} />
          </Reveal>
        </Container>
      </section>

      {/* Popular Tours — a small curated preview; the full searchable
          catalog lives on /tours, not inline on the homepage. */}
      <section className="py-4">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={home.popularTours.eyebrow}
              title={home.popularTours.title}
              description={home.popularTours.description}
            />
          </Reveal>
          <Reveal delay={100} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularTours.map((tour) => (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </Reveal>
          <Reveal delay={150} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tours"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
            >
              {home.popularTours.primaryButtonLabel}
            </Link>
            <Link
              href="/tours"
              className="rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-sand-dim"
            >
              {home.popularTours.secondaryButtonLabel}
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Destinations panel */}
      <section className="py-14">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={home.destinationsSection.eyebrow}
              title={home.destinationsSection.title}
              description={home.destinationsSection.description}
            />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <DestinationsPanel photos={site.destinationPhotos} tours={tours} destinations={site.destinations} />
          </Reveal>
        </Container>
      </section>

      {/* Flying Dresses feature */}
      <section className="py-6">
        <Container>
          <Reveal>
            <div className="grid overflow-hidden rounded-3xl bg-ink lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-5 p-10 sm:p-14">
                <Badge>{home.flyingDress.badge}</Badge>
                <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
                  {home.flyingDress.title}
                </h2>
                <p className="text-cream/70">{home.flyingDress.body}</p>
                <Link
                  href="/photoshoots/flying-dress-photoshoot"
                  className="w-fit rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  {home.flyingDress.buttonLabel}
                </Link>
              </div>
              <SmartImage
                image={site.flyingDressImage.image}
                tone={site.flyingDressImage.tone}
                label="Flying Dress Photoshoot"
                className="min-h-[280px]"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Red Sea Luxe Yachts */}
      <section className="py-6">
        <Container>
          <Reveal>
            <div className="grid overflow-hidden rounded-3xl bg-nile lg:grid-cols-2">
              <SmartImage
                image={site.redSeaImage.image}
                tone={site.redSeaImage.tone}
                label="Red Sea Luxe Yachts"
                className="min-h-[280px] lg:order-1"
              />
              <div className="flex flex-col justify-center gap-5 p-10 sm:p-14 lg:order-2">
                <Badge>{home.redSea.badge}</Badge>
                <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">{home.redSea.title}</h2>
                <p className="text-cream/70">{home.redSea.body}</p>
                <Link
                  href="/tours/red-sea-relaxation"
                  className="w-fit rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  {home.redSea.buttonLabel}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Nine Pyramids View */}
      <section className="py-16">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SmartImage
              image={site.ninePyramidsImage.image}
              tone={site.ninePyramidsImage.tone}
              label="Nine Pyramids View"
              className="aspect-[4/3] w-full rounded-3xl"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading
              eyebrow={home.ninePyramids.eyebrow}
              title={home.ninePyramids.title}
              description={home.ninePyramids.description}
            />
            <Link
              href="/photoshoots/exclusive-pyramids-photoshoot"
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
            >
              {home.ninePyramids.buttonLabel}
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Photoshoots */}
      <section className="bg-sand-dim py-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={home.photoshootsSection.eyebrow}
              title={home.photoshootsSection.title}
              description={home.photoshootsSection.description}
              align="center"
            />
          </Reveal>
          <Reveal delay={100} className="mx-auto mt-10 grid max-w-4xl gap-6">
            {photoshoots.map((p) => (
              <PhotoshootCard key={p.slug} photoshoot={p} />
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Custom Tours CTA */}
      <section className="py-16">
        <Container>
          <Reveal>
            <div className="grid items-center gap-10 rounded-3xl border border-gold/20 bg-cream p-10 sm:p-14 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <SectionHeading
                  eyebrow={home.customCta.eyebrow}
                  title={home.customCta.title}
                  description={home.customCta.description}
                />
                <Link
                  href="/customize"
                  className="mt-6 inline-block rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  {home.customCta.buttonLabel}
                </Link>
              </div>
              <SmartImage
                image={site.customizeImage.image}
                tone={site.customizeImage.tone}
                label="Customize Your Tour"
                className="aspect-square w-full rounded-2xl"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Trust stats — real, computed catalog numbers plus whatever's been
          filled in under Site Settings → Trust stats bar (years operating,
          guest count, review-platform rating). Nothing here is invented. */}
      <section className="py-6">
        <Container>
          <Reveal>
            <StatsBar trustStats={site.trustStats} tourCount={tourCount} destinationCount={destinationCount} />
          </Reveal>
        </Container>
      </section>

      {/* Reviews */}
      <section className="bg-ink py-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={home.reviewsSection.eyebrow}
              title={home.reviewsSection.title}
              description={`${average}★ average across ${reviewCount} reviews — our guests rarely just say "good tour."`}
              align="center"
            />
          </Reveal>
        </Container>
        <Reveal delay={100} className="mt-10">
          <ReviewsMarquee testimonials={testimonials} />
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <Container className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow={home.faqSection.eyebrow} title={home.faqSection.title} align="center" />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <FaqAccordion faqs={faqs} />
          </Reveal>
        </Container>
      </section>

      {/* Stories */}
      <section className="py-16">
        <Container>
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow={home.storiesSection.eyebrow} title={home.storiesSection.title} />
              <Link href="/stories" className="text-sm font-semibold text-gold-dark hover:underline">
                {home.storiesSection.linkLabel}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-10 grid gap-8 sm:grid-cols-2">
            {homepageStories.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="pb-16">
        <Container>
          <Reveal>
            <div className="flex flex-col items-center gap-5 rounded-3xl bg-gold/15 px-8 py-16 text-center">
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{home.finalCta.title}</h2>
              <p className="max-w-xl text-ink-soft/80">{home.finalCta.body}</p>
              <a
                href={site.contact.whatsappLink}
                target="_blank"
                className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
              >
                {home.finalCta.buttonLabel}
              </a>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
