import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getExperiences, getListingPages } from "@/sanity/fetchers";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Egypt Add-On Experiences & Day Trips",
  description:
    "Felucca sailing, desert ATV rides, Nile dinner cruises, and food tours — add one to any Egypt Eye tour, or book it on its own.",
  alternates: { canonical: `${siteUrl}/experiences` },
};

export default async function ExperiencesPage() {
  const [experiences, listingPages] = await Promise.all([getExperiences(), getListingPages()]);
  const page = listingPages.experiences;

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-38498244.jpg"
          tone="desert"
          alt="A desert oasis lake in Egypt's Western Desert"
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
          <SectionHeading title={page.sectionTitle} description={page.sectionDescription} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((e) => (
              <ExperienceCard key={e.slug} experience={e} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
