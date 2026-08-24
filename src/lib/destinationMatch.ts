import type { DestinationHub, Experience, Photoshoot, Tour } from "@/content/types";

// Every destination hub actually relevant to a set of tours/experiences/
// photoshoots — matched via each hub's `matchNames` aliases against those
// items' own `destinations` tags. Shared by /my-journey and /my-egypt so
// both compute "which destinations is this visitor going to" the same way.
export function matchHubsForItems(
  allHubs: readonly DestinationHub[],
  items: { tours: Tour[]; experiences: Experience[]; photoshoots: Photoshoot[] }
): DestinationHub[] {
  const tags = [
    ...items.tours.flatMap((t) => t.destinations ?? []),
    ...items.experiences.flatMap((e) => e.destinations ?? []),
    ...items.photoshoots.flatMap((p) => p.destinations ?? []),
  ];
  return allHubs.filter((hub) => tags.some((tag) => hub.matchNames.includes(tag))).sort((a, b) => a.order - b.order);
}
