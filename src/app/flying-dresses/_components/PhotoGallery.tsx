"use client";

import Image from "next/image";
import { Lightbox, useLightbox, type LightboxFrame } from "./Lightbox";

/**
 * The editorial photograph gallery, shared by the pages that argue with
 * pictures rather than with a grid of tiles.
 *
 * =========================================================================
 * THE RULE IT EXISTS TO ENFORCE
 * =========================================================================
 * Every frame carries a caption saying WHAT IT ACTUALLY IS, and the caller
 * supplies an `intro` that says so in the section's own words. That is not
 * decoration. Both pages using this component sell an occasion they have
 * photographed less often than they would like:
 *
 *   - The proposal page has NO photograph of a proposal. Not one. What it has
 *     is real, credited agency work from the same roof: couples, a vow
 *     renewal, a gender reveal, groups. The Alessandra couple frames look
 *     exactly like proposal photography, and captioning them as a proposal
 *     would be fabricating client work.
 *   - The gender reveal page has EXACTLY ONE, and it is genuinely a gender
 *     reveal this team ran. The temptation there is the opposite one: four
 *     supporting frames from other occasions, uncaptioned, read as a reveal
 *     portfolio four times the size of the real one.
 *
 * So the discipline is the same in both directions. The caption says what the
 * frame is, the credit travels with it, and the intro tells the visitor how
 * many of them are the thing they came to look at.
 *
 * What a gallery like this can honestly prove is worth more than most sites
 * manage anyway, because all of it is first-party: this is the roof, this is
 * the view, this is the real skyline, this is the light at either end of the
 * day, and this team builds decorated setups up here.
 *
 * =========================================================================
 * THE LAYOUT
 * =========================================================================
 * Editorial rather than a uniform grid: a lead frame at full width, then
 * pairs. A six-up grid of identical tiles is what the rest of this site
 * already does and the one thing these pages were asked not to be.
 *
 * `priority` on the first frame only. It is the one above the fold; marking
 * more than one priority is how a page ends up preloading its whole gallery
 * and arriving slower than it did before.
 */
export type GalleryFrame = LightboxFrame & {
  /** "lead" spans the row. "pair" sits two up above 48rem. */
  span: "lead" | "pair";
};

export function PhotoGallery({
  frames,
  heading,
  intro,
}: {
  frames: GalleryFrame[];
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
