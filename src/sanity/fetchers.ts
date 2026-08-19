import { client } from "./client";
import {
  experienceBySlugQuery,
  experiencesQuery,
  faqsQuery,
  photoshootBySlugQuery,
  photoshootsQuery,
  storiesQuery,
  storyBySlugQuery,
  testimonialsQuery,
  tourBySlugQuery,
  toursQuery,
} from "./queries";
import { tours as localTours } from "@/content/tours";
import { experiences as localExperiences } from "@/content/experiences";
import { photoshoots as localPhotoshoots } from "@/content/photoshoots";
import { testimonials as localTestimonials } from "@/content/testimonials";
import { stories as localStories } from "@/content/stories";
import { faqs as localFaqs } from "@/content/faq";
import type { Experience, Faq, Photoshoot, Story, Testimonial, Tour } from "@/content/types";

const REVALIDATE_SECONDS = 60;

// Sanity isn't configured until real env vars are set (see .env.local.example).
// Until then — and if a fetch ever errors — every function below quietly
// falls back to the local content files, so the site keeps working exactly
// as before. Once real tours/experiences/etc. exist in Sanity, these
// automatically start returning that instead, with no code changes needed.
const sanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder0"
);

async function safeFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!sanityConfigured) return null;
  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (err) {
    console.error("Sanity fetch failed, falling back to local content:", err);
    return null;
  }
}

export async function getTours(): Promise<Tour[]> {
  const result = await safeFetch<Tour[]>(toursQuery);
  return result && result.length > 0 ? result : localTours;
}

export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  const result = await safeFetch<Tour | null>(tourBySlugQuery, { slug });
  return result ?? localTours.find((t) => t.slug === slug);
}

export async function getAllTourSlugs(): Promise<string[]> {
  const tours = await getTours();
  return tours.map((t) => t.slug);
}

export async function getExperiences(): Promise<Experience[]> {
  const result = await safeFetch<Experience[]>(experiencesQuery);
  return result && result.length > 0 ? result : localExperiences;
}

export async function getExperienceBySlug(slug: string): Promise<Experience | undefined> {
  const result = await safeFetch<Experience | null>(experienceBySlugQuery, { slug });
  return result ?? localExperiences.find((e) => e.slug === slug);
}

export async function getPhotoshoots(): Promise<Photoshoot[]> {
  const result = await safeFetch<Photoshoot[]>(photoshootsQuery);
  return result && result.length > 0 ? result : localPhotoshoots;
}

export async function getPhotoshootBySlug(slug: string): Promise<Photoshoot | undefined> {
  const result = await safeFetch<Photoshoot | null>(photoshootBySlugQuery, { slug });
  return result ?? localPhotoshoots.find((p) => p.slug === slug);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const result = await safeFetch<Testimonial[]>(testimonialsQuery);
  return result && result.length > 0 ? result : localTestimonials;
}

export async function getStories(): Promise<Story[]> {
  const result = await safeFetch<Story[]>(storiesQuery);
  return result && result.length > 0 ? result : localStories;
}

export async function getStoryBySlug(slug: string): Promise<Story | undefined> {
  const result = await safeFetch<Story | null>(storyBySlugQuery, { slug });
  return result ?? localStories.find((s) => s.slug === slug);
}

export async function getFaqs(): Promise<Faq[]> {
  const result = await safeFetch<Faq[]>(faqsQuery);
  return result && result.length > 0 ? result : [...localFaqs];
}
