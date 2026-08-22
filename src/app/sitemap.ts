import type { MetadataRoute } from "next";
import {
  getAllSignatureExperienceSlugs,
  getAllTourSlugs,
  getExperiences,
  getPhotoshoots,
  getStories,
} from "@/sanity/fetchers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypt-eye.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tourSlugs, experiences, photoshoots, signatureExperienceSlugs, stories] = await Promise.all([
    getAllTourSlugs(),
    getExperiences(),
    getPhotoshoots(),
    getAllSignatureExperienceSlugs(),
    getStories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/signature-experiences`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/tours`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/experiences`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/photoshoots`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/stories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/customize`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

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

  const storyRoutes: MetadataRoute.Sitemap = stories.map((s) => ({
    url: `${siteUrl}/stories/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.65,
    lastModified: s.publishedAt,
  }));

  return [
    ...staticRoutes,
    ...tourRoutes,
    ...experienceRoutes,
    ...photoshootRoutes,
    ...signatureExperienceRoutes,
    ...storyRoutes,
  ];
}
