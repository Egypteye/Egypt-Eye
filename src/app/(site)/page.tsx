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
  const [site, tours, experiences, photoshoots, testimonials, stories, faqs] = await Promise.all([
    getSiteSettings(),
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
      {/* Hero */}
      <section className="relative">
        <HeroSlideshow images={site.heroImages} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <Container className="relative flex min-h-[82vh] flex-col justify-center gap-6 pb-28 pt-40">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            {site.tagline}
          </p>
          <h1 className="animate-fade-up max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-6xl">
            {site.heroSubheadline}
          </h1>
          <p className="animate-fade-up max-w-xl text-lg text-cream/80">
            {site.description}
          </p>
          <div className="animate-fade-up flex flex-wrap gap-4 pt-2">
            <Link
              href="/customize"
              className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              Design Your Dream Tour
            </Link>
            <Link
              href="/tours"
              className="rounded-full border border-cream/30 bg-cream/10 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition hover:bg-cream/20"
            >
              Explore Popular Tours
            </Link>
          </div>
        </Container>

        {/* Search bar, straddling the hero/content boundary */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-1/2 px-5 sm:px-8">
          <SearchBar className="mx-auto max-w-4xl" />
        </div>
      </section>

      {/* Trust bar */}
      <section className="pb-20 pt-20 sm:pt-24">
        <Container>
          <Reveal>
            <TrustBar tours={tours} experiences={experiences} photoshoots={photoshoots} />
          </Reveal>
        </Container>
      </section>

      {/* Popular Tours — a small curated preview; the full searchable
          catalog lives on /tours, not inline on the homepage. */}
      <section className="py-4">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Popular Tours"
              title="Tours Travelers Book Most"
              description="A curated set of our most-loved itineraries — the ones we'd recommend first if you told us nothing else about your trip."
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
              See Popular Tours
            </Link>
            <Link
              href="/tours"
              className="rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-sand-dim"
            >
              Browse All Tours
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Destinations panel */}
      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Where We Take You"
              title="Every Corner of Egypt, and Jordan Too"
              description="Tap a destination to see the tour built around it."
            />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <DestinationsPanel photos={site.destinationPhotos} tours={tours} />
          </Reveal>
        </Container>
      </section>

      {/* Flying Dresses feature */}
      <section className="py-6">
        <Container>
          <Reveal>
            <div className="grid overflow-hidden rounded-3xl bg-ink lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-5 p-10 sm:p-14">
                <Badge>First Flying Dresses in Egypt</Badge>
                <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
                  Elegance Unveiled: Egypt&rsquo;s Inaugural Long Dresses Experience
                </h2>
                <p className="text-cream/70">
                  A flowing dress, a private photographer, and secret, uncrowded
                  locations at the Pyramids Rooftop, sand dunes, or Fayoum
                  Oasis — Egypt Eye&rsquo;s signature photoshoot, from $199.
                </p>
                <Link
                  href="/photoshoots/flying-dress-photoshoot"
                  className="w-fit rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  See the Flying Dress Experience
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
                <Badge>Red Sea Luxe Yachts</Badge>
                <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
                  Sail into Opulence on the Red Sea
                </h2>
                <p className="text-cream/70">
                  Experience the ultimate luxury aboard a private yacht — calm
                  turquoise water, white sand, and a relaxed pace built entirely
                  around you.
                </p>
                <Link
                  href="/tours/red-sea-relaxation"
                  className="w-fit rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  Explore Red Sea Experiences
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Nine Pyramids View */}
      <section className="py-24">
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
              eyebrow="Iconic Nine Pyramids View"
              title="Capture Your Adventure at the Nine Pyramids of Giza"
              description="Beyond the three main Pyramids — the full panorama, and a professional photoshoot built into the experience. This is the shot every traveler wants and few tours actually deliver."
            />
            <Link
              href="/photoshoots/exclusive-pyramids-photoshoot"
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
            >
              Book the Pyramids Photoshoot
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Photoshoots */}
      <section className="bg-sand-dim py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Photoshoot Packages"
              title="Travel + Professional Photography, In One Booking"
              description="Egypt Eye's strongest signature: private, professionally directed photoshoots woven into your trip, not booked separately."
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
      <section className="py-24">
        <Container>
          <Reveal>
            <div className="grid items-center gap-10 rounded-3xl border border-gold/20 bg-cream p-10 sm:p-14 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <SectionHeading
                  eyebrow="Customization"
                  title="Design Your Dream Tour"
                  description="Not sure what to book? Tell us your dates, interests, and pace, and we'll build a private itinerary around you — combining any tour, experience, or photoshoot in our catalog."
                />
                <Link
                  href="/customize"
                  className="mt-6 inline-block rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  Start Customizing
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
      <section className="bg-ink py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What Travelers Say"
              title="Personal, Safe, Flexible, and Photographed"
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
      <section className="py-24">
        <Container className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow="Good to Know" title="Frequently Asked Questions" align="center" />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <FaqAccordion faqs={faqs} />
          </Reveal>
        </Container>
      </section>

      {/* Stories */}
      <section className="py-24">
        <Container>
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Stories" title="From the Journal" />
              <Link href="/stories" className="text-sm font-semibold text-gold-dark hover:underline">
                Read all stories →
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
      <section className="pb-24">
        <Container>
          <Reveal>
            <div className="flex flex-col items-center gap-5 rounded-3xl bg-gold/15 px-8 py-16 text-center">
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                Ready to see Egypt through our eyes?
              </h2>
              <p className="max-w-xl text-ink-soft/80">
                Message us on WhatsApp and we&rsquo;ll help you build the right
                trip — no pressure, just answers.
              </p>
              <a
                href={site.contact.whatsappLink}
                target="_blank"
                className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
              >
                Chat With Us on WhatsApp
              </a>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
