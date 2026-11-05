import { LOCALES, DEFAULT_LOCALE } from "@/i18n/locales";
import { isLocalePublished } from "@/i18n/readiness";

/**
 * What robots.txt tells crawlers to leave alone, and why each entry is there.
 *
 * Pure and dependency-light on purpose: app/robots.ts is a route, so a check
 * script cannot render it, but it can import this and assert on the rules it
 * produces. Per CLAUDE.md #6, the logic that needs testing lives where a
 * check can reach it.
 */

/**
 * Paths that are disallowed whatever the translation state.
 *
 * `/flying-dresses` IS DELIBERATELY ABSENT — see app/robots.ts for the full
 * account. It now 308s to the brand's own domain, and Google cannot follow a
 * redirect on a URL it is not allowed to fetch, so disallowing it would
 * strand those addresses in the index forever.
 */
export const ALWAYS_DISALLOWED: readonly string[] = ["/studio", "/api/", "/os"];

/**
 * Crawl rules for the languages that are not offered to search engines.
 *
 * THE PROBLEM THIS SOLVES, IN THE OWNER'S OWN SEARCH CONSOLE
 *
 * An unpublished locale's pages still serve — the switcher works and a reader
 * in Milan gets Italian — they are simply marked `noindex` and canonicalised
 * to English (see i18n/readiness.ts). That stops them being INDEXED. It does
 * nothing to stop them being CRAWLED, because every page links to every
 * language, so Google keeps finding them.
 *
 * On 23 October 2026 the coverage report read: 274 URLs indexed, 1,689 not.
 * Of the "not", 347 were "Excluded by noindex" — crawled, tag seen, working
 * as designed — and 1,211 were "Discovered, currently not indexed", meaning
 * Google had queued them and not got round to them. Those two numbers add up
 * to roughly five locales times three hundred pages. So the English site,
 * 14% indexed, was queueing behind ~1,500 URLs that are designed never to be
 * indexed at all.
 *
 * Blocking the crawl is the correct tool once a page is already out of the
 * index, which these are. It is the WRONG tool for getting a page out of the
 * index, because a blocked URL cannot be re-crawled and so its `noindex` can
 * never be read. That distinction is why this list is generated from
 * `isLocalePublished` rather than hardcoded: the day a language is published
 * its rules disappear in the same deploy that puts it in the sitemap, and it
 * cannot end up sitemapped and blocked at once.
 *
 * TWO RULES PER LOCALE, NOT ONE
 *
 * robots.txt matches on literal prefix, so a bare `Disallow: /it` would also
 * block `/italy-combo` the day someone adds that page. So each locale gets
 * `/xx/` for its children and `/xx$` for the bare landing page, and
 * scripts/check-robots.mts asserts that no URL in the English sitemap matches
 * any rule — which is what will catch the collision if one is ever created.
 */
/**
 * `published` is injectable only so the guard can ask the question that
 * matters and cannot otherwise be asked: no language is published today, so
 * an assertion that reads the live state can never test "a published locale
 * must stay crawlable" — the one failure here that would ask Google to index
 * a page it is forbidden to fetch. Production always uses the default.
 */
export function unpublishedLocaleDisallows(
  published: (locale: string) => boolean = isLocalePublished as (locale: string) => boolean
): string[] {
  return LOCALES.filter((l) => l.code !== DEFAULT_LOCALE && !published(l.code)).flatMap((l) => [
    `/${l.code}/`,
    `/${l.code}$`,
  ]);
}

/** Everything robots.txt disallows, in the order it is written. */
export function robotsDisallows(
  published?: (locale: string) => boolean
): string[] {
  return [...ALWAYS_DISALLOWED, ...unpublishedLocaleDisallows(published)];
}

/**
 * Whether a path is blocked by a rule, using the matching Google documents:
 * rules are prefix matches, `*` matches any run of characters, and a trailing
 * `$` anchors the end of the path.
 *
 * Written out rather than taken from a library because the guard's whole job
 * is to answer "would Google fetch this?", and a guard that models the
 * matching differently from the crawler proves nothing.
 */
export function isDisallowed(path: string, rules: readonly string[] = robotsDisallows()): boolean {
  return rules.some((rule) => {
    const anchored = rule.endsWith("$");
    const body = anchored ? rule.slice(0, -1) : rule;
    const pattern =
      body
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*") + (anchored ? "$" : "");
    return new RegExp(`^${pattern}`).test(path);
  });
}
