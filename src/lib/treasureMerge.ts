import { treasureCategories as localTreasureCategories } from "@/content/treasures";
import type { TreasureCategory } from "@/content/types";

// Pure, so scripts/check-treasures.mts can exercise it against a simulated
// Sanity payload. It lives outside sanity/fetchers.ts for that reason alone:
// importing the fetchers from a script pulls in next/headers, which has no
// request to read outside a render.

/**
 * Makes a Studio-edited category safe to render.
 *
 * This exists because of a real outage. `personalization` is not a Studio
 * field, so the GROQ projection could not return it, and `TreasureCategory`
 * declares it required — so the moment the first treasureCategory document
 * existed in Sanity, Sanity content won wholesale, `personalization` arrived
 * undefined, and every build died prerendering /take-egypt-home/cartouches
 * with "Cannot read properties of undefined (reading 'map')".
 *
 * The type promised something the query could not keep. `safeFetch` casts the
 * GROQ result, so nothing in the compiler was ever going to notice, and the
 * local-content fallback meant no build without a live Sanity connection
 * could reproduce it either.
 *
 * So every array the renderer walks unguarded is guaranteed here:
 *
 *   - a field the Studio owns but an editor never filled comes back null from
 *     GROQ, and falls back to the local category's content,
 *   - a field an editor deliberately emptied comes back [], which is kept,
 *     because clearing a section is a legitimate edit,
 *   - a category that only exists in Sanity has no local counterpart, and
 *     gets an empty list rather than a crash.
 *
 * `personalization` is the one field that does not follow that rule: it is
 * taken from local content and never from Sanity. Those fields are not copy.
 * Each `name` is the wire contract between the request form,
 * /api/treasure-request and the private uploads bucket, which supports
 * exactly one photo field — an editor renaming one would silently break
 * submissions rather than change a word on screen.
 */
export function mergeTreasureCategoryWithLocal(category: TreasureCategory): TreasureCategory {
  const local = localTreasureCategories.find((c) => c.slug === category.slug);
  return {
    ...category,
    story: category.story ?? local?.story ?? [],
    beforeYouArrive: category.beforeYouArrive ?? local?.beforeYouArrive ?? [],
    trust: category.trust ?? local?.trust ?? [],
    faqs: category.faqs ?? local?.faqs ?? [],
    // Rendered only when `inEgypt` is present, but its steps are walked
    // unguarded once it is — so a half-filled block must not be fatal.
    inEgypt: category.inEgypt
      ? { ...category.inEgypt, steps: category.inEgypt.steps ?? local?.inEgypt?.steps ?? [] }
      : local?.inEgypt,
    personalization: local?.personalization ?? [],
    // Not Studio fields yet, so they would otherwise disappear from every
    // category page the moment a document exists in Sanity.
    relatedTourSlugs: category.relatedTourSlugs ?? local?.relatedTourSlugs,
    relatedPhotoshootSlugs: category.relatedPhotoshootSlugs ?? local?.relatedPhotoshootSlugs,
    relatedStorySlugs: category.relatedStorySlugs ?? local?.relatedStorySlugs,
    // Alt text an editor typed on the uploaded image belongs to the image,
    // and is what the page should use before falling back to the title.
    imageAlt: category.imageAlt ?? sanityImageAlt(category.image) ?? local?.imageAlt,
    imageCredit: category.imageCredit ?? local?.imageCredit,
  };
}

/** The alt text attached to an uploaded Sanity image, where one was typed. */
export function sanityImageAlt(image: unknown): string | undefined {
  if (image && typeof image === "object" && "alt" in image) {
    const alt = (image as { alt?: unknown }).alt;
    if (typeof alt === "string" && alt.trim().length > 0) return alt;
  }
  return undefined;
}

