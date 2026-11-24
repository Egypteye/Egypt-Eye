import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SmartImage } from "@/components/SmartImage";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getTours } from "@/sanity/fetchers";
import { getLocale } from "@/i18n/dictionary";
import { alternatesFor } from "@/i18n/alternates";
import { breadcrumbJsonLd, faqJsonLd, siteUrl } from "@/content/seo";
import { jsonLdScript } from "@/content/jsonLd";
import {
  CAMPAIGN_ACTIVE,
  CAMPAIGN_COPY,
  PACKAGES,
  PARTY_DATE,
  HERO_IMAGE,
  VILLA_PARTY,
  campaignDate,
  campaignFaqs,
  packageDateRange,
  partyIsUpcoming,
} from "@/content/shakiraCampaign";
import { CampaignEnquiryForm } from "./CampaignEnquiryForm";

// The campaign page.
//
// Every fact it shows comes from src/content/shakiraCampaign.ts, so the owner
// can change a date, retire a package or publish the villa details without
// anyone reading this file. What lives here is layout.
//
// Deliberately NOT in the main navigation: this is a campaign with a four-day
// life, reached from a small section at the foot of the homepage and from its
// own URL. Putting it in the nav would reshape the site for one weekend.
//
// WHY THERE IS NO Event SCHEMA. An Event needs a location and a startDate,
// and we have neither: the villa is not booked and no time has been agreed.
// Publishing Event markup with a placeholder venue is exactly the misleading
// structured data Google penalises, so the page carries BreadcrumbList and
// FAQPage — both of which describe things that are actually true — and
// nothing else. Add Event when the venue is confirmed, not before.

const PATH = CAMPAIGN_COPY.path;
const PAGE_URL = `${siteUrl}${PATH}`;
// No "| Egypt Eye" suffix and no second "Egypt Eye": the root layout's title
// template appends the brand, and the first draft of this rendered as
// "Egypt Eye Got You | ... | Egypt Eye" at 90 characters, which Google
// truncates in the middle of the date.
const TITLE = "Egypt Eye Got You \u2014 Tours & One Night, 28 November 2026";
const DESCRIPTION =
  "The concert was postponed \u2014 your Egypt trip doesn't have to be. Private tours across Giza, Cairo, Fayoum and Alexandria, ending with one exclusive Egypt Eye celebration on 28 November 2026.";
const SHARE_IMAGE = `${siteUrl}/brand/egypt-eye-badge-gold.png`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: TITLE,
    description: DESCRIPTION,
    // A retired campaign should stop being offered to search engines. The
    // page still answers — an old link must not 404 — it simply asks not to
    // be indexed once the night has passed.
    robots: CAMPAIGN_ACTIVE ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      title: "Shakira let you down? Egypt Eye got you.",
      description: DESCRIPTION,
      url: PAGE_URL,
      images: [{ url: SHARE_IMAGE, width: 1200, height: 1200, alt: "Egypt Eye Travel" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
    // alternatesFor, not a hand-written canonical: a literal string here is
    // how this site produced a duplicate-canonical incident before.
    alternates: alternatesFor(PATH, locale),
  };
}

export default async function ShakiraCampaignPage() {
  const tours = await getTours();
  const imageFor = (slug: string) => tours.find((t) => t.slug === slug);
  const upcoming = partyIsUpcoming();

  const faqs = campaignFaqs();

  if (!CAMPAIGN_ACTIVE) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">This campaign has ended</h1>
        <p className="mt-3 text-ink-soft">
          <Link href="/tours" className="underline">
            See what else we run in Egypt
          </Link>
        </p>
      </Container>
    );
  }

  const schema = [
    breadcrumbJsonLd([{ name: "Egypt Eye Got You", path: PATH }]),
    faqJsonLd(faqs),
  ];

  return (
    <>
      {schema.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(s) }}
        />
      ))}

      {/* ---------------------------------------------------------------- */}
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
        {/* opacity-60, not 35: at 35 the photograph read as a green smear
            rather than as Egypt. The legibility that the opacity used to buy
            now comes from the gradient below, which is weighted to the left
            where the text actually sits. */}
        <div className="absolute inset-0 opacity-60">
          <SmartImage
            image={HERO_IMAGE.url}
            tone="giza"
            alt=""
            priority
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
        <Container className="relative">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              {campaignDate(PARTY_DATE)} 2026
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-cream sm:text-6xl">
              {CAMPAIGN_COPY.headline}
              <br />
              <span className="text-gold">{CAMPAIGN_COPY.headlineTwo}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg font-semibold text-cream/90">{CAMPAIGN_COPY.supporting}</p>
            <p className="mt-4 max-w-2xl text-cream/75">{CAMPAIGN_COPY.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#experiences"
                className="rounded-full bg-gold px-7 py-4 text-sm font-semibold text-ink transition hover:bg-cream"
              >
                Explore experiences
              </a>
              <a
                href="#the-night"
                className="rounded-full border border-cream/30 px-7 py-4 text-sm font-semibold text-cream transition hover:bg-cream/10"
              >
                Discover the party
              </a>
            </div>
            <p className="mt-8 max-w-xl text-xs leading-relaxed text-cream/50">{CAMPAIGN_COPY.disclaimer}</p>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The idea */}
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">The idea</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                You came for a night. Stay for the country.
              </h2>
              <p className="mt-5 text-ink-soft">
                Plenty of people booked flights to Egypt around one date in November. The concert moved;
                the flights mostly did not. So we built four short journeys for the days you are already
                here — the Pyramids, the desert, the Mediterranean, old Cairo — and gave them all the same
                ending.
              </p>
              <p className="mt-4 text-sm text-ink-soft/85">{CAMPAIGN_COPY.scope}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The four packages */}
      <section id="experiences" className="scroll-mt-24 bg-sand-dim py-16 sm:py-20">
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Choose your experience</h2>
            <p className="mt-3 max-w-2xl text-ink-soft">
              Four journeys, one ending. Every package finishes at the same villa party on{" "}
              {campaignDate(PARTY_DATE)}.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {PACKAGES.map((pkg) => (
              <Reveal key={pkg.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gold/15 bg-cream shadow-sm">
                  <div className="relative h-52 w-full overflow-hidden">
                    <SmartImage
                      image={imageFor(pkg.imageSlug)?.image}
                      tone={imageFor(pkg.imageSlug)?.imageTone ?? "giza"}
                      alt={`${pkg.destinations.join(", ")} — Egypt Eye`}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-gold">
                      {pkg.number}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl font-semibold text-ink">{pkg.name}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
                      {pkg.durationDays} day{pkg.durationDays === 1 ? "" : "s"} · {packageDateRange(pkg)}
                    </p>
                    <p className="mt-3 text-sm text-ink-soft">{pkg.summary}</p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {pkg.destinations.map((d) => (
                        <li key={d} className="rounded-full bg-sand-deep px-3 py-1 text-xs font-semibold text-ink-soft">
                          {d}
                        </li>
                      ))}
                    </ul>

                    {/* Day-by-day. Collapsed on mobile so four packages do not
                        become a wall of text; open on request. */}
                    <details className="group mt-5">
                      {/* -my-2 py-3 keeps the visual position but gives the
                          control a 44px touch height. Measured at 20px on an
                          iPhone 13 before this, which is under the minimum and
                          genuinely hard to hit. */}
                      <summary className="-my-2 cursor-pointer list-none py-3 text-sm font-semibold text-gold-dark underline-offset-4 hover:underline">
                        See the day-by-day
                      </summary>
                      <ol className="mt-4 flex flex-col gap-4 border-l border-gold/25 pl-4">
                        {pkg.days.map((day, i) => (
                          <li key={day.date}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                              Day {i + 1} · {campaignDate(day.date)} · {day.place}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-ink">{day.title}</p>
                            <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-soft">
                              {day.stops.map((stop) => (
                                <li key={stop.label} className="flex gap-2">
                                  <span aria-hidden="true" className="text-gold">
                                    ·
                                  </span>
                                  <span>
                                    {stop.label}
                                    {stop.pending && (
                                      <span className="ml-1 text-xs italic text-ink-soft/70">
                                        ({stop.pending})
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {day.endsAtParty && (
                              <p className="mt-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-gold">
                                Ends at the shared villa party
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </details>

                    {/* #enquire-<id>, not #enquire: the form reads the hash
                        and preselects the package, so the enquiry that
                        arrives names the journey they were reading about. */}
                    <a
                      href={`#enquire-${pkg.id}`}
                      className="mt-6 rounded-full bg-ink px-5 py-3.5 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"
                    >
                      Enquire about this package
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The night */}
      <section id="the-night" className="scroll-mt-24 bg-ink py-16 text-cream sm:py-20">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                {campaignDate(PARTY_DATE)} 2026
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                {CAMPAIGN_COPY.partyHeadline}
              </h2>
              <p className="mt-5 text-cream/80">{CAMPAIGN_COPY.partyBody}</p>
              <p className="mt-4 text-cream/70">{VILLA_PARTY.intent}</p>

              {/* The honest gate. While the villa is unbooked the page says so
                  rather than inventing an address, a start time or a pool. */}
              <div className="mt-8 rounded-2xl border border-gold/25 bg-cream/5 p-6">
                {VILLA_PARTY.venueConfirmed ? (
                  <>
                    <p className="font-display text-xl font-semibold text-gold">{VILLA_PARTY.venueName}</p>
                    {VILLA_PARTY.venueAddress && <p className="mt-1 text-sm text-cream/80">{VILLA_PARTY.venueAddress}</p>}
                    {VILLA_PARTY.startsAt && (
                      <p className="mt-1 text-sm text-cream/80">
                        From {VILLA_PARTY.startsAt}
                        {VILLA_PARTY.endsAt ? ` until ${VILLA_PARTY.endsAt}` : ""}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-cream/85">{VILLA_PARTY.holdingLine}</p>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why us — capabilities only, no invented awards or ratings */}
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Why Egypt Eye</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["We live here", "Egyptian team, Egyptian guides, and the local knowledge that comes with it."],
                ["Private, not coach tours", "Your group, your pace, your car."],
                ["Photography built in", "Professional shoots at the Pyramids are part of what we do, not an upsell."],
                ["Curated, not catalogue", "These four journeys were built for this week, not pulled off a shelf."],
                ["Egyptologist guides", "Private guides who can actually answer the question you asked."],
                ["We answer", "A real person on WhatsApp, before and during your trip."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-gold/15 bg-cream p-6">
                  <p className="font-display text-lg font-semibold text-ink">{title}</p>
                  <p className="mt-2 text-sm text-ink-soft">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Enquiry */}
      <section id="enquire" className="scroll-mt-24 bg-sand-dim py-16 sm:py-20">
        {/* One anchor per package, so a card's "enquire" link both scrolls
            here AND tells the form which package to preselect. Without a real
            element carrying the id the browser would not scroll at all. */}
        {PACKAGES.map((p) => (
          <span key={p.id} id={`enquire-${p.id}`} aria-hidden="true" className="block scroll-mt-24" />
        ))}
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {upcoming ? "Find your experience" : "Tell us what you are after"}
            </h2>
            <p className="mt-3 text-ink-soft">{CAMPAIGN_COPY.enquiryNote}</p>
            <div className="mt-8">
              <CampaignEnquiryForm />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Questions</h2>
            <div className="mt-8">
              <FaqAccordion faqs={faqs} idPrefix="campaign-faq" />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="bg-ink py-16 text-center text-cream sm:py-20">
        <Container>
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
              {CAMPAIGN_COPY.finalHeadline}
            </h2>
            <a
              href="#experiences"
              className="mt-8 inline-block rounded-full bg-gold px-8 py-4 text-sm font-semibold text-ink transition hover:bg-cream"
            >
              Find your experience
            </a>
            <p className="mx-auto mt-10 max-w-xl text-xs leading-relaxed text-cream/50">
              {CAMPAIGN_COPY.disclaimer}
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
