import type { Metadata } from "next";
import { withdrawnRobots } from "@/content/withdrawnSections";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { HotelCard } from "./HotelCard";
import { getEnabledHotels } from "@/lib/hotels";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/hotel-deals"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/hotel-deals", locale),
    // Section withdrawn — see content/withdrawnSections.ts.
    robots: withdrawnRobots,
  };
}

export default async function HotelDealsPage() {
  const ui = await trAll([
    "A Red Sea resort beach with sun loungers and umbrellas",
    "A different kind of stay: premium, Airbnb-style apartments for travellers who want more space, more privacy, and a home-like base — couples, families, groups, and longer stays. Send an enquiry for availability and rates.",
    "Luxury Long-Stay Apartments",
    "Not a Hotel — A Home",
    "Rates shown are indicative Egypt Eye deal rates, not live booking-engine availability. Hotel rates are subject to change based on travel dates, availability, seasonality, and hotel conditions — send an enquiry to confirm the latest available rate.",
    "{count} hotel with current deals",
    "{count} hotels with current deals",
  ]);

  const allHotels = await getEnabledHotels();
  const hotels = allHotels.filter((h) => h.property_type !== "apartment");
  const apartments = allHotels.filter((h) => h.property_type === "apartment");

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-31166900.jpg"
          tone="redsea"
          alt={ui["A Red Sea resort beach with sun loungers and umbrellas"]}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light"><T>Hotel Deals</T></p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl"><T>Hotels With Egypt Eye Rates</T></h1>
          <p className="max-w-xl text-[15px] text-cream/80"><T>A hand-picked list of hotels we have a working relationship with — see the rooms, the rates, and what’s included.</T></p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            title={(hotels.length === 1 ? ui["{count} hotel with current deals"] : ui["{count} hotels with current deals"]).replace(
              "{count}",
              String(hotels.length)
            )}
            description={ui["Rates shown are indicative Egypt Eye deal rates, not live booking-engine availability. Hotel rates are subject to change based on travel dates, availability, seasonality, and hotel conditions — send an enquiry to confirm the latest available rate."]}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
          {hotels.length === 0 && (
            <p className="mt-10 text-center text-sm text-ink-soft/60"><T>No hotel deals are published yet — check back soon.</T></p>
          )}
        </Container>
      </section>

      {apartments.length > 0 && (
        <section className="bg-sand-dim py-16">
          <Container>
            <SectionHeading
              eyebrow={ui["Not a Hotel — A Home"]}
              title={ui["Luxury Long-Stay Apartments"]}
              description={ui["A different kind of stay: premium, Airbnb-style apartments for travellers who want more space, more privacy, and a home-like base — couples, families, groups, and longer stays. Send an enquiry for availability and rates."]}
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {apartments.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
