/**
 * Every image slot on the Flying Dresses site, declared in one place.
 *
 * WHY A REGISTRY RATHER THAN PATHS SPRINKLED THROUGH THE PAGES
 *
 * Because the honest answer to "which of these photographs are actually the
 * agency's work?" has to be checkable, and it stops being checkable the moment
 * image paths are inline in a dozen components. The brief's hard rule is that
 * temporary imagery must never become indistinguishable from real customer
 * work — so each slot states what it is:
 *
 *   kind: "agency"      the agency's own photography. Real client work.
 *   kind: "location"    real Egypt photography already licensed and in use on
 *                       egypteyetravel.com. Shows the PLACE, and is never
 *                       presented as a flying-dress photograph.
 *   kind: "empty"       no photograph exists. Renders as a designed, labelled
 *                       slot (components/Scene.tsx), never as a stock photo.
 *
 * scripts/check-flying-dresses.mts reads this file: every non-empty slot must
 * point at a file that is actually in public/, and every "agency" slot must be
 * one of the known genuine photographs. A path typo therefore fails a check
 * rather than shipping a broken image, and nobody can quietly promote a
 * location photo to agency work by editing a page.
 *
 * docs/FLYING-DRESSES-ASSET-CHECKLIST.md is the owner-facing version of this
 * list, ordered by how much each missing photograph costs.
 */

export type ImageSlot = {
  kind: "agency" | "location" | "empty";
  /** null only when kind is "empty". */
  src: string | null;
  /** Describes the image to someone who cannot see it. */
  alt: string;
  /** Intrinsic pixel size, so the box is reserved before the bytes land. */
  width: number;
  height: number;
  /**
   * Who made it, where it is published, or which creator collaboration it
   * came from. Agency work keeps its attribution so a reviewer can trace it.
   */
  credit?: string;
  /** For an empty slot: what should go here, shown on the slot itself. */
  wanted?: string;
};

/**
 * Identity, but it pins each entry's type to ImageSlot.
 *
 * Without it the object literals narrow to their exact shape and `credit` or
 * `wanted` simply does not exist on the ones that omit it — so a page that
 * renders a caption for whichever slot it was handed stops compiling. Wrapping
 * each entry keeps the optional fields in the type while leaving the keys
 * precise, which `Record<string, ImageSlot>` would throw away.
 */
function slot(value: ImageSlot): ImageSlot {
  return value;
}

/**
 * THE TWO GENUINE FLYING-DRESS PHOTOGRAPHS on this deployment.
 *
 * Both are already published on egypteyetravel.com's About page as creator
 * collaborations, and the business states there that its flying-dress shoots
 * are run in-house rather than outsourced — so these are the agency's own
 * sessions. Their original attribution is kept.
 *
 * They are small (800px on the long edge), which is why neither is used
 * full-bleed: a 533px-wide file stretched across a 1440px hero is visibly
 * soft, and softness in the first viewport is the one thing a photography
 * brand cannot afford. They are used at card and column size, where they hold
 * up. Higher-resolution originals are the first line of the asset checklist.
 */
export const agency = {
  blueGownDesert: slot({
    kind: "agency",
    src: "/photos/about/briana-trip-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a blue gown against the Egyptian desert",
    width: 533,
    height: 800,
    credit: "Briana Trip collaboration, May 2022",
  }),
  whiteGownDune: slot({
    kind: "agency",
    src: "/photos/about/cherry-travel-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a white gown on a desert dune",
    width: 800,
    height: 533,
    credit: "Cherry Travel collaboration, July 2023",
  }),
};

/**
 * Real Egypt photography, used to show the PLACE.
 *
 * Every one of these is already licensed and in use on egypteyetravel.com.
 * None of them contains a flying dress, and none is captioned or framed as if
 * it did — a location panel says where you will be standing, which is a
 * different claim from "here is a photograph we took of a customer".
 */
export const location = {
  gizaPlateau: slot({
    kind: "location",
    src: "/photos/pexels-10124763.jpg",
    alt: "The Pyramids of Giza in low morning light",
    width: 1880,
    height: 1253,
    credit: "Pexels, already in use on egypteyetravel.com",
  }),
  saharaDunes: slot({
    kind: "location",
    src: "/photos/pexels-20189345.jpg",
    alt: "Sahara sand dunes at golden hour outside Cairo",
    width: 1880,
    height: 1253,
    credit: "Pexels, already in use on egypteyetravel.com",
  }),
  gizaHorseback: slot({
    kind: "location",
    src: "/photos/about/distinctions-travel-giza-horseback.jpg",
    alt: "A traveller on horseback in front of the Giza pyramids",
    width: 576,
    height: 720,
    credit: "Distinctions Travel collaboration",
  }),
  fayoumArchway: slot({
    kind: "location",
    src: "/photos/about/wandee-travel-fayoum.jpg",
    alt: "A traveller seated in a sunlit ochre archway in Fayoum",
    width: 427,
    height: 640,
    credit: "Wandee Travel collaboration",
  }),
};

/**
 * The slots with nothing in them yet.
 *
 * These render as tinted, bordered fields with the wanted subject written
 * across them and the words "photograph to come" underneath. That is the
 * point: a reviewer, the owner and a visitor can all see exactly which frames
 * are still missing, and no stock image is ever mistaken for the agency's
 * work.
 */
export const empty = {
  heroRooftop: slot({
    kind: "empty",
    src: null,
    alt: "A flowing dress on a Giza rooftop at first light, the pyramids across the skyline",
    width: 1600,
    height: 2000,
    wanted: "A flying dress on the rooftop, pyramids behind, shot at 7am",
  }),
  rooftopPortrait: slot({
    kind: "empty",
    src: null,
    alt: "A flying dress lifted by the wind on the rooftop above Giza",
    width: 1000,
    height: 1500,
    wanted: "The rooftop shoot, vertical, dress mid-air",
  }),
  fayoumDress: slot({
    kind: "empty",
    src: null,
    alt: "A flying dress against the pale dunes and lake water of Fayoum",
    width: 1600,
    height: 1067,
    wanted: "Fayoum: dress against white dunes and water",
  }),
  assistantAtWork: slot({
    kind: "empty",
    src: null,
    alt: "The assistant throwing the train of a flying dress between frames",
    width: 1200,
    height: 800,
    wanted: "Behind the scenes: the assistant handling the dress",
  }),
  couple: slot({
    kind: "empty",
    src: null,
    alt: "A couple photographed together, one in a flying dress and one in a traditional gawn",
    width: 1200,
    height: 800,
    wanted: "A couples' frame — dress and gawn together",
  }),
  mensGawn: slot({
    kind: "empty",
    src: null,
    alt: "The five traditional gawns, photographed as a set",
    width: 1200,
    height: 1500,
    wanted: "The five gawns — the site's biggest missing asset",
  }),
  accessories: slot({
    kind: "empty",
    src: null,
    alt: "The accessories available to wear with a flying dress",
    width: 1200,
    height: 900,
    wanted: "The accessory collection — nothing has been named yet",
  }),
  dressRental: slot({
    kind: "empty",
    src: null,
    alt: "A flying dress packed and ready for delivery to a hotel",
    width: 1200,
    height: 900,
    wanted: "A rental dress, packed for hotel delivery",
  }),
};

/** Everything, for the check script and the asset checklist. */
export const allSlots: Record<string, ImageSlot> = {
  ...agency,
  ...location,
  ...empty,
};
