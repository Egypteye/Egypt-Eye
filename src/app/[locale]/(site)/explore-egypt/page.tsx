import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { notFound } from "next/navigation";
import { loadExploreEgyptData } from "./data";
import { ExploreEgyptView } from "./ExploreEgyptView";
import { getListingPages } from "@/sanity/fetchers";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/explore-egypt"];
  return {
    title: meta.title,
    description: meta.description,
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
