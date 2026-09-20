import type { Metadata } from "next";
// Defined here rather than imported from content/seo to keep these two
// modules acyclic — seo.ts calls alternatesFor for every page's metadata.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from "./locales";
import { isLocalePublished } from "./readiness";

// hreflang and canonicals for every page, in one place.
//
// Search engines need each translation to point at all the others, plus an
// x-default for anyone whose language isn't among them. Getting this wrong is
// the classic way a multilingual site ends up competing with itself, so it's
// derived from the locale registry rather than written per page.
//
// Only languages that are actually translated take part. An untranslated
// locale serving English copy at its own URL is a duplicate, not a
// translation, so it canonicalises to English and is left out of everyone
// else's alternate set — see i18n/readiness.ts. That keeps the hreflang
// cluster honest: every URL in it is a genuinely different-language version
// of the same page, which is the condition under which hreflang helps rather
// than hurts.

export function alternatesFor(path: string, locale: Locale): Metadata["alternates"] {
  const published = LOCALES.filter((l) => isLocalePublished(l.code));

  const languages: Record<string, string> = {};
  for (const l of published) {
    languages[l.htmlLang] = `${siteUrl}${localePath(path, l.code)}`;
  }
  // x-default points at English, which is also the unprefixed URL.
  languages["x-default"] = `${siteUrl}${localePath(path, DEFAULT_LOCALE)}`;

  // An unpublished locale points at the English page rather than at itself:
  // it is the same content, so consolidating the signal there is both what
  // Google asks for and what stops the duplicate from ranking in its place.
  const canonical = isLocalePublished(locale)
    ? `${siteUrl}${localePath(path, locale)}`
    : `${siteUrl}${localePath(path, DEFAULT_LOCALE)}`;

  // With only one published language there is no alternate set worth
  // declaring — a lone self-referencing hreflang is noise.
  return published.length > 1 ? { canonical, languages } : { canonical };
}
