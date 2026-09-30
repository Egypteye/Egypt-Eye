import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { FaqAccordion } from "@/components/FaqAccordion";
import { allHubFaqs, faqGroups } from "@/content/faqHub";
import { breadcrumbJsonLd, faqJsonLd } from "@/content/seo";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { localizeContent } from "@/i18n/localizeDeep";
import { T, trAll } from "@/i18n/T";

// The canonical home for the questions whose answer does not change between
// products. It exists so the other 40-odd product pages do not each have to
// carry the deposit, the currencies and the cancellation terms — see the
// comment at the top of content/faqHub.ts for the split.
//
// This is the only page on the site that emits FAQPage structured data for
// policy questions. The homepage shows a short teaser of the same answers and
// deliberately emits none, because two pages claiming the same FAQ entity is
// how you get neither of them shown.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const ui = await trAll([
    "Frequently Asked Questions",
    "Deposits, payment, children's pricing, cancellations and how our private tours actually run — answered by Egypt Eye Travel and Tours.",
  ]);
  return {
    title: ui["Frequently Asked Questions"],
    description:
      ui[
        "Deposits, payment, children's pricing, cancellations and how our private tours actually run — answered by Egypt Eye Travel and Tours."
      ],
    alternates: alternatesFor("/faq", locale),
  };
}

export default async function FaqPage() {
  const locale = await getLocale();
  const to = (path: string) => localePath(path, locale);
  const groups = await localizeContent(faqGroups, locale);
  const ui = await trAll(["Still have a question?", "Message us on WhatsApp"]);

  const breadcrumbs = breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(allHubFaqs)) }}
      />

      <section className="py-20 sm:py-24">
        <Container className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
            <T>Before You Book</T>
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            <T>Frequently Asked Questions</T>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            <T>
              The questions below have the same answer whatever you book with us. Anything specific to one
              tour, photoshoot or trip is answered on that page, where it can be specific.
            </T>
          </p>

          {/* An in-page index. On a phone this is the difference between a
              page you can use and one you scroll past — and the anchors are
              real headings, so a link shared to a specific answer still
              lands on it. */}
          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-gold/40 hover:text-ink"
              >
                {group.title}
              </a>
            ))}
          </nav>

          <div className="mt-14 space-y-14">
            {groups.map((group) => (
              <div key={group.id} id={group.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-semibold text-ink">{group.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{group.intro}</p>
                <div className="mt-6">
                  <FaqAccordion faqs={group.faqs} idPrefix={group.id} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-black/5 bg-cream p-8 text-center">
            <p className="font-display text-xl font-semibold text-ink">{ui["Still have a question?"]}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              <T>
                Ask us directly — we answer the awkward ones too, including the ones about what is not
                included.
              </T>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={to("/customize")}
                className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
              >
                <T>Build your trip</T>
              </Link>
              <Link
                href={to("/tours")}
                className="rounded-full border border-black/10 px-7 py-3 text-sm font-semibold text-ink-soft transition hover:border-gold/40 hover:text-ink"
              >
                <T>Browse tours</T>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
