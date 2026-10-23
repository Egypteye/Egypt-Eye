import {
  FLYING_DRESS_COLLECTION,
  MENS_OUTFITS,
} from "@/content/outfitCollection";

/**
 * A photograph of each dress, for this brand's pages.
 *
 * WHY THIS IS NOT `Outfit.image`
 *
 * The shared Outfit type (lib/booking/outfits.ts) already has an `image`, and
 * it is a SanityImage: the Egypt Eye booking picker reads it from the CMS so
 * the owner can change a dress photograph from Studio without a deploy. That
 * field belongs to the booking flow and to Sanity, and quietly stuffing a
 * local file path into it would either break the picker's image pipeline or
 * force the type to become a union that every consumer has to narrow.
 *
 * So the garments stay a single shared list with no presentation in them, and
 * the photographs live here, in the brand that displays them, keyed by outfit
 * id. The same arrangement assets.ts already uses for the rest of the site.
 *
 * WHEN A DRESS IS PHOTOGRAPHED IN SANITY TOO
 *
 * Nothing breaks: this is what the Flying Dresses wardrobe renders, Sanity is
 * what the booking picker renders. If they ever disagree it is because someone
 * uploaded a new photograph to one and not the other, which is a content task,
 * not a bug.
 *
 * PROVENANCE
 *
 * The twelve DRESSES are the agency's own work, from client shoots supplied by
 * the owner in October 2026. The EXIF on the originals reads "egypt-eye-travel
 * / EGYPT.EYE". They are real customers, published at the owner's instruction.
 *
 * The five GAWNS are not, and the difference is marked rather than described
 * in passing. The owner photographed each garment and had it composited onto a
 * generated model on a plain studio background; the files carry C2PA
 * provenance naming OpenAI. The garment is real and the owner stands behind
 * delivering the one shown. The person wearing it is not a customer and the
 * frame is not a shoot, so `styled` is set on each and the wardrobe says
 * something different about them. See the note on that field.
 */
export type DressPhoto = {
  src: string;
  /** Describes the photograph to someone who cannot see it. */
  alt: string;
  /** The shoot it came from, so a frame can always be traced back. */
  shoot: string;
  /**
   * True when the GARMENT is real and photographed but the model and the
   * setting around it are generated.
   *
   * It exists because of one sentence. The wardrobe tells a customer "From the
   * Aroouj shoot. The dress is the one you would wear." — which is true of
   * twelve frames taken at real client shoots and false of a composite, where
   * there was no shoot and the person is nobody. Without this flag the five
   * gawns would have inherited that sentence and quietly claimed a customer
   * session that never happened.
   *
   * What stays true either way is the half that matters to somebody choosing:
   * the garment is the one they would wear. That part is said for both.
   */
  styled?: boolean;
};

export const dressPhotos: Record<string, DressPhoto> = {
  // ---------------------------------------------------------------------------
  // THE FIVE GAWNS — the asset checklist's "biggest missing asset", filled.
  //
  // Supplied in the men's wardrobe folder, one frame each, already matching the
  // five entries in MENS_OUTFITS by name. Studio frames on white: the garment
  // is the subject, which is what a wardrobe grid needs and what the twelve
  // dress photographs, shot on location, deliberately are not.
  //
  // `styled` on every one. See the field's note.
  // ---------------------------------------------------------------------------
  "saeedy-gawn-1": {
    src: "/photos/flying-dresses/gawn-saeedy-gawn-1.jpg",
    alt: "A white Saeedy gawn worn with a brown and amber patterned shawl over one shoulder",
    shoot: "Men's wardrobe",
    styled: true,
  },
  "saeedy-gawn-2": {
    src: "/photos/flying-dresses/gawn-saeedy-gawn-2.jpg",
    alt: "A white Saeedy gawn worn with a gold and cream patterned shawl over one shoulder",
    shoot: "Men's wardrobe",
    styled: true,
  },
  "bahary-gawn-3": {
    src: "/photos/flying-dresses/gawn-bahary-gawn-3.jpg",
    alt: "A white Bahary gawn worn under a deep red waistcoat with gold embroidery down both front panels",
    shoot: "Men's wardrobe",
    styled: true,
  },
  "bahary-gawn-4": {
    src: "/photos/flying-dresses/gawn-bahary-gawn-4.jpg",
    alt: "A white Bahary gawn worn under a black waistcoat with gold embroidery down both front panels",
    shoot: "Men's wardrobe",
    styled: true,
  },
  "classic-plain-gawn-5": {
    src: "/photos/flying-dresses/gawn-classic-plain-gawn-5.jpg",
    alt: "A plain white gawn with a mandarin collar and no overlay",
    shoot: "Men's wardrobe",
    styled: true,
  },

  cherry: {
    src: "/photos/flying-dresses/dress-cherry.jpg",
    alt: "The Cherry dress on the Giza rooftop, its red train sweeping the full width of the frame with the pyramids behind",
    shoot: "Aroouj",
  },
  emerald: {
    src: "/photos/flying-dresses/dress-emerald.jpg",
    alt: "The Emerald dress on the rooftop, deep green silk running out across the terrace toward the pyramids",
    shoot: "Percious",
  },
  navy: {
    src: "/photos/flying-dresses/dress-navy.jpg",
    alt: "The Navy dress spread into a wide circle on the rooftop, arm raised, three pyramids on the skyline",
    shoot: "Cami",
  },
  black: {
    src: "/photos/flying-dresses/dress-black.jpg",
    alt: "The Black dress on the rooftop, its train laid out long and low with the pyramids behind",
    shoot: "El Mira",
  },
  verdant: {
    src: "/photos/flying-dresses/dress-verdant.jpg",
    alt: "The Verdant dress caught mid-air, green fabric arcing across the rooftop toward the pyramids",
    shoot: "Gwlad",
  },
  ginger: {
    src: "/photos/flying-dresses/dress-ginger.jpg",
    alt: "The Ginger dress from behind, amber silk fanned wide across the rooftop under the pyramids",
    shoot: "Omarya",
  },
  snowy: {
    src: "/photos/flying-dresses/dress-snowy.jpg",
    alt: "The Snowy dress lifting in the wind on the rooftop, white fabric bright against the desert",
    shoot: "Mary",
  },
  golden: {
    src: "/photos/flying-dresses/dress-golden.jpg",
    alt: "The Golden dress opened into a full fan, arms outstretched, the pyramids behind the rooftop",
    shoot: "Milya",
  },
  bronzey: {
    src: "/photos/flying-dresses/dress-bronzey.jpg",
    alt: "The BronZey dress on the rooftop, bronze silk falling away to one side with a pyramid behind",
    shoot: "Elleena",
  },
  aqua: {
    src: "/photos/flying-dresses/dress-aqua.jpg",
    alt: "The Aqua dress spread wide across the rooftop, turquoise against the sand and three pyramids",
    shoot: "Elleena",
  },
  lavender: {
    src: "/photos/flying-dresses/dress-lavender.jpg",
    alt: "The Lavender dress with its violet train streaming sideways across the rooftop",
    shoot: "Julia",
  },
  "hot-pink": {
    src: "/photos/flying-dresses/dress-hot-pink.jpg",
    alt: "The Hot Pink dress on the Giza rooftop, its train thrown up into a wave the width of the terrace, two pyramids on the skyline behind",
    shoot: "Melody",
  },
  orchid: {
    src: "/photos/flying-dresses/dress-orchid.jpg",
    alt: "The Orchid dress on the rooftop, magenta silk thrown up into the air beside a pyramid",
    shoot: "Fran",
  },
};

/**
 * THE MEN'S GAWNS STILL HAVE NO PHOTOGRAPHS, AND THIS SAYS SO OUT LOUD.
 *
 * Twelve dresses arrived; five gawns did not. The wardrobe page therefore
 * still renders those five as named, photo-less options, which is the honest
 * state and the top line of the asset checklist. This export exists so the
 * check script can assert the gap rather than letting it be forgotten once the
 * page looks finished.
 */
export const outfitsAwaitingPhotos: string[] = MENS_OUTFITS.filter(
  (o) => !dressPhotos[o.id]
).map((o) => o.id);

export const dressesAwaitingPhotos: string[] = FLYING_DRESS_COLLECTION.filter(
  (o) => !dressPhotos[o.id]
).map((o) => o.id);
