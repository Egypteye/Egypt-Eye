// Tours that stay in the catalogue but are withheld from the site.
//
// This is a commercial decision, not a content edit: the trips below are
// still fully written, translated, priced and tagged, they are simply not
// being offered right now. Deleting them would throw away the itineraries,
// the translations and the destination tagging, and make it a rewrite rather
// than a checkbox to put one back.
//
// Deliberately NOT a Sanity field, for the same reason the cancellation
// policy isn't a Sanity document: Sanity wins wholesale over local content
// (see the fetcher precedence note in sanity/fetchers.ts), so a `hidden` flag
// living only in the CMS would be silently dropped by any document that
// predates it, and the site would quietly start selling a withdrawn trip
// again. Applied in code, the list holds whatever Sanity returns.
//
// What hiding does, and does not, do:
//   - Removed from /tours, the homepage, the Explore Egypt destination hubs,
//     "related tours" everywhere, the catalogue counts, and the sitemap.
//   - The tour's own page stays reachable and is marked noindex, so old
//     bookmarks, a saved journey and an editorial link inside a story all
//     still resolve instead of 404ing, while search engines let it go.
//
// To bring one back: delete its line. Nothing else needs to change.

export const hiddenTourSlugs: ReadonlySet<string> = new Set([
  // Red Sea & Sinai day trips
  "hurghada-red-sea-diving-snorkeling",
  "ras-mohammed-national-park-tour",
  "sharm-el-sheikh-day-trip-from-cairo",
  "blue-lagoon-dahab-day-trip",
  "dahab-blue-hole-three-pools-tour",
  "abu-galum-snorkeling-trek",
  "colored-canyon-nuweiba-tour",
  "taba-day-trip",
  "giftun-island-hurghada-boat-trip",
  "el-gouna-lagoon-day",
  "marsa-alam-dolphin-house-tour",
  "soma-bay-watersports-relaxation",
  "mount-sinai-sunrise-hike",
  "st-catherine-monastery-sinai-tour",

  // Cairo & Giza short trips
  "cairo-nile-dinner-cruise-night-tour",
  "cairo-by-night-tour",
  "cairo-felucca-sunset-sail",
  "khan-el-khalili-food-walking-tour",
  "egyptian-museum-coptic-cairo-tour",
  "giza-pyramids-sound-and-light-show",
  "sunrise-camel-ride-giza-pyramids",
  "quad-bike-stargazing-desert-night",

  // Luxor, Aswan & Nile day trips
  "luxor-east-bank-day-tour",
  "luxor-west-bank-day-tour",
  "valley-of-the-kings-hatshepsut-temple-tour",
  "luxor-museum-mummification-museum-tour",
  "karnak-temple-sound-and-light-show",
  "hot-air-balloon-luxor-east-bank-combo",
  "dendera-abydos-day-tour",
  "edfu-kom-ombo-day-tour",
  "esna-lock-nile-tour",
  "aswan-kom-ombo-felucca-sail-2-day",
  "kalabsha-temple-nubian-museum-tour",
  "philae-temple-sound-and-light-show",
  "lake-nasser-cruise-aswan-abu-simbel",

  // Western Desert & Fayoum
  "dakhla-kharga-oasis-circuit",
  "wadi-el-hitan-whale-valley-safari",

  // Jordan day trips and short breaks
  "petra-day-tour-from-amman",
  "petra-by-night",
  "wadi-rum-overnight-bedouin-camp",
  "amman-city-tour",
  "jerash-ajloun-castle-tour",
  "dead-sea-day-trip-jordan",
  "aqaba-red-sea-diving-jordan",
  "jordan-5-day-highlights",

  // Extended grand itineraries
  "14-day-egypt-jordan-classic-journey",
  "16-day-egypt-hidden-gems",
  "21-day-egypt-grand-explorer",
]);

export function isHiddenTour(slug: string): boolean {
  return hiddenTourSlugs.has(slug);
}

/**
 * Drops hidden tours from any list of them.
 *
 * Applied at the fetcher boundary rather than in each of the pages that show
 * a tour list, so a new surface that lists tours is hidden-aware by default
 * instead of having to remember.
 */
export function withoutHiddenTours<T extends { slug: string }>(tours: T[]): T[] {
  return tours.filter((tour) => tour && !hiddenTourSlugs.has(tour.slug));
}

/**
 * Strips withheld tours out of a document's `relatedTours` relation.
 *
 * Needed separately from withoutHiddenTours because a Story or an Experience
 * carries its own `relatedTours[]->` references in Sanity, resolved by the
 * document's own query — those never pass through the tour list, so filtering
 * the list alone left a live "you might also like" card pointing at a
 * withdrawn trip on every Sanity-served story and experience page.
 */
export function withoutHiddenRelatedTours<T extends { relatedTours?: { slug: string }[] }>(
  items: T[]
): T[] {
  return items.map((item) => {
    const related = item.relatedTours;
    if (!related) return item;
    // `null` entries are real: GROQ's `relatedTours[]->` dereferences to null
    // when the referenced tour has been deleted or unpublished, so a document
    // that still holds a stale reference comes back with a hole in the array.
    // The local fallback never contains one, which is why reading `t.slug`
    // straight off each entry survived every sandbox check and then crashed
    // the build the moment Sanity was the one answering. Dropping the holes
    // here also spares every consumer downstream the same guard.
    const cleaned = related.filter((t) => t && !hiddenTourSlugs.has(t.slug));
    return cleaned.length === related.length ? item : { ...item, relatedTours: cleaned };
  });
}
