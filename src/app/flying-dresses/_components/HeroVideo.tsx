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

    // Narrow viewport gets the 1024px cut: a quarter of the bytes for a file
    // that will be scaled down to a phone's width anyway.
    const narrow = window.matchMedia("(max-width: 48rem)").matches;

    // H.264 is not universal. It is proprietary, so Chromium builds compiled
    // without it — some Linux distributions ship those, and so does the
    // browser this project's visual audit drives — refuse the MP4 outright and
    // abort the request. Those browsers do have VP9. Asking canPlayType costs
    // nothing and means the fallback is a second format rather than no video.
    //
    // Only ONE file is ever fetched: this picks the source, it does not offer
    // both. A browser with H.264 never sees the WebM.
    const playsMp4 = el.canPlayType('video/mp4; codecs="avc1.42E01E"') !== "";
    el.src = playsMp4 ? (narrow ? srcSmall : src) : srcWebm;
    el.load();

    // play() rejects on its own whenever a browser decides not to autoplay
    // (low power mode, a per-site setting, an OS policy). That is a refusal,
    // not a fault: the poster stays, which is the same thing reduced motion
    // gets. Swallowing it keeps a rejected promise out of the console.
    void el.play().catch(() => {});
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
      <img src={poster} alt={alt} width={1600} height={900} />
    </video>
  );
}
