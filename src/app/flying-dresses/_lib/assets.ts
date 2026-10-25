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
 *   kind: "styled"      the PRODUCT is really ours and really photographed;
 *                       the model and the setting around it are generated.
 *                       Added when the owner supplied the accessory and dress
 *                       frames: they photographed each piece and had it
 *                       composited onto generated models, and confirmed the
 *                       pieces render identically to the wardrobe and that
 *                       delivering the exact piece shown is theirs. The files
 *                       carry C2PA provenance naming OpenAI, so this is not a
 *                       judgement call — it is in the bytes, and a slot that
 *                       said "agency" would be contradicted by its own file.
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
  kind: "agency" | "location" | "styled" | "empty";
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
  heroRooftop: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-group.jpg",
    alt: "Six women on the Giza rooftop with their backs to the camera, arms raised, each in a different colour, a pyramid on the skyline",
    width: 2000,
    height: 1333,
    credit: "Agency shoot, supplied October 2026",
  }),
  rooftopPortrait: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-gold.jpg",
    alt: "A gold dress fanned out across the Giza rooftop, the wearer facing the two pyramids",
    width: 2000,
    height: 1333,
    credit: "Milya shoot, supplied October 2026",
  }),
  fayoumDress: slot({
    kind: "agency",
    src: "/photos/flying-dresses/fayoum-dress.jpg",
    alt: "An amber dress on the shore at Fayoum, its train thrown out across the sand beside the water",
    width: 2000,
    height: 1333,
    credit: "Nunu and Kassy shoot, Fayoum",
  }),
  assistantAtWork: slot({
    kind: "agency",
    src: "/photos/flying-dresses/assistant.jpg",
    alt: "The assistant at the right of frame, mid-throw, sending the gold train up into the air behind the wearer",
    width: 1600,
    height: 1067,
    credit: "Milya shoot. The assistant is visible at the right of the frame.",
  }),

  /* ---------------------------------------------------------------------
     SUPPLIED OCTOBER 2026, from the owner's photo library.

     These four do the same job the four `location` slots below were doing
     with licensed travel photography and stock: they show the place and
     the celebrations. The difference is that they are OUR work,
     with our clients in them, which is the claim the rest of the site
     makes and the one the pictures should support.
     --------------------------------------------------------------------- */

  /* The romance panel was an Elleena frame: a real couple, a real bronze
     train, three pyramids — and the man barefoot in board shorts and a
     printed shirt. Authentic, and the wrong single image to represent
     "Romance" on a brand selling a luxury morning. This is the same
     rooftop and our own work, dressed the way the page promises. */
  couplesRomance: slot({
    kind: "agency",
    src: "/photos/flying-dresses/couple-romance-rooftop.jpg",
    alt: "A couple on the Giza rooftop at sunrise, he in black tie with his arm around her waist, she laughing in a long lace gown, three pyramids across the horizon behind them",
    width: 2000,
    height: 1333,
    credit: "Alessandra shoot, supplied October 2026",
  }),
  couplesVows: slot({
    kind: "agency",
    src: "/photos/flying-dresses/couple-vows-rooftop.jpg",
    alt: "A couple in formal dress on the Giza rooftop at golden hour, her train laid out behind her, two pyramids clear on the horizon",
    width: 2000,
    height: 1333,
    credit: "Alessandra shoot, supplied October 2026",
  }),
  genderReveal: slot({
    kind: "agency",
    src: "/photos/flying-dresses/gender-reveal-rooftop.jpg",
    alt: "Parents and a guest with arms thrown wide beside lit BABY letters and a pink and blue balloon arch, the pyramids behind them at sunset",
    width: 2000,
    height: 1333,
    credit: "Kayan shoot, supplied October 2026",
  }),
  gizaSand: slot({
    kind: "agency",
    src: "/photos/flying-dresses/giza-plateau.jpg",
    alt: "A visitor standing on the sand at Giza in warm afternoon light, two pyramids filling the frame behind her",
    width: 933,
    height: 1400,
    credit: "Luis shoot, supplied October 2026",
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
  /* Was a Pexels photograph of the plateau. It is now our own, with our
     own client in it — the same place, photographed by us. */
  gizaPlateau: agency.gizaSand,
  /* THIS SLOT USED TO BE A PHOTOGRAPH OF PARKED QUAD BIKES.
     ------------------------------------------------------------------
     `/photos/pexels-20189345.jpg` is a row of rental ATVs under sun
     umbrellas on a beach. Its alt text read "Sahara sand dunes at golden
     hour outside Cairo", and it was the picture illustrating the Sand
     Dunes photoshoot — the $179 product — on the home page, on
     /experiences and on the shoot's own page. Three places where a
     customer deciding between three shoots was shown hired ATVs.

     Nothing in the owner's photo library is a dune: it is rooftop and
     pyramid work. So this now points at the one genuine dune photograph
     the brand has — a real flying dress, on a real dune, ours. It is
     small (800px), which is why the asset checklist still asks for a
     high-resolution dune frame; small and true beats large and wrong. */
  saharaDunes: slot({
    kind: "agency",
    src: "/photos/about/cherry-travel-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a white gown on a desert dune, the train thrown out across the sand",
    width: 800,
    height: 533,
    credit: "Cherry Travel collaboration, July 2023",
  }),
  /* THERE IS NO HORSE SLOT ON THIS BRAND.
     ------------------------------------------------------------------
     A horse-at-Giza frame briefly lived here. Horseback riding is an
     Egypt Eye Travel product, not a Flying Dresses one, and a rider in
     black on a decorated horse tells a visitor on this site that we sell
     something we do not. The home-page panel it illustrated is about the
     rooftop at seven in the morning, so it now shows the rooftop.
     `scripts/check-flying-dresses.mts` fails if a horse photograph is
     referenced from this brand again. */
  /* THE FAYOUM CARD SHOWED A BUILDING.
     ------------------------------------------------------------------
     This slot held a Wandee Travel frame of a traveller sitting in an
     ochre archway. A real photograph, really taken in Fayoum, and the
     wrong one for this panel: the Fayoum shoot is sold as the lakes and
     the white dunes, and the card illustrating it showed masonry and no
     flying dress. The owner spotted it on a phone and said so.

     It is the same fault as the quad bikes on the dunes card, in a
     milder form: the picture does not show the product. A visitor
     choosing between three shoots sees a dress on a dune, a dress on a
     rooftop, and then a woman in an archway.

     `fayoum-black.jpg` was already in the library and used nowhere: a
     black flying dress with the train thrown out across the ground,
     Lake Qarun behind it. Landscape at 1600x1067, so it fills
     fd-ratio-landscape without the upright crop the archway needed.

     The archway photograph is not deleted. It is still the right frame
     for the credibility rail on the About page, where the subject is
     the collaboration and not the shoot. */
  fayoumLake: slot({
    kind: "agency",
    src: "/photos/flying-dresses/fayoum-black.jpg",
    alt: "A black flying dress on the desert shore at Fayoum, its train thrown out along the ground with Lake Qarun behind",
    width: 1600,
    height: 1067,
    credit: "Fayoum shoot",
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
/**
 * THE PHOTOGRAPH FOR AN EXPERIENCE CATEGORY, where one honestly exists.
 *
 * Eight categories; three photographs. That ratio is the point of this map
 * rather than an embarrassment to be padded out. There is a real gender
 * reveal, a real couple on the rooftop and a real couple in formal dress, so
 * those three categories get a picture. There is no proposal, no birthday,
 * no maternity session, no creator shoot and no DJ set in the library, so
 * those five get none — and they render the designed card they rendered
 * before, which says what the experience is in words.
 *
 * The alternative was to illustrate "Proposals above the pyramids" with the
 * wedding couple, who are not proposing. A visitor cannot tell the
 * difference, which is exactly why it would be a lie rather than a liberty.
 *
 * Keyed by ExperienceCategoryId. Missing is the normal case.
 */
export const categoryPhoto: Partial<Record<string, ImageSlot>> = {
  "gender-reveal": agency.genderReveal,
  romance: agency.couplesRomance,
  "vows-engagement": agency.couplesVows,
};

export const empty = {
  couple: slot({
    kind: "empty",
    src: null,
    alt: "A couple photographed together, one in a flying dress and one in a traditional gawn",
    width: 1800,
    height: 1200,
    // Deliberately still empty. The supplied group photographs are several
    // women together, which is a different picture and a different sale: this
    // slot sits beside the men's wear and has to show a dress and a gawn in
    // one frame or it is arguing for something it does not show.
    wanted: "A couples' frame: a dress and a gawn together",
  }),
  mensGawn: slot({
    kind: "empty",
    src: null,
    alt: "The five traditional gawns, photographed as a set",
    width: 1800,
    height: 1200,
    // The five garments are photographed now and render in the wardrobe grid
    // from dressPhotos. What this landscape slot still wants is the thing none
    // of those five frames is: all five together, so the range reads at a
    // glance instead of one portrait at a time.
    wanted: "The five gawns together in one frame",
  }),
  accessories: slot({
    kind: "empty",
    src: null,
    alt: "The accessories available to wear with a flying dress",
    width: 1800,
    height: 1200,
    // Still empty, and still worth filling: the thirteen accessory frames on
    // the rentals page are portraits of single pieces, and this slot is the
    // landscape header that would show the collection together. Nothing in
    // the folder is that shot.
    wanted: "The accessory collection together, in one landscape frame",
  }),
  redSeaYacht: slot({
    kind: "empty",
    src: null,
    alt: "A flying dress photographed on a yacht on the Red Sea at Ain Sokhna",
    width: 1800,
    height: 1200,
    // The October 2026 operating brief confirms this experience exists and
    // the website did not mention it at all. There is no photograph of it in
    // the library yet, so it renders as a labelled gap rather than borrowing
    // a dune or a rooftop — which would show a customer the wrong sea.
    wanted: "The yacht at Ain Sokhna: the only one of the four on water",
  }),
  dressRental: slot({
    // The hire range, in one frame. NOT the packed-for-delivery photograph
    // this slot was waiting for, which is still worth taking: this shows what
    // you can hire, not what arrives at your hotel.
    kind: "styled",
    src: "/photos/flying-dresses/rent-a-dress-collection.jpg",
    alt: "A row of flying dresses in teal, blue, red, green, black, white, gold, purple and pink, displayed on mannequins in open desert",
    width: 1536,
    height: 1024,
    credit: "Dresses photographed from the collection; the display and setting are generated.",
  }),
};

/**
 * The wardrobe in one photograph.
 *
 * Added when the owner's October 2026 shoot folder turned out to contain group
 * frames: seven women, seven colours in one frame, which says what the
 * wardrobe page spends a grid of tiles saying.
 *
 * Both descriptions of this file used to be wrong about it — "eight women"
 * here and "a line of gowns in twelve colours" in shareImages. It is seven
 * women wearing the dresses, not a rail of them, and the count of colours in
 * the frame has nothing to do with the size of the collection. Counted off
 * the photograph itself.
 */
export const wardrobeLineup = slot({
  kind: "agency",
  src: "/photos/flying-dresses/wardrobe-lineup.jpg",
  alt: "Seven women together on the Giza rooftop, each in a different colour from the collection",
  width: 2000,
  height: 1333,
  credit: "Agency group shoot, supplied October 2026",
});

/** Everything, for the check script and the asset checklist. */
export const allSlots: Record<string, ImageSlot> = {
  ...agency,
  ...location,
  ...empty,
  wardrobeLineup,
};
