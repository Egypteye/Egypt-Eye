import { DEFAULT_LOCALE, type Locale } from "./locales";
import coverage from "./generated/coverage.json";

// Whether a language is ready to be shown to Google.
//
// A locale's pages exist and render the moment the language is added, but
// until the translation pipeline has actually filled it they render English
// content at a different URL. Advertising those is the textbook way to turn a
// multilingual rollout into a duplicate-content problem: seven URLs per page,
// six of them substantially identical to the English one, each claiming to be
// canonical and each declaring the other six as equal alternates.
//
// For a site with 30 indexed pages that is not a theoretical risk — it is
// 1,782 near-duplicate URLs competing for a crawl budget that was already
// leaving 327 real pages in "Discovered - currently not indexed".
//
// So a locale earns its place. Until its coverage crosses the threshold its
// pages are noindex, canonicalise to English, stay out of the sitemap, and
// stay out of every page's hreflang set. Nothing about them is hidden from
// visitors — the switcher still works and the pages still serve — they are
// simply not offered to search engines as separate documents yet.

/**
 * How much of the catalogue a language must carry before its URLs are offered
 * to search engines as pages in their own right.
 *
 * 0.9 rather than 1.0 because the tail of a 9,400-string corpus is never
 * quite finished — a handful of strings added since the last pipeline run
 * shouldn't pull a fully translated language back out of the index.
 */
const PUBLISH_THRESHOLD = 0.9;

type CoverageFile = { total: number; locales: Record<string, number> };

const data = coverage as CoverageFile;

/** Translated fraction of the catalogue, 0–1. English is always 1. */
export function localeCoverage(locale: Locale): number {
  if (locale === DEFAULT_LOCALE) return 1;
  if (!data.total) return 0;
  return (data.locales[locale] ?? 0) / data.total;
}

/**
 * Whether this language's URLs should be indexed, sitemapped and declared as
 * hreflang alternates.
 */
export function isLocalePublished(locale: Locale): boolean {
  return locale === DEFAULT_LOCALE || localeCoverage(locale) >= PUBLISH_THRESHOLD;
}

/** The languages currently offered to search engines. Always includes English. */
export function publishedLocales<T extends { code: Locale }>(all: readonly T[]): T[] {
  return all.filter((l) => isLocalePublished(l.code));
}

export { PUBLISH_THRESHOLD };
