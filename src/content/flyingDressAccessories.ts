/**
 * The accessories, photographed, named and described.
 *
 * =========================================================================
 * WHERE THESE CAME FROM, AND WHY IT IS WRITTEN DOWN
 * =========================================================================
 * The owner supplied them in the brand's Drive folder, under their own five
 * headings: Earrings, Around Neck, On Head, Around Arm, in Finger. Those
 * headings are the business's own way of organising the hire, so they are
 * what the page is built from rather than a grouping invented here.
 *
 * THE PIECES ARE REAL. THE MODEL AND THE SETTING ARE NOT. The owner
 * photographed each piece of jewellery and had it composited onto generated
 * models against a generated desert, and states that every piece renders
 * identically to the item in the wardrobe and that delivering the exact piece
 * shown is their responsibility. That is a business fact only they can give,
 * they gave it plainly, and it is recorded here because the files themselves
 * carry C2PA provenance naming OpenAI — so anybody who inspects them later,
 * or any ad platform that reads that metadata automatically, will see
 * generated imagery and should find this note rather than a mystery.
 *
 * It also sets the boundary for anyone editing this file: the JEWELLERY may
 * be described, because it exists and the owner stands behind it. The people
 * may not be described as customers, the settings may not be described as
 * locations we shoot at, and no piece may gain a figure here. The three hire
 * services carry none by design and check-flying-dresses enforces it.
 *
 * =========================================================================
 * THE NAMES ARE THE STUDIO'S OWN, AND THE FILE SAYS SO OUT LOUD
 * =========================================================================
 * This file used to carry references and nothing else — "Headpiece 2" — on
 * the reasoning that the source material names no piece, so any name would be
 * invented. The owner has since asked for names drawn from ancient Egypt, and
 * that is a different act from inventing a fact: naming your own stock is
 * branding, and the owner is the only person entitled to do it.
 *
 * What it must never slide into is a CLAIM. A name here says "this is what we
 * call it"; it does not say the piece is an artefact, a reproduction of one,
 * or a design with any documented ancient provenance. NAMING_NOTE states that
 * in the customer's own words and every surface that prints a name prints it.
 *
 * The references survive alongside the names, and they are not decoration.
 * They are stable, they are unambiguous over a phone line, and they are what
 * the desk matches an enquiry against — a customer who writes "the gold one"
 * still has "Headpiece 2" under the picture to quote.
 */

export type AccessoryItem = {
  /** Stable id, and what the desk matches an enquiry against. */
  ref: string;
  /**
   * The studio's own name for the piece, drawn from ancient Egypt. NOT a
   * claim of provenance — see NAMING_NOTE, which every surface prints.
   */
  name: string;
  src: string;
  /** What is visibly in the frame. Describes the jewellery, not the model. */
  alt: string;
  /** The piece itself, in a sentence. Nothing about the model or the setting. */
  description: string;
  /** Where on the body it is worn. Asked for directly. */
  worn: string;
};

export type AccessoryCategory = {
  slug: string;
  /** The owner's own heading, kept as they wrote it. */
  title: string;
  items: AccessoryItem[];
};

export const accessoryCategories: AccessoryCategory[] = [
  {
    slug: "headpieces",
    title: "On the head",
    items: [
      {
        ref: "Headpiece 1",
        name: "Nefertari",
        src: "/photos/flying-dresses/accessories/headpieces-1.jpg",
        alt: "A gold headdress with a cobra rising at the front, set with turquoise stones, with fine chains hanging across the brow",
        description:
          "A gold headdress with a cobra rising at the front, set with turquoise, and fine chains hanging loose across the brow.",
        worn: "Across the forehead, the band following the hairline and the chains falling over the brow.",
      },
      {
        ref: "Headpiece 2",
        name: "Seshat",
        src: "/photos/flying-dresses/accessories/headpieces-2.jpg",
        alt: "A fine gold chain headpiece with small discs falling across the forehead",
        description: "A fine gold chain hung with small discs that catch the light as you move.",
        worn: "Across the forehead, sitting just above the eyebrows, the discs resting on the brow.",
      },
      {
        ref: "Headpiece 3",
        name: "Hatshepsut",
        src: "/photos/flying-dresses/accessories/headpieces-3.jpg",
        alt: "A gold coin headdress worn in a band across the brow",
        description: "A band of gold coins, the heaviest of the three on the head.",
        worn: "Across the forehead as a band, fastened behind and hidden under the hair.",
      },
    ],
  },
  {
    slug: "necklaces",
    title: "Around the neck",
    items: [
      {
        ref: "Necklace 1",
        name: "Nefertiti",
        src: "/photos/flying-dresses/accessories/necklaces-1.jpg",
        alt: "A wide beaded collar in gold and dark blue with a pale stone at its centre",
        description:
          "A wide beaded collar in gold and deep blue with a pale stone at its centre, in the broad-collar shape the Egyptians called a usekh.",
        worn: "Flat around the base of the neck and out over the collarbones. It needs an open or wide neckline to sit properly.",
      },
      {
        ref: "Necklace 2",
        name: "Meritaten",
        src: "/photos/flying-dresses/accessories/necklaces-2.jpg",
        alt: "A slim gold choker of several close-set strands",
        description: "A slim choker of several close-set gold strands.",
        worn: "High on the throat, close to the skin.",
      },
      {
        ref: "Necklace 3",
        name: "Isis",
        src: "/photos/flying-dresses/accessories/necklaces-3.jpg",
        alt: "A gold pendant on a fine chain, worn long",
        description: "A single gold pendant on a fine chain.",
        worn: "Long, with the pendant falling to the breastbone. It layers under the wider collar.",
      },
    ],
  },
  {
    slug: "earrings",
    title: "Earrings",
    items: [
      {
        ref: "Earrings 1",
        name: "Bastet",
        src: "/photos/flying-dresses/accessories/earrings-1.jpg",
        alt: "A gold drop earring with a figured motif",
        description: "A gold drop with a figured motif.",
        worn: "In the ear, falling just below the lobe.",
      },
      {
        ref: "Earrings 2",
        name: "Sekhmet",
        src: "/photos/flying-dresses/accessories/earrings-2.jpg",
        alt: "Large gold cluster drop earrings",
        description: "Large gold cluster drops, the bolder of the two pairs.",
        worn: "In the ear, falling towards the jaw. They read best with the hair up or swept to one side.",
      },
    ],
  },
  {
    slug: "armbands",
    title: "Around the arm",
    items: [
      {
        ref: "Armband 1",
        name: "Nekhbet",
        src: "/photos/flying-dresses/accessories/armbands-1.jpg",
        alt: "Several slim gold bangles stacked together",
        description: "Several slim gold bangles, worn as a stack rather than singly.",
        worn: "At the wrist, several together, on the arm nearest the camera.",
      },
      {
        ref: "Armband 2",
        name: "Wadjet",
        src: "/photos/flying-dresses/accessories/armbands-2.jpg",
        alt: "A wide gold cuff, ribbed across its face, worn on the upper arm",
        description: "A wide gold cuff, ribbed across its face.",
        worn: "On the upper arm, above the elbow, where a sleeveless dress leaves it visible.",
      },
      {
        ref: "Armband 3",
        name: "Serqet",
        src: "/photos/flying-dresses/accessories/armbands-3.jpg",
        alt: "A gold upper-arm cuff with a knotted detail",
        description: "A gold upper-arm cuff with a knotted detail at its centre.",
        worn: "On the upper arm, with the knot turned outward to the camera.",
      },
    ],
  },
  {
    slug: "rings",
    title: "On the finger",
    items: [
      {
        ref: "Ring 1",
        name: "Horus",
        src: "/photos/flying-dresses/accessories/rings-1.jpg",
        alt: "A gold ring with a raised figured motif",
        description: "A gold ring with a raised figured motif.",
        worn: "On the finger. The raised face reads best on the hand nearest the camera.",
      },
      {
        ref: "Ring 2",
        name: "Maat",
        src: "/photos/flying-dresses/accessories/rings-2.jpg",
        alt: "A gold ring with a broad engraved face",
        description: "A gold ring with a broad engraved face.",
        worn: "On the finger, worn on its own rather than stacked.",
      },
    ],
  },
];

/** Every piece shown, for counting, for the picker and for the checks. */
export const accessoryItems: AccessoryItem[] = accessoryCategories.flatMap((c) => c.items);

/** Resolved, never trusted. An unknown reference becomes undefined. */
export function accessoryByRef(ref: string): AccessoryItem | undefined {
  return accessoryItems.find((item) => item.ref.toLowerCase() === ref.trim().toLowerCase());
}

/**
 * Said once, on every surface that shows these frames.
 *
 * Kept here rather than typed into each page so the two cannot drift, and so
 * removing it is one edit if the owner decides it is not wanted. It names what
 * is generated and what is not, in that order, because the jewellery is the
 * thing being sold and the model is the thing being doubted.
 */
export const LOOKBOOK_NOTE =
  "Each piece is photographed from our own collection. The model and the setting are created digitally, so you are seeing the real jewellery styled rather than a photograph of a shoot.";

/**
 * Said wherever a name is printed, for the reason in the header comment.
 *
 * It is one string for the same reason LOOKBOOK_NOTE is: a disclaimer typed
 * into three pages is a disclaimer that survives in two of them.
 */
export const NAMING_NOTE =
  "The names are ours. Each piece is called after a figure from ancient Egypt because that is how we refer to them on a shoot day, not because the piece is an antiquity or a copy of one. Quote the name, or the reference beneath it, and we will know which one you mean.";
