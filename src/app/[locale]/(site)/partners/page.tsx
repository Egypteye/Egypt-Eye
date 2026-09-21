import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/partners"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/partners", locale),
  };
}

export default async function PartnersPage() {
  const ui = await trAll([
    "Choose Your Program",
    "Find the Fit",
    "Sunrise light over the Pyramids of Giza",
    "For Agencies & Tour Operators",
    "Travel Agent Partner Program",
    "Special partner rates, a dedicated specialist, and full booking support for agencies sending clients to Egypt & Jordan.",
    "See Partner Rates",
    "For Bloggers, Creators & Communities",
    "Affiliate Program",
    "A personal referral code and commission on every booking it brings in, plus a real discount for the people you send us.",
    "See Commission Details",
    "For Content Creators & Influencers",
    "Creators & Influencers",
    "Apply for a sponsored trip, content partnership, or press coverage — for creators who show Egypt as it really is.",
    "See How to Apply",
  ]);

  const PROGRAMS = [
    {
      href: "/travel-agents",
      eyebrow: ui["For Agencies & Tour Operators"],
      title: ui["Travel Agent Partner Program"],
      description: ui["Special partner rates, a dedicated specialist, and full booking support for agencies sending clients to Egypt & Jordan."],
      cta: ui["See Partner Rates"],
    },
    {
      href: "/affiliate",
      eyebrow: ui["For Bloggers, Creators & Communities"],
      title: ui["Affiliate Program"],
      description: ui["A personal referral code and commission on every booking it brings in, plus a real discount for the people you send us."],
      cta: ui["See Commission Details"],
    },
    {
      href: "/collaborate",
      eyebrow: ui["For Content Creators & Influencers"],
      title: ui["Creators & Influencers"],
      description: ui["Apply for a sponsored trip, content partnership, or press coverage — for creators who show Egypt as it really is."],
      cta: ui["See How to Apply"],
    },
  ];

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-15272456.jpg"
          tone="giza"
          alt={ui["Sunrise light over the Pyramids of Giza"]}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light"><T>Partner With Us</T></p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl"><T>Three Ways to Work With Egypt Eye</T></h1>
          <p className="max-w-xl text-[15px] text-cream/80"><T>Whether you book for clients, refer your audience, or create content on the ground — there’s a program built for how you actually work.</T></p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow={ui["Choose Your Program"]} title={ui["Find the Fit"]} />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {PROGRAMS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group flex flex-col rounded-2xl border border-black/5 bg-cream p-7 shadow-sm transition hover:border-gold/40 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-dark">{p.eyebrow}</p>
                <p className="mt-3 font-display text-xl font-semibold text-ink">{p.title}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft/70">{p.description}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition group-hover:text-gold-dark">
                  {p.cta}
                  <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
