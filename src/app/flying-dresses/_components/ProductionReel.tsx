"use client";

import { useEffect, useRef } from "react";

/**
 * The vertical production clips, filmed on the rooftop.
 *
 * WHY THIS IS NOT HeroVideo WITH A LOOP AROUND IT
 *
 * HeroVideo decides once, for one file, above the fold, and the decision it
 * makes is "which cut of the same clip suits this screen". This renders FOUR
 * DIFFERENT CLIPS, none of which is above the fold, and the question that
 * matters is a different one: which of them should be fetched at all.
 *
 * Four clips at roughly 1.2 to 1.5MB each is six megabytes if they all load,
 * and on the connection most of this brand's visitors are on that is not a
 * decoration budget. So nothing is fetched until the tile is actually near the
 * viewport, and a visitor who never scrolls this far pays nothing for any of
 * them. `preload="none"` plus an IntersectionObserver is the whole mechanism.
 *
 * WHAT IS KEPT FROM HeroVideo, BECAUSE IT WAS LEARNED THE HARD WAY
 *
 *  - No `autoplay` attribute. The poster IS the reduced-motion fallback, at
 *    the same size in the same place, so nothing shifts and there is no second
 *    element to keep in step.
 *  - Save-Data is honoured. A looping silent clip is decoration, and a person
 *    whose browser asked us not to spend their allowance on decoration gets
 *    the still.
 *  - canPlayType is asked about the codec THE FILE ACTUALLY IS. Every clip
 *    here is avc1.640028 (High, level 4.0), read out of its own avcC box, and
 *    scripts/check-flying-dresses.mts re-reads them on every run so this
 *    string cannot drift away from the files again. A decoder that refuses it
 *    falls to the VP9 WebM rather than sitting on a dead poster forever.
 *
 * THE CLIPS ARE SILENT ON PURPOSE AND IT IS NOT ONLY ABOUT AUTOPLAY. They were
 * filmed at a live DJ set, so their original audio is someone else's recorded
 * music. The audio track is not muted here, it is absent from the files.
 */

export type ReelClip = {
  /** Stem under /brand/flying-dresses/creators, without an extension. */
  id: string;
  mp4: string;
  webm: string;
  poster: string;
  width: number;
  height: number;
  /** What a reader who cannot see it is missing. */
  alt: string;
  /** Printed under the clip. Says what the footage actually is. */
  caption: string;
};

function Clip({ clip }: { clip: ReelClip }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const MP4 = { src: clip.mp4, type: 'video/mp4; codecs="avc1.640028"' };
    // H.264 is proprietary and some Chromium builds ship without it, including
    // the one this project's visual audit drives. Those builds do have VP9.
    const WEBM = { src: clip.webm, type: 'video/webm; codecs="vp9"' };

    const queue = [MP4, WEBM].filter((c) => el.canPlayType(c.type) !== "");
    // Nothing playable: the poster is the designed floor, so leave it there.
    if (queue.length === 0) return;

    let index = 0;
    let cancelled = false;
    let started = false;

    const attempt = () => {
      if (cancelled || index >= queue.length) return;
      el.src = queue[index].src;
      el.load();
      // A browser may refuse to autoplay for its own reasons (low power mode,
      // a per-site setting). That is a refusal rather than a fault: the poster
      // stays, which is what reduced motion gets too.
      void el.play().catch(() => {});
    };

    const onError = () => {
      index += 1;
      attempt();
    };
    el.addEventListener("error", onError);

    // THE BYTES ARE SPENT HERE AND NOWHERE EARLIER.
    //
    // rootMargin starts the fetch a little before the tile arrives so the
    // first frame is moving by the time it is read, without fetching four
    // files for a visitor who stops at the price.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!started) {
              started = true;
              attempt();
            } else {
              void el.play().catch(() => {});
            }
          } else if (started) {
            // Off screen is not worth a decode. Pausing also stops four clips
            // competing for the same decoder on a phone.
            el.pause();
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      el.removeEventListener("error", onError);
    };
  }, [clip.mp4, clip.webm]);

  return (
    <figure className="fd-reel-item">
      <video
        ref={ref}
        className="fd-reel-video"
        poster={clip.poster}
        width={clip.width}
        height={clip.height}
        muted
        loop
        playsInline
        preload="none"
        // Decoration beside a caption that carries the meaning. A screen
        // reader announcing a silent looping clip would be noise; the caption
        // below and the poster's alt text say what it is.
        aria-hidden="true"
        tabIndex={-1}
      >
        {/* No <source> children: the effect sets .src, so nothing downloads
            until it has decided which file and whether to download one at all.
            This <img> is video fallback content, reached only by a browser
            that cannot play video; next/image cannot stand here because its
            wrapper is not treated as fallback content. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={clip.poster} alt={clip.alt} width={clip.width} height={clip.height} />
      </video>
      <figcaption className="fd-reel-caption">{clip.caption}</figcaption>
    </figure>
  );
}

export function ProductionReel({
  clips,
  heading,
  intro,
}: {
  clips: readonly ReelClip[];
  heading: string;
  intro: string;
}) {
  if (clips.length === 0) return null;

  return (
    <section className="fd-section-tight" id="footage">
      <div className="fd-shell">
        <div style={{ maxWidth: "46rem", marginBottom: "2.5rem" }}>
          <p className="fd-eyebrow">Filmed on this roof</p>
          <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
            {heading}
          </h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            {intro}
          </p>
        </div>
        <div className="fd-reel">
          {clips.map((clip) => (
            <Clip key={clip.id} clip={clip} />
          ))}
        </div>
      </div>
    </section>
  );
}
