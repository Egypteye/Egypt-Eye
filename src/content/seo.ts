import type { Metadata } from "next";
import type { SanityImage } from "./types";
import { urlForImage } from "@/sanity/image";
import type { PageSeo } from "./types";

// Falls back to the current Vercel URL until a custom domain is attached —
// set NEXT_PUBLIC_SITE_URL in Vercel's env vars once one is.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypt-eye.vercel.app";

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
