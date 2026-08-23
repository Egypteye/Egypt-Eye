import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getSiteSettings } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: true },
};

const SECTIONS = [
  {
    title: "What information we collect",
    note: "List every field collected from the Customize Your Tour form, the contact page, and WhatsApp conversations (e.g. name, email, phone, travel dates, party size).",
  },
  {
    title: "How we use your information",
    note: "Describe the actual use — building a quote, replying by email or WhatsApp, no marketing use unless that's true.",
  },
  {
    title: "How we store and protect it",
    note: "Name the actual systems involved (this website's form handler, the email provider used to deliver enquiries, any CRM or spreadsheet) and how long submissions are kept.",
  },
  {
    title: "Third parties we share information with",
    note: "List any service actually used to process this data (e.g. the email delivery provider). State plainly if no data is sold or shared for marketing.",
  },
  {
    title: "Cookies and analytics",
    note: "Disclose any analytics or tracking tool once one is added to the site. Currently none is active — update this section when that changes.",
  },
  {
    title: "Your rights",
    note: "Explain how a visitor can request their data be corrected or deleted (e.g. by emailing the contact address).",
  },
  {
    title: "Contact",
    note: "Confirm the email address visitors should use for a privacy request.",
  },
];

export default async function PrivacyPage() {
  const site = await getSiteSettings();

  return (
    <section className="py-24">
      <Container className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">Privacy Policy</h1>
        <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5 text-sm text-ink-soft/80">
          <p className="font-semibold text-terracotta">Draft structure — not yet published.</p>
          <p className="mt-1">
            This page lists the sections a Privacy Policy needs. Each one below is a placeholder, not legal
            language — replace it with reviewed, accurate text (ideally checked by a legal professional) before
            this page is indexed or linked as final.
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
