// The key every content translation is stored under.
//
// Translating a catalogue this size can't work off field names: a tour has
// nine prose fields, an itinerary day has two more, and an article body is an
// arbitrary tree of blocks. Keying off the English text itself means any
// string anywhere becomes translatable without a schema change, and — the
// part that matters on a live site — an edit to the English automatically
// invalidates its translations, because the edited text fingerprints
// differently and falls back to English until the pipeline catches up. A
// wrong translation is worse than an untranslated one; this makes the wrong
// one impossible.

/**
 * Whitespace is normalised first so that re-indenting a template literal, or
 * a Studio paste that arrives with a non-breaking space, doesn't orphan a
 * translation. HTML collapses this whitespace when rendering anyway, so the
 * normalised form is what a reader actually sees.
 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * A 64-bit fingerprint, as 16 hex characters.
 *
 * Two independent FNV-1a passes with different offset bases, concatenated.
 * Not cryptographic and doesn't need to be — it needs to be stable across
 * Node and the browser, fast enough to run on every string of every page
 * during a 2,000-page static build, and collision-free across a corpus of a
 * few hundred thousand strings. 64 bits gives a collision probability around
 * one in ten billion at this corpus size.
 */
export function fingerprint(text: string): string {
  const s = normalizeText(text);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= c + i;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

/**
 * Whether a string is worth sending to a translator at all.
 *
 * Filters out the things that read as text but aren't prose: URLs, slugs,
 * asset references, bare numbers, ISO dates and currency codes. Keeping them
 * out of the manifest is not just a saving — it stops a translator helpfully
 * "translating" a slug and breaking a route.
 */
export function isTranslatable(text: string): boolean {
  const s = normalizeText(text);
  if (s.length < 2) return false;
  if (!/\p{L}{2}/u.test(s)) return false; // no two consecutive letters: numbers, symbols
  if (/^https?:\/\//i.test(s)) return false;
  if (/^[/#][\w\-/#?=&.]*$/.test(s)) return false; // paths and anchors
  if (/^[a-z0-9]+(?:[-_][a-z0-9]+)+$/.test(s)) return false; // slugs and ids
  if (/^image-[a-f0-9]{8,}/.test(s)) return false; // Sanity asset refs
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return false; // ISO dates
  if (/^[A-Z]{3}$/.test(s)) return false; // currency codes
  return true;
}
