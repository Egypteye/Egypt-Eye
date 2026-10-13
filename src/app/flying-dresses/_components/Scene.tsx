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
  label,
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
  ratio?: string;
  /** Shown on an empty slot. Falls back to the alt text, which describes the
      intended photograph and is exactly what belongs there. */
  label?: string;
  className?: string;
  /** Adds the slow scroll-linked scale. Off by default. */
  drift?: boolean;
}) {
  const frame = `fd-figure ${ratio} ${drift ? "fd-drift" : ""} ${className}`.trim();

  if (!src) {
    return (
      <div className={frame}>
        <div className={`fd-slot fd-slot-tone-${tone}`} style={{ height: "100%" }}>
          <div>
            <p className="fd-slot-label">{label ?? alt}</p>
            <p className="fd-slot-note">Photograph to come</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={frame}>
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
}
