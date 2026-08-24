import { getDestinationHubBySlug, getExperienceBySlug, getPhotoshootBySlug, getTourBySlug } from "@/sanity/fetchers";
import type { DestinationHub, Experience, Photoshoot, Tour } from "@/content/types";

export type JourneyRef = { type: "tour" | "experience" | "photoshoot" | "destination"; slug: string };

export type HydratedJourney = {
  tours: Tour[];
  experiences: Experience[];
  photoshoots: Photoshoot[];
  destinations: DestinationHub[];
};

// Resolves the lightweight { type, slug } refs from the visitor's
// localStorage "My Journey" shortlist back into full, live CMS records.
// Shared by /api/journey (My Journey page) and /api/reservations (pricing
// + eligibility at submission time) so both always see the same real data.
export async function hydrateJourneyRefs(items: JourneyRef[]): Promise<HydratedJourney> {
  const slugsFor = (type: JourneyRef["type"]) =>
    [...new Set(items.filter((i) => i?.type === type && typeof i.slug === "string").map((i) => i.slug))];

  const [tours, experiences, photoshoots, destinations] = await Promise.all([
    Promise.all(slugsFor("tour").map((slug) => getTourBySlug(slug))),
    Promise.all(slugsFor("experience").map((slug) => getExperienceBySlug(slug))),
    Promise.all(slugsFor("photoshoot").map((slug) => getPhotoshootBySlug(slug))),
    Promise.all(slugsFor("destination").map((slug) => getDestinationHubBySlug(slug))),
  ]);

  return {
    tours: tours.filter((t): t is Tour => Boolean(t)),
    experiences: experiences.filter((e): e is Experience => Boolean(e)),
    photoshoots: photoshoots.filter((p): p is Photoshoot => Boolean(p)),
    destinations: destinations.filter((d): d is DestinationHub => Boolean(d)),
  };
}
