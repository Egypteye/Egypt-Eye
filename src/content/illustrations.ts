/**
 * Generated illustrations, declared in one place, with what they are.
 *
 * =========================================================================
 * WHY THIS FILE IS SEPARATE FROM EVERY OTHER CONTENT FILE
 * =========================================================================
 * Everything in src/content/*.ts is a photograph of a real thing. These are
 * not. They are AI renders of the Grand Egyptian Museum, supplied by the
 * owner, and they are published at the owner's explicit decision with a
 * visible label on every one.
 *
 * Keeping them in their own file with their own type is the mechanism that
 * stops them leaking. A tour's `image` takes a SanityImage; it cannot take an
 * `Illustration`, because an Illustration is a different shape and carries a
 * mandatory `disclosure`. So a generated image cannot be dropped into a
 * product's photo slot by someone editing a content file in a hurry — the
 * compiler refuses it, and check-illustrations.mts refuses the path.
 *
 * This mirrors src/app/flying-dresses/_lib/assets.ts, which solved the same
 * problem for that site with a `kind` on every slot. The lesson there was
 * that "temporary imagery must never become indistinguishable from real
 * customer work", and the way it stays distinguishable is that a machine
 * checks it, not that somebody remembers.
 *
 * =========================================================================
 * WHY THE DISCLOSURE IS A REQUIRED FIELD AND NOT A COMPONENT DEFAULT
 * =========================================================================
 * A default renders once and can be removed in one edit, in a component that
 * nobody re-reads. A required field per image means an unlabelled render is
 * not expressible: there is no way to add one of these to the site without
 * writing the sentence that says what it is.
 *
 * =========================================================================
 * ONE THING THAT IS NOT TRUE OF THESE FILES, AND MATTERS
 * =========================================================================
 * They carry NO generated-media provenance. Scanned for c2pa, openai,
 * gpt-image and trainedAlgorithmicMedia: zero hits, and no PNG text chunks.
 * The originals were named `Gemini_Generated_Image_*.png`, but a filename is
 * not provenance and does not survive into `public/`.
 *
 * That is the opposite of the flying-dresses case, where the generated frames
 * carried their markers "in abundance, so this is not a judgement call — it is
 * in the bytes". Here it IS a judgement call, resting on where the files came
 * from. Which is precisely why the label is declared here per image rather
 * than inferred from the file: nothing in the file itself would ever tell us
 * again.
 */

export type Illustration = {
  /** Path under /public. */
  src: string;
  /** Honest alt text. Says it is an illustration before it says anything else. */
  alt: string;
  /** The real place depicted, named plainly. */
  subject: string;
  /**
   * Shown to the reader, on the image. Required, so an unlabelled generated
   * image cannot be added to this site without deleting this field first —
   * which does not compile.
   */
  disclosure: string;
};

const AI_LABEL = "AI illustration";

const gem = (src: string, alt: string): Illustration => ({
  src: `/photos/illustrations/gem/${src}`,
  alt: `${AI_LABEL}: ${alt}`,
  subject: "The Grand Egyptian Museum, Giza",
  disclosure: AI_LABEL,
});

/**
 * Keyed by the slug of the page that shows them. A key with no matching
 * product is a mistake the check catches, because an illustration rendering
 * on no page is indistinguishable from one rendering on the wrong page.
 */
export const illustrationGalleries: Record<string, Illustration[]> = {
  "shakiras-2-day-egypt-experience": [
    gem(
      "atrium-glass-roof.jpg",
      "the museum's great atrium, with daylight through the faceted glass roof"
    ),
    gem(
      "grand-staircase.jpg",
      "the grand staircase, lined with royal statues on the climb"
    ),
    gem(
      "ramesses-colossus-hall.jpg",
      "the entrance hall around the colossus of Ramesses II"
    ),
    gem("columned-gallery.jpg", "a columned gallery lit from high windows"),
    gem("sphinx-gallery.jpg", "a sphinx displayed under gallery lighting"),
    gem(
      "plateau-view.jpg",
      "the view out towards the Giza plateau from inside the building"
    ),
  ],
};
