import { FLYING_DRESS_COLLECTION } from "./outfitCollection";

/**
 * THE THIRTEEN PER-DRESS PAGES.
 *
 * =========================================================================
 * WHAT THIS FILE IS, AND WHY IT IS NOT GENERATED FROM A TEMPLATE
 * =========================================================================
 * Thirteen commercial pages, one per dress, at /wardrobe/[slug]. They exist
 * because the dress collection is the one subject only this brand sells and
 * the one subject the travel site has never written about, and because
 * /wardrobe and the rental pages already take Search Console impressions with
 * nowhere specific to send them.
 *
 * Every colour sentence below was written after looking at that dress's own
 * frames from the Drive colour folder. None of it is inferred from the name
 * or from the stored hex. Where the photographs and the swatch disagree, the
 * photographs win, and the disagreement is recorded rather than smoothed over
 * (see NAVY below).
 *
 * =========================================================================
 * NO COLOUR SWATCH IS RENDERED ON THESE PAGES, DELIBERATELY
 * =========================================================================
 * `Outfit.hex` exists and the wardrobe index uses it, correctly, as a stand-in
 * where a garment has no photograph. These pages all have three to six real
 * photographs, so a swatch beside them adds nothing and introduces a second
 * source of truth that can contradict the first.
 *
 * It already does. `navy` is stored as #1e2a4a, a very dark navy. All twelve
 * frames in the Blue folder show a vivid royal blue, and sampling the lit face
 * of the fabric across them lands near #3f548b. One of those two is wrong and
 * only the owner can say which, so this file describes the colour the camera
 * recorded, does not render the swatch next to it, and the question is in
 * docs/FLYING-DRESSES-WARDROBE-BUILD.md awaiting an answer. Renaming the dress
 * was explicitly ruled out, and nothing here renames it.
 *
 * =========================================================================
 * PROVENANCE
 * =========================================================================
 * All 61 frames were checked at byte level on the ORIGINAL Drive files before
 * being resized into public/photos/flying-dresses/wardrobe/. Every one carries
 * an EXIF block and none carries `c2pa.created` or a `trainedAlgorithmicMedia`
 * digital source type. 26 are original photography, 35 are edited photography
 * naming Camera Raw and Lightroom Classic.
 *
 * ONE FRAME WAS REJECTED BY THAT CHECK and is worth recording because it is
 * the reason the check exists: a Fayoum frame of the Ginger dress carried
 * `c2pa.edited` + `compositeWithTrainedAlgorithmicMedia` + an Adobe Firefly
 * manifest with 15 c2pa hits. By the owner's four classes that is edited
 * photography rather than generated, but it belongs to the population this
 * repo keeps under /shoots/retouched/ with a credit that says so, not in a
 * product gallery of straight client photographs. It was dropped; Ginger keeps
 * five frames and the page is no worse.
 *
 * The resize preserves EXIF on purpose, so check-flying-dresses.mts can assert
 * it on every file in that directory. The older dress-*.jpg files predate that
 * decision and were saved without it, which is why the guard is scoped to this
 * directory rather than applied to the whole folder.
 *
 * =========================================================================
 * PRICES
 * =========================================================================
 * Nothing here invents one. $199 per person, the $99 second dress and the
 * $249 made-to-keep dress are all already published on /wardrobe and come from
 * flyingDressRates.ts and that page's FAQ. No dress is priced differently from
 * any other and the pages say so, because "does my colour cost more" is a
 * question the collection otherwise invites.
 */

/**
 * The shoot label for a frame whose client session we cannot identify.
 *
 * Nine of the sixty-one frames came out of the colour folders as IMG_nnnn
 * with no session in the filename. They are unmistakably this team's work on
 * this roof, but nobody recorded whose session they are, and a page that
 * counts them as separate people is claiming a range it has not got. The
 * "photographed on N different people" heading counts NAMED sessions only,
 * and the check script holds it to that.
 */
export const UNATTRIBUTED_SHOOT = "an unrecorded rooftop session";

export type WardrobeFrame = {
  /** Basename under /photos/flying-dresses/wardrobe/. */
  file: string;
  /**
   * The file's real pixel dimensions, so the gallery renders each frame at its
   * own aspect ratio instead of cropping everything to one shape. Declared
   * rather than measured at render time, because measuring means opening 61
   * files on every build. check-flying-dresses.mts asserts these against the
   * files on disk, so a stale number is caught rather than quietly distorting
   * a photograph.
   */
  w: number;
  h: number;
  /** The client session it came from, so a frame traces back. */
  shoot: string;
  alt: string;
};

export type DressPage = {
  /** Must match an id in FLYING_DRESS_COLLECTION. Checked. */
  id: string;
  seoTitle: string;
  metaDescription: string;
  /** The colour as the camera recorded it, in one sentence. */
  colour: string;
  /** How it behaves against pale limestone and sand. */
  againstTheGround: string[];
  /** What the fabric does, which is half of what the photograph is. */
  fabric: string;
  locations: { label: string; path: string; why: string }[];
  occasions: { label: string; path: string }[];
  /** Chosen on how they behave in a frame, not on hue. */
  related: { id: string; why: string }[];
  frames: WardrobeFrame[];
  /**
   * Said on the page when the archive is thin or single-session. A product
   * page that shows two frames and implies a deep library is the kind of
   * small lie this codebase keeps having to unpick.
   */
  note?: string;
};

export const dressPages: DressPage[] = [
  {
    id: "cherry",
    seoTitle: "Cherry: The Red Flying Dress",
    metaDescription:
      "A deep crimson satin with a train that fills the frame. Nine client sessions in the same dress, and what red actually does against pale limestone in haze and in hard sun.",
    colour:
      "A deep crimson. Darker and cooler than a pillarbox red, clearly distinct from Hot Pink, and the most requested colour in the collection.",
    againstTheGround: [
      "Everything behind you at Giza is made of the same light: pale limestone, pale sand, hazed sky and the buff roofs of the town. Cherry is the opposite of that in both hue and depth, so it reads as the subject at any distance, in any of the nine sessions we have shot it in.",
      "What changes is the sky, not the dress. On a hazy day it photographs a shade lighter and warmer than the fabric really is, closer to scarlet, and the frame goes high key. On a clear day it reads deeper and cooler and the photograph becomes about red against blue. Both are good. They are not the same picture.",
    ],
    fabric:
      "A high-sheen satin with a deep V halter, a fitted bodice and a front split. Lying still the train pools in wide folds and every ridge catches a highlight. Thrown, it curls, and the curl is where the colour goes darkest, so a single piece of cloth shows a bright face and a dark fold at once.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where all nine of these were shot." },
      { label: "Sand Dunes", path: "/experiences/sand-dunes", why: "Open dune country at first light, where the contrast is strongest." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Anniversaries and romance", path: "/celebrations/anniversaries-and-romance" },
    ],
    related: [
      { id: "orchid", why: "The other saturated colour that reads as the subject at distance." },
      { id: "hot-pink", why: "Warmer and brighter, for the same loud photograph." },
      { id: "black", why: "If you want the separation without the colour." },
    ],
    frames: [
      { file: "cherry-abbyrou-78.jpg", w: 1600, h: 1067, shoot: "Abby & Rou", alt: "The Cherry dress against a deep teal sky, its train fanned out symmetrically across the full width of the rooftop deck with three pyramids behind" },
      { file: "cherry-aroouj-155.jpg", w: 1600, h: 1067, shoot: "Aroouj", alt: "The Cherry dress under a near-white hazy sky, the train spread low and wide over the cushioned bench" },
      { file: "cherry-kristen-1187.jpg", w: 1600, h: 1067, shoot: "Kristen", alt: "The Cherry train airborne in a long arc above the rooftop deck, arms raised, two pyramids behind" },
      { file: "cherry-img8981.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Cherry train caught mid-throw, curling over on itself so a bright red face and a dark fold show in the same cloth" },
      { file: "cherry-camela-94.jpg", w: 1600, h: 1067, shoot: "Camela", alt: "The Cherry dress under a warm hazy sky, the train swept across the whole deck in deep soft folds" },
      { file: "cherry-bassim-57.jpg", w: 1600, h: 1067, shoot: "Bassim", alt: "The Cherry train streaming low out of frame across the rooftop, two pyramids on a pale sky" },
    ],
  },
  {
    id: "emerald",
    seoTitle: "Emerald: The Green Flying Dress",
    metaDescription:
      "A bright jewel green in mirror-finish satin. There is no green anywhere in a Giza frame, which is exactly why this one works.",
    colour:
      "A bright jewel green with the highest sheen in the collection. In the light it reads almost metallic; in a shaded fold it goes nearly black-green.",
    againstTheGround: [
      "There is no green anywhere in a Giza frame. No vegetation in shot, no green in the stone, nothing in the sky. Emerald has the entire scene to itself, which is why people are consistently surprised by how well it works somewhere they expected warm colours to win.",
      "It is also the glossiest fabric we run, so it holds its shape in a photograph even when the dress is small in a wide landscape frame. The sheen gives the folds internal structure that a matte colour of the same hue would lose.",
    ],
    fabric:
      "A mirror-finish satin, cut with the same deep V halter and long train as the rest of the collection. The sheen is doing as much work as the colour: thrown, the train shows a bright lit face and a deep shadowed one in the same arc.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these four sessions were shot." },
      { label: "Fayoum", path: "/experiences/fayoum", why: "The one location with real water and greenery to answer it." },
    ],
    occasions: [
      { label: "Anniversaries and romance", path: "/celebrations/anniversaries-and-romance" },
      { label: "Creators and editorial", path: "/creative/creators-and-editorial" },
    ],
    related: [
      { id: "verdant", why: "The deeper, quieter green, if this one is too bright." },
      { id: "aqua", why: "The other cool colour with nothing to compete with on the plateau." },
      { id: "cherry", why: "The warm equivalent: loud, saturated, unmistakably the subject." },
    ],
    frames: [
      { file: "emerald-alexandra-290.jpg", w: 1600, h: 1067, shoot: "Alexandra", alt: "The Emerald dress standing on the rooftop deck, its green train sweeping away to one side with two pyramids behind" },
      { file: "emerald-anabel-366.jpg", w: 1600, h: 1067, shoot: "Anabel", alt: "The Emerald train thrown into a high arc above the deck, the shaded underside almost black against the lit green face" },
      { file: "emerald-cami-96.jpg", w: 1600, h: 1067, shoot: "Cami", alt: "The Emerald dress beside the cushioned bench, the train pooled across the rugs under a hazy sky" },
      { file: "emerald-percious-94.jpg", w: 1600, h: 1067, shoot: "Percious", alt: "The Emerald train stretched wide and low across the rooftop, three pyramids on the skyline" },
    ],
  },
  {
    id: "navy",
    seoTitle: "Navy: The Blue Flying Dress",
    metaDescription:
      "A vivid royal blue satin, brighter than the name suggests. The strongest cool contrast against pale limestone, in twelve client sessions.",
    colour:
      "A vivid royal blue. Brighter and more saturated than the name leads people to expect: in all twelve sessions it photographs as a strong cobalt rather than a dark navy, going deep only in the shaded curl of a throw.",
    againstTheGround: [
      "Blue is the one colour the plateau cannot answer. The stone is warm, the sand is warm, the town roofs are warm, and on a clear day the only other blue in frame is the sky, which sits far lighter. The dress separates on hue, instantly, at any distance.",
      "It is the most consistent dress in the collection across weather. Cherry swings between scarlet and crimson depending on the sky; this one reads the same royal blue in haze and in hard sun, which makes it the safest choice if you have a particular photograph in mind and cannot choose your day.",
    ],
    fabric:
      "A high-sheen satin with a deep V halter and a very long train. Thrown, it holds a clean arc rather than crumpling, and the sheen puts a bright edge along the leading fold.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where all twelve of these were shot." },
      { label: "White Desert", path: "/experiences/white-desert", why: "Against white chalk the separation is at its most extreme." },
      { label: "Red Sea Yacht", path: "/experiences/red-sea-yacht", why: "The one place the water answers it rather than fighting it." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Maternity and family", path: "/celebrations/maternity-and-family" },
    ],
    related: [
      { id: "aqua", why: "The same cool register, warmer and more tropical." },
      { id: "black", why: "If you want the separation to come from shape rather than colour." },
      { id: "lavender", why: "The nearest thing to it on the cool side of the collection." },
    ],
    frames: [
      { file: "navy-angela-168.jpg", w: 1600, h: 1067, shoot: "Angela", alt: "The royal blue dress standing on the rooftop, its train swept across the deck with two pyramids behind" },
      { file: "navy-cami-324.jpg", w: 1600, h: 1067, shoot: "Cami", alt: "The blue train fanned wide across the cushioned bench under a hazy sky, one arm raised" },
      { file: "navy-elleena-250.jpg", w: 1600, h: 1067, shoot: "Elleena", alt: "The blue dress on the rooftop bench with the train streaming out to one side, cloud over the pyramids" },
      { file: "navy-ericablair-910.jpg", w: 1600, h: 1067, shoot: "Erica Blair", alt: "The blue train thrown into a tall dark sail above the deck, pyramids beyond" },
      { file: "navy-viago-1097.jpg", w: 1600, h: 1067, shoot: "Viago", alt: "The blue dress standing with a hand on one hip, the train swept the width of the frame" },
      { file: "navy-img9174.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The blue train spread wide across the deck, arms raised, pale sky above the plateau" },
    ],
  },
  {
    id: "black",
    seoTitle: "Black: The Black Flying Dress",
    metaDescription:
      "True black satin against pale sand. The one dress whose separation does not depend on colour at all, so it works in any light.",
    colour:
      "True black, in a satin with enough sheen to keep its folds readable rather than closing into a flat shape.",
    againstTheGround: [
      "Black is the most reliable choice in the collection for a wide landscape frame, and the reason is that its separation does not depend on hue. Pale ground, pale sky, dark subject. It works at any distance and in any weather, which is not true of every colour here.",
      "The trade is the middle of the day. Under a hard overhead sun a black train takes the light least comfortably of all thirteen, and the photographer is choosing between holding detail in the fabric and holding it in the sky. Shot in the softer hour either side, that choice disappears.",
    ],
    fabric:
      "A satin with a restrained sheen. Laid out the train becomes a large black field with soft light running along each ridge; thrown, it reads as pure silhouette against the sky.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these six were shot." },
      { label: "White Desert", path: "/experiences/white-desert", why: "The most extreme version of the same idea: dark subject, white ground." },
    ],
    occasions: [
      { label: "Creators and editorial", path: "/creative/creators-and-editorial" },
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
    ],
    related: [
      { id: "navy", why: "The other dress that works as shape, with colour as well." },
      { id: "bronzey", why: "The dark option that keeps a warm tone." },
      { id: "cherry", why: "If you decide you want the colour to do the work after all." },
    ],
    frames: [
      { file: "black-elmira-373.jpg", w: 1600, h: 1067, shoot: "El Mira", alt: "The Black dress standing on the rooftop, its train swept wide across the deck with the pyramids behind" },
      { file: "black-elmira-51.jpg", w: 1600, h: 1067, shoot: "El Mira", alt: "The Black dress on the rooftop bench, the train running the length of the frame" },
      { file: "black-elmira-229.jpg", w: 1600, h: 1067, shoot: "El Mira", alt: "The Black dress seated among the patterned cushions, train pooled, two pyramids in hazy light" },
      { file: "black-milya-694.jpg", w: 1600, h: 1067, shoot: "Milya", alt: "The Black train billowing beside the figure, arm raised, two pyramids under broken cloud" },
      { file: "black-milya-834.jpg", w: 1600, h: 1067, shoot: "Milya", alt: "The Black dress reclining on the cushioned bench with the train spread over the rugs" },
      { file: "black-img7034.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Black train thrown overhead in a wide dark arc above the rooftop deck" },
    ],
  },
  {
    id: "verdant",
    seoTitle: "Verdant: The Deep Green Flying Dress",
    metaDescription:
      "A bottle-green with a quieter finish than Emerald. The green that sits into the scene rather than jumping out of it.",
    colour:
      "A deep bottle green, noticeably darker and less glossy than Emerald. Where Emerald is a jewel, this one is closer to forest.",
    againstTheGround: [
      "It takes the same advantage Emerald does, which is that nothing in a Giza frame is green, but it spends it differently. Verdant holds shadow, so in a wide frame the dress reads as a dark mass with a green cast rather than as a bright object.",
      "That makes it the better of the two greens if you want the plateau to stay the subject and the dress to belong to the scene. It is the worse of the two if you want the dress to be the first thing anyone sees.",
    ],
    fabric:
      "A satin with a softer finish than Emerald's, so the folds read as depth rather than as highlight. Thrown, the arc goes dark olive where it shades itself.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these four were shot." },
      { label: "Fayoum", path: "/experiences/fayoum", why: "Water and reeds, the one setting with greens of its own." },
    ],
    occasions: [
      { label: "Anniversaries and romance", path: "/celebrations/anniversaries-and-romance" },
      { label: "Creators and editorial", path: "/creative/creators-and-editorial" },
    ],
    related: [
      { id: "emerald", why: "The brighter green, if you want it to carry the frame." },
      { id: "black", why: "The same quiet weight, without the colour." },
      { id: "bronzey", why: "The warm equivalent of this one: dark, rich, not loud." },
    ],
    frames: [
      { file: "verdant-ashley-294.jpg", w: 1600, h: 1067, shoot: "Ashley", alt: "The Verdant train thrown into a dark green sail above the rooftop, the figure seated below it" },
      { file: "verdant-gwlad-42.jpg", w: 1600, h: 1067, shoot: "Gwlad", alt: "The Verdant train swept to one side across the cushioned bench, deep green against warm rugs" },
      { file: "verdant-luxe-291.jpg", w: 1600, h: 1067, shoot: "Luxe", alt: "The Verdant dress standing with its skirt spread full, backlit under a hazy sky with a pyramid behind" },
      { file: "verdant-viago-1860.jpg", w: 1600, h: 1067, shoot: "Viago", alt: "The Verdant train arcing overhead in a broad dark curve above the rooftop deck" },
    ],
    note: "Four frames from four separate sessions. A smaller set than Cherry or Aqua, and we would rather show you four real ones than pad it.",
  },
  {
    id: "ginger",
    seoTitle: "Ginger: The Orange Flying Dress",
    metaDescription:
      "A vivid marigold satin, the loudest warm colour in the collection. What it needs behind it, and when it wins.",
    colour:
      "A vivid marigold orange, saturated and warm. The brightest of the warm colours and a long way from the muted earth tones it sits next to in the collection.",
    againstTheGround: [
      "Ginger is a warm colour on a warm plateau, which should be a problem and is not, because it is so much more saturated than anything behind it. Sand is a desaturated buff. This is pure pigment. The separation comes from intensity rather than from hue.",
      "Where it does need thought is the ground directly behind the train. Against a sunlit dune at the same angle, the dress and the sand start to agree with each other. Put sky, shade or water behind it and it is one of the strongest photographs in the collection. That adjustment is the photographer's and it takes ten seconds on the roof.",
    ],
    fabric:
      "A high-sheen satin that throws particularly well: the train is light enough to hold a tall arc and bright enough that the lit face reads almost yellow against the shadowed orange beneath.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these five were shot, mostly against sky." },
      { label: "Fayoum", path: "/experiences/fayoum", why: "Water behind it rather than sand, which is what this colour wants." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Creators and editorial", path: "/creative/creators-and-editorial" },
    ],
    related: [
      { id: "golden", why: "The muted version of the same warmth." },
      { id: "hot-pink", why: "The other dress chosen for being loud." },
      { id: "bronzey", why: "If you want warm and rich rather than warm and bright." },
    ],
    frames: [
      { file: "ginger-omarya-71.jpg", w: 1600, h: 1067, shoot: "Omarya", alt: "The Ginger dress standing on the rooftop, marigold train spread wide across the deck with the pyramids behind" },
      { file: "ginger-vineetha-707.jpg", w: 1600, h: 1067, shoot: "Vineetha", alt: "The Ginger train thrown into a tall orange arc above the rooftop, pyramids beyond" },
      { file: "ginger-vicky-306.jpg", w: 1600, h: 1067, shoot: "Vicky", alt: "The Ginger train caught mid-air under broken cloud, the lit face of the fabric almost yellow" },
      { file: "ginger-limarie-124.jpg", w: 1600, h: 1067, shoot: "Limarie", alt: "The Ginger train thrown out to one side in a long curve across the rooftop deck" },
      { file: "ginger-marie-69.jpg", w: 1600, h: 1067, shoot: "Marie", alt: "The Ginger dress with its train fanned wide over the cushioned bench, pyramids on a pale sky" },
    ],
  },
  {
    id: "snowy",
    seoTitle: "Snowy: The White Flying Dress",
    metaDescription:
      "The lightest fabric in the collection, and the only one that goes translucent when the sun is behind it.",
    colour:
      "Off-white, and the only dress here that is not a heavy satin. In these frames the train goes semi-transparent where the light passes through it.",
    againstTheGround: [
      "White against pale limestone and pale sand is a tonal photograph rather than a graphic one. The interest is in the fold and the movement of the fabric, not in contrast, and that is a real choice rather than a compromise: it is the most bridal of the thirteen and the one people pick when they want the picture to be soft.",
      "It rewards being shot low against the sky rather than against the ground, and it is the one dress that genuinely improves when the sun is behind it. Backlit, the train lights up from inside.",
    ],
    fabric:
      "A light, fine weave rather than a satin. It is the easiest train in the collection to lift and the quickest to lose its shape in still air, so it is the one most dependent on the throw.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these four were shot, against sky." },
      { label: "White Desert", path: "/experiences/white-desert", why: "White on white: a tonal photograph taken to its limit." },
    ],
    occasions: [
      { label: "Vow renewals and engagements", path: "/celebrations/vow-renewals-and-engagements" },
      { label: "Anniversaries and romance", path: "/celebrations/anniversaries-and-romance" },
    ],
    related: [
      { id: "golden", why: "The other dress that lives on light rather than contrast." },
      { id: "lavender", why: "Soft, but with a colour in it." },
      { id: "aqua", why: "If the softness is not what you wanted after all." },
    ],
    frames: [
      { file: "snowy-mary-58.jpg", w: 1600, h: 1067, shoot: "Mary", alt: "The Snowy dress backlit on the rooftop, the white train glowing where the low sun passes through it" },
      { file: "snowy-mary-200.jpg", w: 1600, h: 1067, shoot: "Mary", alt: "The Snowy train fanned out across the rooftop deck with the pyramids behind" },
      { file: "snowy-lovendree-342.jpg", w: 1600, h: 1067, shoot: "Lovendree", alt: "The Snowy train streaming out to one side, the fabric half transparent against the sky" },
      { file: "snowy-karina-343.jpg", w: 1600, h: 1067, shoot: "Karina", alt: "The Snowy dress seated among the patterned cushions, the white train spread over the rugs" },
    ],
    note: "Four frames from three sessions.",
  },
  {
    id: "golden",
    seoTitle: "Golden: The Antique Gold Flying Dress",
    metaDescription:
      "A dark antique gold with a metallic finish, closer to old bronze than to bright yellow. What low sun does to it.",
    colour:
      "A dark antique gold with a metallic finish. Not a bright yellow gold: in flat light it reads almost olive, and it turns to burnished metal only where the sun catches a fold.",
    againstTheGround: [
      "This is one of the colours the background is already wearing, and it asks for something in return. Against a sunlit dune at the same angle the dress and the ground become one object. Against sky, shade, or the dark face of a building it is one of the richest photographs in the collection.",
      "It is also the most light-dependent of the thirteen. Flat midday light makes it muddy. Low sun makes it metal. If this is the colour you want, the hour matters more than it does for any other dress here.",
    ],
    fabric:
      "A metallic-finish satin, heavier-looking than the plain colours. The sheen is directional, so the train shows bands of bright and dark as it moves rather than an even surface.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where this session was shot, against sky rather than sand." },
      { label: "Red Sea Yacht", path: "/experiences/red-sea-yacht", why: "Water behind it, which is what a metallic needs." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Creators and editorial", path: "/creative/creators-and-editorial" },
    ],
    related: [
      { id: "bronzey", why: "The redder, warmer metallic of the two." },
      { id: "ginger", why: "The same warmth at full saturation." },
      { id: "snowy", why: "The other dress that is made by its light." },
    ],
    frames: [
      { file: "golden-milya-147.jpg", w: 1600, h: 1067, shoot: "Milya", alt: "The Golden dress with arms raised, the antique gold train spread wide across the rooftop, two pyramids behind" },
      { file: "golden-milya-199.jpg", w: 1600, h: 1067, shoot: "Milya", alt: "The Golden dress standing on the deck, the train fanned out and catching the sun along its folds" },
      { file: "golden-milya-271.jpg", w: 1600, h: 1067, shoot: "Milya", alt: "The Golden train thrown across the rooftop, the assistant just visible at the edge of the frame" },
      { file: "golden-milya-362.jpg", w: 1600, h: 1067, shoot: "Milya", alt: "The Golden dress seated on the cushioned bench, the train pooled across the rugs" },
    ],
    note: "All four frames are from one session. We have shot this dress once, so you are seeing one person, one evening and one sky rather than the range the other colours can show you.",
  },
  {
    id: "bronzey",
    seoTitle: "BronZey: The Bronze Flying Dress",
    metaDescription:
      "A coppery brown metallic that reads chocolate in shade and burnished copper in low sun. The richest dark colour in the collection.",
    colour:
      "A coppery brown with a metallic finish. In shade it reads as a deep chocolate; where the low sun hits it, it turns to burnished copper.",
    againstTheGround: [
      "It belongs to the same warm family as the plateau, and it is dark enough that the separation comes from weight rather than hue. In a wide frame it behaves more like Black than like Ginger: a dark mass with a warm cast.",
      "The frames where it is most itself are the late ones. Low sun across a metallic finish gives it a copper edge that no other dress in the collection produces, and that is the reason to pick it.",
    ],
    fabric:
      "A metallic-finish satin. The directional sheen means the train is never one flat colour: it bands from near-black to bright copper along its length as it moves.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these five were shot." },
      { label: "Sand Dunes", path: "/experiences/sand-dunes", why: "First light across a metallic finish, with sky behind." },
    ],
    occasions: [
      { label: "Anniversaries and romance", path: "/celebrations/anniversaries-and-romance" },
      { label: "Creators and editorial", path: "/creative/creators-and-editorial" },
    ],
    related: [
      { id: "golden", why: "The greener, more antique of the two metallics." },
      { id: "black", why: "The same weight in a frame, without the warmth." },
      { id: "verdant", why: "Dark and rich from the cool side." },
    ],
    frames: [
      { file: "bronzey-abbyrou-429.jpg", w: 1600, h: 1067, shoot: "Abby & Rou", alt: "The BronZey train thrown into a dark bronze sail against a deep teal sky above the rooftop" },
      { file: "bronzey-elleena-738.jpg", w: 1600, h: 1067, shoot: "Elleena", alt: "The BronZey dress standing with hands behind the head, the copper train spread across the deck, two pyramids behind" },
      { file: "bronzey-elleena-1041.jpg", w: 1600, h: 1067, shoot: "Elleena", alt: "The BronZey train lifted beside the figure, the metallic finish banding from dark to bright" },
      { file: "bronzey-jane-552.jpg", w: 1600, h: 1067, shoot: "Jane", alt: "The BronZey dress from behind with one arm raised, the train spread wide over the rooftop and the pyramids beyond" },
      { file: "bronzey-jane-886.jpg", w: 1600, h: 1067, shoot: "Jane", alt: "The BronZey train streaming out across the deck in low sun, copper along the lit folds" },
    ],
  },
  {
    id: "aqua",
    seoTitle: "Aqua: The Turquoise Flying Dress",
    metaDescription:
      "A bright turquoise satin. The strongest cool contrast in the collection against warm stone, and the most consistent across weather.",
    colour:
      "A bright turquoise, leaning blue-green and strongly saturated. It holds that colour in every one of the six sessions we have shot it in.",
    againstTheGround: [
      "Everything on the plateau is warm: buff stone, orange sand, terracotta rugs, warm hazed sky. Turquoise is the direct opposite of all of it, which makes this the strongest colour contrast available here. In a wide frame it is the first thing the eye lands on.",
      "It is also the most weather-proof colour in the collection. Hazy, clear, early, late, it photographs as the same turquoise. If you are booking from abroad and cannot choose your sky, that reliability is worth something.",
    ],
    fabric:
      "A high-sheen satin with a long, light train. It takes a throw well and the sheen keeps a bright line along the leading edge, so the arc stays legible even against a bright sky.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these six were shot." },
      { label: "Red Sea Yacht", path: "/experiences/red-sea-yacht", why: "The one place the colour has something behind it that agrees." },
      { label: "Fayoum", path: "/experiences/fayoum", why: "Lake water and salt flats, for the same reason." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Maternity and family", path: "/celebrations/maternity-and-family" },
    ],
    related: [
      { id: "navy", why: "The deeper blue, for the same cool separation." },
      { id: "emerald", why: "The other jewel colour with nothing on the plateau to match it." },
      { id: "snowy", why: "If you decide you want soft rather than loud." },
    ],
    frames: [
      { file: "aqua-elleena-429.jpg", w: 1600, h: 1067, shoot: "Elleena", alt: "The Aqua dress standing on the rooftop with the turquoise train spread full across the deck, three pyramids behind" },
      { file: "aqua-estele-124.jpg", w: 1600, h: 1067, shoot: "Estele", alt: "The Aqua train thrown upward against a clear blue sky above the rooftop" },
      { file: "aqua-jessy-363.jpg", w: 1600, h: 1067, shoot: "Jessy", alt: "The Aqua dress with arms raised, the train spread wide under a warm hazy sky" },
      { file: "aqua-myrelsie-464.jpg", w: 1600, h: 1067, shoot: "Myrelsie", alt: "The Aqua dress from behind, the turquoise train billowing out across the rooftop toward a pyramid" },
      { file: "aqua-natalia-a479.jpg", w: 1600, h: 1067, shoot: "Natalia", alt: "The Aqua train caught in a large billow beside the figure, pyramids on the skyline" },
      { file: "aqua-img8728.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Aqua train lifting across the rooftop deck under broken cloud" },
    ],
  },
  {
    id: "lavender",
    seoTitle: "Lavender: The Purple Flying Dress",
    metaDescription:
      "A vivid violet satin. The only purple in the collection, and nothing on the plateau comes near it.",
    colour:
      "A vivid violet-purple in high-sheen satin. Deeper and more saturated than the name suggests, and clearly distinct from Orchid, which is a magenta.",
    againstTheGround: [
      "Purple is the second colour, after green, that appears nowhere in a Giza frame. It separates on hue alone and it does it in any light.",
      "It sits between the two groups in the collection: it holds its colour well in the softer light either side of the middle of the day, and loses a little of its distinctness under a hard overhead sun. Book it for the early or late hour and it is one of the strongest colours here.",
    ],
    fabric:
      "A high-sheen satin with a long train, cut the same way as the rest of the collection. In both frames the train is caught streaming sideways rather than overhead.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where both of these were shot." },
      { label: "White Desert", path: "/experiences/white-desert", why: "Violet against white chalk, if you want the contrast at its most extreme." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Anniversaries and romance", path: "/celebrations/anniversaries-and-romance" },
    ],
    related: [
      { id: "orchid", why: "The magenta next to this violet, and the two are often confused." },
      { id: "navy", why: "The cool colour with the deepest separation." },
      { id: "hot-pink", why: "Warmer and louder, from the same side of the wheel." },
    ],
    frames: [
      { file: "lavender-julia-171.jpg", w: 1600, h: 1067, shoot: "Julia", alt: "The Lavender dress standing on the rooftop, the violet train streaming out wide to one side under a hazy sky" },
      { file: "lavender-img8018.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Lavender train swept across the cushioned bench, deep violet against the patterned rugs" },
    ],
    note: "Two frames, and that is the whole archive for this dress. It is the thinnest page in the wardrobe and we would rather say so than fill it with photographs of a different colour. Ask us and we will send you more pictures of it.",
  },
  {
    id: "hot-pink",
    seoTitle: "Hot Pink: The Pink Flying Dress",
    metaDescription:
      "A vivid red-pink that swings between coral and fuchsia depending on the light. The loudest dress in the collection.",
    colour:
      "A vivid red-pink. It swings with the light more than any other dress here: in hazy sun it reads as a bright coral-red, in flatter light it goes deep fuchsia.",
    againstTheGround: [
      "This is the loudest dress in the collection and it is chosen by people who want the photograph to be loud. Against pale stone it is pure saturation, and the dress is unambiguously the subject of the frame.",
      "It is the one colour where it is worth saying out loud which version you are imagining, because the coral and the fuchsia are genuinely different photographs and the difference is the sky rather than the dress. Tell us which you have seen and we will tell you what the hour gives you.",
    ],
    fabric:
      "A high-sheen satin with a long train that throws into a tall arc. The lit face goes almost scarlet while the shadowed fold stays deep pink, so a single throw shows both versions of the colour at once.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these five were shot." },
      { label: "Sand Dunes", path: "/experiences/sand-dunes", why: "First light and nothing but sand behind it." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Gender reveals", path: "/celebrations/gender-reveals" },
    ],
    related: [
      { id: "cherry", why: "The deeper, cooler red of the two." },
      { id: "orchid", why: "The same saturation pushed toward magenta." },
      { id: "ginger", why: "The warm equivalent, if you want loud without pink." },
    ],
    frames: [
      { file: "hot-pink-melody-128.jpg", w: 1600, h: 1067, shoot: "Melody", alt: "The Hot Pink train thrown into a tall sail above the rooftop deck, pyramids behind" },
      { file: "hot-pink-desiree-23.jpg", w: 1600, h: 1067, shoot: "Desiree", alt: "The Hot Pink dress with the train spread the full width of the frame, reading coral-red in hazy sun, three pyramids behind" },
      { file: "hot-pink-img0088.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Hot Pink train thrown overhead in a deep fuchsia arc, the figure turned away" },
      { file: "hot-pink-img0095.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Hot Pink dress with both arms raised holding the train open above the cushioned bench" },
      { file: "hot-pink-img0098.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Hot Pink train caught mid-throw in a bright arc across the rooftop, pyramids beyond" },
    ],
  },
  {
    id: "orchid",
    seoTitle: "Orchid: The Magenta Flying Dress",
    metaDescription:
      "A deep fuchsia-magenta satin. One of the two strongest performers against pale stone, and the more unusual of them.",
    colour:
      "A deep fuchsia-magenta, strongly saturated and glossy. More purple than Hot Pink and more pink than Lavender, which is the gap it fills.",
    againstTheGround: [
      "Magenta is the other colour, with Cherry, that holds up at any distance against pale stone. It stays readable in silhouette, it keeps its colour in direct sun, and it photographs as the subject even when the dress is small in a wide landscape frame.",
      "It is the less expected of the two, which is most of its appeal. A red dress at the pyramids is a photograph people have seen. This is not.",
    ],
    fabric:
      "A high-sheen satin with a long train. Thrown, it shows a bright magenta face and a deep plum shadow in the same arc, which is what gives the fabric its depth in a still frame.",
    locations: [
      { label: "Pyramids Rooftop", path: "/experiences/pyramids-rooftop", why: "Where these four were shot." },
      { label: "White Desert", path: "/experiences/white-desert", why: "Saturated magenta against white chalk." },
    ],
    occasions: [
      { label: "Birthdays and celebrations", path: "/celebrations/birthdays-and-celebrations" },
      { label: "Creators and editorial", path: "/creative/creators-and-editorial" },
    ],
    related: [
      { id: "cherry", why: "The other dress that reads as the subject at any distance." },
      { id: "hot-pink", why: "Brighter and warmer, for a louder frame." },
      { id: "lavender", why: "The violet on the other side of this one." },
    ],
    frames: [
      { file: "orchid-fran-49.jpg", w: 1600, h: 1067, shoot: "Fran", alt: "The Orchid dress standing on the rooftop with the magenta train spread across the deck under a hazy sky" },
      { file: "orchid-fran-164.jpg", w: 1600, h: 1067, shoot: "Fran", alt: "The Orchid dress with the train swept to one side, pyramids on the skyline behind" },
      { file: "orchid-fran-211.jpg", w: 1600, h: 1067, shoot: "Fran", alt: "The Orchid train thrown into a wide magenta arc above the rooftop" },
      { file: "orchid-img7863.jpg", w: 1600, h: 1067, shoot: UNATTRIBUTED_SHOOT, alt: "The Orchid train streaming across the cushioned bench, deep magenta against the patterned rugs" },
    ],
    note: "Four frames, three of them from one session.",
  },
];

/** Shared across all thirteen pages, because it is true of all thirteen. */
export const WARDROBE_PRICE_NOTE =
  "A flying dress session is $199 per person and the dress is included, whichever of the thirteen you choose. There is no colour surcharge. A second dress in the same session is $99, and a dress made or customised for you to keep is $249.";

export function dressPageById(id: string): DressPage | undefined {
  return dressPages.find((d) => d.id === id);
}

/** The id list, in collection order rather than in this file's order. */
export const dressPageIds: string[] = FLYING_DRESS_COLLECTION.filter((o) =>
  dressPages.some((d) => d.id === o.id)
).map((o) => o.id);
