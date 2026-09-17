import { DEFAULT_LOCALE, type Locale } from "./locales";
import { contentDictionary, say, type ContentDictionary } from "./contentStore";
import { fingerprint, isTranslatable, normalizeText } from "./fingerprint";

// Translating the whole catalogue, without naming every field.
//
// A tour has nine prose fields plus an itinerary of two more per day; an
// article body is an arbitrary tree of Portable Text and custom blocks; a
// signature experience has twenty-odd. Listing each path would be a list
// nobody keeps current — the first field added in Studio would silently ship
// in English forever.
//
// So the walk goes the other way: recurse through anything, and translate a
// string only when the KEY it sits under is a known prose key. New fields
// named `description` or `answer` are translated the day they appear; a
// field named `slug` or `category` never is, however deeply it's nested.
//
// The allowlist is deliberately conservative. Getting it wrong in one
// direction leaves a string in English, which is a working page. Getting it
// wrong in the other translates a value something else matches on — a slug, a
// destination the map resolves to coordinates, a category the tour filter
// compares against — and quietly breaks a feature in six languages while
// English stays green. Everything below is a field that is only ever
// rendered, never compared.

const PROSE_KEYS = new Set([
  // Universal editorial fields
  "title", "tagline", "description", "excerpt", "intro", "body", "note",
  "heading", "subheading", "subtitle", "headline", "subheadline", "subtext",
  "eyebrow", "badge", "label", "caption", "alt", "text", "summary",
  // Lists that render as bullets
  "highlights", "included", "excluded", "addOns", "delivery", "goodFor",
  "goodToKnow", "careItems", "locations", "steps", "perks", "features",
  // Q&A and quotes
  "question", "answer", "quote", "attribution", "context", "role", "bio",
  // Product detail that is displayed, never matched on
  "duration", "location", "region", "groupSize", "luxuryLevel", "forWhom",
  "imageLabel", "linkLabel", "buttonLabel", "ctaLabel", "cta", "placeholder",
  // Signature experience's named sections
  "emotionalHeadline", "shortDescription", "experienceIntro",
  "whoIsThisForTitle", "whoIsThisForBody", "whyWeCreatedThisTitle",
  "whyWeCreatedThisBody", "careTitle", "careIntro", "positioning",
  // Per-page SEO, so metadata is translated with the page it describes
  "seoTitle", "seoDescription", "metaTitle", "metaDescription",
  "template", "blurb", "message", "prompt", "disclaimer", "tooltip", "name",
  // Itinerary step times ("Afternoon"), policy paragraphs, form options,
  // and the singular/plural pair on the signature-experience collection.
  "time", "notes", "age", "deposit", "voucher", "cancellation", "options",
  "singular", "plural", "luxuryLevel", "price", "currency",
]);

/**
 * Keys that are never translated even when a prose key sits beneath them.
 *
 * `matchNames` is a hub's list of aliases the map matches a tour's
 * destinations against, and `mapStops` is a route in place names — translate
 * either and the map silently loses its pins in six languages.
 */
const OPAQUE_KEYS = new Set([
  "slug", "href", "url", "sourceUrl", "canonicalUrl", "image", "ogImage",
  "heroImage", "gallery", "images", "matchNames", "mapStops", "destinations",
  "cities", "travelStyle", "tags", "category", "imageTone", "heroImageTone",
  "primaryKeyword", "secondaryKeywords", "_type", "_key", "_ref", "_id",
  "id", "status", "tier", "mood", "marks", "markDefs", "style",
  "listItem", "imageCredit", "subjectSlug",
  // Values something else matches on, which read like prose and are not:
  // a transfer zone's group is compared against "Cairo & Giza" in
  // transfers.ts, and the rest are discriminators or photo provenance.
  "group", "includedOrOptional", "tone", "fieldKey", "fieldType", "width",
  "kind", "icon", "vehicle", "source", "creator", "license", "email",
  "whatsapp", "instagram", "facebook", "tiktok", "youtube", "pinterest",
  "publishedAt", "contentReviewDate", "targetDateTime", "backgroundTone",
]);

// Content trees are shallow in practice (an article body is three or four
// levels); this only stops a cyclic structure from hanging a build.
const MAX_DEPTH = 12;

/**
 * Whether a field name is prose, allowing for the compound names this
 * codebase uses throughout — `heroHeadline`, `whatWeDoDescription`,
 * `formIntroTitle`, `collectionTitleSingular`.
 *
 * Matching the tail rather than the whole name is what makes the allowlist
 * survive contact with real field names: an exact-match list caught 8 of the
 * listing pages' 27 strings and none of the About page's, because almost
 * every page-copy field is prefixed with the section it belongs to. Opaque
 * names are tested the same way and tested FIRST, so `heroImage` and
 * `bannerImage` stay opaque while `imageLabel` stays prose.
 */
function tailMatch(key: string, set: Set<string>): boolean {
  if (set.has(key)) return true;
  const lower = key.toLowerCase();
  for (const candidate of set) {
    const c = candidate.toLowerCase();
    // Only a camelCase boundary counts, so `style` never matches
    // `travelStyle`'s tail by accident of substring position.
    if (lower.length > c.length && lower.endsWith(c)) {
      const boundary = key[key.length - candidate.length];
      if (boundary && boundary === boundary.toUpperCase() && boundary !== boundary.toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

function isProseKey(key: string): boolean {
  return !tailMatch(key, OPAQUE_KEYS) && tailMatch(key, PROSE_KEYS);
}

function isOpaqueKey(key: string): boolean {
  return tailMatch(key, OPAQUE_KEYS);
}

function walk(value: unknown, dict: ContentDictionary, key: string, depth: number): unknown {
  if (depth > MAX_DEPTH || value === null || value === undefined) return value;

  if (typeof value === "string") {
    return isProseKey(key) && isTranslatable(value) ? say(dict, value) : value;
  }

  if (Array.isArray(value)) {
    // The array keeps its own key, so `highlights: string[]` translates its
    // members and `itinerary: Day[]` recurses into each day's own fields.
    return value.map((item) => walk(item, dict, key, depth + 1));
  }

  if (typeof value !== "object") return value;

  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  let changed = false;
  for (const [k, v] of Object.entries(source)) {
    if (isOpaqueKey(k)) {
      out[k] = v;
      continue;
    }
    const next = walk(v, dict, k, depth + 1);
    out[k] = next;
    if (next !== v) changed = true;
  }
  // Returning the original when nothing changed keeps referential equality,
  // which matters for the fetchers that hand the same object to several
  // components on a page.
  return changed ? out : value;
}

/**
 * Anything from the CMS or the content files, in the reader's language.
 *
 * Applied at the fetcher boundary so no page or component needs to know that
 * translations exist. English short-circuits entirely: the English site does
 * no extra work and cannot be affected by a translation.
 */
export async function localizeContent<T>(value: T, locale: Locale): Promise<T> {
  if (locale === DEFAULT_LOCALE) return value;
  const dict = await contentDictionary(locale);
  if (Object.keys(dict).length === 0) return value;
  return walk(value, dict, "", 0) as T;
}

/** The synchronous form, for callers that already hold the dictionary. */
export function localizeContentWith<T>(value: T, dict: ContentDictionary): T {
  return walk(value, dict, "", 0) as T;
}


/**
 * Every string the runtime would try to translate, collected instead of
 * replaced.
 *
 * Deliberately the same walk as `localizeContent`, driven by the same two key
 * sets, so the extraction manifest and the runtime lookups cannot drift. If
 * this collected a different set, the pipeline would spend tokens translating
 * strings no page ever asks for, while leaving visible ones in English.
 */
export function collectStrings(value: unknown, into: Map<string, string> = new Map()): Map<string, string> {
  const gather = (node: unknown, key: string, depth: number): void => {
    if (depth > MAX_DEPTH || node === null || node === undefined) return;
    if (typeof node === "string") {
      if (isProseKey(key) && isTranslatable(node)) {
        const text = normalizeText(node);
        into.set(fingerprint(text), text);
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) gather(item, key, depth + 1);
      return;
    }
    if (typeof node !== "object") return;
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (!isOpaqueKey(k)) gather(v, k, depth + 1);
    }
  };
  gather(value, "", 0);
  return into;
}

/** How a field name is classified — the reviewable form of the two sets above. */
export function classifyKey(key: string): "prose" | "opaque" | "unclassified" {
  if (isOpaqueKey(key)) return "opaque";
  if (isProseKey(key)) return "prose";
  return "unclassified";
}

/** Exported for the extraction script, so the manifest is exactly what the runtime reads. */
export const TRANSLATABLE_KEYS = PROSE_KEYS;
export const OPAQUE_CONTENT_KEYS = OPAQUE_KEYS;
