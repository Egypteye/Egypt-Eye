import type { Metadata } from "next";
// Defined here rather than imported from content/seo to keep these two
// modules acyclic — seo.ts calls alternatesFor for every page's metadata.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from "./locales";

// hreflang for every page, in one place.
//
// Search engines need each translation to point at all the others, plus an
// x-default for anyone whose language isn't among them. Getting this wrong is
// the classic way a multilingual site ends up competing with itself, so it's
// derived from the locale registry rather than written per page: a new
// language joins every page's alternates the moment it's added.

export function alternatesFor(path: string, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l.htmlLang] = `${siteUrl}${localePath(path, l.code)}`;
  }
  // x-default points at English, which is also the unprefixed URL.
  languages["x-default"] = `${siteUrl}${localePath(path, DEFAULT_LOCALE)}`;

  return {
    canonical: `${siteUrl}${localePath(path, locale)}`,
    languages,
  };
}
