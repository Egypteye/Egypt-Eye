"use client";

import { useEffect, useRef } from "react";

/**
 * The home page's moving hero.
 *
 * WHY THE VIDEO HAS NO `autoplay` ATTRIBUTE
 *
 * Because a video element parks on its poster frame until something plays it,
 * and that gives this component a reduced-motion story that needs no second
 * element and no layout swap: the poster IS the fallback. A visitor who has
 * asked their operating system for less motion gets a still photograph of the
 * same frame, at the same size, in the same place. Nothing shifts, nothing
 * flashes, and there is no second copy of the hero to keep in step.
 *
 * `preload="none"` is the other half of it. The file is not fetched until this
 * effect decides it should be, so the people who will never see it — reduced
 * motion, Save-Data on — never pay for it either. On a phone in Cairo on a
 * metered connection that is the difference between a 120KB hero and a 1.2MB
 * one.
 *
 * WHY THIS IS A CLIENT COMPONENT AND THE REST OF THE PAGE IS NOT
 *
 * It is the only part that has to ask the browser a question. The markup is
 * server-rendered as it always was; this adds an effect that reads two media
 * queries and may call play(). It ships no state, no library and no event
 * handler beyond that.
 */
export function HeroVideo({
  poster,
  srcSmall,
  srcWebm,
  src,
  alt,
}: {
  poster: string;
  srcSmall: string;
  /** For browsers built without the proprietary H.264 decoder. */
  srcWebm: string;
  src: string;
  alt: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Save-Data is a request from the person's own browser not to spend their
    // allowance on decoration. A looping background video is decoration.
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    // Narrow viewport gets the smaller cut — but only when the screen cannot
    // actually resolve more than it holds.
    //
    // THE BYTES ARGUMENT WAS RIGHT AND THE PIXEL ARGUMENT WAS MISSING. The
    // 960px file was chosen because it "will be scaled down to a phone's
    // width anyway", which is true in CSS pixels and false in real ones: a
    // 390pt phone at devicePixelRatio 3 paints 1170 device pixels across, so
    // the 960px cut is being scaled UP by a fifth on the hardware where this
    // brand gets most of its traffic. That is the softness the owner saw on
    // their phone, and it is not a bitrate problem — it is the wrong file.
    //
    // So the choice is made in device pixels. A 1x or 2x phone still gets the
    // small file (720 and 780 device pixels, comfortably under 960); a 3x
    // phone gets the full 1440 master, which it can resolve. Save-Data and
    // reduced motion are both checked above, so nobody who asked to be spared
    // the bytes reaches this line at all.
    const narrowViewport = window.matchMedia("(max-width: 48rem)").matches;
    const devicePx = window.innerWidth * (window.devicePixelRatio || 1);
    const narrow = narrowViewport && devicePx <= 960;

    // ASK ABOUT THE CODEC THE FILE ACTUALLY IS.
    //
    // This line used to ask `canPlayType('video/mp4; codecs="avc1.42E01E"')`
    // — Baseline, level 3.0 — and then hand over a file that is neither.
    // hero.mp4 is High 4.0 (avc1.640028) and hero-small.mp4 is High 3.1
    // (avc1.64001f); the codec strings below were read out of each file's
    // avcC box, and check-flying-dresses re-reads them on every run so this
    // cannot drift away from the files again.
    //
    // The gap that opened mattered: a decoder that does Baseline 3.0 but not
    // High 4.0 — low-end Android hardware, or anything below level 4.0 — said
    // yes, was given a stream it could not decode, and had nowhere to go,
    // because .src is set directly rather than offered as <source> children
    // and there was no error handler. The video died with the poster up and no
    // way back. Asking the honest question is half the fix; the other half is
    // that a refusal now has somewhere to fall.
    const MASTER = { src, type: 'video/mp4; codecs="avc1.640028"' };
    const SMALL = { src: srcSmall, type: 'video/mp4; codecs="avc1.64001f"' };
    // H.264 is proprietary, so Chromium builds compiled without it — some
    // Linux distributions ship those, and so does the browser this project's
    // visual audit drives — refuse the MP4 outright. Those builds do have VP9.
    const WEBM = { src: srcWebm, type: 'video/webm; codecs="vp9"' };

    // A narrow screen that cannot resolve more than the small cut holds has
    // nothing to gain from the master. A wide or high-density one takes the
    // master, and keeps the small cut as a third try: its level is 3.1, so a
    // decoder that balked at 4.0 may well accept it.
    const wanted = narrow ? [SMALL, WEBM] : [MASTER, WEBM, SMALL];

    // Only ONE file is ever fetched unless one of them fails. canPlayType
    // costs nothing and removes the formats this browser has already said it
    // cannot play, so the queue holds real candidates only.
    const queue = wanted.filter((c) => el.canPlayType(c.type) !== "");

    // Nothing playable: the poster is the designed fallback, so leave it.
    if (queue.length === 0) return;

    let index = 0;
    let cancelled = false;

    const attempt = () => {
      if (cancelled || index >= queue.length) return;
      el.src = queue[index].src;
      el.load();
      // play() rejects on its own whenever a browser decides not to autoplay
      // (low power mode, a per-site setting, an OS policy). That is a refusal,
      // not a fault: the poster stays, which is the same thing reduced motion
      // gets. Swallowing it keeps a rejected promise out of the console.
      void el.play().catch(() => {});
    };

    // A decode or network failure on the chosen file moves to the next
    // candidate rather than ending as a still poster forever. When the last
    // one fails the poster is what is left, which is the intended floor.
    const onError = () => {
      index += 1;
      attempt();
    };

    el.addEventListener("error", onError);
    attempt();

    return () => {
      cancelled = true;
      el.removeEventListener("error", onError);
    };
  }, [src, srcSmall, srcWebm]);

  return (
    <video
      ref={ref}
      className="fd-hero-video"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      // Decoration: the headline beside it carries the meaning, and a screen
      // reader announcing a silent looping clip would only be noise. The alt
      // text of the poster lives on the <img> fallback below.
      aria-hidden="true"
      tabIndex={-1}
    >
      {/* No <source> children: the effect sets .src so nothing downloads until
          it has decided which file, or whether to download one at all.

          This <img> is a <video> element's fallback content, shown only by a
          browser that cannot play video at all. next/image cannot stand here:
          it renders a wrapper and a srcset that a video element does not treat
          as fallback content, and the optimizer would be fetching a file for a
          case that modern browsers never reach. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt={alt} width={1440} height={960} />
    </video>
  );
}
