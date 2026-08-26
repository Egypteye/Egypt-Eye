import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { HotelCard } from "./HotelCard";
import { getEnabledHotels } from "@/lib/hotels";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Hotel Deals in Egypt",
  description: "Hotels with current Egypt Eye partner rates across Cairo, Giza, and the Red Sea coast.",
  alternates: { canonical: `${siteUrl}/hotel-deals` },
};

export default async function HotelDealsPage() {
  const hotels = await getEnabledHotels();

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-31166900.jpg"
          tone="redsea"
          alt="A Red Sea resort beach with sun loungers and umbrellas"
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">Hotel Deals</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Hotels With Egypt Eye Rates
          </h1>
          <p className="max-w-xl text-[15px] text-cream/80">
            A hand-picked list of hotels we have a working relationship with — see the rooms, the rates, and what&rsquo;s
            included.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            title={`${hotels.length} hotel${hotels.length === 1 ? "" : "s"} with current deals`}
            description="Rates shown are Egypt Eye's negotiated deal rates, not live booking-engine availability — we confirm final pricing and availability with you directly."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
          {hotels.length === 0 && (
            <p className="mt-10 text-center text-sm text-ink-soft/60">
              No hotel deals are published yet — check back soon.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
