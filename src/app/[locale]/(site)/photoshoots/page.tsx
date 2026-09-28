import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getListingPages, getPhotoshoots } from "@/sanity/fetchers";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/photoshoots"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/photoshoots", locale),
  };
}

export default async function PhotoshootsPage() {
  const ui = await trAll([
    "Ornately carved columns at Karnak Temple in Luxor",
    "Before You Book",
    "Photoshoot Questions, Answered",
  ]);

  const [photoshoots, listingPages] = await Promise.all([getPhotoshoots(), getListingPages()]);
  const page = listingPages.photoshoots;

  // Built from the exact pairs the accordion renders — structured data that
  // claims something the page doesn't show is a manual-action risk, not a
  // rich result. Mirrors photoshoots/[slug]/page.tsx.
  const faqJsonLd =
    page.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <section className="relative">
        <SmartImage
          image="/photos/pexels-17034971.jpg"
          tone="luxor"
          alt={ui["Ornately carved columns at Karnak Temple in Luxor"]}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{page.heroEyebrow}</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">{page.heroTitle}</h1>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading title={page.sectionTitle} description={page.sectionDescription} />
          <div className="mx-auto mt-10 grid max-w-4xl gap-6">
            {photoshoots.map((p) => (
              <PhotoshootCard key={p.slug} photoshoot={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* The questions travelers search before booking — price, photo count,
          delivery, payment, pickup. This page had none, while the product
          pages below it already publish theirs as structured data. */}
      {page.faqs.length > 0 && (
        <section className="bg-sand-dim py-20">
          <Container className="mx-auto max-w-3xl">
            <SectionHeading eyebrow={ui["Before You Book"]} title={ui["Photoshoot Questions, Answered"]} align="center" />
            <div className="mt-10">
              <FaqAccordion faqs={[...page.faqs]} />
            </div>
            <p className="mt-10 text-center text-sm text-ink-soft/70">
              <T>Still deciding? Tell us the date and we will confirm what is possible.</T>
            </p>
          </Container>
        </section>
      )}
    </>
  );
}
