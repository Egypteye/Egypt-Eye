import { getDestinationHubs, getExperiences, getPhotoshoots, getStories, getTours } from "@/sanity/fetchers";
import type { DestinationHub, Experience, Photoshoot, Story, Tour } from "@/content/types";

// Shared by /explore-egypt and /explore-egypt/[slug] — both render the same
// map + destination panel, just with a different initial selection, so the
// data loading and destination-matching logic lives here once.

export async function loadExploreEgyptData() {
  const [hubs, tours, experiences, photoshoots, stories] = await Promise.all([
    getDestinationHubs(),
    getTours(),
    getExperiences(),
    getPhotoshoots(),
    getStories(),
  ]);
  return { hubs, tours, experiences, photoshoots, stories };
}

// A tour/experience/photoshoot/story is "in" a destination when one of its
// own free-text `destinations` tags matches one of that hub's `matchNames`
// aliases (e.g. a tour tagged "Siwa Oasis" matches the "Siwa" hub) — the
// same tag fields already used for filtering elsewhere on the site, not a
// new relationship to maintain.
function matchesHub(tags: string[] | undefined, hub: DestinationHub): boolean {
  if (!tags || tags.length === 0) return false;
  return tags.some((t) => hub.matchNames.includes(t));
}

export function toursForHub(tours: Tour[], hub: DestinationHub): Tour[] {
  return tours.filter((t) => matchesHub(t.destinations, hub));
}

export function experiencesForHub(experiences: Experience[], hub: DestinationHub): Experience[] {
  return experiences.filter((e) => matchesHub(e.destinations, hub));
}

export function photoshootsForHub(photoshoots: Photoshoot[], hub: DestinationHub): Photoshoot[] {
  return photoshoots.filter((p) => matchesHub(p.destinations, hub));
}

export function storiesForHub(stories: Story[], hub: DestinationHub): Story[] {
  return stories.filter((s) => matchesHub(s.destinations, hub));
}
