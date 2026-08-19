import { tours } from "./tours";
import { experiences } from "./experiences";
import { photoshoots } from "./photoshoots";

// Derives real stats from the content data instead of hardcoding numbers —
// keeps homepage stat tiles honest as tours/experiences/photoshoots are added.

function allRatings() {
  return [...tours, ...experiences, ...photoshoots]
    .map((item) => item.rating)
    .filter((r): r is { score: number; count: number } => r !== null);
}

export function getOverallRating() {
  const ratings = allRatings();
  const totalReviews = ratings.reduce((sum, r) => sum + r.count, 0);
  const weightedScore =
    ratings.reduce((sum, r) => sum + r.score * r.count, 0) / (totalReviews || 1);
  return {
    average: Math.round(weightedScore * 100) / 100,
    reviewCount: totalReviews,
  };
}

export const catalogStats = {
  tourCount: tours.length,
  experienceCount: experiences.length,
  photoshootCount: photoshoots.length,
  destinationCount: new Set(tours.flatMap((t) => t.destinations)).size,
};
