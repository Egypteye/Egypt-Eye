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
  rating?: { score?: number; count: number; scope?: "product" | "company"; source?: "computed" | "manual" } | null;
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
    // Published only for a figure counted from real testimonial records that
    // name this product. AggregateRating is a machine-readable assertion to
    // search engines that this many reviews of this item exist and can be
    // produced, so a company-wide total (true of the business, not of this
    // tour) and a manually entered number both stay out of it — they still
    // drive everything on the page. An AggregateRating without a real
    // ratingValue isn't valid markup either.
    ...(rating &&
    rating.scope === "product" &&
    rating.source === "computed" &&
    rating.count > 0 &&
    typeof rating.score === "number"
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

/**
 * Home is prepended automatically. Every detail page renders a visible
 * breadcrumb that starts at Home, and structured data has to describe what is
 * actually on the page — a trail that begins at "Tours" while the page shows
 * "Home › Tours › …" is a mismatch, and callers kept forgetting to pass it.
 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
