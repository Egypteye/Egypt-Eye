import type { MetadataRoute } from "next";
import {
  getAllSignatureExperienceSlugs,
  getAllTourSlugs,
  getDestinationHubs,
  getExperiences,
  getPhotoshoots,
  getStories,
} from "@/sanity/fetchers";
import { getEnabledHotels } from "@/lib/hotels";
import { siteUrl } from "@/content/seo";

// Slugs that 301-redirect elsewhere (see next.config.ts) — keep them out of
// the sitemap even if the underlying Sanity document hasn't been removed yet.
const REDIRECTED_STORY_SLUGS = new Set(["best-travel-agencies-in-egypt-2025-guide"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tourSlugs, experiences, photoshoots, signatureExperienceSlugs, stories, destinationHubs, hotels] =
    await Promise.all([
      getAllTourSlugs(),
      getExperiences(),
      getPhotoshoots(),
      getAllSignatureExperienceSlugs(),
      getStories(),
      getDestinationHubs(),
      getEnabledHotels(),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/explore-egypt`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/signature-experiences`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/tours`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/experiences`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/photoshoots`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/hotel-deals`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/pharaoh-challenge`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/transfers`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/stories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/customize`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/testimonials`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/travel-agents`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/collaborate`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const hotelRoutes: MetadataRoute.Sitemap = hotels.map((h) => ({
    url: `${siteUrl}/hotel-deals/${h.slug}`,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  const tourRoutes: MetadataRoute.Sitemap = tourSlugs.map((slug) => ({
    url: `${siteUrl}/tours/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const experienceRoutes: MetadataRoute.Sitemap = experiences.map((e) => ({
    url: `${siteUrl}/experiences/${e.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const photoshootRoutes: MetadataRoute.Sitemap = photoshoots.map((p) => ({
    url: `${siteUrl}/photoshoots/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const signatureExperienceRoutes: MetadataRoute.Sitemap = signatureExperienceSlugs.map((slug) => ({
    url: `${siteUrl}/signature-experiences/${slug}`,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const storyRoutes: MetadataRoute.Sitemap = stories
    .filter((s) => !REDIRECTED_STORY_SLUGS.has(s.slug))
    .map((s) => ({
      url: `${siteUrl}/stories/${s.slug}`,
      changeFrequency: "monthly",
      priority: 0.65,
      lastModified: s.publishedAt,
    }));

  const destinationRoutes: MetadataRoute.Sitemap = destinationHubs.map((d) => ({
    url: `${siteUrl}/explore-egypt/${d.slug}`,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...tourRoutes,
    ...experienceRoutes,
    ...photoshootRoutes,
    ...hotelRoutes,
    ...signatureExperienceRoutes,
    ...storyRoutes,
    ...destinationRoutes,
  ];
}
