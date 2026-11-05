import type { FlyingDressGallery } from "./types";
import {
  agency,
  empty,
  shootGenerated,
  shootPhoto,
  shootRetouched,
} from "../app/flying-dresses/_lib/assets";

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

/**
 * ONE GALLERY PER SHOOT, mixing what exists.
 *
 * The owner supplied these folders on 5 November 2026 and said plainly that
 * there are not enough real photographs to fill a page per shoot, so real and
 * generated frames should sit together. They do — but each frame keeps its own
 * `kind`, so the mixing happens in the layout and never in the claim.
 *
 * Fayoum is the only one of the three with real photography of its own, so it
 * leads with camera frames and the generated one comes last. The White Desert
 * and the yacht have none at all, which is why every frame there is generated
 * and captioned as such. A real Fayoum or rooftop frame was NOT borrowed to
 * pad them: a photograph of the wrong place is the error the desert geography
 * guard exists to catch, and it would be the same error here.
 */
const SHOOT_GALLERIES: FlyingDressGallery[] = [
  {
    // 24 frames: twelve camera, eleven retouched, one generated. The count is
    // a multiple of 2 and 3 for the same reason the home gallery's is six —
    // .fd-gallery pins to 1, 2 or 3 columns, and 25 left one frame alone in
    // the last row at every breakpoint. fayoumRetouched12 is the one left out
    // and stays in the registry, ready for the Studio to drop in.
    galleryId: "shoot-fayoum",
    title: "From the Fayoum sessions",
    layout: "grid",
    frames: [
      shootPhoto.fayoumShoot1,
      shootPhoto.fayoumShoot2,
      shootPhoto.fayoumShoot3,
      shootPhoto.fayoumShoot4,
      shootPhoto.fayoumShoot5,
      shootPhoto.fayoumShoot6,
      shootPhoto.fayoumShoot7,
      shootPhoto.fayoumShoot8,
      shootPhoto.fayoumShoot9,
      shootPhoto.fayoumShoot10,
      shootPhoto.fayoumShoot11,
      shootPhoto.fayoumShoot12,
      shootRetouched.fayoumRetouched1,
      shootRetouched.fayoumRetouched2,
      shootRetouched.fayoumRetouched3,
      shootRetouched.fayoumRetouched4,
      shootRetouched.fayoumRetouched5,
      shootRetouched.fayoumRetouched6,
      shootRetouched.fayoumRetouched7,
      shootRetouched.fayoumRetouched8,
      shootRetouched.fayoumRetouched9,
      shootRetouched.fayoumRetouched10,
      shootRetouched.fayoumRetouched11,
      shootGenerated.fayoumGenerated1,
    ],
  },
  {
    galleryId: "shoot-white-desert",
    title: "How the White Desert photographs",
    layout: "grid",
    frames: [
      shootGenerated.whiteDesert1,
      shootGenerated.whiteDesert2,
      shootGenerated.whiteDesert3,
      shootGenerated.whiteDesert4,
      shootGenerated.whiteDesert5,
      shootGenerated.whiteDesertDetail,
    ],
  },
  {
    galleryId: "shoot-red-sea-yacht",
    title: "How the yacht day photographs",
    layout: "grid",
    frames: [
      shootGenerated.redSeaYacht1,
      shootGenerated.redSeaYacht2,
      shootGenerated.redSeaYacht3,
      shootGenerated.redSeaYacht4,
      shootGenerated.redSeaYacht5,
      shootGenerated.redSeaYacht6,
      shootGenerated.redSeaYacht7,
      shootGenerated.redSeaYacht8,
      shootGenerated.redSeaYacht9,
      shootGenerated.redSeaYacht10,
      shootGenerated.redSeaYacht11,
    ],
  },
];

flyingDressGalleries.push(...SHOOT_GALLERIES);

export function flyingDressGalleryById(
  galleryId: string
): FlyingDressGallery | undefined {
  return flyingDressGalleries.find((gallery) => gallery.galleryId === galleryId);
}
