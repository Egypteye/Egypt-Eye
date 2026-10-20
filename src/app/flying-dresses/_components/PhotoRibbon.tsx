import type { MarqueeFrame } from "../_lib/marquee";

/**
 * A row of photographs travelling sideways, forever.
 *
 * =========================================================================
 * CSS ONLY. NO STATE, NO TIMER, NO CLIENT COMPONENT.
 * =========================================================================
 * The obvious build for "an animated slider" is a client component with an
 * index, a setInterval and a transform. This is not that, and the reasons are
 * not stylistic:
 *
 *   - A timer-driven carousel has to hydrate before it moves. On the phone
 *     this is built for, that is the first thing below a 6.6MB hero video.
 *   - A carousel shows one frame at a time, which is the opposite of what was
 *     asked for: "variety of photos moving" is a wall, not a slideshow.
 *   - An interval that keeps running off-screen is a battery cost with
 *     nothing on the screen to show for it. A CSS animation on a
 *     `content-visibility: auto` section is throttled by the browser for
 *     free.
 *
 * So: one strip, translated from 0 to -50% forever, with the frames listed
 * TWICE inside it. At -50% the second copy sits exactly where the first
 * started, so the loop closes with no jump and no measurement.
 *
 * =========================================================================
 * THE DUPLICATE IS ARIA-HIDDEN, AND THAT IS THE WHOLE ACCESSIBILITY STORY
 * =========================================================================
 * A screen reader would otherwise announce twenty frames for ten
 * photographs. The second copy is `aria-hidden`, so the ribbon reads once.
 *
 * Nothing in here is focusable. These are photographs, not links: a moving
 * target you have to click is a usability problem, and the section has a real
 * link underneath it that does not move. That also means the marquee cannot
 * trap or drag a keyboard user, which a focusable carousel has to work hard
 * to avoid.
 *
 * It still pauses on hover and on focus-within, because a visitor who wants
 * to look at one frame should be able to, and because `focus-within` covers
 * somebody tabbing to the link below it.
 */
export function PhotoRibbon({
  frames,
  direction = "left",
  speedSeconds,
  label,
}: {
  frames: MarqueeFrame[];
  direction?: "left" | "right";
  /** Long enough to read as drift rather than scroll. Tuned per row. */
  speedSeconds: number;
  /** Named for a screen reader, since the group has no visible heading. */
  label: string;
}) {
  if (frames.length === 0) return null;

  return (
    <div className="fd-ribbon" role="group" aria-label={label}>
      <div
        className={`fd-ribbon-track${direction === "right" ? " fd-ribbon-reverse" : ""}`}
        style={{ ["--fd-ribbon-duration" as string]: `${speedSeconds}s` }}
      >
        {/* The real one. */}
        {frames.map((frame) => (
          <figure className="fd-ribbon-cell" key={frame.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frame.src} alt={frame.alt} loading="lazy" decoding="async" />
          </figure>
        ))}
        {/* The seam. Announced to nobody. */}
        {frames.map((frame) => (
          <figure className="fd-ribbon-cell" key={`${frame.src}-again`} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frame.src} alt="" loading="lazy" decoding="async" />
          </figure>
        ))}
      </div>
    </div>
  );
}
