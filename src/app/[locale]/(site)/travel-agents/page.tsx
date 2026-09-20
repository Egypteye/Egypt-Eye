import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { TravelAgentForm } from "./TravelAgentForm";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/travel-agents"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/travel-agents", locale),
  };
}

export default async function TravelAgentsPage() {
  const ui = await trAll([
    "Apply Now",
    "Built for Agencies, Not Just Travelers",
    "How It Works",
    "Nile riverfront with a felucca sailboat and cruise ships in Egypt",
    "Tell Us About Your Agency",
    "Three Steps to Partner Rates",
    "We'll review your application and reach out to schedule a video call with a specialist.",
    "Why Partner With Us",
    "Special Partner Rates",
    "Preferred pricing on every tour, experience, and photoshoot in our catalog, built for repeat agency bookings.",
    "A Dedicated Specialist",
    "One point of contact who knows your clients and can turn a request into a confirmed itinerary fast.",
    "Full Support, Start to Finish",
    "We handle logistics, guides, and on-the-ground details — you handle the relationship with your client.",
    "Flexible & Custom Itineraries",
    "From a single day trip to a full multi-city journey, we'll build around what your client actually wants.",
    "Apply",
    "Tell us about your agency — a couple of minutes, no commitment.",
    "Connect With a Specialist",
    "A quick video call to understand your clients and how we can work together.",
    "We Help With Everything",
    "Partner rates, sample itineraries, and a direct line to our team for every booking after that.",
  ]);

  const BENEFITS = [
    { title: ui["Special Partner Rates"], description: ui["Preferred pricing on every tour, experience, and photoshoot in our catalog, built for repeat agency bookings."] },
    { title: ui["A Dedicated Specialist"], description: ui["One point of contact who knows your clients and can turn a request into a confirmed itinerary fast."] },
    { title: ui["Full Support, Start to Finish"], description: ui["We handle logistics, guides, and on-the-ground details — you handle the relationship with your client."] },
    { title: ui["Flexible & Custom Itineraries"], description: ui["From a single day trip to a full multi-city journey, we'll build around what your client actually wants."] },
  ];

  const STEPS = [
    { title: ui["Apply"], description: ui["Tell us about your agency — a couple of minutes, no commitment."] },
    { title: ui["Connect With a Specialist"], description: ui["A quick video call to understand your clients and how we can work together."] },
    { title: ui["We Help With Everything"], description: ui["Partner rates, sample itineraries, and a direct line to our team for every booking after that."] },
  ];

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-20954992.jpg"
          tone="nile"
          alt={ui["Nile riverfront with a felucca sailboat and cruise ships in Egypt"]}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light"><T>Travel Agent Program</T></p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl"><T>Partner With Egypt Eye</T></h1>
          <p className="max-w-xl text-[15px] text-cream/80"><T>Special partner rates and a dedicated specialist for travel agencies and tour operators sending clients to Egypt & Jordan.</T></p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow={ui["Why Partner With Us"]} title={ui["Built for Agencies, Not Just Travelers"]} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
                <p className="font-display text-base font-semibold text-ink">{b.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/70">{b.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-20">
        <Container>
          <SectionHeading eyebrow={ui["How It Works"]} title={ui["Three Steps to Partner Rates"]} align="center" />
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
          <SectionHeading
            eyebrow={ui["Apply Now"]}
            title={ui["Tell Us About Your Agency"]}
            description={ui["We'll review your application and reach out to schedule a video call with a specialist."]}
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <TravelAgentForm />
          </div>
        </Container>
      </section>
    </>
  );
}
