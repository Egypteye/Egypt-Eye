import type {
  DestinationHub,
  Experience,
  Photoshoot,
  SignatureExperience,
  Tour,
} from "@/content/types";

// Guarantees the arrays the renderer walks without checking first.
//
// This exists because of an outage. `TreasureCategory.personalization` is
// required by its type, the GROQ projection could not return it, and the
// first Studio document took every build down with "Cannot read properties
// of undefined (reading 'map')" — for two days, across three deploys.
//
// The same gap is open on every product type, for a second reason: GROQ
// returns null for a field an editor cleared. `Tour.highlights` is required,
// so nothing in the code checks it, so emptying the Highlights list on one
// tour in the Studio would end the next build on that tour's page — and one
// page error exits the whole build. The site would stop deploying until
// somebody typed the field back in, with no message saying so.
//
// That is not an acceptable property for a CMS whose whole point is that
// non-developers edit it. Clearing a field is a legitimate edit; it should
// empty a section, never break the site.
//
// So each type's required arrays are guaranteed here, at the one boundary
// every page goes through. Three cases, deliberately distinguished:
//
//   - null/undefined (never set, or not in the projection) -> the local
//     content file's value, which is the richer answer when one exists,
//   - [] (an editor emptied it) -> kept as [], because that is a real edit
//     and quietly restoring the repo's copy would overrule it,
//   - no local counterpart -> [], so a Studio-only document renders an empty
//     section rather than throwing.
//
// Nested relations are hardened too: `relatedTours` is typed as Tour[] and
// renders through the same TourCard, so a related tour is exposed to exactly
// the same crash as a top-level one.

/** Keeps a deliberate [], replaces a missing value. */
function arr<T>(value: T[] | undefined | null, fallback?: T[]): T[] {
  if (Array.isArray(value)) return value;
  return fallback ?? [];
}

function bySlug<T extends { slug: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.slug, item]));
}

export function hardenTour(tour: Tour, local?: Tour): Tour {
  return {
    ...tour,
    destinations: arr(tour.destinations, local?.destinations),
    highlights: arr(tour.highlights, local?.highlights),
    included: arr(tour.included, local?.included),
    excluded: arr(tour.excluded, local?.excluded),
    faqs: arr(tour.faqs, local?.faqs),
    relatedExperiences: tour.relatedExperiences?.map((e) => hardenExperience(e)),
  };
}

export function hardenExperience(experience: Experience, local?: Experience): Experience {
  return {
    ...experience,
    included: arr(experience.included, local?.included),
    timeSlots: arr(experience.timeSlots, local?.timeSlots),
    extras: arr(experience.extras, local?.extras),
    faqs: arr(experience.faqs, local?.faqs),
    relatedTours: experience.relatedTours?.map((t) => hardenTour(t)),
  };
}

export function hardenPhotoshoot(photoshoot: Photoshoot, local?: Photoshoot): Photoshoot {
  return {
    ...photoshoot,
    locations: arr(photoshoot.locations, local?.locations),
    goodFor: arr(photoshoot.goodFor, local?.goodFor),
    included: arr(photoshoot.included, local?.included),
    delivery: arr(photoshoot.delivery, local?.delivery),
    // The booking popup's dropdown and its priced extras. These follow the
    // same three-case rule as every other array here, which is what makes the
    // content file a working default: a Studio document that has never had
    // extras typed into it projects null and falls back to the repo's list, so
    // the popup is complete before anyone edits the CMS — while an editor who
    // empties the list in Studio gets an empty list, not the repo's copy back.
    timeSlots: arr(photoshoot.timeSlots, local?.timeSlots),
    extras: arr(photoshoot.extras, local?.extras),
    // Added after a live product shipped with no FAQs at all.
    //
    // `faqs` and `addOns` are projected by GROQ and declared on the type, but
    // they were missing from this list \u2014 so a Studio document that had never
    // had them typed in projected null, nothing fell back, and the page
    // rendered zero questions. That also drops the FAQPage structured data,
    // which is invisible until somebody checks why a product has no rich
    // result. The same three-case rule applies: never set falls back to the
    // repo's copy, a list an editor emptied stays empty.
    addOns: arr(photoshoot.addOns, local?.addOns),
    faqs: arr(photoshoot.faqs, local?.faqs),
  };
}

export function hardenDestinationHub(hub: DestinationHub, local?: DestinationHub): DestinationHub {
  // matchNames drives destination matching rather than any visible section —
  // an empty one quietly stops a hub matching anything, which is wrong but
  // survivable; a null one throws in lib/destinationMatch.
  return { ...hub, matchNames: arr(hub.matchNames, local?.matchNames) };
}

export function hardenSignatureExperience(
  experience: SignatureExperience,
  local?: SignatureExperience
): SignatureExperience {
  return {
    ...experience,
    experienceHighlights: arr(experience.experienceHighlights, local?.experienceHighlights),
    itineraryDays: arr(experience.itineraryDays, local?.itineraryDays),
    careItems: arr(experience.careItems, local?.careItems),
  };
}

/** List forms, pairing each record with its local counterpart by slug. */
export const hardenTours = (tours: Tour[], local: readonly Tour[]): Tour[] => {
  const map = bySlug(local);
  return tours.map((t) => hardenTour(t, map.get(t.slug)));
};

export const hardenExperiences = (items: Experience[], local: readonly Experience[]): Experience[] => {
  const map = bySlug(local);
  return items.map((e) => hardenExperience(e, map.get(e.slug)));
};

export const hardenPhotoshoots = (items: Photoshoot[], local: readonly Photoshoot[]): Photoshoot[] => {
  const map = bySlug(local);
  return items.map((p) => hardenPhotoshoot(p, map.get(p.slug)));
};

export const hardenDestinationHubs = (items: DestinationHub[], local: readonly DestinationHub[]): DestinationHub[] => {
  const map = bySlug(local);
  return items.map((h) => hardenDestinationHub(h, map.get(h.slug)));
};

export const hardenSignatureExperiences = (
  items: SignatureExperience[],
  local: readonly SignatureExperience[]
): SignatureExperience[] => {
  const map = bySlug(local);
  return items.map((e) => hardenSignatureExperience(e, map.get(e.slug)));
};
