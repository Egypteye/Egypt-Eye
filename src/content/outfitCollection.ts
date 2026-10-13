/**
 * THE WARDROBE — one collection, two brands.
 *
 * Twelve flying dresses and five traditional men's gawns. Egypt Eye Travel
 * sells photoshoots that include them (content/photoshoots.ts) and Flying
 * Dresses Egypt sells the same garments as shoots and as rentals
 * (content/flyingDresses.ts). It is one physical wardrobe in Cairo, so it is
 * one array here.
 *
 * This file exists because it was briefly two. The dresses were declared
 * inline in photoshoots.ts, and adding a second brand meant either importing
 * one brand's product file into the other's — which is backwards — or typing
 * "BronZey" out a second time and letting the two spellings drift until the
 * sister sites disagreed about a garment. Neither is acceptable for a fact
 * with exactly one correct answer, so both brands read from here.
 *
 * Outfits carry no price, by design. See lib/booking/outfits.ts: the Outfit
 * type has no price field at all, which is what makes it structurally
 * impossible for a dress choice to move a booking total.
 *
 * SANITY WINS OVER THIS FILE, WHOLESALE. These arrays are the fallback that
 * serves a product until someone types outfits into the Studio. The rule is in
 * lib/sanityShape.ts: a Studio document that has never had an outfit typed
 * into it projects null and falls back to this collection; a document whose
 * list an editor has emptied stays empty, because that is a real edit. So
 * adding a garment here reaches production only while the Studio is still
 * silent on the subject — which, as of this change, it is.
 */

import type { Outfit } from "@/lib/booking/outfits";

/**
 * THE FLYING DRESS COLLECTION — twelve dresses, all confirmed available.
 *
 * Confirmed twice: the business names all twelve in the "Do I bring the
 * dress?" FAQ on the rooftop product, and the live page at
 * egypteyetravel.com/photoshoots/pyramids-rooftop-flying-dress-photoshoot
 * lists the same twelve by name.
 *
 * Shared by every Flying Dress product because all of them already promise a
 * dress "in the colour you choose" from one collection. That is an assumption
 * about one agency wardrobe serving the dunes, Fayoum and the rooftop alike;
 * if a colour never travels to Fayoum, switch it off for that product in the
 * Studio rather than editing this file.
 *
 * `hex` is a swatch shown ONLY until a photograph is uploaded, and the picker
 * labels such an option "photo coming soon" rather than passing the circle off
 * as the garment. These values are approximations of the colour names, not
 * measurements of the real fabric. Upload the photographs in Sanity Studio and
 * the swatches disappear on their own.
 *
 * `BronZey`'s internal capital is the business's own spelling. Left alone.
 */
export const FLYING_DRESS_COLLECTION: Outfit[] = [
  { id: "cherry", name: "Cherry", category: "womens-dress", hex: "#9d2235" },
  { id: "emerald", name: "Emerald", category: "womens-dress", hex: "#1f6f54" },
  { id: "navy", name: "Navy", category: "womens-dress", hex: "#1e2a4a" },
  { id: "black", name: "Black", category: "womens-dress", hex: "#15161a" },
  { id: "verdant", name: "Verdant", category: "womens-dress", hex: "#4b7a3f" },
  { id: "ginger", name: "Ginger", category: "womens-dress", hex: "#b4662c" },
  { id: "snowy", name: "Snowy", category: "womens-dress", hex: "#f2efe9" },
  { id: "golden", name: "Golden", category: "womens-dress", hex: "#c9a227" },
  { id: "bronzey", name: "BronZey", category: "womens-dress", hex: "#8c6239" },
  { id: "aqua", name: "Aqua", category: "womens-dress", hex: "#3c9ca8" },
  { id: "lavender", name: "Lavender", category: "womens-dress", hex: "#9b8ac4" },
  { id: "orchid", name: "Orchid", category: "womens-dress", hex: "#a4559b" },
];

/**
 * TRADITIONAL MEN'S OUTFITS — five gawns.
 *
 * THIS ARRAY WAS EMPTY, AND THE COMMENT EXPLAINING WHY WAS RIGHT AT THE TIME:
 * nothing anyone had supplied named a single men's outfit, so there was
 * nothing truthful to put in it, and "Linen Shirt — Beige" would have put a
 * garment on a product page the business may not own.
 *
 * What changed is that the business's own services-and-pricing brochure names
 * five, and the rooftop product's FAQ has been telling customers so for
 * months: *"Yes. We have traditional Egyptian attire for men in five styles.
 * Let us know when you book."* That promise was live on egypteyetravel.com
 * with an outfit picker that offered nothing but dresses — a customer reading
 * the FAQ was told the garments exist and then shown none of them. Filling
 * this array is what makes the picker agree with the sentence above it.
 *
 * The brochure numbers them and repeats two of the style names:
 *
 *     1 Saeedy Gawn   2 Saeedy Gawn   3 Bahary Gawn   4 Bahary Gawn
 *     5 Classic Plain Gawn
 *
 * Read as a numbered catalogue: two Saeedy variants, two Bahary variants, one
 * plain. The numbers are kept in the display names because they are the only
 * thing distinguishing each pair. Inventing a description to tell them apart
 * — "Saeedy Gawn I, cream linen, embroidered cuff" — would be exactly the
 * fabrication the original comment was protecting against, so WHAT
 * DISTINGUISHES EACH PAIR IS STILL AN OPEN QUESTION, recorded in
 * docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md.
 *
 * No `hex` on any of them, deliberately. A colour swatch is a fair stand-in
 * for a dress sold by colour name and a misleading one for a garment sold by
 * regional cut: there is no colour that "Bahary Gawn" means. With no hex and
 * no image these render as named, photo-less options, which the picker already
 * labels honestly. Photographs are the fix and they are the top line of the
 * asset checklist.
 */
export const MENS_OUTFITS: Outfit[] = [
  { id: "saeedy-gawn-1", name: "Saeedy Gawn 1", category: "mens-outfit" },
  { id: "saeedy-gawn-2", name: "Saeedy Gawn 2", category: "mens-outfit" },
  { id: "bahary-gawn-3", name: "Bahary Gawn 3", category: "mens-outfit" },
  { id: "bahary-gawn-4", name: "Bahary Gawn 4", category: "mens-outfit" },
  { id: "classic-plain-gawn-5", name: "Classic Plain Gawn 5", category: "mens-outfit" },
];

/** What a Flying Dress product offers: the dresses and the men's outfits. */
export const FLYING_DRESS_OUTFITS: Outfit[] = [
  ...FLYING_DRESS_COLLECTION,
  ...MENS_OUTFITS,
];
