import { Scene } from "./Scene";
import type { ImageSlot } from "../_lib/assets";

/**
 * A set of photographs, laid out, captioned and counted from one list.
 *
 * WHY THIS EXISTS
 *
 * Because every time a gallery was hand-built on this site it drifted, and the
 * drift was always invisible to every tool in the repository:
 *
 *   * The home page's grid lost its CSS in a rename and stacked six frames
 *     full-width down the page. Class names are strings; nothing type-checks
 *     them.
 *   * Its intro read "Two frames here are ours" on the day four were, because
 *     the sentence was typed and the pictures were not.
 *   * Only some figures had captions, so the rows did not share a baseline.
 *   * One cell carried `gridRow: span 2`, which stranded another in a row of
 *     its own.
 *
 * None of those is a crash. Every one of them renders a healthy-looking page
 * that is wrong, which is the failure mode this whole brand is prone to. So
 * the rules that keep a gallery honest live in here, where a page cannot forget
 * them, rather than in whoever edits the page next.
 *
 * THE RULES, AND THEY ARE NOT OPTIONAL
 *
 *   1. A frame with no photograph renders as a designed, labelled gap, never
 *      as a stock photograph. That is `Scene`'s job and it is the brief's one
 *      unbreakable rule about imagery.
 *   2. Attribution travels with the photograph. A caption cannot drift from
 *      its picture because it is not typed next to it.
 *   3. Counts are derived. `ours` and `total` come off the array, so a
 *      sentence about the gallery cannot disagree with the gallery.
 *   4. Every cell is the same shape, so the baselines line up whatever the mix
 *      of real photographs and gaps happens to be.
 *   5. Landscape by default, per the owner's standing instruction: most of the
 *      photography is landscape and portrait frames make the handover harder.
 */

export type GalleryLayout = "grid" | "feature" | "strip";

/**
 * How much of the viewport a cell occupies, per layout, so next/image ships
 * the right file rather than the largest one. Wrong `sizes` is not a visible
 * bug, it is a slow page, which is why it is set per layout here instead of
 * being left to each caller to guess.
 */
const SIZES: Record<GalleryLayout, string> = {
  grid: "(min-width: 60rem) 30vw, 92vw",
  feature: "(min-width: 60rem) 60vw, 92vw",
  strip: "(min-width: 60rem) 22vw, 70vw",
};

export function Gallery({
  frames,
  layout = "grid",
  ratio = "fd-ratio-landscape",
  className = "",
}: {
  /** Registry entries, never inline paths. See _lib/assets.ts. */
  frames: ImageSlot[];
  layout?: GalleryLayout;
  /** Overridable for the rare frame that genuinely needs portrait. */
  ratio?: string;
  className?: string;
}) {
  return (
    <div className={`fd-gallery fd-gallery-${layout} fd-reveal-group ${className}`.trim()}>
      {frames.map((frame, index) => (
        <figure key={`${frame.src ?? "gap"}-${index}`}>
          <Scene
            src={frame.src}
            alt={frame.alt}
            width={frame.width}
            height={frame.height}
            ratio={ratio}
            tone="neutral"
            sizes={SIZES[layout]}
            label={frame.wanted}
            // The slow scroll-linked scale reads as life in a photograph and as
            // a wobble on an empty box, so gaps do not get it.
            drift={frame.kind !== "empty"}
          />
          <figcaption className="fd-caption">
            {frame.credit ?? (frame.kind === "empty" ? "Photograph to come" : "")}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * How many of these are the agency's own work, and how many frames there are.
 *
 * Exported beside the component because the sentence introducing a gallery is
 * where the drift showed up last time: the copy claimed two when four were
 * shown. Anything describing a gallery counts it with this.
 */
export function galleryTally(frames: ImageSlot[]): { ours: number; total: number } {
  return {
    ours: frames.filter((frame) => frame.kind !== "empty").length,
    total: frames.length,
  };
}
