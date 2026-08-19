import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getExperiences } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Extra Experiences",
  description:
    "Add-on experiences to any Egypt Eye tour — felucca sailing, desert ATV rides, Nile dinner cruises, and food tours.",
};

export default async function ExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="desert" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            Extra Experiences
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Make Any Tour More Memorable
          </h1>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            title="Short experiences, big memories"
            description="Add one of these to any tour, or book it on its own — each runs about an hour and is easy to slot into your schedule."
          />
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
