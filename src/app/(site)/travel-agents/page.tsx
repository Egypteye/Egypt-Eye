import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { TravelAgentForm } from "./TravelAgentForm";

export const metadata: Metadata = {
  title: "Travel Agent Partner Program",
  description:
    "Join the Egypt Eye Travel Agent Program for special partner rates, a dedicated specialist, and full support booking private tours and experiences across Egypt & Jordan.",
};

const BENEFITS = [
  {
    title: "Special Partner Rates",
    description: "Preferred pricing on every tour, experience, and photoshoot in our catalog, built for repeat agency bookings.",
  },
  {
    title: "A Dedicated Specialist",
    description: "One point of contact who knows your clients and can turn a request into a confirmed itinerary fast.",
  },
  {
    title: "Full Support, Start to Finish",
    description: "We handle logistics, guides, and on-the-ground details — you handle the relationship with your client.",
  },
  {
    title: "Flexible & Custom Itineraries",
    description: "From a single day trip to a full multi-city journey, we'll build around what your client actually wants.",
  },
];

const STEPS = [
  {
    title: "Apply",
    description: "Tell us about your agency — a couple of minutes, no commitment.",
  },
  {
    title: "Connect With a Specialist",
    description: "A quick video call to understand your clients and how we can work together.",
  },
  {
    title: "We Help With Everything",
    description: "Partner rates, sample itineraries, and a direct line to our team for every booking after that.",
  },
];

export default function TravelAgentsPage() {
  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="nile" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">Travel Agent Program</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Partner With Egypt Eye
          </h1>
          <p className="max-w-xl text-[15px] text-cream/80">
            Special partner rates and a dedicated specialist for travel agencies and tour operators sending clients
            to Egypt & Jordan.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Why Partner With Us" title="Built for Agencies, Not Just Travelers" />
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
          <SectionHeading eyebrow="How It Works" title="Three Steps to Partner Rates" align="center" />
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
            eyebrow="Apply Now"
            title="Tell Us About Your Agency"
            description="We'll review your application and reach out to schedule a video call with a specialist."
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <TravelAgentForm />
          </div>
        </Container>
      </section>
    </>
  );
}
