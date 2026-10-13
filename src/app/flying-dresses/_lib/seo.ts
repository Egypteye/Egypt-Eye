import type { Metadata } from "next";
import { FLYING_DRESSES_PATH, brand, contact, packages } from "@/content/flyingDresses";

/**
 * Metadata, canonical URLs and structured data for the Flying Dresses site.
 *
 * Separate from content/seo.ts, which is Egypt Eye's: that module canonicalises
 * to egypteyetravel.com and emits hreflang for six locales. This brand is on
 * its own domain and is English-only, so sharing that helper would have
 * produced canonicals on the wrong domain and hreflang tags for translations
 * that do not exist.
 *
 * -------------------------------------------------------------------------
 * WHY THE URLS CARRY /flying-dresses
 * -------------------------------------------------------------------------
 * The pages are physically at /flying-dresses/* in one Next app that also
 * serves egypteyetravel.com, and every internal link uses that prefix. The
 * prefix is kept in the canonical URL rather than stripped, because the
 * alternative needs the host at render time (`headers()`), and reading headers
 * opts every page out of static prerendering — a real cost on a site whose
 * largest asset is a full-bleed photograph and whose LCP target is 2.5s.
 *
 * So there is exactly ONE url shape per page, it is the same on every host,
 * nothing redirects, and every page stays static. src/proxy.ts additionally
 * accepts the short form on this brand's own domain, so
 * flyingdressesegypt.com/wardrobe reaches the wardrobe for anyone who types
 * or shares it.
 *
 * Switching to short canonical URLs once DNS is pointed is a deliberate,
 * separately reviewable change — see docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md.
 */

/** Overridable per deployment; defaults to the brand's own domain. */
export const fdSiteUrl = process.env.NEXT_PUBLIC_FLYING_DRESSES_URL || brand.url;

/** An internal link. Always prefixed, so it resolves on every host. */
export function fdPath(path = ""): string {
  if (path === "" || path === "/") return FLYING_DRESSES_PATH;
  return `${FLYING_DRESSES_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The absolute URL of a page, for canonicals and structured data. */
export function fdUrl(path = ""): string {
  return `${fdSiteUrl}${fdPath(path)}`;
}

export function fdMetadata({
  title,
  description,
  path = "",
  noindex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const canonical = fdUrl(path);
  const fullTitle = path === "" ? title : `${title} — ${brand.name}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: brand.name,
      title: fullTitle,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/**
 * Organization and LocalBusiness data.
 *
 * Carries ONLY what is on the page and confirmed: the name, the URL, the area
 * served, the contact points. No aggregateRating, no reviewCount, no
 * priceRange band, no founding date, no employee count — every one of those is
 * a field Google will happily accept and none of them has a verified value.
 * Structured data that outruns the visible page is a manual-action risk and,
 * more simply, a lie in a machine-readable format.
 *
 * `sameAs` IS emitted, because the owner supplied the three profile URLs
 * directly. It is what ties these accounts to this business for a search
 * engine, and it was deliberately absent until the URLs were confirmed — a
 * sameAs pointing at the wrong account ties the business to someone else's.
 * Any social entry still missing a profileUrl is skipped rather than guessed.
 */
export function fdOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brand.name,
    description: brand.description,
    url: fdUrl(),
    email: contact.email,
    telephone: contact.phones.map((p) => p.tel),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    areaServed: { "@type": "City", name: "Cairo" },
    sameAs: contact.socials
      .map((s) => s.profileUrl)
      .filter((url): url is string => Boolean(url)),
  };
}

/**
 * One Service entry per photoshoot location.
 *
 * `offers.price` is the brochure's per-person price and matches what the page
 * shows, which is the rule for prices in structured data. The rental services
 * are deliberately NOT emitted as Offers at all: they have no price, and an
 * Offer without a price is either dropped or guessed at by the consumer.
 */
export function fdPackagesJsonLd() {
  return packages.map((p) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${p.title} Flying Dress Photoshoot`,
    serviceType: "Photography session",
    provider: { "@type": "LocalBusiness", name: brand.name, url: fdUrl() },
    areaServed: { "@type": "Country", name: "Egypt" },
    url: fdUrl(`/experiences/${p.slug}`),
    offers: {
      "@type": "Offer",
      price: p.priceUsd,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: fdUrl(`/experiences/${p.slug}`),
    },
  }));
}

export function fdFaqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function fdBreadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: fdUrl(item.path),
    })),
  };
}

/**
 * Renders JSON-LD.
 *
 * `JSON.stringify` then escaping `<` is what keeps a `</script>` inside any
 * string from closing the tag early. The site's CSP allows 'unsafe-inline'
 * for script-src, which is what lets this and Next's own hydration bootstrap
 * run — see the note in next.config.ts.
 */
export function fdJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
