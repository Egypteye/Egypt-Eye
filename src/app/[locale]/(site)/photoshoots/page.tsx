import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { getListingPages, getPhotoshoots } from "@/sanity/fetchers";
import { trAll } from "@/i18n/T";

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
  ]);

  const [photoshoots, listingPages] = await Promise.all([getPhotoshoots(), getListingPages()]);
  const page = listingPages.photoshoots;

  return (
    <>
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
    </>
  );
}
