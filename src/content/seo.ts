import type { Metadata } from "next";
import type { SanityImage } from "./types";
import { urlForImage } from "@/sanity/image";
import type { PageSeo } from "./types";

// The single source of truth for the site's canonical domain — every other
// file that needs it (robots.ts, sitemap.ts, email templates, etc.) should
// import this rather than redefining its own fallback, so they can't drift
// out of sync with each other the way robots.ts/sitemap.ts once did.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

// Shared metadata resolution for every detail page: an editorial SEO
// override (title/description/canonical/OG image/noindex) layered over
// sensible defaults derived from the page's own content, so every page
// stays search-safe even when nothing has been filled in manually.
export function resolveMetadata({
  title,
  description,
  seo,
  image,
  path,
}: {
  title: string;
  description: string;
  seo?: Pick<PageSeo, "seoTitle" | "seoDescription" | "canonicalUrl" | "ogImage" | "noindex">;
  image?: SanityImage;
  path: string;
}): Metadata {
  const resolvedTitle = seo?.seoTitle || title;
  const resolvedDescription = seo?.seoDescription || description;
  const canonical = seo?.canonicalUrl || `${siteUrl}${path}`;
  const ogImageUrl = urlForImage(seo?.ogImage || image)?.width(1200).height(630).url();

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical },
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

// TouristTrip structured data for tour/experience/photoshoot detail pages —
// deliberately carries no `offers`/price field, since prices are not shown
// to customers anywhere on the site (business decision) and structured
// data must match what a visitor actually sees on the page.
export function touristTripJsonLd({
  name,
  description,
  image,
  path,
  rating,
}: {
  name: string;
  description: string;
  image?: SanityImage;
  path: string;
  rating?: { score: number; count: number } | null;
}) {
  const imageUrl = urlForImage(image)?.width(1200).height(630).url();
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description,
    ...(imageUrl ? { image: imageUrl } : {}),
    url: `${siteUrl}${path}`,
    provider: {
      "@type": "TravelAgency",
      name: "Egypt Eye Travel and Tours",
      url: siteUrl,
    },
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.score,
            reviewCount: rating.count,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
