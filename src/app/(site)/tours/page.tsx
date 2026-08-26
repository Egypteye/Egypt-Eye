import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ToursGrid } from "./ToursGrid";
import { getListingPages, getTours } from "@/sanity/fetchers";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Private Tours Across Egypt & Jordan",
  description:
    "Private, guided tours across Egypt and Jordan — one-day trips, multi-day itineraries, and Nile cruises. Every tour includes a private vehicle and guide.",
  alternates: { canonical: `${siteUrl}/tours` },
};

export default async function ToursPage() {
  const [tours, listingPages] = await Promise.all([getTours(), getListingPages()]);
  const page = listingPages.tours;
  const sectionTitle = page.sectionTitleTemplate.replace("{count}", String(tours.length));

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-36518565.jpg"
          tone="luxor"
          alt="Painted hieroglyphic columns at Luxor Temple"
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{page.heroEyebrow}</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">{page.heroTitle}</h1>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading title={sectionTitle} description={page.sectionDescription} />
          <div className="mt-10">
            <Suspense fallback={null}>
              <ToursGrid tours={tours} />
            </Suspense>
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-20">
        <Container className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Good to Know" title="Planning an Egypt Trip" align="center" />
          <div className="mt-10">
            <FaqAccordion faqs={[...page.faqs]} />
          </div>
        </Container>
      </section>
    </>
  );
}
