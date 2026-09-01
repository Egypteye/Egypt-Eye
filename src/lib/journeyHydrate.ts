import {
  getDestinationHubsBySlugs,
  getExperiencesBySlugs,
  getPhotoshootsBySlugs,
  getToursBySlugs,
} from "@/sanity/fetchers";
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
//
// One batched query per content type rather than one per saved item: this
// previously fanned out into a separate Sanity request for every slug — up
// to 50 per lookup, on two of the highest-intent pages on the site. The
// per-slug fallback, ordering and drop-if-missing behaviour is unchanged;
// the *BySlugs fetchers reuse the exact merge helpers the single-slug
// lookups use.
export async function hydrateJourneyRefs(items: JourneyRef[]): Promise<HydratedJourney> {
  const slugsFor = (type: JourneyRef["type"]) =>
    [...new Set(items.filter((i) => i?.type === type && typeof i.slug === "string").map((i) => i.slug))];

  const [tours, experiences, photoshoots, destinations] = await Promise.all([
    getToursBySlugs(slugsFor("tour")),
    getExperiencesBySlugs(slugsFor("experience")),
    getPhotoshootsBySlugs(slugsFor("photoshoot")),
    getDestinationHubsBySlugs(slugsFor("destination")),
  ]);

  return { tours, experiences, photoshoots, destinations };
}
