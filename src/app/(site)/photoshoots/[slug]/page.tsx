import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { Rating } from "@/components/Rating";
import { PriceTag } from "@/components/PriceTag";
import { Gallery } from "@/components/Gallery";
import { AddToJourneyButton } from "@/components/AddToJourneyButton";
import { EnquiryButton } from "@/components/EnquiryButton";
import { WhatsAppBookButton } from "@/components/WhatsAppBookButton";
import { getPhotoshootBySlug, getPhotoshoots, getSiteSettings } from "@/sanity/fetchers";
import { breadcrumbJsonLd, resolveMetadata, touristTripJsonLd } from "@/content/seo";

export async function generateStaticParams() {
  const photoshoots = await getPhotoshoots();
  return photoshoots.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const photoshoot = await getPhotoshootBySlug(slug);
  if (!photoshoot) return {};
  return resolveMetadata({
    title: photoshoot.title,
    description: photoshoot.description,
    seo: photoshoot.seo,
    image: photoshoot.image,
    path: `/photoshoots/${photoshoot.slug}`,
  });
}

export default async function PhotoshootDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [photoshoot, site] = await Promise.all([getPhotoshootBySlug(slug), getSiteSettings()]);
  if (!photoshoot) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Photoshoots", path: "/photoshoots" },
    { name: photoshoot.title, path: `/photoshoots/${photoshoot.slug}` },
  ]);
  const touristTrip = touristTripJsonLd({
    name: photoshoot.title,
    description: photoshoot.description,
    image: photoshoot.image,
    path: `/photoshoots/${photoshoot.slug}`,
    rating: photoshoot.rating,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTrip) }} />
    <section className="py-14">
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SmartImage
            image={photoshoot.image}
            tone={photoshoot.imageTone}
            alt={photoshoot.title}
            label={photoshoot.locations.join(" · ")}
            priority
            className="aspect-[16/10] w-full rounded-2xl"
          />
          <h1 className="mt-8 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {photoshoot.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft/70">
            <span>⏱ {photoshoot.duration}</span>
            <Rating rating={photoshoot.rating} />
          </div>
          <p className="mt-5 leading-relaxed text-ink-soft/80">
            {photoshoot.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {photoshoot.goodFor.map((g) => (
              <span
                key={g}
                className="rounded-full bg-sand-dim px-3 py-1.5 text-xs font-medium text-ink-soft/70"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Included
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft/80">
                {photoshoot.included.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nile">✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            {photoshoot.addOns && (
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">
                  Optional Add-Ons
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft/80">
                  {photoshoot.addOns.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gold-dark">+</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink">
              What you receive
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft/80">
              {photoshoot.delivery.map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold-dark">✦</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>

          {photoshoot.gallery && photoshoot.gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-semibold text-ink">Gallery</h2>
              <div className="mt-4">
                <Gallery images={photoshoot.gallery} alt={photoshoot.title} />
              </div>
            </div>
          )}

          <Link
            href="/photoshoots"
            className="mt-10 inline-block text-sm font-semibold text-gold-dark hover:underline"
          >
            ← Back to all photoshoot packages
          </Link>
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-cream p-6 shadow-sm lg:sticky lg:top-24">
          <PriceTag price={photoshoot.price} />
          <p className="mt-1 text-xs text-ink-soft/60">per session</p>
          <WhatsAppBookButton
            whatsappLink={site.contact.whatsappLink}
            context={{ page: "this photoshoot's page", item: photoshoot.title }}
            className="mt-5 block w-full rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            Book on WhatsApp
          </WhatsAppBookButton>
          <EnquiryButton itemType="photoshoot" itemTitle={photoshoot.title} itemSlug={photoshoot.slug} className="mt-3" />

          <div className="mt-4 border-t border-black/5 pt-4">
            <AddToJourneyButton
              type="photoshoot"
              slug={photoshoot.slug}
              title={photoshoot.title}
              subtitle={photoshoot.duration}
              className="w-full justify-center"
            />
          </div>
        </aside>
      </Container>
    </section>
    </>
  );
}
