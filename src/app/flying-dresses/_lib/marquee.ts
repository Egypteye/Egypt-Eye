import { FLYING_DRESS_COLLECTION } from "@/content/outfitCollection";
import { agency, location, wardrobeLineup } from "./assets";
import { dressPhotos } from "./dressPhotos";

/**
 * THE MOVING RIBBON OF WORK.
 *
 * The owner asked for "photos animated slider with variety of photos moving".
 * This is the data behind it: two rows, travelling in opposite directions at
 * different speeds, so the band reads as a wall of work rather than a
 * carousel somebody has to operate.
 *
 * =========================================================================
 * COMPOSED, NEVER RETYPED
 * =========================================================================
 * Every entry here POINTS AT an existing slot or dress photograph rather than
 * carrying its own src and alt. That is deliberate and it is the lesson of
 * the three faults this brand has already had: a second hand-kept copy of a
 * photograph's path and description is a copy that drifts. When a slot is
 * repointed — as the Fayoum one just was, from an archway to the lake — this
 * ribbon follows it in the same commit, with the right alt text, for free.
 *
 * It also means nothing here can be a stock photograph, because there is
 * nowhere to put one: a marquee entry is a reference to the agency's own
 * library, not a src string.
 *
 * =========================================================================
 * WHY TWO ROWS, AND WHY THESE TWO
 * =========================================================================
 * They answer different questions, which is what makes the pairing worth the
 * vertical space rather than just twice the pictures.
 *
 *   PLACES AND PEOPLE — rooftop, dunes, Fayoum; solo, couple, group; and the
 *   assistant mid-throw, which is the one frame on the site that shows how
 *   the photograph is actually made.
 *
 *   THE TWELVE COLOURS — the whole collection, in order, on one roof. A
 *   visitor who has not yet opened the wardrobe sees the range in six
 *   seconds without being asked to click anything.
 *
 * The second row is built from FLYING_DRESS_COLLECTION rather than from a
 * hand-written list, so a thirteenth dress arrives here the moment it arrives
 * in the collection and a withdrawn one leaves. A dress with no photograph is
 * skipped rather than rendered as a colour rectangle: the ribbon is a claim
 * about photography and a swatch in it would be a weaker claim than a shorter
 * row.
 */

export type MarqueeFrame = { src: string; alt: string };

function frame(slot: { src: string | null; alt: string }): MarqueeFrame | null {
  return slot.src ? { src: slot.src, alt: slot.alt } : null;
}

/** Rooftop, dunes and lake; one person, two people, eight people. */
export const marqueePlaces: MarqueeFrame[] = [
  agency.rooftopPortrait,
  location.fayoumLake,
  location.saharaDunes,
  agency.couplesRomance,
  wardrobeLineup,
  agency.genderReveal,
  agency.fayoumDress,
  agency.couplesVows,
  agency.assistantAtWork,
  agency.gizaSand,
]
  .map(frame)
  .filter((f): f is MarqueeFrame => f !== null);

/** The collection, in the order the wardrobe lists it. */
export const marqueeColours: MarqueeFrame[] = FLYING_DRESS_COLLECTION.map((dress) => {
  const photo = dressPhotos[dress.id];
  return photo ? { src: photo.src, alt: photo.alt } : null;
}).filter((f): f is MarqueeFrame => f !== null);
