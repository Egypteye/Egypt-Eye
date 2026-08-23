import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getExperiences, getListingPages } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Egypt Add-On Experiences & Day Trips",
  description:
    "Felucca sailing, desert ATV rides, Nile dinner cruises, and food tours — add one to any Egypt Eye tour, or book it on its own.",
};

export default async function ExperiencesPage() {
  const [experiences, listingPages] = await Promise.all([getExperiences(), getListingPages()]);
  const page = listingPages.experiences;

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="desert" className="absolute inset-0" />
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
