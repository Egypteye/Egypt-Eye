import Link from "next/link";
import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { AffiliateForm } from "./AffiliateForm";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/affiliate"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/affiliate", locale),
  };
}

export default async function AffiliatePage() {
  const ui = await trAll([
    "A Good Fit, Not a Follower Count",
    "Apply Now",
    "Built to Reward Real Recommendations",
    "Golden sand dunes in the Egyptian desert at Siwa Oasis",
    "How It Works",
    "Tell Us About Your Audience",
    "Three Steps to Your First Payout",
    "We review every application personally — expect a response within a few business days.",
    "Who It's For",
    "Why Join",
    "A Personal Referral Code",
    "Your own code, credited to every booking it brings in — no spreadsheets, no guesswork on your end.",
    "Real Commission, Every Booking",
    "Earn on every confirmed tour, experience, or photoshoot your code is used on — not just a one-time flat fee.",
    "A Discount for Your Audience",
    "Your code also gives the people you send us a genuine discount, so it's an easy recommendation, not a hard sell.",
    "Monthly Payouts",
    "Commission is tallied and paid out monthly by PayPal or bank transfer — no minimum threshold games.",
    "Apply",
    "Tell us where you'd share Egypt Eye — a couple of minutes, no commitment.",
    "Get Your Code",
    "Once approved, we'll email your personal referral code and link, ready to share.",
    "Earn as You Refer",
    "Share it however fits your audience — every booking it brings in earns you commission.",
    "Travel bloggers and YouTubers covering Egypt, Jordan, or the wider Middle East",
    "Newsletter writers or communities with travel-curious readers",
    "Deal/coupon sites and travel-planning tools",
    "Anyone with an audience who trusts your travel recommendations",
    "Note: this program is for ongoing referral partnerships. Looking for a sponsored trip or content collaboration instead?",
  ]);

  const BENEFITS = [
    { title: ui["A Personal Referral Code"], description: ui["Your own code, credited to every booking it brings in — no spreadsheets, no guesswork on your end."] },
    { title: ui["Real Commission, Every Booking"], description: ui["Earn on every confirmed tour, experience, or photoshoot your code is used on — not just a one-time flat fee."] },
    { title: ui["A Discount for Your Audience"], description: ui["Your code also gives the people you send us a genuine discount, so it's an easy recommendation, not a hard sell."] },
    { title: ui["Monthly Payouts"], description: ui["Commission is tallied and paid out monthly by PayPal or bank transfer — no minimum threshold games."] },
  ];

  const STEPS = [
    { title: ui["Apply"], description: ui["Tell us where you'd share Egypt Eye — a couple of minutes, no commitment."] },
    { title: ui["Get Your Code"], description: ui["Once approved, we'll email your personal referral code and link, ready to share."] },
    { title: ui["Earn as You Refer"], description: ui["Share it however fits your audience — every booking it brings in earns you commission."] },
  ];

  const GOOD_FIT = [
    ui["Travel bloggers and YouTubers covering Egypt, Jordan, or the wider Middle East"],
    ui["Newsletter writers or communities with travel-curious readers"],
    ui["Deal/coupon sites and travel-planning tools"],
    ui["Anyone with an audience who trusts your travel recommendations"],
  ];

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-16580393.jpg"
          tone="desert"
          alt={ui["Golden sand dunes in the Egyptian desert at Siwa Oasis"]}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light"><T>Affiliate Program</T></p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl"><T>Earn Commission Recommending Egypt Eye</T></h1>
          <p className="max-w-xl text-[15px] text-cream/80"><T>A personal referral code, real commission on every booking it brings in, and a discount your audience will actually thank you for.</T></p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow={ui["Why Join"]} title={ui["Built to Reward Real Recommendations"]} />
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
          <SectionHeading eyebrow={ui["How It Works"]} title={ui["Three Steps to Your First Payout"]} align="center" />
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
          <SectionHeading eyebrow={ui["Who It's For"]} title={ui["A Good Fit, Not a Follower Count"]} />
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
            {ui["Note: this program is for ongoing referral partnerships. Looking for a sponsored trip or content collaboration instead?"]}{" "}
            <Link href="/collaborate" className="underline hover:text-ink"><T>See our Creators & Influencers program</T></Link>
            .
          </p>
        </Container>
      </section>

      <section className="bg-sand-dim py-16">
        <Container>
          <SectionHeading
            eyebrow={ui["Apply Now"]}
            title={ui["Tell Us About Your Audience"]}
            description={ui["We review every application personally — expect a response within a few business days."]}
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <AffiliateForm />
          </div>
        </Container>
      </section>
    </>
  );
}
