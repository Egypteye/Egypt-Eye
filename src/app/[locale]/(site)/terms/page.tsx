import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { getSiteSettings } from "@/sanity/fetchers";
import { T, trAll } from "@/i18n/T";

// Indexable on purpose. A real operator's terms and privacy policy are a
// trust signal — for travellers comparing agencies and for Google reading the
// site as a business — and there is nothing private on either page.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/terms"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/terms", locale),
  };
}

export default async function TermsPage() {
  const site = await getSiteSettings();
  const ui = await trAll([
    "Booking and confirmation",
    "State how a booking becomes confirmed (the deposit terms already live on the Contact page's policy cards — reuse the real figures from there, don't restate a different number here).",
    "Pricing and payment",
    "Confirm currency, what's included in the quoted price, and accepted payment methods for the remaining balance.",
    "Cancellations and refunds",
    "Set out the actual cancellation window and refund terms this business honors.",
    "Changes to an itinerary",
    "Explain who can request a change, and any cutoff before departure.",
    "Traveler responsibilities",
    "Cover passports/visas, travel insurance, and health requirements the traveler is responsible for arranging themselves.",
    "Liability",
    "This needs a lawyer's input — do not publish liability language without legal review.",
    "Governing law",
    "State which country's law governs the agreement once confirmed.",
    "Contact",
    "Confirm the email address for questions about a booking's terms.",
    "Questions in the meantime? Contact us at",
  ]);

  const SECTIONS = [
    { title: ui["Booking and confirmation"], note: ui["State how a booking becomes confirmed (the deposit terms already live on the Contact page's policy cards — reuse the real figures from there, don't restate a different number here)."] },
    { title: ui["Pricing and payment"], note: ui["Confirm currency, what's included in the quoted price, and accepted payment methods for the remaining balance."] },
    { title: ui["Cancellations and refunds"], note: ui["Set out the actual cancellation window and refund terms this business honors."] },
    { title: ui["Changes to an itinerary"], note: ui["Explain who can request a change, and any cutoff before departure."] },
    { title: ui["Traveler responsibilities"], note: ui["Cover passports/visas, travel insurance, and health requirements the traveler is responsible for arranging themselves."] },
    { title: ui["Liability"], note: ui["This needs a lawyer's input — do not publish liability language without legal review."] },
    { title: ui["Governing law"], note: ui["State which country's law governs the agreement once confirmed."] },
    { title: ui["Contact"], note: ui["Confirm the email address for questions about a booking's terms."] },
  ];

  return (
    <section className="py-24">
      <Container className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark"><T>Legal</T></p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl"><T>Terms of Service</T></h1>
        <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5 text-sm text-ink-soft/80">
          <p className="font-semibold text-terracotta"><T>Draft structure — not yet published.</T></p>
          <p className="mt-1">
            <T>This page lists the sections a Terms of Service page needs. Each one below is a placeholder, not legal language — replace it with reviewed, accurate text (ideally checked by a legal professional) before this page is indexed or linked as final.</T>
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
          {ui["Questions in the meantime? Contact us at"]}{" "}
          <a href={`mailto:${site.contact.email}`} className="underline">
            {site.contact.email}
          </a>
          .
        </p>
      </Container>
    </section>
  );
}
