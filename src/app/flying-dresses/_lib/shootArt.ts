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
    // Cover chosen by the owner, 9 November 2026.
    card: shootPhoto.pyramidsRooftopCover,
    hero: shootPhoto.pyramidsRooftopCover,
    detail: location.gizaPlateau,
  },
  fayoum: {
    // Cover chosen by the owner, 9 November 2026. fayoumHero, which was the
    // cover until now, stays in the registry and in the gallery.
    card: shootPhoto.fayoumCover,
    hero: shootPhoto.fayoumCover,
    detail: shootPhoto.fayoumGroup,
  },
  "red-sea-yacht": {
    card: shootGenerated.redSeaYachtHero,
    hero: shootGenerated.redSeaYachtHero,
    detail: shootGenerated.redSeaYachtDetail,
  },
  "white-desert": {
    // Cover chosen by the owner, 9 November 2026. Generated, like the one it
    // replaces: see the note on whiteDesertCover in _lib/assets.ts.
    card: shootGenerated.whiteDesertCover,
    hero: shootGenerated.whiteDesertCover,
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

/**
 * THE COVER PHOTOGRAPH FOR A SHOOT CARD: the Studio's, or the registry's.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS BESIDE artFor()
 * ---------------------------------------------------------------------------
 * `shootArt` above is a map typed into the repository. That is fine as a
 * default and wrong as the only answer: the owner works from a browser and
 * the Vercel dashboard (CLAUDE.md §2), so "change the cover photo of the
 * White Desert shoot" must not be a code change. It is now a file upload in
 * the Studio, and this function is where that upload wins.
 *
 * ---------------------------------------------------------------------------
 * THE ORDER, AND WHY IT IS THIS WAY ROUND
 * ---------------------------------------------------------------------------
 * A Studio cover REPLACES the registry entry outright, which is CLAUDE.md §3
 * applied to a photograph: once the document has one, the file-based default
 * is not consulted and nothing of it leaks through. In particular the
 * registry's `credit` does not: it describes the registry's file and would be
 * a false attribution printed under somebody else's photograph. A Studio
 * cover carries only what Studio knows about it.
 *
 * `imageAlt` is the one field that can fall back, because an empty alt is an
 * accessibility failure rather than a design choice, and the registry's alt
 * at least describes the same shoot. The Studio field asks for one and the
 * check script warns when a cover has none.
 *
 * ---------------------------------------------------------------------------
 * PER-SHOOT INDEPENDENCE
 * ---------------------------------------------------------------------------
 * The lookup is keyed on the package the caller is rendering, so changing one
 * shoot's cover cannot reach another. The no-shared-picture check in
 * check-flying-dresses.mts still guards the registry defaults, which is where
 * a shared picture actually came from last time: a silent per-site fallback,
 * not an editor.
 */
export type ShootCover = {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  /** CSS object-position, from the Studio hotspot. */
  focus?: string;
  credit?: string;
  wanted?: string;
  /** True when this came from the Studio rather than from shootArt. */
  fromStudio: boolean;
};

export function coverFor(pkg: {
  slug: string;
  image?: string | null;
  imageAlt?: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageFocus?: string;
}): ShootCover {
  const fallback = artFor(pkg.slug).card;

  if (pkg.image) {
    return {
      src: pkg.image,
      alt: pkg.imageAlt?.trim() || fallback.alt,
      width: pkg.imageWidth ?? undefined,
      height: pkg.imageHeight ?? undefined,
      focus: pkg.imageFocus,
      // No credit. See the note above: the registry's credit belongs to the
      // registry's file, and printing it under an uploaded photograph would
      // attribute one picture's provenance to another.
      credit: undefined,
      fromStudio: true,
    };
  }

  return {
    src: fallback.src,
    alt: fallback.alt,
    width: fallback.width,
    height: fallback.height,
    focus: fallback.focus,
    credit: fallback.credit,
    wanted: fallback.wanted,
    fromStudio: false,
  };
}
