import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Three ways to work with Egypt Eye: the Travel Agent Partner Program, the Affiliate Program, and Creators & Influencers collaborations.",
  alternates: { canonical: `${siteUrl}/partners` },
};

const PROGRAMS = [
  {
    href: "/travel-agents",
    eyebrow: "For Agencies & Tour Operators",
    title: "Travel Agent Partner Program",
    description:
      "Special partner rates, a dedicated specialist, and full booking support for agencies sending clients to Egypt & Jordan.",
    cta: "See Partner Rates",
  },
  {
    href: "/affiliate",
    eyebrow: "For Bloggers, Creators & Communities",
    title: "Affiliate Program",
    description:
      "A personal referral code and commission on every booking it brings in, plus a real discount for the people you send us.",
    cta: "See Commission Details",
  },
  {
    href: "/collaborate",
    eyebrow: "For Content Creators & Influencers",
    title: "Creators & Influencers",
    description:
      "Apply for a sponsored trip, content partnership, or press coverage — for creators who show Egypt as it really is.",
    cta: "See How to Apply",
  },
];

export default function PartnersPage() {
  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-15272456.jpg"
          tone="giza"
          alt="Sunrise light over the Pyramids of Giza"
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">Partner With Us</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Three Ways to Work With Egypt Eye
          </h1>
          <p className="max-w-xl text-[15px] text-cream/80">
            Whether you book for clients, refer your audience, or create content on the ground — there&rsquo;s a
            program built for how you actually work.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Choose Your Program" title="Find the Fit" />
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
