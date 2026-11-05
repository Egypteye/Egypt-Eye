import {
  agency,
  empty,
  location,
  shootGenerated,
  shootPhoto,
  type ImageSlot,
} from "./assets";

/**
 * THE PICTURE FOR EACH SHOOT, IN ONE PLACE.
 *
 * There were three copies of this map and all three disagreed, which is how
 * the same bug shipped three times:
 *
 *   experiences/[slug]/page.tsx  fell back to `empty.redSeaYacht`, so the
 *                                White Desert page showed the YACHT's
 *                                "photograph to come" card.
 *   experiences/page.tsx         same fallback, same wrong card, on the
 *                                listing.
 *   page.tsx (home)              a ternary ending `: location.fayoumLake`,
 *                                so every slug that was not sand-dunes or
 *                                pyramids-rooftop got a photograph of a lake
 *                                in FAYOUM — including the White Desert and
 *                                the yacht.
 *
 * Each was fixed on its own and the other two kept rendering, because nothing
 * tied them together. One map and no per-site fallback is the fix; the check
 * script asserts every package has an entry here and that no two shoots share
 * a picture, which is the signature a silent fallback leaves.
 *
 * `card` is the listing and home-page thumbnail. `hero` and `detail` are the
 * shoot's own page. They are separate because a card is small and wants the
 * strongest single frame, while the page can afford two.
 */
export type ShootArt = {
  card: ImageSlot;
  hero: ImageSlot;
  detail: ImageSlot;
};

export const shootArt: Record<string, ShootArt> = {
  "sand-dunes": {
    card: location.saharaDunes,
    hero: location.saharaDunes,
    detail: agency.fayoumDress,
  },
  "pyramids-rooftop": {
    card: agency.rooftopPortrait,
    hero: agency.rooftopPortrait,
    detail: location.gizaPlateau,
  },
  fayoum: {
    card: shootPhoto.fayoumHero,
    hero: shootPhoto.fayoumHero,
    detail: shootPhoto.fayoumGroup,
  },
  "red-sea-yacht": {
    card: shootGenerated.redSeaYachtHero,
    hero: shootGenerated.redSeaYachtHero,
    detail: shootGenerated.redSeaYachtDetail,
  },
  "white-desert": {
    card: shootGenerated.whiteDesertHero,
    hero: shootGenerated.whiteDesertHero,
    detail: shootGenerated.whiteDesertDetail,
  },
};

/**
 * The art for a slug.
 *
 * A shoot created in the Studio that nobody has added here renders a labelled
 * gap rather than throwing — that part of the old fallback was right, and a
 * missing picture must never be a 500. What is deliberately gone is falling
 * back to ANOTHER product's picture: `empty.unknownShoot` says nothing about
 * a yacht, a lake or anywhere else.
 */
export function artFor(slug: string): ShootArt {
  return (
    shootArt[slug] ?? {
      card: empty.unknownShoot,
      hero: empty.unknownShoot,
      detail: empty.unknownShoot,
    }
  );
}
