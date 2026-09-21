import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/dictionary";
import { breadcrumbJsonLd } from "@/content/seo";
import { loadExploreEgyptData } from "../data";
import { ExploreEgyptView } from "../ExploreEgyptView";
import { getDestinationHubs, getListingPages } from "@/sanity/fetchers";
import { resolveMetadata } from "@/content/seo";
import { trAll } from "@/i18n/T";

export async function generateStaticParams() {
  const hubs = await getDestinationHubs();
  return hubs.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hubs = await getDestinationHubs();
  const hub = hubs.find((h) => h.slug === slug);
  if (!hub) return {};

  const locale = await getLocale();
  const ui = await trAll([
    "{name} — Explore Egypt",
    "{tagline}. Discover the tours, experiences, and photoshoots Egypt Eye offers in {name}, and add them to your journey.",
  ]);

  return resolveMetadata({
    locale,
    title: ui["{name} — Explore Egypt"].replace("{name}", hub.name),
    description: ui["{tagline}. Discover the tours, experiences, and photoshoots Egypt Eye offers in {name}, and add them to your journey."]
      .replace("{tagline}", hub.tagline)
      .replace("{name}", hub.name),
    image: hub.image,
    path: `/explore-egypt/${hub.slug}`,
  });
}

export default async function ExploreEgyptDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ hubs, tours, experiences, photoshoots, stories }, listingPages] = await Promise.all([
    loadExploreEgyptData(),
    getListingPages(),
  ]);
  const selectedHub = hubs.find((h) => h.slug === slug);
  if (!selectedHub) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Explore Egypt", path: "/explore-egypt" },
    { name: selectedHub.name, path: `/explore-egypt/${selectedHub.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <ExploreEgyptView
        hubs={hubs}
        selectedHub={selectedHub}
        tours={tours}
        experiences={experiences}
        photoshoots={photoshoots}
        stories={stories}
        copy={listingPages.exploreEgypt}
      />
    </>
  );
}
