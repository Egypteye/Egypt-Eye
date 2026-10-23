/**
 * The accessories, photographed.
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
 * locations we shoot at, and no piece may gain a price here. The three hire
 * services carry no price by design and check-flying-dresses enforces it.
 *
 * =========================================================================
 * REFERENCES, NOT PRODUCT NAMES
 * =========================================================================
 * Nothing in the folder names a single piece — the filenames are generative
 * titles like "Golden Hour Desert Goddess", repeated across categories. So
 * each item gets a stable reference built from its category and position
 * ("Headpiece 2") and nothing else. A customer can quote that in an enquiry
 * and the desk knows exactly which piece they mean, and no product name has
 * been invented to do it.
 */

export type AccessoryItem = {
  /** Stable id, and what the page shows so a customer can quote it. */
  ref: string;
  src: string;
  /** What is visibly in the frame. Describes the jewellery, not the model. */
  alt: string;
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
        src: "/photos/flying-dresses/accessories/headpieces-1.jpg",
        alt: "A gold headdress set with turquoise stones, with fine chains hanging across the brow",
      },
      {
        ref: "Headpiece 2",
        src: "/photos/flying-dresses/accessories/headpieces-2.jpg",
        alt: "A fine gold chain headpiece with small discs falling across the forehead",
      },
      {
        ref: "Headpiece 3",
        src: "/photos/flying-dresses/accessories/headpieces-3.jpg",
        alt: "A gold coin headdress worn in a band across the brow",
      },
    ],
  },
  {
    slug: "necklaces",
    title: "Around the neck",
    items: [
      {
        ref: "Necklace 1",
        src: "/photos/flying-dresses/accessories/necklaces-1.jpg",
        alt: "A wide beaded collar in gold and dark blue with a pale stone at its centre",
      },
      {
        ref: "Necklace 2",
        src: "/photos/flying-dresses/accessories/necklaces-2.jpg",
        alt: "A slim gold choker of several close-set strands",
      },
      {
        ref: "Necklace 3",
        src: "/photos/flying-dresses/accessories/necklaces-3.jpg",
        alt: "A gold pendant on a fine chain, worn long",
      },
    ],
  },
  {
    slug: "earrings",
    title: "Earrings",
    items: [
      {
        ref: "Earrings 1",
        src: "/photos/flying-dresses/accessories/earrings-1.jpg",
        alt: "A gold drop earring with a figured motif",
      },
      {
        ref: "Earrings 2",
        src: "/photos/flying-dresses/accessories/earrings-2.jpg",
        alt: "Large gold cluster drop earrings",
      },
    ],
  },
  {
    slug: "armbands",
    title: "Around the arm",
    items: [
      {
        ref: "Armband 1",
        src: "/photos/flying-dresses/accessories/armbands-1.jpg",
        alt: "Several slim gold bangles stacked together",
      },
      {
        ref: "Armband 2",
        src: "/photos/flying-dresses/accessories/armbands-2.jpg",
        alt: "A wide gold cuff worn on the upper arm",
      },
      {
        ref: "Armband 3",
        src: "/photos/flying-dresses/accessories/armbands-3.jpg",
        alt: "A gold upper-arm cuff with a knotted detail",
      },
    ],
  },
  {
    slug: "rings",
    title: "On the finger",
    items: [
      {
        ref: "Ring 1",
        src: "/photos/flying-dresses/accessories/rings-1.jpg",
        alt: "A gold ring with a raised figured motif",
      },
      {
        ref: "Ring 2",
        src: "/photos/flying-dresses/accessories/rings-2.jpg",
        alt: "A gold ring with a broad engraved face",
      },
    ],
  },
];

/** Every piece shown, for counting and for the checks. */
export const accessoryItems: AccessoryItem[] = accessoryCategories.flatMap((c) => c.items);

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
