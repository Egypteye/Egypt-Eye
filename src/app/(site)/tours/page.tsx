import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ToursGrid } from "./ToursGrid";
import { getTours } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Private Tours Across Egypt & Jordan",
  description:
    "Private, guided tours across Egypt and Jordan — one-day trips, multi-day itineraries, and Nile cruises. Every tour includes a private vehicle and guide.",
};

const toursFaqs = [
  {
    question: "How many days do I need in Egypt?",
    answer:
      "Most first-time travelers find 10 days the sweet spot — enough time for Cairo and Giza plus a proper Nile stretch between Luxor and Aswan, without every hour being scheduled. A week is workable if you accept choosing between Cairo and the Nile Valley rather than both. Two weeks or more lets you add Alexandria, the Red Sea, or a desert oasis without rushing the rest.",
  },
  {
    question: "What's the difference between a private and a group tour?",
    answer:
      "Every tour on this page is private: your own vehicle, your own English-speaking Egyptologist, and a schedule that moves at your pace rather than a bus timetable. It costs more than joining a group, but it's the difference between seeing a site and actually experiencing it — no waiting on 20 other people to finish photos.",
  },
  {
    question: "Can I customize one of these tours?",
    answer:
      "Yes. Every itinerary here is a starting point, not a fixed package — swap a destination, add an experience, or change the pace, and we'll rebuild it around you. If nothing here matches what you have in mind, use Customize Your Tour to start from a blank page instead.",
  },
  {
    question: "What's included in the price?",
    answer:
      "Every tour includes private transportation and a private guide as standard; most also include entrance fees and lunch. Flights, hotels, and your Egypt visa are handled separately so you can book accommodation and airfare on your own terms — each tour page lists exactly what's included and what isn't.",
  },
];

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="luxor" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            Popular Tours
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Tours Across All Egypt &amp; Jordan
          </h1>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            title={`${tours.length} private, guided itineraries`}
            description="Every tour includes a private vehicle and an English-speaking guide. Search by destination, filter by trip length or travel style, or reach out and we'll help you choose."
          />
          <div className="mt-10">
            <Suspense fallback={null}>
              <ToursGrid tours={tours} />
            </Suspense>
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-20">
        <Container className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Good to Know" title="Planning an Egypt Trip" align="center" />
          <div className="mt-10">
            <FaqAccordion faqs={toursFaqs} />
          </div>
        </Container>
      </section>
    </>
  );
}
