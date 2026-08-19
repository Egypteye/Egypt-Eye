import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ToursGrid } from "./ToursGrid";
import { getTours } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Popular Tours",
  description:
    "Private, expertly guided tours across Egypt and Jordan — one-day trips, multi-day itineraries, and Nile cruises.",
};

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="luxor" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            Popular Tours
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Tours Across All Egypt &amp; Jordan
          </h1>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            title={`${tours.length} private, guided itineraries`}
            description="Every tour includes a private vehicle and an English-speaking guide. Filter by trip length, or reach out and we'll help you choose."
          />
          <div className="mt-10">
            <Suspense fallback={null}>
              <ToursGrid tours={tours} />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}
