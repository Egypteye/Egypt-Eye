import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadExploreEgyptData } from "./data";
import { ExploreEgyptView } from "./ExploreEgyptView";
import { getListingPages } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Explore Egypt — Interactive Destination Map",
  description:
    "An interactive map of Egypt's must-see destinations — Cairo, Giza, Luxor, Aswan, Abu Simbel, Siwa, and the Red Sea coast — with the real tours, experiences, and photoshoots available at each.",
};

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
