"use client";

import Image from "next/image";
import { Lightbox, useLightbox, type LightboxFrame } from "./Lightbox";

/**
 * The proposal gallery.
 *
 * =========================================================================
 * WHAT IS IN IT, AND THE SENTENCE THAT MAKES IT HONEST
 * =========================================================================
 * There are NO photographs of a proposal we have run. Not one. The repository
 * holds real, credited agency work from this rooftop — couples, a vow
 * renewal, a gender reveal with a lit sign and a balloon arch, groups, the
 * plateau — and none of it is somebody being proposed to.
 *
 * The temptation is obvious and this component refuses it: the Alessandra
 * couple frames look exactly like proposal photography, and captioning them
 * as a proposal would be fabricating client work. The brief's own rule, and
 * the brand's. So every frame says what it actually is, in the caption, in
 * the lightbox, and in the alt text.
 *
 * What the gallery can honestly prove is worth more than most sites manage
 * anyway, because all of it is first-party:
 *
 *   - This is the roof. This is the view from it. That is the real skyline.
 *   - This is the light at the start of the day and at the end of it.
 *   - This is what couple portraits from this team look like.
 *   - This team builds decorated setups on this roof: the gender reveal has
 *     a lit sign, an arch and evening lighting in frame.
 *
 * A visitor can reason from that to what their proposal will look like, which
 * is the actual job. What they cannot do is be misled about what they are
 * looking at.
 *
 * =========================================================================
 * THE LAYOUT
 * =========================================================================
 * Editorial rather than a uniform grid: a lead frame at full width, then
 * pairs. A six-up grid of identical tiles is what the rest of this site
 * already does and the one thing this page was asked not to be.
 *
 * `priority` on the first frame only. It is the one above the fold; marking
 * more than one priority is how a page ends up preloading its whole gallery
 * and arriving slower than it did before.
 */

export type ProposalFrame = LightboxFrame & {
  /** "lead" spans the row. "pair" sits two up above 48rem. */
  span: "lead" | "pair";
};

export function ProposalGallery({
  frames,
  heading,
  intro,
}: {
  frames: ProposalFrame[];
  heading: string;
  intro: string;
}) {
  const lightbox = useLightbox();
  if (frames.length === 0) return null;

  return (
    <section className="fd-section-tight" id="gallery">
      <div className="fd-shell">
        <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
          <h2 className="fd-display fd-h3">{heading}</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            {intro}
          </p>
        </div>

        <ul className="fd-pgallery">
          {frames.map((frame, i) => (
            <li key={frame.src} className={`fd-pgallery-cell fd-pgallery-${frame.span}`}>
              <button
                type="button"
                className="fd-pgallery-btn"
                onClick={() => lightbox.open(i)}
                // The caption is visible beneath, so the button's own label
                // names the ACTION rather than repeating it. A screen reader
                // otherwise hears the description twice in a row.
                aria-label={`Open photograph ${i + 1} of ${frames.length}: ${frame.alt}`}
              >
                <Image
                  src={frame.src}
                  alt={frame.alt}
                  width={frame.width ?? 1600}
                  height={frame.height ?? 1067}
                  className="fd-pgallery-img"
                  sizes={
                    frame.span === "lead"
                      ? "(min-width: 60rem) 72rem, 94vw"
                      : "(min-width: 48rem) 36rem, 94vw"
                  }
                  priority={i === 0}
                />
              </button>
              {frame.caption ? <p className="fd-pgallery-cap">{frame.caption}</p> : null}
            </li>
          ))}
        </ul>
      </div>

      <Lightbox
        frames={frames}
        index={lightbox.index}
        onClose={lightbox.close}
        onIndexChange={lightbox.move}
      />
    </section>
  );
}
