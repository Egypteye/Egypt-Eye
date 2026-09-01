import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { CollaborateForm } from "./CollaborateForm";
import { SocialLinks } from "@/components/SocialLinks";
import { getSiteSettings } from "@/sanity/fetchers";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Collaborate With Egypt Eye",
  description:
    "Content creators and influencers — apply to collaborate with Egypt Eye for sponsored trips, content partnerships, and press coverage across Egypt & Jordan.",
  alternates: { canonical: `${siteUrl}/collaborate` },
};

const WHAT_YOU_GET = [
  {
    title: "A Fully Hosted Experience",
    description: "Tour, guide, and access arranged around what you're there to create — not a generic itinerary.",
  },
  {
    title: "A Story Worth Telling",
    description: "Access most visitors don't get — private timing, real conversations, and moments built for a real narrative, not a stock shot.",
  },
  {
    title: "A Team That Gets Content",
    description: "We plan around your shot list and posting schedule, not the other way around.",
  },
  {
    title: "Long-Term Relationships",
    description: "The best collaborations become repeat ones — return trips, new destinations, an ongoing partnership.",
  },
];

const STEPS = [
  {
    title: "Apply",
    description: "Tell us about your platform, your audience, and what you'd want to create.",
  },
  {
    title: "We Review & Reply",
    description: "Every application is reviewed personally — expect a response within a couple of weeks.",
  },
  {
    title: "We Build the Trip Together",
    description: "Dates, itinerary, and deliverables agreed before you travel — no surprises on either side.",
  },
];

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

export default async function CollaboratePage() {
  const site = await getSiteSettings();

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
          <SectionHeading eyebrow="What You Get" title="Built Around Your Content, Not Ours" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
                <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/70">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-20">
        <Container>
          <SectionHeading eyebrow="How It Works" title="From Application to Trip" align="center" />
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-cream p-6 text-center shadow-sm">
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold-dark">
                  {i + 1}
                </span>
                <p className="mt-4 font-display text-base font-semibold text-ink">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/70">{s.description}</p>
              </div>
            ))}
          </div>
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

          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-ink-soft/70">
              Have a look at what we&rsquo;re already making before you apply:
            </p>
            <SocialLinks site={site} tone="light" />
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
