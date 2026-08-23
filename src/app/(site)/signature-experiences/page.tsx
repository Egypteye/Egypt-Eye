import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { SectionHeading } from "@/components/SectionHeading";
import { SignatureExperienceCard } from "@/components/SignatureExperienceCard";
import { Reveal } from "@/components/Reveal";
import { getListingPages, getSignatureExperiences } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Signature Experiences",
  description:
    "Curated Egypt travel experiences designed around a specific person and need — the destination is part of the answer, not the whole plan.",
};

export default async function SignatureExperiencesPage() {
  const [experiences, listingPages] = await Promise.all([getSignatureExperiences(), getListingPages()]);
  const page = listingPages.signatureExperiences;

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="desert" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
        <Container className="relative flex min-h-[46vh] flex-col justify-end gap-4 pb-16 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{page.heroEyebrow}</p>
          <h1 className="max-w-2xl text-balance font-display text-4xl font-semibold text-cream sm:text-5xl">
            {page.heroTitle}
          </h1>
          <p className="max-w-xl text-cream/80">{page.heroDescription}</p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow={page.collectionEyebrow}
            title={experiences.length === 1 ? page.collectionTitleSingular : page.collectionTitlePlural}
            description={page.collectionDescription}
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
