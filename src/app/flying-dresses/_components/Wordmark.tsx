import { brand } from "@/content/flyingDresses";

/**
 * THE WORDMARK — set in live text, not an image.
 *
 * It follows the design of the mark the owner supplied: letterspaced serif
 * capitals with a flowing script "Egypt" overlapping beneath them, in the
 * logo's red-brown and dusty rose.
 *
 * WHY IT IS TEXT AND NOT THE SUPPLIED FILE
 *
 * The supplied artwork reads "FLYING DRESS" — singular. The agency is
 * "Flying Dresses Egypt", confirmed by the owner, and it is the name used by
 * the domain, the brochure and every page of this site. A header that says
 * one thing while the page says another is the kind of inconsistency a
 * visitor reads as carelessness, so the wordmark carries the correct name.
 *
 * Setting it in text rather than waiting for corrected artwork turns out to
 * be better than a file anyway:
 *
 *   - it is sharp at any size and on any display, with no 2x export
 *   - it costs no image request, so it cannot delay or shift the header
 *   - it recolours for the light and dark versions from one source
 *   - it is selectable, translatable, and readable by a screen reader
 *   - correcting the name was a one-word change rather than a re-export
 *
 * The typefaces are the two already loaded for the brand — Bodoni Moda for
 * the capitals and Italianno for the script — so this adds no font payload.
 * Both are close in character to the supplied mark: a high-contrast didone
 * and a formal English roundhand.
 *
 * IF CORRECTED ARTWORK ARRIVES, IT WINS. _lib/logo.ts checks for the file and
 * the header and footer prefer it over this component, so dropping a corrected
 * export into public/brand/ replaces this with no code change.
 *
 * ACCESSIBILITY: the two words are one accessible string. The script "Egypt"
 * is aria-hidden and the full name is supplied by the parent link's
 * aria-label, so a screen reader announces "Flying Dresses Egypt — home" once
 * rather than reading a decorative flourish as a separate word.
 */
export function Wordmark({
  /** "light" inverts it for the ink footer. */
  tone = "dark",
  /**
   * "stacked" is the signature lockup: the script written across the capitals.
   * It needs room to be read as one mark rather than two collided words, and
   * in a 64px header bar it does not have any — the owner's note was that it
   * "looks ugly", and at that size it does.
   *
   * "inline" sets the same two words side by side on a shared baseline. It is
   * the same mark, laid out for a horizontal bar, which is what the header is.
   */
  layout = "stacked",
  className = "",
}: {
  tone?: "dark" | "light";
  layout?: "stacked" | "inline";
  className?: string;
}) {
  return (
    <span
      className={`fd-mark fd-mark-${tone} fd-mark-${layout} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="fd-mark-script">Egypt</span>
      <span className="fd-mark-name">
        {/* Spaced as individual words so the tracking is even and the line can
            wrap between them on a very narrow phone rather than overflowing. */}
        <span>Flying</span> <span>Dresses</span>
      </span>
      <span className="fd-sr">{brand.name}</span>
    </span>
  );
}
