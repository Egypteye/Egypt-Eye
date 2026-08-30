import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { AffiliateForm } from "./AffiliateForm";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description:
    "Earn a commission recommending Egypt Eye's private Egypt & Jordan tours. Your own referral code, real-time-tracked bookings, and monthly payouts.",
  alternates: { canonical: `${siteUrl}/affiliate` },
};

const BENEFITS = [
  {
    title: "A Personal Referral Code",
    description: "Your own code, credited to every booking it brings in — no spreadsheets, no guesswork on your end.",
  },
  {
    title: "Real Commission, Every Booking",
    description: "Earn on every confirmed tour, experience, or photoshoot your code is used on — not just a one-time flat fee.",
  },
  {
    title: "A Discount for Your Audience",
    description: "Your code also gives the people you send us a genuine discount, so it's an easy recommendation, not a hard sell.",
  },
  {
    title: "Monthly Payouts",
    description: "Commission is tallied and paid out monthly by PayPal or bank transfer — no minimum threshold games.",
  },
];

const STEPS = [
  {
    title: "Apply",
    description: "Tell us where you'd share Egypt Eye — a couple of minutes, no commitment.",
  },
  {
    title: "Get Your Code",
    description: "Once approved, we'll email your personal referral code and link, ready to share.",
  },
  {
    title: "Earn as You Refer",
    description: "Share it however fits your audience — every booking it brings in earns you commission.",
  },
];

const GOOD_FIT = [
  "Travel bloggers and YouTubers covering Egypt, Jordan, or the wider Middle East",
  "Newsletter writers or communities with travel-curious readers",
  "Deal/coupon sites and travel-planning tools",
  "Anyone with an audience who trusts your travel recommendations",
];

export default function AffiliatePage() {
  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-16580393.jpg"
          tone="desert"
          alt="Golden sand dunes in the Egyptian desert at Siwa Oasis"
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">Affiliate Program</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            Earn Commission Recommending Egypt Eye
          </h1>
          <p className="max-w-xl text-[15px] text-cream/80">
            A personal referral code, real commission on every booking it brings in, and a discount your audience
            will actually thank you for.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Why Join" title="Built to Reward Real Recommendations" />
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
          <SectionHeading eyebrow="How It Works" title="Three Steps to Your First Payout" align="center" />
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
          <SectionHeading eyebrow="Who It's For" title="A Good Fit, Not a Follower Count" />
          <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {GOOD_FIT.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-black/5 bg-cream p-4 text-sm leading-relaxed text-ink-soft/80 shadow-sm"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-dark" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-ink-soft/50">
            Note: this program is for ongoing referral partnerships. Looking for a sponsored trip or content
            collaboration instead?{" "}
            <a href="/collaborate" className="underline hover:text-ink">
              See our Creators &amp; Influencers program
            </a>
            .
          </p>
        </Container>
      </section>

      <section className="bg-sand-dim py-16">
        <Container>
          <SectionHeading
            eyebrow="Apply Now"
            title="Tell Us About Your Audience"
            description="We review every application personally — expect a response within a few business days."
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <AffiliateForm />
          </div>
        </Container>
      </section>
    </>
  );
}
