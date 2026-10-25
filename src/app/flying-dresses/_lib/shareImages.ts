import type { FdShareImage } from "./seo";

/**
 * The picture that appears when someone pastes a link to this site.
 *
 * WHY THIS IS A REGISTRY AND NOT A FIELD ON EACH PAGE
 *
 * Because a share image has exact dimensions and a scraper lays the card out
 * from the numbers it is given, not from the file. The three sources here are
 * three different shapes — the hero poster is 1600x900, the dress frames are
 * 1600x1067, the wide shoot frames are 2000x1333 — so a page that names a path
 * and leaves the size to a default ships a correct photograph with a lie about
 * its shape. Size travels with src, in one place, measured from the files.
 *
 * WHAT IS DELIBERATELY ABSENT
 *
 * `sand-dunes` has no entry. There is no landscape photograph of that shoot:
 * the only dune frame on this deployment is 533px wide and portrait, which is
 * under the 600px minimum for a large card and would crop to a sliver. It
 * therefore falls back to the brand default, which is a real client frame and
 * is captioned by the page title in every scraper that renders a card, so it
 * reads as the brand rather than as a claim about that location. A landscape
 * Sand Dunes frame is on the asset checklist; the moment one arrives this is
 * where it goes.
 *
 * Nothing here is ever a stock photograph. If there is no real frame for a
 * page, it gets the brand default and that is the end of it.
 */

export const shootShareImages: Record<string, FdShareImage> = {
  "pyramids-rooftop": {
    src: "/photos/flying-dresses/rooftop-group.jpg",
    width: 2000,
    height: 1333,
    alt: "A flying dress on the Giza rooftop, the pyramids on the skyline behind",
  },
  fayoum: {
    src: "/photos/flying-dresses/fayoum-dress.jpg",
    width: 2000,
    height: 1333,
    alt: "A flying dress against the white dunes and lakes of Fayoum",
  },
};

export const wardrobeShareImage: FdShareImage = {
  src: "/photos/flying-dresses/wardrobe-lineup.jpg",
  width: 2000,
  height: 1333,
  alt: "Seven women on the Giza rooftop, each in a different colour from the collection, the pyramids hazy behind them",
};

export const aboutShareImage: FdShareImage = {
  src: "/photos/flying-dresses/assistant.jpg",
  width: 1600,
  height: 1067,
  alt: "An assistant lifting the train of a flying dress during a shoot",
};
