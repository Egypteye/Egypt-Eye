import { DEFAULT_LOCALE, LOCALE_CODES, type Locale } from "./locales";

// How CMS content gets translated.
//
// The catalogue — tour titles and descriptions, itineraries, listing-page
// headings, article bodies — is editor-owned and grows every week, so it can't
// live in a dictionary in the repo. Instead each translatable field gains an
// optional sibling holding its translations, keyed by locale:
//
//   { title: "1 Day Giza Tour", title_i18n: { ar: "...", fr: "..." } }
//
// Two properties make this safe to roll out gradually, which matters when
// there are 79 tours and 114 articles:
//
//   1. English is never stored in the translations map — it stays in the
//      original field, so the English site reads exactly as it always has and
//      cannot be broken by a translation edit.
//   2. A missing translation falls back to English rather than rendering
//      blank. A half-translated catalogue is a working site, not a broken one,
//      so editors can translate the highest-value products first.

/** A field plus its translations, as stored in Sanity. */
export type Translated = Record<string, string | undefined>;

/**
 * The value for this locale, or the English original when there's no
 * translation yet. Never returns an empty string in place of real content.
 */
export function localized(
  original: string | undefined,
  translations: Translated | undefined,
  locale: Locale
): string {
  if (locale === DEFAULT_LOCALE) return original ?? "";
  const candidate = translations?.[locale];
  if (typeof candidate === "string" && candidate.trim().length > 0) return candidate;
  return original ?? "";
}

/** The list form, for string arrays like highlights and inclusions. */
export function localizedList(
  original: string[] | undefined,
  translations: Record<string, string[] | undefined> | undefined,
  locale: Locale
): string[] {
  if (locale === DEFAULT_LOCALE) return original ?? [];
  const candidate = translations?.[locale];
  if (Array.isArray(candidate) && candidate.length > 0) return candidate;
  return original ?? [];
}

/**
 * How much of a set of records is translated, per locale.
 *
 * Feeds the admin coverage view: with a catalogue this size, the useful
 * question is never "is it translated" but "which language is furthest along
 * and what's left", and that has to be answerable without opening Studio.
 */
export function translationCoverage(
  records: { translations?: Translated }[],
): Record<Locale, { done: number; total: number }> {
  const out = {} as Record<Locale, { done: number; total: number }>;
  for (const code of LOCALE_CODES) {
    if (code === DEFAULT_LOCALE) continue;
    const done = records.filter((r) => {
      const v = r.translations?.[code];
      return typeof v === "string" && v.trim().length > 0;
    }).length;
    out[code] = { done, total: records.length };
  }
  return out;
}
