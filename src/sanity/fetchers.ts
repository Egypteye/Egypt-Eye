import { client } from "./client";
import {
  aboutPageQuery,
  allSignatureExperienceSlugsQuery,
  contactPageQuery,
  customizePageQuery,
  experienceBySlugQuery,
  experiencesQuery,
  faqsQuery,
  photoshootBySlugQuery,
  photoshootsQuery,
  signatureExperienceBySlugQuery,
  signatureExperiencesQuery,
  siteSettingsQuery,
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
import { site as localSite } from "@/content/site";
import { customizePage as localCustomizePage } from "@/content/customizePage";
import { aboutPage as localAboutPage } from "@/content/aboutPage";
import { contactPage as localContactPage } from "@/content/contactPage";
import { signatureExperiences as localSignatureExperiences } from "@/content/signatureExperiences";
import type {
  AboutPage,
  ContactPage,
  CustomizePage,
  Experience,
  Faq,
  Photoshoot,
  ResolvedAboutPage,
  ResolvedContactPage,
  ResolvedCustomizePage,
  ResolvedSiteSettings,
  SignatureExperience,
  SiteSettings,
  Story,
  Testimonial,
  Tour,
} from "@/content/types";

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

// Default homepage hero slideshow — gradient-placeholder slides shown until
// real photos are uploaded to Site Settings > Homepage hero background photos.
const defaultHeroImages: ResolvedSiteSettings["heroImages"] = [
  {
    tone: "giza",
    headline: "Where It All Begins: Giza",
    subtext: "Stand before the last surviving wonder of the ancient world, then climb inside the Great Pyramid itself.",
    linkLabel: "See the Giza Tour",
    linkHref: "/tours/1-day-giza-tour",
  },
  {
    tone: "nile",
    headline: "Temples That Rise Straight From the Water",
    subtext: "A private cruise between Luxor and Aswan — the most scenic way to see ancient Egypt.",
    linkLabel: "Explore Nile Cruises",
    linkHref: "/tours/8-day-essential-egypt-nile-cruise",
  },
  {
    tone: "luxor",
    headline: "Ancient Thebes, Properly Explored",
    subtext: "Karnak, the Valley of the Kings, and everything in between — how to actually see Luxor.",
    linkLabel: "Read the Luxor Guide",
    linkHref: "/stories/luxor-travel-guide",
  },
  {
    tone: "redsea",
    headline: "Turquoise Water, White Sand, Nothing on the Agenda",
    subtext: "A slower few days on Egypt's Red Sea coast.",
    linkLabel: "Explore the Red Sea",
    linkHref: "/tours/red-sea-relaxation",
  },
  {
    tone: "desert",
    headline: "A Sahara Sunset by Quad Bike",
    subtext: "Golden dunes, a private guide, and a ride you'll actually remember.",
    linkLabel: "See the Desert Experience",
    linkHref: "/experiences/atv-quad-bikes-sahara",
  },
];

// Default placeholder tones for the homepage's single-image feature banners,
// matching the tones those sections used before they were CMS-editable.
const defaultBanners = {
  flyingDressImage: { tone: "desert" as const },
  redSeaImage: { tone: "redsea" as const },
  ninePyramidsImage: { tone: "giza" as const },
  customizeImage: { tone: "luxor" as const },
};

// Site Settings is a singleton — merge field-by-field instead of an
// all-or-nothing swap, so filling in just one field in the Studio (e.g. only
// the WhatsApp number) doesn't blank out everything else that hasn't been
// touched yet. `nav` isn't part of the Sanity schema (it's routing, not
// editorial content) and always comes from the local config.
export async function getSiteSettings(): Promise<ResolvedSiteSettings> {
  const result = await safeFetch<SiteSettings>(siteSettingsQuery);
  if (!result) {
    return { ...localSite, heroImages: defaultHeroImages, ...defaultBanners, destinationPhotos: [] };
  }

  return {
    ...localSite,
    ...result,
    contact: { ...localSite.contact, ...result.contact },
    socials: { ...localSite.socials, ...result.socials },
    heroImages:
      result.heroImages && result.heroImages.length > 0
        ? result.heroImages.map((slide) => ({ ...slide, tone: slide.tone ?? "giza" }))
        : defaultHeroImages,
    flyingDressImage: {
      tone: result.flyingDressImage?.tone ?? defaultBanners.flyingDressImage.tone,
      image: result.flyingDressImage?.image,
    },
    redSeaImage: {
      tone: result.redSeaImage?.tone ?? defaultBanners.redSeaImage.tone,
      image: result.redSeaImage?.image,
    },
    ninePyramidsImage: {
      tone: result.ninePyramidsImage?.tone ?? defaultBanners.ninePyramidsImage.tone,
      image: result.ninePyramidsImage?.image,
    },
    customizeImage: {
      tone: result.customizeImage?.tone ?? defaultBanners.customizeImage.tone,
      image: result.customizeImage?.image,
    },
    destinationPhotos: result.destinationPhotos ?? [],
    policies: {
      ...localSite.policies,
      ...result.policies,
      children:
        result.policies?.children && result.policies.children.length > 0
          ? result.policies.children
          : localSite.policies.children,
    },
    pillars: result.pillars && result.pillars.length > 0 ? result.pillars : localSite.pillars,
    trustStats: { ...localSite.trustStats, ...result.trustStats },
    nav: localSite.nav,
  };
}

// Same field-by-field merge approach as Site Settings — `steps` and
// `formSections` are swapped wholesale (rather than deep-merged) when
// Sanity has a non-empty array, since partial-merging an ordered list of
// form questions by index would be more surprising than useful.
export async function getCustomizePage(): Promise<ResolvedCustomizePage> {
  const result = await safeFetch<CustomizePage>(customizePageQuery);
  if (!result) return localCustomizePage;

  return {
    ...localCustomizePage,
    ...result,
    bannerImage: {
      tone: result.bannerImage?.tone ?? localCustomizePage.bannerImage.tone,
      image: result.bannerImage?.image,
    },
    steps: result.steps && result.steps.length > 0 ? result.steps : localCustomizePage.steps,
    formSections:
      result.formSections && result.formSections.length > 0
        ? result.formSections
        : localCustomizePage.formSections,
  };
}

export async function getAboutPage(): Promise<ResolvedAboutPage> {
  const result = await safeFetch<AboutPage>(aboutPageQuery);
  if (!result) return localAboutPage;

  return {
    ...localAboutPage,
    ...result,
    heroImage: {
      tone: result.heroImage?.tone ?? localAboutPage.heroImage.tone,
      image: result.heroImage?.image,
    },
    teamMembers:
      result.teamMembers && result.teamMembers.length > 0 ? result.teamMembers : localAboutPage.teamMembers,
  };
}

export async function getContactPage(): Promise<ResolvedContactPage> {
  const result = await safeFetch<ContactPage>(contactPageQuery);
  if (!result) return localContactPage;

  return {
    ...localContactPage,
    ...result,
    heroImage: {
      tone: result.heroImage?.tone ?? localContactPage.heroImage.tone,
      image: result.heroImage?.image,
    },
  };
}

export async function getSignatureExperiences(): Promise<SignatureExperience[]> {
  const result = await safeFetch<SignatureExperience[]>(signatureExperiencesQuery);
  return result && result.length > 0 ? result : localSignatureExperiences;
}

export async function getSignatureExperienceBySlug(slug: string): Promise<SignatureExperience | undefined> {
  const result = await safeFetch<SignatureExperience | null>(signatureExperienceBySlugQuery, { slug });
  return result ?? localSignatureExperiences.find((e) => e.slug === slug);
}

export async function getAllSignatureExperienceSlugs(): Promise<string[]> {
  const result = await safeFetch<string[]>(allSignatureExperienceSlugsQuery);
  return result && result.length > 0 ? result : localSignatureExperiences.map((e) => e.slug);
}
