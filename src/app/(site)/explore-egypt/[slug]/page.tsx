import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadExploreEgyptData } from "../data";
import { ExploreEgyptView } from "../ExploreEgyptView";
import { getDestinationHubs, getListingPages } from "@/sanity/fetchers";
import { resolveMetadata } from "@/content/seo";

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

  return resolveMetadata({
    title: `${hub.name} — Explore Egypt`,
    description: `${hub.tagline}. Discover the tours, experiences, and photoshoots Egypt Eye offers in ${hub.name}, and add them to your journey.`,
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

  return (
    <ExploreEgyptView
      hubs={hubs}
      selectedHub={selectedHub}
      tours={tours}
      experiences={experiences}
      photoshoots={photoshoots}
      stories={stories}
      copy={listingPages.exploreEgypt}
    />
  );
}
