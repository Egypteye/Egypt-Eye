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
const PUBLISH_THRESHOLD = 0.98;

/**
 * Which languages are actually offered to search engines right now.
 *
 * WHY THIS EXISTS AS WELL AS THE THRESHOLD, AND NOT INSTEAD OF IT
 *
 * A threshold alone cannot stage a rollout here, because the pipeline
 * translates every language in lockstep: on 13 October 2026 all five sat at
 * exactly 9517/10493 = 90.7%. So any threshold either publishes all five or
 * none of them, and when they crossed 0.9 together the sitemap went from 291
 * URLs to 1,746 in a single deploy.
 *
 * Google's response, measured in Search Console: indexed pages FELL from 37
 * to 27 while the URL count rose 37x, 1,707 URLs sat in "Discovered -
 * currently not indexed", and impressions did not move at all (mean 37/day
 * across 46 days). The extra 1,455 URLs earned nothing and cost the English
 * pages their crawl budget.
 *
 * So the list is the staging control and the threshold is the safety floor.
 * To publish a language: add its code here. It still has to clear the
 * threshold as well, so a half-translated language cannot be published by
 * editing one line in a hurry.
 *
 * Empty means English only — which is the correct state until the English
 * site is substantially indexed (it was 59 of 291 pages on 9 October 2026).
 * Add ONE language at a time and watch impressions for a month before the
 * next. That is the whole point of a list rather than a threshold.
 */
const PUBLISHED_LOCALES: readonly Locale[] = [];

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
  if (locale === DEFAULT_LOCALE) return true;
  // Both gates, deliberately: on the staging list AND translated enough.
  return PUBLISHED_LOCALES.includes(locale) && localeCoverage(locale) >= PUBLISH_THRESHOLD;
}

/** The languages currently offered to search engines. Always includes English. */
export function publishedLocales<T extends { code: Locale }>(all: readonly T[]): T[] {
  return all.filter((l) => isLocalePublished(l.code));
}

export { PUBLISH_THRESHOLD, PUBLISHED_LOCALES };
