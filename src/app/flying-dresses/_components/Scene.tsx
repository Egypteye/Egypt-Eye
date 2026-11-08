import type { CSSProperties } from "react";

import Image from "next/image";

/**
 * A photograph, or an honest, designed absence of one.
 *
 * THE RULE THIS COMPONENT EXISTS TO ENFORCE: a slot with no real photograph in
 * it must not look like a photograph. The brief is explicit — temporary
 * imagery must never become indistinguishable from the agency's own customer
 * work — and the easy way to fail that is to drop a stock desert photo into
 * every empty slot and ship. A visitor cannot tell, a reviewer cannot tell,
 * and six months later nobody remembers which frames were real.
 *
 * So `src: null` renders a tinted, bordered field with the intended subject
 * written across it and the words "photograph to come". It is composed, it
 * carries the location's own tone so the page still reads as designed, and it
 * is unmistakably not a photograph. Every one of them is listed in
 * docs/FLYING-DRESSES-ASSET-CHECKLIST.md.
 *
 * Real images go through next/image, which is what gets responsive srcsets,
 * AVIF/WebP negotiation and lazy loading below the fold. `width`/`height` are
 * required rather than optional: they are what reserves the box before the
 * bytes arrive, and an unreserved image is a CLS failure the moment the
 * network is slow.
 */

export type SceneTone = "dunes" | "rooftop" | "fayoum" | "neutral";

export function Scene({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  tone = "neutral",
  ratio = "fd-ratio-landscape",
  fit = "cover",
  focus,
  label,
  credit,
  className = "",
  drift = false,
}: {
  /** null means no photograph exists yet. */
  src: string | null;
  /** Describes the photograph for someone who cannot see it. Never the filename. */
  alt: string;
  width?: number;
  height?: number;
  /** What proportion of the viewport this occupies, per breakpoint. */
  sizes?: string;
  /** True for the one image above the fold. Never for more than one per page. */
  priority?: boolean;
  tone?: SceneTone;
  /**
   * The shape of the box the photograph sits in.
   *
   * One of the `fd-ratio-*` classes, or the string "auto".
   *
   * "auto" IS THE ONE THAT DOES NOT CROP. It sets the box to the
   * photograph's own width/height, so `object-fit: cover` has nothing to
   * cut off: the frame is exactly the shape of the file inside it. Use it
   * wherever the whole photograph matters more than the cells lining up.
   *
   * A fixed class is still right where the layout depends on every cell
   * being the same shape (the feature gallery's spanning cell, a horizontal
   * strip). There, pick the class nearest the photography and set `focus`.
   *
   * "auto" needs `width` and `height`; without them there is nothing to
   * compute and it falls back to landscape.
   */
  ratio?: string;
  /**
   * How the photograph fills its box when the two shapes disagree.
   *
   * "cover" fills the box and crops the overflow. "contain" fits the whole
   * photograph inside and lets the brand's sand tone show around it.
   *
   * With `ratio="auto"` the two are identical, because there is no overflow.
   * This matters only for a fixed ratio, and there the honest default is
   * still "cover": a letterboxed portrait in a 3:2 card looks like a
   * mistake, while a 4:5 card with a focal point looks composed.
   */
  fit?: "cover" | "contain";
  /**
   * Which part of the photograph survives when `fit` is "cover".
   *
   * A CSS object-position: "50% 30%" keeps the upper third. The default
   * centres, which is what cut the heads off portrait frames in a 3:2 box
   * and is exactly what this prop exists to let a caller fix.
   */
  focus?: string;
  /** Shown on an empty slot. Falls back to the alt text, which describes the
      intended photograph and is exactly what belongs there. */
  label?: string;
  /**
   * Who made it, shown under the frame.
   *
   * Added for kind:"styled" — a frame whose product is really ours and really
   * photographed, with a generated model and setting around it. assets.ts
   * requires such a slot to carry a credit saying which part is generated, and
   * a credit nothing renders is a note to ourselves rather than to the
   * customer looking at the picture. So the component shows it.
   */
  credit?: string;
  className?: string;
  /** Adds the slow scroll-linked scale. Off by default. */
  drift?: boolean;
}) {
  // "auto" means: the box takes the photograph's own proportions, so nothing
  // is cropped. It needs real pixel dimensions; without them there is nothing
  // to compute, and landscape is the brand's standing default.
  const natural = ratio === "auto" && typeof width === "number" && typeof height === "number";
  const ratioClass = ratio === "auto" ? (natural ? "fd-ratio-auto" : "fd-ratio-landscape") : ratio;

  const frame = `fd-figure ${ratioClass} ${drift ? "fd-drift" : ""} ${className}`.trim();

  // Passed as custom properties rather than as inline styles on the <img>,
  // because next/image owns that element's style attribute and the CSS has
  // to be able to override per breakpoint.
  const frameStyle: CSSProperties & Record<string, string | number> = {};
  if (natural) frameStyle["--fd-ar"] = `${width} / ${height}`;
  if (fit !== "cover") frameStyle["--fd-fit"] = fit;
  if (focus) frameStyle["--fd-focus"] = focus;

  if (!src) {
    return (
      <div className={frame} style={frameStyle}>
        <div className={`fd-slot fd-slot-tone-${tone}`} style={{ height: "100%" }}>
          <div>
            <p className="fd-slot-label">{label ?? alt}</p>
            <p className="fd-slot-note">Photograph to come</p>
          </div>
        </div>
      </div>
    );
  }

  const picture = (
    <div className={frame} style={frameStyle}>
      <Image
        src={src}
        alt={alt}
        width={width ?? 1600}
        height={height ?? 1067}
        sizes={sizes ?? "100vw"}
        priority={priority}
        // Anything not above the fold is lazy by default in next/image; said
        // explicitly here so the one priority image is visibly the exception.
        loading={priority ? undefined : "lazy"}
      />
    </div>
  );

  if (!credit) return picture;

  return (
    <figure style={{ margin: 0 }}>
      {picture}
      <figcaption className="fd-scene-credit">{credit}</figcaption>
    </figure>
  );
}
