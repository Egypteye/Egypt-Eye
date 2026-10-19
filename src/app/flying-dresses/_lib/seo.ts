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
 * -------------------------------------------------------------------------
 * THE SWITCH TO SHORT CANONICALS HAS NOW HAPPENED
 * -------------------------------------------------------------------------
 * The paragraph above described the state before DNS was pointed. The brand
 * domain is now attached and verified, and that changes the right answer.
 *
 * On flyingdressesegypt.com, src/proxy.ts rewrites /wardrobe to
 * /flying-dresses/wardrobe, so BOTH forms serve the same page. That is two
 * working URLs per page on the domain we are about to submit to Search
 * Console, and the canonical was pointing at the longer, uglier one:
 *
 *     https://flyingdressesegypt.com/flying-dresses/wardrobe
 *
 * on a domain whose entire name is already "flying dresses". The duplication
 * was resolved correctly — one canonical, every URL agreeing on it — but it
 * was resolved in favour of the worse URL.
 *
 * So canonicals and the sitemap now emit the SHORT form. The cost the old
 * note worried about does not apply: stripping a known constant prefix needs
 * no `headers()` call, so every page stays statically prerendered.
 *
 * WHY NOW AND NOT LATER. URLs are cheap to change before a search engine has
 * seen them and expensive afterwards — a later switch means redirects,
 * re-crawling and a period of split signals. The domain went live minutes
 * ago and Search Console has not been connected yet. This is the only free
 * moment this decision will ever have.
 *
 * INTERNAL LINKS ARE UNCHANGED. `fdPath()` still returns /flying-dresses/...,
 * which is what the app actually serves and what works on every host,
 * including the vercel.app review deployments where the short form does not
 * exist. Only the ABSOLUTE url changes, and only because it is always the
 * brand domain, where the short form is guaranteed to resolve.
 */

/** Overridable per deployment; defaults to the brand's own domain. */
export const fdSiteUrl = process.env.NEXT_PUBLIC_FLYING_DRESSES_URL || brand.url;

/** An internal link. Always prefixed, so it resolves on every host. */
export function fdPath(path = ""): string {
  if (path === "" || path === "/") return FLYING_DRESSES_PATH;
  return `${FLYING_DRESSES_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The absolute URL of a page, for canonicals, structured data and the sitemap.
 *
 * Short form on purpose — see the note at the top of this file. The
 * /flying-dresses segment is what the app serves internally; it is not part
 * of the address this brand publishes.
 *
 * Everything that states a public URL goes through here, so the canonical
 * tag, the Open Graph url, the JSON-LD and every <loc> in the sitemap cannot
 * disagree about what a page's address is. A sitemap that lists one URL while
 * the page canonicalises to another is a conflict a crawler resolves by
 * ignoring one of them, and which one is not up to us.
 */
export function fdUrl(path = ""): string {
  const clean = path === "" || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${fdSiteUrl}${clean}`;
}

/**
 * THE SHARE IMAGE.
 *
 * A link to this site used to render as grey text everywhere it was pasted:
 * WhatsApp, Instagram DMs, Facebook, iMessage, Slack. `openGraph` carried a
 * title, a description and a url and NO image, and `twitter.card` was set to
 * "summary_large_image", which asks for the big photo card and then supplies
 * no photo. For a business whose entire product is photographs, shared by
 * customers in exactly those places, that was the worst available first
 * impression.
 *
 * It was not fixable before: there were no photographs. There are now.
 *
 * The default is the hero poster, which is a real client frame on the Giza
 * rooftop at 1600x900 — wider than the 1.91:1 the scrapers prefer, which they
 * crop rather than reject, and the subject sits centre so the crop is safe.
 * Pages that have a better, more specific frame pass one.
 */
export type FdShareImage = { src: string; width: number; height: number; alt?: string };

export const FD_DEFAULT_SHARE_IMAGE: FdShareImage = {
  src: "/brand/flying-dresses/hero-poster.jpg",
  width: 1440,
  height: 960,
  alt: "A red flying dress on a rooftop above the Pyramids of Giza, its train thrown out across the frame",
};

/**
 * Scrapers do not resolve relative URLs. WhatsApp, Slack and Facebook each
 * fetch the page and then fetch the image as its own request, with no page
 * context, so "/brand/..." is a 404 to them and the card falls back to text.
 * Every share image therefore goes out absolute.
 */
function fdAbsolute(src: string): string {
  return src.startsWith("http") ? src : `${fdSiteUrl}${src}`;
}

export function fdMetadata({
  title,
  description,
  path = "",
  noindex = false,
  image = FD_DEFAULT_SHARE_IMAGE,
}: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  /**
   * A page-specific share image. Its DIMENSIONS TRAVEL WITH IT, deliberately:
   * the first version of this took a bare path and hardcoded 1600x900 beside
   * it, which is right for the hero poster and wrong for every dress
   * photograph, all of which are 1600x1067. Scrapers lay the card out from the
   * declared size, so a page passing a taller frame would have shipped a
   * correct picture with a lie about its shape.
   */
  image?: FdShareImage;
}): Metadata {
  const canonical = fdUrl(path);
  const fullTitle = path === "" ? title : `${title} | ${brand.name}`;

  const shareImage = {
    url: fdAbsolute(image.src),
    width: image.width,
    height: image.height,
    alt: image.alt ?? description,
  };

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
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [shareImage.url],
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
