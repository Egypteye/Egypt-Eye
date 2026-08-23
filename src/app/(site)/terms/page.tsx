import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getSiteSettings } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false, follow: true },
};

const SECTIONS = [
  {
    title: "Booking and confirmation",
    note: "State how a booking becomes confirmed (the deposit terms already live on the Contact page's policy cards — reuse the real figures from there, don't restate a different number here).",
  },
  {
    title: "Pricing and payment",
    note: "Confirm currency, what's included in the quoted price, and accepted payment methods for the remaining balance.",
  },
  {
    title: "Cancellations and refunds",
    note: "Set out the actual cancellation window and refund terms this business honors.",
  },
  {
    title: "Changes to an itinerary",
    note: "Explain who can request a change, and any cutoff before departure.",
  },
  {
    title: "Traveler responsibilities",
    note: "Cover passports/visas, travel insurance, and health requirements the traveler is responsible for arranging themselves.",
  },
  {
    title: "Liability",
    note: "This needs a lawyer's input — do not publish liability language without legal review.",
  },
  {
    title: "Governing law",
    note: "State which country's law governs the agreement once confirmed.",
  },
  {
    title: "Contact",
    note: "Confirm the email address for questions about a booking's terms.",
  },
];

export default async function TermsPage() {
  const site = await getSiteSettings();

  return (
    <section className="py-24">
      <Container className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">Terms of Service</h1>
        <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5 text-sm text-ink-soft/80">
          <p className="font-semibold text-terracotta">Draft structure — not yet published.</p>
          <p className="mt-1">
            This page lists the sections a Terms of Service page needs. Each one below is a placeholder, not
            legal language — replace it with reviewed, accurate text (ideally checked by a legal professional)
            before this page is indexed or linked as final.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s, i) => (
            <div key={s.title}>
              <h2 className="font-display text-xl font-semibold text-ink">
                {i + 1}. {s.title}
              </h2>
              <p className="mt-2 text-sm italic text-ink-soft/60">{s.note}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-ink-soft/60">
          Questions in the meantime? Contact us at{" "}
          <a href={`mailto:${site.contact.email}`} className="underline">
            {site.contact.email}
          </a>
          .
        </p>
      </Container>
    </section>
  );
}
