import Link from "next/link";
import { Container } from "@/components/Container";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { SectionHeading } from "@/components/SectionHeading";
import { TourCard } from "@/components/TourCard";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Badge } from "@/components/Badge";
import { site } from "@/content/site";
import { tours } from "@/content/tours";
import { photoshoots } from "@/content/photoshoots";
import { testimonials } from "@/content/testimonials";
import { stories } from "@/content/stories";

const featuredTours = tours.filter((t) =>
  ["1-day-giza-tour", "6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise", "3-days-jordan"].includes(
    t.slug
  )
);

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <PlaceholderImage tone="giza" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <Container className="relative flex min-h-[88vh] flex-col justify-end gap-6 pb-20 pt-40 sm:pb-28">
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
      </section>

      {/* Pillars */}
      <section className="border-b border-black/5 bg-cream">
        <Container className="grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
          {site.pillars.map((p) => (
            <div key={p.title}>
              <p className="font-display text-lg font-semibold text-ink">
                {p.title}
              </p>
              <p className="mt-1.5 text-sm text-ink-soft/70">{p.description}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Popular Tours */}
      <section className="py-24">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Popular Tours"
              title="Tours Across All Egypt"
              description="From Cairo and Giza to Luxor, Aswan, and the Red Sea — private, expertly guided journeys across the land of the Pharaohs."
            />
            <Link
              href="/tours"
              className="whitespace-nowrap text-sm font-semibold text-gold-dark hover:underline"
            >
              View all tours →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTours.map((tour) => (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </div>
        </Container>
      </section>

      {/* Flying Dresses feature */}
      <section className="py-6">
        <Container>
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
            <PlaceholderImage tone="desert" label="Flying Dress Photoshoot" className="min-h-[280px]" />
          </div>
        </Container>
      </section>

      {/* Red Sea Luxe Yachts */}
      <section className="py-6">
        <Container>
          <div className="grid overflow-hidden rounded-3xl bg-nile lg:grid-cols-2">
            <PlaceholderImage tone="redsea" label="Red Sea Luxe Yachts" className="min-h-[280px] lg:order-1" />
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
        </Container>
      </section>

      {/* Nine Pyramids View */}
      <section className="py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <PlaceholderImage
            tone="giza"
            label="Nine Pyramids View"
            className="aspect-[4/3] w-full rounded-3xl"
          />
          <div>
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
          </div>
        </Container>
      </section>

      {/* Photoshoots */}
      <section className="bg-sand-dim py-24">
        <Container>
          <SectionHeading
            eyebrow="Photoshoot Packages"
            title="Travel + Professional Photography, In One Booking"
            description="Egypt Eye's strongest signature: private, professionally directed photoshoots woven into your trip, not booked separately."
            align="center"
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-6">
            {photoshoots.map((p) => (
              <PhotoshootCard key={p.slug} photoshoot={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* Custom Tours CTA */}
      <section className="py-24">
        <Container>
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
            <PlaceholderImage tone="luxor" label="Customize Your Tour" className="aspect-square w-full rounded-2xl" />
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-ink py-24">
        <Container>
          <SectionHeading
            eyebrow="What Travelers Say"
            title="Personal, Safe, Flexible, and Photographed"
            description="Our reviews rarely just say 'good tour' — travelers describe the experience as personal, friendly, safe, flexible, and memorable."
            align="center"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
        </Container>
      </section>

      {/* Stories */}
      <section className="py-24">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Stories" title="From the Journal" />
            <Link href="/stories" className="text-sm font-semibold text-gold-dark hover:underline">
              Read all stories →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stories.map((s) => (
              <Link
                key={s.slug}
                href={`/stories/${s.slug}`}
                className="group overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <PlaceholderImage tone={s.imageTone} className="h-36 w-full transition duration-500 group-hover:scale-105" />
                <div className="p-4">
                  <h3 className="text-sm font-semibold leading-snug text-ink">{s.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="pb-24">
        <Container>
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
        </Container>
      </section>
    </>
  );
}
