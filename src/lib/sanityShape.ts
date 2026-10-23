import type {
  DestinationHub,
  FlyingDressGallery,
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

/**
 * Time slots as the Studio actually receives them.
 *
 * A real booking page shipped with one dropdown option reading
 * "\t6:00 AM, 9:00 AM, 1:00 PM", because all three times were pasted into a
 * single row of the timeSlots array instead of three. The customer was offered
 * one unusable choice, and nothing failed: the array was present, non-empty
 * and typed correctly, so every guard upstream was satisfied.
 *
 * Typing a comma-separated list into one box is what people do with a list
 * field, so it is handled rather than policed: entries are trimmed (the tab
 * came from the paste) and split on commas.
 *
 * The trade-off is deliberate. A slot label that legitimately contains a comma
 * would be split in two, which is cosmetic; a comma-separated list left whole
 * is a booking form nobody can use. No label in this codebase has ever
 * contained a comma, and the failure modes are not the same size.
 */
function slots(value: string[] | undefined | null, fallback?: string[]): string[] {
  const source = arr(value, fallback);
  return source
    .flatMap((slot) => (typeof slot === "string" ? slot.split(",") : []))
    .map((slot) => slot.trim())
    .filter((slot) => slot !== "");
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
    timeSlots: slots(experience.timeSlots, local?.timeSlots),
    extras: arr(experience.extras, local?.extras),
    // Same three-case rule. A Studio document that has never had an outfit
    // typed into it projects null and falls back to the repo's collection, so
    // the twelve dresses are live before anyone opens the CMS — while an
    // editor who empties the list gets an empty list, not the repo's copy back,
    // which is how a product stops offering outfits at all.
    outfits: arr(experience.outfits, local?.outfits),
    faqs: arr(experience.faqs, local?.faqs),
    // Same three-case rule as every other array here: never set in Studio
    // falls back to the repo's list, an editor who empties it gets an empty
    // list back. Without this line a Studio document that predates the field
    // projects null, nothing falls back, and the enquiry form quietly stops
    // asking the product's own questions.
    enquiryOptions: arr(experience.enquiryOptions, local?.enquiryOptions),
    // A scalar, so it cannot use arr()'s three-case rule — but it needs the
    // same protection. A Studio document that predates this field projects
    // theme: null, the spread above writes that null over the content file's
    // value, and the product drops out of its collection into the loose
    // "More" bucket on the listing page. Visible only in production.
    theme: experience.theme ?? local?.theme,
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
    timeSlots: slots(photoshoot.timeSlots, local?.timeSlots),
    extras: arr(photoshoot.extras, local?.extras),
    // Same three-case rule. A Studio document that has never had an outfit
    // typed into it projects null and falls back to the repo's collection, so
    // the twelve dresses are live before anyone opens the CMS — while an
    // editor who empties the list gets an empty list, not the repo's copy back,
    // which is how a product stops offering outfits at all.
    outfits: arr(photoshoot.outfits, local?.outfits),
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

/**
 * A Flying Dresses gallery, safe to render.
 *
 * `frames` is required by the type, so every page walks it without checking.
 * The three cases are the ones the whole of this file exists for, and the
 * middle one is the one that is easy to get wrong:
 *
 *   - null/undefined: the projection did not return it, or no editor ever set
 *     it. The repo's own frames are the richer answer, so use them.
 *   - []: an editor emptied the gallery. That is a real edit. Keep it empty;
 *     quietly restoring the repo's frames would overrule a deliberate choice
 *     and the editor would have no way to tell why.
 *   - no local counterpart: a gallery that exists only in the Studio. Empty,
 *     so it renders nothing rather than throwing.
 *
 * `layout` gets the same treatment for a different reason: it is a union, and
 * a document saved before the field existed returns null for it, which would
 * reach the component as a class name of `fd-gallery-null`.
 */
export function hardenFlyingDressGallery(
  gallery: FlyingDressGallery,
  local?: FlyingDressGallery
): FlyingDressGallery {
  const layout = gallery.layout;
  return {
    ...gallery,
    title: gallery.title || local?.title || "",
    layout:
      layout === "grid" || layout === "feature" || layout === "strip"
        ? layout
        : (local?.layout ?? "grid"),
    frames: arr(gallery.frames, local?.frames),
  };
}
