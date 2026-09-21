import { DEFAULT_LOCALE, type Locale } from "./locales";
import { say, type ContentDictionary } from "./contentStore";

// The strings written into components, rather than into content.
//
// These could have gone into the typed dictionaries beside the navigation and
// the buttons, and the first hundred did. The remaining few hundred are
// page-level: a section heading on the tour page, a form's validation
// message, an empty state in My Journey. Adding each as a typed key means
// adding a language later is not "run the pipeline" but "hand-translate
// several hundred keys again", which is the maintenance problem this system
// exists to avoid.
//
// So they go through the same fingerprint store the catalogue uses, and the
// same pipeline fills them. Kept in their own small file rather than the
// content store because Client Components need them: a few hundred strings
// serialize to the browser fine, and a quarter-million-word catalogue does
// not.
//
// The typed dictionaries stay for the chrome — navigation, footer, the
// buttons on every page. Those are worth hand-translating and worth having
// the compiler check.

const uiLoaders: Partial<Record<Locale, () => Promise<ContentDictionary>>> = {
  ar: async () => (await import("./generated/ui/ar.json")).default,
  fr: async () => (await import("./generated/ui/fr.json")).default,
  es: async () => (await import("./generated/ui/es.json")).default,
  it: async () => (await import("./generated/ui/it.json")).default,
  ru: async () => (await import("./generated/ui/ru.json")).default,
};

const EMPTY: ContentDictionary = Object.freeze({});
const cache = new Map<Locale, ContentDictionary>();

export async function uiDictionary(locale: Locale): Promise<ContentDictionary> {
  if (locale === DEFAULT_LOCALE) return EMPTY;
  const hit = cache.get(locale);
  if (hit) return hit;
  let dict: ContentDictionary = EMPTY;
  try {
    dict = (await uiLoaders[locale]?.()) ?? EMPTY;
  } catch {
    dict = EMPTY;
  }
  cache.set(locale, dict);
  return dict;
}

/** Translate against an already-loaded UI dictionary. */
export function uiSay(dict: ContentDictionary, text: string): string {
  return say(dict, text);
}
