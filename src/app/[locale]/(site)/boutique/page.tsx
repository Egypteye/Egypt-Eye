import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";
import { TREASURES_PATH } from "@/content/treasures";
import { getBoutiquePage, getTreasureCategories } from "@/sanity/fetchers";
import { breadcrumbJsonLd, faqJsonLd, resolveMetadata } from "@/content/seo";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { localizeContent } from "@/i18n/localizeDeep";
import { T, trAll } from "@/i18n/T";
import type { Faq } from "@/content/types";

// The gateway. It explains the idea and sends people into one of four rooms;
// it deliberately does not list products from all four, because the four have
// almost nothing in common at the point of buying and a merged grid would ask
// a visitor to compare a silver pendant with a bottle of oil.
//
// The two-journey split is the organising idea of the whole section and it is
// stated here before any product is shown. See docs/boutique.md.
//
// Named "Take Egypt Home" until the rename. "The Boutique" carries the shop;
// "Shop & Collect" is the eyebrow above it, because it is the mechanic — you
// buy it now, you collect it there — and a mechanic reads as a service rather
// than as a subtitle in brackets.

const TITLE = "The Boutique";
/** The line under the name, everywhere the name is presented as a section. */
const SLOGAN = "Take a little piece of Egypt home.";
const DESCRIPTION =
  "Shop and collect: a cartouche in your own name, a papyrus with your own face in it, Egyptian clothing fitted in person, or fragrance oils chosen by smelling them. Ordered before you fly, finished and waiting when you land.";

const LANDING_FAQS: Faq[] = [
  {
    question: "How does buying actually work?",
    answer:
      "You choose the piece and tell us the details; we come back with the specification, the price and the date it can be ready; you decide then. Nothing is charged on this page. Everything here is made or fitted to order, so the price depends on what you choose — which is why it is confirmed by a person rather than guessed by a checkout.",
  },
  {
    question: "Why order before I arrive?",
    answer:
      "Because anything personalised takes time to make, and the alternative is spending an afternoon of a short trip trying to arrange it from a hotel lobby. Telling us your arrival date is the whole trick: the piece is made while you are still at home, so it is finished rather than started when you land.",
  },
  {
    question: "What if I am already in Egypt?",
    answer:
      "Say so and we will tell you honestly what is possible in the days you have left. For clothing and fragrance being here is an advantage rather than a problem — both are better chosen in person, and we arrange the appointment.",
  },
  {
    question: "Do I have to be booked on a tour with you?",
    answer:
      "No. The Boutique is open to anyone travelling to Egypt. It is more useful if we are already arranging your trip, because we know your dates and where you will be, but it is not a condition.",
  },
  {
    question: "How do I actually collect what I order?",
    answer:
      "That is agreed with you when we confirm the piece, because it depends on where you are staying and how your itinerary runs. It is one of the things the reply covers, rather than something we decide for you in advance.",
  },
  {
    question: "Can I have something sent to me instead?",
    answer:
      "Ask. The Boutique is built around collecting on your trip, which is what makes it different from ordering online from home, so shipping is handled case by case rather than promised on this page.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    ...resolveMetadata({
      title: `${TITLE} — Shop & Collect: Cartouches, Papyrus, Clothing & Essence Oils`,
      description: DESCRIPTION,
      path: TREASURES_PATH,
      locale,
    }),
    alternates: alternatesFor(TREASURES_PATH, locale),
  };
}

export default async function BoutiquePage() {
  const locale = await getLocale();
  const to = (path: string) => localePath(path, locale);

  // Every field falls back to the copy that ships in this file, so an empty
  // Studio document renders exactly what the repo does and editing one field
  // does not require filling in the other twelve.
  const [page, rawCategories] = await Promise.all([getBoutiquePage(), getTreasureCategories()]);
  const categories = await localizeContent(rawCategories, locale);
  const faqs = await localizeContent(page?.faqs?.length ? page.faqs : LANDING_FAQS, locale);
  const copy = await localizeContent(
    {
      heroEyebrow: page?.heroEyebrow ?? "Shop & Collect",
      heroTitle: page?.heroTitle ?? "The Boutique",
      heroSubtitle: page?.heroSubtitle ?? SLOGAN,
      intro:
        page?.intro ??
        "Four things Egypt makes properly, made to order and collected on your trip. The good pieces take time, which is the one thing a traveller never has and a travel company always does — we already know your dates. Order before you fly and it is finished, not started, when you land.",
      categoriesEyebrow: page?.categoriesEyebrow ?? "Shop",
      categoriesTitle: page?.categoriesTitle ?? "Four collections",
      journeysTitle: page?.journeysTitle ?? "Two ways to shop and collect",
      giftsTitle: page?.giftsTitle ?? "The pieces you bring back for other people",
      giftsBody:
        page?.giftsBody ??
        "A cartouche carries a name, so it is the rare gift that cannot be bought for the wrong person. A papyrus can hold a family that never came on the trip. An oil is small enough to bring six of. If you tell us who they are for, we will tell you which of the four actually suits them.",
      giftsCtaLabel: page?.giftsCtaLabel ?? "Shop cartouches",
    },
    locale
  );
  const ui = await trAll(["Explore", "Souvenirs worth bringing home"]);

  const breadcrumbs = breadcrumbJsonLd([{ name: TITLE, path: TREASURES_PATH }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      {/* Hero */}
      <section className="relative">
        <SmartImage
          image={
            page?.heroImage ??
            "https://images.unsplash.com/photo-1783713335436-d4fc69a6d8c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
          }
          tone="desert"
          alt="Egyptian cartouches, papyrus, clothing and fragrance oils"
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        {/* Three lines and nothing else. The mechanic sits above the name as a
            label, the name is the h1, and the slogan carries the feeling — the
            substance moves to the band directly below, which is what keeps a
            shop front feeling like a shop front rather than a page of copy. */}
        <Container className="relative flex min-h-[52vh] flex-col justify-end gap-4 pb-16 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{copy.heroEyebrow}</p>
          <h1 className="max-w-3xl font-display text-5xl font-semibold text-cream sm:text-6xl">{copy.heroTitle}</h1>
          <p className="max-w-2xl font-display text-xl leading-relaxed text-cream/90 sm:text-2xl">
            {copy.heroSubtitle}
          </p>
        </Container>
      </section>

      {/* Why this exists */}
      <section className="border-b border-black/5 bg-sand/40 py-16">
        <Container className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-ink-soft">{copy.intro}</p>
        </Container>
      </section>

      {/* The four rooms */}
      <section className="py-16">
        <Container>
          <Reveal>
            <SectionHeading eyebrow={copy.categoriesEyebrow} title={copy.categoriesTitle} align="center" />
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {categories.map((category, i) => (
              <Reveal key={category.slug} delay={i * 80}>
                <Link
                  href={to(`${TREASURES_PATH}/${category.slug}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-cream shadow-sm transition hover:shadow-xl hover:shadow-black/5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <SmartImage
                      image={category.image}
                      tone="desert"
                      alt={category.imageAlt ?? category.title}
                      className="h-full w-full transition duration-700 group-hover:scale-105"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
                        {category.eyebrow}
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-semibold text-cream">{category.title}</h3>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm font-semibold text-gold-dark">{category.cardHook}</p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{category.cardBlurb}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-gold-dark">
                      <T>See the collection</T> <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* The two journeys */}
      <section className="bg-sand-dim py-16">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="How it works" title={copy.journeysTitle} align="center" />
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-gold/20 bg-cream p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  <T>Before you arrive</T>
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                  <T>Made while you pack</T>
                </h3>
                <ol className="mt-6 space-y-4">
                  {["Choose", "Personalise", "We confirm the price", "It gets made", "Collect on your trip"].map(
                    (step, i) => (
                      <li key={step} className="flex gap-4">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-ink-soft">
                          <T>{step}</T>
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="h-full rounded-3xl border border-black/5 bg-cream p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  <T>Already in Egypt</T>
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                  <T>Seen, tried, chosen</T>
                </h3>
                <ol className="mt-6 space-y-4">
                  {["Tell us your dates", "We check what's there", "We book the appointment", "Visit and try", "Take it with you"].map(
                    (step, i) => (
                      <li key={step} className="flex gap-4">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-cream">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-ink-soft">
                          <T>{step}</T>
                        </span>
                      </li>
                    )
                  )}
                </ol>
                <p className="mt-6 text-sm leading-relaxed text-ink-soft/85">
                  <T>
                    Best for clothing and fragrance, where fit and scent are not screen decisions.
                  </T>
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Gifts */}
      <section className="py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  <T>Gifts</T>
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-ink">{copy.giftsTitle}</h2>
                <p className="mt-4 leading-relaxed text-ink-soft">{copy.giftsBody}</p>
                <Link
                  href={to(`${TREASURES_PATH}/cartouches`)}
                  className="mt-6 inline-block rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  {copy.giftsCtaLabel}
                </Link>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-3xl border border-black/5 bg-sand-dim p-8">
                <p className="font-display text-lg font-semibold text-ink">
                  <T>Not sure what to buy in Egypt at all?</T>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  <T>
                    We wrote a guide to the things worth bringing home and the things that are not, independent of
                    whether you buy them from us.
                  </T>
                </p>
                <Link
                  href={to("/stories/best-souvenirs-to-buy-in-egypt")}
                  className="mt-4 inline-block text-sm font-semibold text-gold-dark underline-offset-4 hover:underline"
                >
                  {ui["Souvenirs worth bringing home"]} →
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="bg-sand/40 py-16">
        <Container className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow="Questions" title="Before you ask" align="center" />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <FaqAccordion faqs={faqs} idPrefix="boutique" />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
