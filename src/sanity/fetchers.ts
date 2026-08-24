import { client } from "./client";
import {
  aboutPageQuery,
  allSignatureExperienceSlugsQuery,
  contactPageQuery,
  customizePageQuery,
  destinationHubBySlugQuery,
  destinationHubsQuery,
  experienceBySlugQuery,
  experiencesQuery,
  faqsQuery,
  homepageQuery,
  listingPagesQuery,
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
import { homepage as localHomepage } from "@/content/homepage";
import { listingPages as localListingPages } from "@/content/listingPages";
import { destinationHubs as localDestinationHubs } from "@/content/destinationHubs";
import type {
  AboutPage,
  ContactPage,
  CustomizePage,
  DestinationHub,
  Experience,
  Faq,
  Homepage,
  ListingPages,
  Photoshoot,
  ResolvedAboutPage,
  ResolvedContactPage,
  ResolvedCustomizePage,
  ResolvedHomepage,
  ResolvedListingPages,
  ResolvedSiteSettings,
  SignatureExperience,
  SiteSettings,
  Story,
  Testimonial,
  Tour,
} from "@/content/types";

const REVALIDATE_SECONDS = 60;

// Sanity documents from an earlier migration can predate a field (like a
// newly-curated photo) that only exists in the local content files so far.
// Rather than let a stale/imageless Sanity copy silently blank out a real
// photo, fill in the local one wherever the Sanity item doesn't have its
// own — matched by slug. A real photo uploaded in Sanity always wins; this
// only ever fills a gap, never overrides one.
function withLocalImageFallback<T extends { slug: string; image?: unknown }>(items: T[], local: readonly T[]): T[] {
  const localBySlug = new Map(local.map((item) => [item.slug, item]));
  return items.map((item) =>
    item.image ? item : { ...item, image: localBySlug.get(item.slug)?.image }
  );
}

function withLocalHeroImageFallback<T extends { slug: string; heroImage?: unknown }>(
  items: T[],
  local: readonly T[]
): T[] {
  const localBySlug = new Map(local.map((item) => [item.slug, item]));
  return items.map((item) =>
    item.heroImage ? item : { ...item, heroImage: localBySlug.get(item.slug)?.heroImage }
  );
}

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
  return result && result.length > 0 ? withLocalImageFallback(result, localTours) : localTours;
}

export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  const result = await safeFetch<Tour | null>(tourBySlugQuery, { slug });
  const local = localTours.find((t) => t.slug === slug);
  if (!result) return local;
  return result.image ? result : { ...result, image: local?.image };
}

export async function getAllTourSlugs(): Promise<string[]> {
  const tours = await getTours();
  return tours.map((t) => t.slug);
}

// The Sanity `relatedTours` relation on an Experience only has data once an
// editor sets it in the Studio. Local fallback content instead derives it
// from the other side of the relation (Tour.relatedExperiences, curated in
// tours.ts) so the "you might also like" suggestion still has something to
// show before that curation happens in Sanity.
function withLocalExperienceRelations(exps: Experience[]): Experience[] {
  return exps.map((e) =>
    e.relatedTours && e.relatedTours.length > 0
      ? e
      : { ...e, relatedTours: localTours.filter((t) => (t.relatedExperiences ?? []).some((re) => re.slug === e.slug)) }
  );
}

export async function getExperiences(): Promise<Experience[]> {
  const result = await safeFetch<Experience[]>(experiencesQuery);
  return result && result.length > 0
    ? withLocalImageFallback(result, localExperiences)
    : withLocalExperienceRelations(localExperiences);
}

export async function getExperienceBySlug(slug: string): Promise<Experience | undefined> {
  const result = await safeFetch<Experience | null>(experienceBySlugQuery, { slug });
  const local = localExperiences.find((e) => e.slug === slug);
  if (!result) return local && withLocalExperienceRelations([local])[0];
  return result.image ? result : { ...result, image: local?.image };
}

export async function getPhotoshoots(): Promise<Photoshoot[]> {
  const result = await safeFetch<Photoshoot[]>(photoshootsQuery);
  return result && result.length > 0 ? withLocalImageFallback(result, localPhotoshoots) : localPhotoshoots;
}

export async function getPhotoshootBySlug(slug: string): Promise<Photoshoot | undefined> {
  const result = await safeFetch<Photoshoot | null>(photoshootBySlugQuery, { slug });
  const local = localPhotoshoots.find((p) => p.slug === slug);
  if (!result) return local;
  return result.image ? result : { ...result, image: local?.image };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const result = await safeFetch<Testimonial[]>(testimonialsQuery);
  return result && result.length > 0 ? result : localTestimonials;
}

export async function getStories(): Promise<Story[]> {
  const result = await safeFetch<Story[]>(storiesQuery);
  return result && result.length > 0 ? withLocalImageFallback(result, localStories) : localStories;
}

export async function getStoryBySlug(slug: string): Promise<Story | undefined> {
  const result = await safeFetch<Story | null>(storyBySlugQuery, { slug });
  const local = localStories.find((s) => s.slug === slug);
  if (!result) return local;
  return result.image ? result : { ...result, image: local?.image };
}

export async function getDestinationHubs(): Promise<DestinationHub[]> {
  const result = await safeFetch<DestinationHub[]>(destinationHubsQuery);
  return result && result.length > 0 ? withLocalImageFallback(result, localDestinationHubs) : localDestinationHubs;
}

export async function getDestinationHubBySlug(slug: string): Promise<DestinationHub | undefined> {
  const result = await safeFetch<DestinationHub | null>(destinationHubBySlugQuery, { slug });
  const local = localDestinationHubs.find((d) => d.slug === slug);
  if (!result) return local;
  return result.image ? result : { ...result, image: local?.image };
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
    image: "/photos/pexels-10124763.jpg",
    headline: "Where It All Begins: Giza",
    subtext: "Stand before the last surviving wonder of the ancient world, then climb inside the Great Pyramid itself.",
    linkLabel: "See the Giza Tour",
    linkHref: "/tours/1-day-giza-tour",
  },
  {
    tone: "nile",
    image: "/photos/pexels-15131486.jpg",
    headline: "Temples That Rise Straight From the Water",
    subtext: "A private cruise between Luxor and Aswan — the most scenic way to see ancient Egypt.",
    linkLabel: "Explore Nile Cruises",
    linkHref: "/tours/8-day-essential-egypt-nile-cruise",
  },
  {
    tone: "luxor",
    image: "/photos/pexels-18934702.jpg",
    headline: "Ancient Thebes, Properly Explored",
    subtext: "Karnak, the Valley of the Kings, and everything in between — how to actually see Luxor.",
    linkLabel: "Read the Luxor Guide",
    linkHref: "/stories/luxor-travel-guide",
  },
  {
    tone: "redsea",
    image: "/photos/pexels-36221985.jpg",
    headline: "Turquoise Water, White Sand, Nothing on the Agenda",
    subtext: "A slower few days on Egypt's Red Sea coast.",
    linkLabel: "Explore the Red Sea",
    linkHref: "/tours/red-sea-relaxation",
  },
  {
    tone: "desert",
    image: "/photos/pexels-20189345.jpg",
    headline: "A Sahara Sunset by Quad Bike",
    subtext: "Golden dunes, a private guide, and a ride you'll actually remember.",
    linkLabel: "See the Desert Experience",
    linkHref: "/experiences/atv-quad-bikes-sahara",
  },
];

// Default placeholder tones for the homepage's single-image feature banners,
// matching the tones those sections used before they were CMS-editable.
const defaultBanners = {
  flyingDressImage: {
    tone: "desert" as const,
    image: "/photos/pexels-38810253.jpg",
  },
  redSeaImage: {
    tone: "redsea" as const,
    image: "/photos/pexels-7974685.jpg",
  },
  ninePyramidsImage: {
    tone: "giza" as const,
    image: "/photos/pexels-18291196.jpg",
  },
  customizeImage: {
    tone: "luxor" as const,
    image: "/photos/pexels-15131539.jpg",
  },
};

// Site Settings is a singleton — merge field-by-field instead of an
// all-or-nothing swap, so filling in just one field in the Studio (e.g. only
// the WhatsApp number) doesn't blank out everything else that hasn't been
// touched yet.
export async function getSiteSettings(): Promise<ResolvedSiteSettings> {
  const result = await safeFetch<SiteSettings>(siteSettingsQuery);
  if (!result) {
    return { ...localSite, heroImages: defaultHeroImages, ...defaultBanners, destinationPhotos: [] };
  }

  // Every entry needs its required fields filled in before it's usable — a
  // nav link with a blank href, or a destination with no linked tour, would
  // otherwise silently break navigation. Incomplete entries are dropped
  // rather than rendered broken; the local defaults cover the gap.
  const nav =
    result.nav
      ?.filter((n): n is { label: string; href: string } => Boolean(n.label && n.href)) ?? [];
  const destinations =
    result.destinations?.filter(
      (d): d is { name: string; days: number; tone: import("@/content/types").ImageTone; tourSlug: string } =>
        Boolean(d.name && d.days !== undefined && d.tourSlug)
    ) ?? [];
  const interests =
    result.interests?.filter((i): i is { label: string; kind: NonNullable<typeof i.kind>; slug?: string } =>
      Boolean(i.label && i.kind)
    ) ?? [];
  const trustBadges =
    result.trustBadges?.filter(
      (b): b is { icon: NonNullable<typeof b.icon>; title: string; body: string } =>
        Boolean(b.icon && b.title && b.body)
    ) ?? [];

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
      image: result.flyingDressImage?.image ?? defaultBanners.flyingDressImage.image,
    },
    redSeaImage: {
      tone: result.redSeaImage?.tone ?? defaultBanners.redSeaImage.tone,
      image: result.redSeaImage?.image ?? defaultBanners.redSeaImage.image,
    },
    ninePyramidsImage: {
      tone: result.ninePyramidsImage?.tone ?? defaultBanners.ninePyramidsImage.tone,
      image: result.ninePyramidsImage?.image ?? defaultBanners.ninePyramidsImage.image,
    },
    customizeImage: {
      tone: result.customizeImage?.tone ?? defaultBanners.customizeImage.tone,
      image: result.customizeImage?.image ?? defaultBanners.customizeImage.image,
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
    nav: nav.length > 0 ? nav : localSite.nav,
    trustBadges: trustBadges.length > 0 ? trustBadges : localSite.trustBadges,
    destinations: destinations.length > 0 ? destinations : localSite.destinations,
    interests: interests.length > 0 ? interests : localSite.interests,
    footer: { ...localSite.footer, ...result.footer },
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
      image: result.bannerImage?.image ?? localCustomizePage.bannerImage.image,
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
      image: result.heroImage?.image ?? localAboutPage.heroImage.image,
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
      image: result.heroImage?.image ?? localContactPage.heroImage.image,
    },
  };
}

export async function getSignatureExperiences(): Promise<SignatureExperience[]> {
  const result = await safeFetch<SignatureExperience[]>(signatureExperiencesQuery);
  return result && result.length > 0
    ? withLocalHeroImageFallback(result, localSignatureExperiences)
    : localSignatureExperiences;
}

export async function getSignatureExperienceBySlug(slug: string): Promise<SignatureExperience | undefined> {
  const result = await safeFetch<SignatureExperience | null>(signatureExperienceBySlugQuery, { slug });
  const local = localSignatureExperiences.find((e) => e.slug === slug);
  if (!result) return local;
  return result.heroImage ? result : { ...result, heroImage: local?.heroImage };
}

export async function getAllSignatureExperienceSlugs(): Promise<string[]> {
  const result = await safeFetch<string[]>(allSignatureExperienceSlugsQuery);
  return result && result.length > 0 ? result : localSignatureExperiences.map((e) => e.slug);
}

// Same field-by-field merge as Site Settings — a Studio editor filling in
// just one homepage block (say, the Final CTA) shouldn't blank out every
// other block that hasn't been touched yet.
export async function getHomepage(): Promise<ResolvedHomepage> {
  const result = await safeFetch<Homepage>(homepageQuery);
  if (!result) return localHomepage;

  return {
    popularTours: { ...localHomepage.popularTours, ...result.popularTours },
    destinationsSection: { ...localHomepage.destinationsSection, ...result.destinationsSection },
    flyingDress: { ...localHomepage.flyingDress, ...result.flyingDress },
    redSea: { ...localHomepage.redSea, ...result.redSea },
    ninePyramids: { ...localHomepage.ninePyramids, ...result.ninePyramids },
    photoshootsSection: { ...localHomepage.photoshootsSection, ...result.photoshootsSection },
    customCta: { ...localHomepage.customCta, ...result.customCta },
    reviewsSection: { ...localHomepage.reviewsSection, ...result.reviewsSection },
    faqSection: { ...localHomepage.faqSection, ...result.faqSection },
    storiesSection: { ...localHomepage.storiesSection, ...result.storiesSection },
    finalCta: { ...localHomepage.finalCta, ...result.finalCta },
  };
}

export async function getListingPages(): Promise<ResolvedListingPages> {
  const result = await safeFetch<ListingPages>(listingPagesQuery);
  if (!result) return localListingPages;

  return {
    tours: {
      ...localListingPages.tours,
      ...result.tours,
      faqs: result.tours?.faqs && result.tours.faqs.length > 0 ? result.tours.faqs : localListingPages.tours.faqs,
    },
    experiences: { ...localListingPages.experiences, ...result.experiences },
    photoshoots: { ...localListingPages.photoshoots, ...result.photoshoots },
    signatureExperiences: { ...localListingPages.signatureExperiences, ...result.signatureExperiences },
    exploreEgypt: { ...localListingPages.exploreEgypt, ...result.exploreEgypt },
    stories: { ...localListingPages.stories, ...result.stories },
  };
}
