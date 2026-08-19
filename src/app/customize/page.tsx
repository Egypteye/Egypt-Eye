import { Container } from "@/components/Container";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { SectionHeading } from "@/components/SectionHeading";
import { CustomizeForm } from "./CustomizeForm";

export const metadata = {
  title: "Customize Your Tour",
  description:
    "Tell us your dates, interests, and pace — we'll design a private Egypt or Jordan itinerary around you.",
};

export default function CustomizePage() {
  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="nile" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[36vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            Customization
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Design Your Dream Tour
          </h1>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="Tell us what you're after"
              description="Fill in the basics and we'll reply with a proposed itinerary and pricing — usually within a few hours."
            />
            <ol className="mt-8 space-y-5">
              {[
                { title: "Share your dates & pace", body: "How many days, and how packed or relaxed you want it." },
                { title: "Pick your interests", body: "History, photography, desert adventure, food, the Red Sea — mix and match." },
                { title: "We build your itinerary", body: "A private Egyptologist guide, transportation, and any experiences you'd like included." },
                { title: "Confirm with a 20% deposit", body: "Pay the rest in cash or PayPal at the end of your tour." },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold-dark">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="text-sm text-ink-soft/70">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <CustomizeForm />
        </Container>
      </section>
    </>
  );
}
