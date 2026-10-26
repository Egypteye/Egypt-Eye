import type { FlyingDressGallery } from "./types";
import { agency, empty } from "../app/flying-dresses/_lib/assets";

/**
 * The Flying Dresses galleries, as the repository knows them.
 *
 * This is the FALLBACK half of a Sanity-backed type. Read the
 * `sanity-content` skill before changing it, and specifically this:
 *
 *   A published Studio document for a galleryId REPLACES the entry here
 *   wholesale. It does not merge field by field.
 *
 * That is deliberate and it is the point: the owner works from a browser and
 * needs to reorder frames, change a caption and swap a photograph without a
 * developer. What it costs is that a field added here and not to
 * src/sanity/schemaTypes/flyingDressGallery.ts is silently empty in
 * production for any gallery that has a document. The five places to change
 * together are listed in the skill.
 *
 * Until a document exists, these render, which is why they are real rather
 * than placeholders.
 */
export const flyingDressGalleries: FlyingDressGallery[] = [
  {
    galleryId: "home-work",
    title: "What a morning looks like",
    layout: "grid",
    // Six, because .fd-gallery is pinned to 1, 2 or 3 columns and six divides
    // evenly by all three, so no frame is ever stranded in a row of its own.
    // Rebuilt October 2026 around the AAT rooftop session. It used to lead
    // with briana-trip and cherry-travel, which are 533x800 and 800x533: real
    // work, but the only genuine flying-dress frames the brand had, and small
    // enough that this grid was sized around them. Six colours from one
    // morning replace them, and the collaborations keep their place on the
    // About page where the subject is the collaboration.
    frames: [
      agency.rooftopRed,
      agency.rooftopGreen,
      agency.rooftopPurple,
      agency.assistantAtWork,
      agency.fayoumDress,
      // The one subject with no photograph. It stays in the list on purpose:
      // a labelled gap is this brand's answer to a missing frame, never a
      // stock photograph standing in for client work. The October folder did
      // not contain a dress and a gawn in one frame either.
      empty.couple,
    ],
  },
];

export function flyingDressGalleryById(
  galleryId: string
): FlyingDressGallery | undefined {
  return flyingDressGalleries.find((gallery) => gallery.galleryId === galleryId);
}
