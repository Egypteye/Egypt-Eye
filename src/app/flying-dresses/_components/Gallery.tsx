import { visibleCredit } from "../_lib/assets";
import { Scene } from "./Scene";
import type { FlyingDressFrame } from "@/content/types";

/**
 * Frames are typed as FlyingDressFrame rather than the registry's ImageSlot
 * because a Studio frame may not know its pixel size, while a repo one always
 * does. An ImageSlot is assignable to this, so both sources arrive here as the
 * same thing and the component needs no idea which it is holding. CSS reserves
 * the box through the aspect-ratio class either way; width and height only
 * sharpen what next/image ships.
 */

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
 *   4. Every cell is the same WIDTH, so the grid stays a grid. Heights follow
 *      each photograph (see 5), and the labelled gaps take the layout's
 *      default shape since they have no photograph to take one from.
 *   5. EVERY FRAME RENDERS AT ITS OWN SHAPE. This reverses the rule that
 *      stood here before ("landscape by default"), and it is reversed on the
 *      owner's instruction of 8 November 2026: photographs were being cropped
 *      so that heads and dress trains were cut off.
 *
 *      The cropping was not a bad crop. It was a 3:2 box: the shoot folders
 *      are mostly 1050x1400 portrait, and a portrait file in a landscape box
 *      loses a third of its height to `object-fit: cover` no matter what the
 *      crop is. So the box takes the file's shape instead, and then there is
 *      nothing to cut off. Rows go ragged at the bottom, which is what a
 *      mixed-orientation gallery is supposed to look like.
 *
 *      Rule 4 above is what gives way: the cells are no longer the same
 *      shape. The two rules were always in tension and the owner has said
 *      which way it goes.
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

/**
 * The default shape of a cell, per layout.
 *
 * "auto" means the frame takes the photograph's own proportions and nothing
 * is cropped. That is right for `grid`, which is what every gallery on the
 * site uses and where the mixed portrait/landscape shoot folders live.
 *
 * `feature` and `strip` keep a fixed shape, and not out of caution: their
 * layouts are built on cells being identical. The feature gallery's first
 * cell spans two rows and two columns, which only resolves if the rows are
 * a known height; the strip is a single row of equal-width cells where
 * ragged heights read as a mistake rather than as a gallery. If either ever
 * needs to stop cropping, the fix is `focus` on the frame, not "auto" here.
 */
const DEFAULT_RATIO: Record<GalleryLayout, string> = {
  grid: "auto",
  feature: "fd-ratio-landscape",
  strip: "fd-ratio-portrait",
};

export function Gallery({
  frames,
  layout = "grid",
  ratio,
  className = "",
}: {
  /** Registry entries, never inline paths. See _lib/assets.ts. */
  frames: FlyingDressFrame[];
  layout?: GalleryLayout;
  /**
   * Forces one shape on every cell, overriding the layout's default.
   *
   * Left unset, a `grid` renders each photograph at its own proportions and
   * crops nothing. Pass a `fd-ratio-*` class only when the section genuinely
   * needs uniform cells, and expect to pass `focus` on the frames too.
   */
  ratio?: string;
  className?: string;
}) {
  const cellRatio = ratio ?? DEFAULT_RATIO[layout];
  return (
    <div className={`fd-gallery fd-gallery-${layout} fd-reveal-group ${className}`.trim()}>
      {frames.map((frame, index) => (
        <figure key={`${frame.src ?? "gap"}-${index}`}>
          <Scene
            src={frame.src}
            alt={frame.alt}
            width={frame.width}
            height={frame.height}
            ratio={cellRatio}
            focus={frame.focus}
            tone="neutral"
            sizes={SIZES[layout]}
            label={frame.wanted}
            // The slow scroll-linked scale reads as life in a photograph and as
            // a wobble on an empty box, so gaps do not get it.
            drift={frame.kind !== "empty"}
          />
          <figcaption className="fd-caption">
            {visibleCredit(frame) ?? (frame.kind === "empty" ? "Photograph to come" : "")}
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
export function galleryTally(frames: FlyingDressFrame[]): { ours: number; total: number } {
  return {
    ours: frames.filter((frame) => frame.kind !== "empty").length,
    total: frames.length,
  };
}
