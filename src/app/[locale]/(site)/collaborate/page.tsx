import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { CollaborateForm } from "./CollaborateForm";
import { SocialLinks } from "@/components/SocialLinks";
import { getSiteSettings } from "@/sanity/fetchers";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/collaborate"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/collaborate", locale),
  };
}

export default async function CollaboratePage() {
  const ui = await trAll([
    "A Fit, Not a Follower Count",
    "Apply Now",
    "Built Around Your Content, Not Ours",
    "Detailed hieroglyphic reliefs on temple columns in Egypt",
    "From Application to Trip",
    "How It Works",
    "Tell Us About You",
    "We review every application personally — expect a response within a couple of weeks.",
    "What We Look For",
    "What You Get",
    "A Fully Hosted Experience",
    "Tour, guide, and access arranged around what you're there to create — not a generic itinerary.",
    "A Story Worth Telling",
    "Access most visitors don't get — private timing, real conversations, and moments built for a real narrative, not a stock shot.",
    "A Team That Gets Content",
    "We plan around your shot list and posting schedule, not the other way around.",
    "Long-Term Relationships",
    "The best collaborations become repeat ones — return trips, new destinations, an ongoing partnership.",
    "Apply",
    "Tell us about your platform, your audience, and what you'd want to create.",
    "We Review & Reply",
    "Every application is reviewed personally — expect a response within a couple of weeks.",
    "We Build the Trip Together",
    "Dates, itinerary, and deliverables agreed before you travel — no surprises on either side.",
    "Genuine Storytelling",
    "Creators who show Egypt as it really is — history, culture, people — not just a backdrop.",
    "An Engaged Audience",
    "We care more about a real, engaged following than a follower count alone.",
    "A Clear Idea",
    "Tell us what you'd want to create and why it's a fit for Egypt Eye and your audience.",
    "Have a look at what we're already making before you apply:",
  ]);

  const WHAT_YOU_GET = [
    { title: ui["A Fully Hosted Experience"], description: ui["Tour, guide, and access arranged around what you're there to create — not a generic itinerary."] },
    { title: ui["A Story Worth Telling"], description: ui["Access most visitors don't get — private timing, real conversations, and moments built for a real narrative, not a stock shot."] },
    { title: ui["A Team That Gets Content"], description: ui["We plan around your shot list and posting schedule, not the other way around."] },
    { title: ui["Long-Term Relationships"], description: ui["The best collaborations become repeat ones — return trips, new destinations, an ongoing partnership."] },
  ];

  const STEPS = [
    { title: ui["Apply"], description: ui["Tell us about your platform, your audience, and what you'd want to create."] },
    { title: ui["We Review & Reply"], description: ui["Every application is reviewed personally — expect a response within a couple of weeks."] },
    { title: ui["We Build the Trip Together"], description: ui["Dates, itinerary, and deliverables agreed before you travel — no surprises on either side."] },
  ];

  const WHAT_WE_LOOK_FOR = [
    { title: ui["Genuine Storytelling"], description: ui["Creators who show Egypt as it really is — history, culture, people — not just a backdrop."] },
    { title: ui["An Engaged Audience"], description: ui["We care more about a real, engaged following than a follower count alone."] },
    { title: ui["A Clear Idea"], description: ui["Tell us what you'd want to create and why it's a fit for Egypt Eye and your audience."] },
  ];

  const site = await getSiteSettings();

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-15131539.jpg"
          tone="desert"
          alt={ui["Detailed hieroglyphic reliefs on temple columns in Egypt"]}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light"><T>Collaborate</T></p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl"><T>Collaborate With Egypt Eye</T></h1>
          <p className="max-w-xl text-[15px] text-cream/80"><T>Content creators and influencers — apply for a sponsored trip, content partnership, or press coverage with Egypt Eye.</T></p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow={ui["What You Get"]} title={ui["Built Around Your Content, Not Ours"]} />
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
          <SectionHeading eyebrow={ui["How It Works"]} title={ui["From Application to Trip"]} align="center" />
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
          <SectionHeading eyebrow={ui["What We Look For"]} title={ui["A Fit, Not a Follower Count"]} />
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
              {ui["Have a look at what we're already making before you apply:"]}
            </p>
            <SocialLinks site={site} tone="light" />
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-16">
        <Container>
          <SectionHeading
            eyebrow={ui["Apply Now"]}
            title={ui["Tell Us About You"]}
            description={ui["We review every application personally — expect a response within a couple of weeks."]}
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <CollaborateForm />
          </div>
        </Container>
      </section>
    </>
  );
}
