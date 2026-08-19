import type { Experience, Photoshoot, Rating, Tour } from "./types";

// Derives real stats from whatever tour/experience/photoshoot data is passed
// in (local files or Sanity, via the fetchers) instead of hardcoding numbers
// — keeps homepage stat tiles honest as content is added or edited.

function allRatings(tours: Tour[], experiences: Experience[], photoshoots: Photoshoot[]) {
  return [...tours, ...experiences, ...photoshoots]
    .map((item) => item.rating)
    .filter((r): r is NonNullable<Rating> => r !== null);
}

export function getOverallRating(tours: Tour[], experiences: Experience[], photoshoots: Photoshoot[]) {
  const ratings = allRatings(tours, experiences, photoshoots);
  const totalReviews = ratings.reduce((sum, r) => sum + r.count, 0);
  const weightedScore =
    ratings.reduce((sum, r) => sum + r.score * r.count, 0) / (totalReviews || 1);
  return {
    average: Math.round(weightedScore * 100) / 100,
    reviewCount: totalReviews,
  };
}

export function getCatalogStats(tours: Tour[], experiences: Experience[], photoshoots: Photoshoot[]) {
  return {
    tourCount: tours.length,
    experienceCount: experiences.length,
    photoshootCount: photoshoots.length,
    destinationCount: new Set(tours.flatMap((t) => t.destinations)).size,
  };
}
