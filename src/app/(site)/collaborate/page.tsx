import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { CollaborateForm } from "./CollaborateForm";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Collaborate With Egypt Eye",
  description:
    "Content creators and influencers — apply to collaborate with Egypt Eye for sponsored trips, content partnerships, and press coverage across Egypt & Jordan.",
  alternates: { canonical: `${siteUrl}/collaborate` },
};

const WHAT_WE_LOOK_FOR = [
  {
    title: "Genuine Storytelling",
    description: "Creators who show Egypt as it really is — history, culture, people — not just a backdrop.",
  },
  {
    title: "An Engaged Audience",
    description: "We care more about a real, engaged following than a follower count alone.",
  },
  {
    title: "A Clear Idea",
    description: "Tell us what you'd want to create and why it's a fit for Egypt Eye and your audience.",
  },
];

export default function CollaboratePage() {
  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-15131539.jpg"
          tone="desert"
          alt="Detailed hieroglyphic reliefs on temple columns in Egypt"
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">Collaborate</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Collaborate With Egypt Eye
          </h1>
          <p className="max-w-xl text-[15px] text-cream/80">
            Content creators and influencers — apply for a sponsored trip, content partnership, or press coverage
            with Egypt Eye.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="What We Look For" title="A Fit, Not a Follower Count" />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {WHAT_WE_LOOK_FOR.map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
                <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/70">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-16">
        <Container>
          <SectionHeading
            eyebrow="Apply Now"
            title="Tell Us About You"
            description="We review every application personally — expect a response within a couple of weeks."
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <CollaborateForm />
          </div>
        </Container>
      </section>
    </>
  );
}
