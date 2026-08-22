import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { SectionHeading } from "@/components/SectionHeading";
import { SignatureExperienceCard } from "@/components/SignatureExperienceCard";
import { Reveal } from "@/components/Reveal";
import { getSignatureExperiences } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Signature Experiences",
  description:
    "A different kind of travel from Egypt Eye — curated experiences designed around a specific person, need, and way of feeling taken care of, not just a list of destinations.",
};

export default async function SignatureExperiencesPage() {
  const experiences = await getSignatureExperiences();

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="desert" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
        <Container className="relative flex min-h-[46vh] flex-col justify-end gap-4 pb-16 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            Signature Experiences
          </p>
          <h1 className="max-w-2xl text-balance font-display text-4xl font-semibold text-cream sm:text-5xl">
            Built Around How You Want to Feel — Not Just Where You Want to Go
          </h1>
          <p className="max-w-xl text-cream/80">
            A different kind of product from our tours. Each Signature Experience is designed
            around a specific person and a specific need — the destination is part of the
            solution, not the whole plan.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="The Collection"
            title={experiences.length === 1 ? "Our first Signature Experience" : "Signature Experiences"}
            description="Each one starts with a person, not a place — read through and see which one was built with you in mind."
          />
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience, i) => (
              <Reveal key={experience.slug} delay={i * 80}>
                <SignatureExperienceCard experience={experience} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
