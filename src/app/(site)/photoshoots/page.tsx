import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { getListingPages, getPhotoshoots } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Pyramids & Flying Dress Photoshoots in Egypt",
  description:
    "Professional photoshoot packages in Egypt, including the Exclusive Pyramids Photoshoot and Egypt's first Flying Dress experience.",
};

export default async function PhotoshootsPage() {
  const [photoshoots, listingPages] = await Promise.all([getPhotoshoots(), getListingPages()]);
  const page = listingPages.photoshoots;

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="luxor" className="absolute inset-0" />
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
