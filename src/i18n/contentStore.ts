import { DEFAULT_LOCALE, type Locale } from "./locales";
import { fingerprint, normalizeText } from "./fingerprint";

// The translated catalogue, loaded once per locale per server process.
//
// Each generated file is a flat map of { fingerprint: translation } covering
// everything editorial on the site in that language — tour copy, itineraries,
// article bodies, testimonials, hub intros. Flat and fingerprint-keyed so the
// runtime never has to know which content type a string came from, which is
// what lets a new field or a new content type be translated without touching
// this file.

export type ContentDictionary = Readonly<Record<string, string>>;

const EMPTY: ContentDictionary = Object.freeze({});
const cache = new Map<Locale, ContentDictionary>();

/**
 * Loaded per locale rather than imported statically for all six: the files
 * are large, and a route rendering in French has no reason to carry the
 * Russian catalogue in its serverless bundle.
 *
 * A missing file is the normal state for a locale the pipeline hasn't been
 * run for yet, so it resolves to an empty dictionary — every string then
 * falls back to English and the site works, untranslated.
 */
/**
 * Spelled out one locale at a time rather than built from a template literal.
 * A dynamic `import(`./generated/${locale}.json`)` type-checks and runs fine
 * under tsx, and then silently resolves to nothing once bundled — the site
 * builds green and every page ships in English. The explicit map is what
 * makes each file a real, code-split chunk. Adding a language is one line
 * here, next to its entry in locales.ts.
 */
const loaders: Partial<Record<Locale, () => Promise<ContentDictionary>>> = {
  ar: async () => (await import("./generated/ar.json")).default,
  fr: async () => (await import("./generated/fr.json")).default,
  es: async () => (await import("./generated/es.json")).default,
  it: async () => (await import("./generated/it.json")).default,
  ru: async () => (await import("./generated/ru.json")).default,
};

export async function contentDictionary(locale: Locale): Promise<ContentDictionary> {
  if (locale === DEFAULT_LOCALE) return EMPTY;
  const cached = cache.get(locale);
  if (cached) return cached;

  let dict: ContentDictionary = EMPTY;
  try {
    dict = (await loaders[locale]?.()) ?? EMPTY;
  } catch {
    // A locale whose file hasn't been generated yet: every string falls back
    // to English and the site works, untranslated.
    dict = EMPTY;
  }
  cache.set(locale, dict);
  return dict;
}

/**
 * One string, translated — or the English, which is always a correct page.
 *
 * Callers hold the dictionary rather than awaiting per string: a tour page
 * translates a few hundred strings, and a promise each would turn a
 * synchronous object walk into an async one for no benefit.
 */
export function say(dict: ContentDictionary, text: string): string {
  if (dict === EMPTY) return text;
  const hit = dict[fingerprint(text)];
  return hit && hit.trim().length > 0 ? hit : text;
}

/** The list form, for string arrays like highlights and inclusions. */
export function sayAll(dict: ContentDictionary, texts: readonly string[]): string[] {
  return texts.map((text) => say(dict, text));
}

/**
 * How much of a set of English strings this locale actually has, as a
 * fraction. Feeds the admin coverage view — with a corpus this size the
 * useful question is never "is it translated" but "how far along is it".
 */
export function coverageOf(dict: ContentDictionary, texts: readonly string[]): number {
  if (texts.length === 0) return 1;
  const done = texts.filter((t) => Boolean(dict[fingerprint(normalizeText(t))])).length;
  return done / texts.length;
}
