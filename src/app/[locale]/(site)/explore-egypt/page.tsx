import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { notFound } from "next/navigation";
import { loadExploreEgyptData } from "./data";
import { ExploreEgyptView } from "./ExploreEgyptView";
import { getListingPages } from "@/sanity/fetchers";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Explore Egypt — Interactive Destination Map",
    description:
      "An interactive map of Egypt's must-see destinations — Cairo, Luxor, Aswan, and the Red Sea coast — with real tours and experiences available at each.",
    alternates: alternatesFor("/explore-egypt", locale),
  };
}

export default async function ExploreEgyptPage() {
  const [{ hubs, tours, experiences, photoshoots, stories }, listingPages] = await Promise.all([
    loadExploreEgyptData(),
    getListingPages(),
  ]);
  const selectedHub = hubs[0];
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
