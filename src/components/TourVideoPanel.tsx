"use client";

import { useRef, useState } from "react";
import { useTr } from "@/i18n/LocaleProvider";
import type { TourVideo } from "@/content/types";

/**
 * The short vertical video on a tour page.
 *
 * =========================================================================
 * WHY IT DOES NOT AUTOPLAY, UNLIKE THE FLYING DRESSES HERO
 * =========================================================================
 * That one is a silent moving backdrop and autoplays on purpose. This one is
 * a person talking to camera about the tour. Starting speech by itself is
 * hostile on a phone in public, and it competes with a page the visitor came
 * to read. So it waits to be pressed, which also means there is no
 * reduced-motion branch to get wrong: nothing moves until someone asks.
 *
 * =========================================================================
 * NOTHING IS DOWNLOADED UNTIL IT IS PRESSED
 * =========================================================================
 * `preload="none"` plus a real poster frame. Before the press the page pays
 * for a ~45KB JPEG instead of a ~1.5MB MP4, which matters because this sits
 * on four of the best-selling tour pages and most visitors will never play
 * it. It is also what makes rendering the panel twice — once for each
 * breakpoint — cost nothing but markup.
 *
 * The MP4s are encoded with `-movflags +faststart`, so the one person who
 * does press play starts watching before the file has finished arriving.
 *
 * =========================================================================
 * WHAT THIS DOES NOT DO, AND SHOULD LATER
 * =========================================================================
 * There are no captions. These videos are speech, and speech without a text
 * alternative is inaccessible to deaf and hard-of-hearing visitors — WCAG
 * 1.2.2. It is mitigated rather than solved: everything the presenter says is
 * also written on the page around it, in the description, the highlights and
 * the itinerary, so nothing is available ONLY in the video. That is the
 * reason it was acceptable to ship, not a reason it is finished. A WebVTT
 * track per video is the fix, and it needs a transcript somebody has actually
 * checked.
 */
export function TourVideoPanel({
  video,
  title,
  className = "",
}: {
  video: TourVideo;
  title: string;
  className?: string;
}) {
  const tr = useTr();
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function start() {
    const el = ref.current;
    if (!el) return;
    setStarted(true);
    void el.play().catch(() => {
      // Autoplay policies can still refuse even after a click in some
      // embedded webviews. The controls are visible by then, so the person
      // can press the browser's own play button; nothing is left broken.
    });
  }

  const seconds = Math.round(video.durationSeconds);

  return (
    <figure className={`overflow-hidden rounded-2xl border border-black/5 bg-ink shadow-sm ${className}`}>
      <div className="relative aspect-[9/16] w-full">
        <video
          ref={ref}
          // poster + preload="none" is the whole performance story: this
          // element fetches nothing until start() runs.
          poster={video.poster}
          preload="none"
          controls={started}
          playsInline
          className="h-full w-full bg-ink object-cover"
          aria-label={video.alt}
        >
          {/* WebM first: a browser that understands both will take it, and a
              Chromium built without the proprietary H.264 decoder has
              nothing else it can play. The browser picks the first source it
              can decode, so ordering is the whole mechanism. */}
          <source src={video.srcWebm} type="video/webm" />
          <source src={video.src} type="video/mp4" />
        </video>

        {!started && (
          <button
            type="button"
            onClick={start}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/25 transition hover:bg-ink/35 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-gold"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/95 shadow-lg transition group-hover:scale-105">
              <svg viewBox="0 0 24 24" aria-hidden className="ml-1 h-7 w-7 fill-ink">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-cream backdrop-blur-sm">
              {tr("Watch · {n}s").replace("{n}", String(seconds))}
            </span>
            {/* The accessible name of the control, kept out of the visual
                design so the label above can stay short. */}
            <span className="sr-only">
              {tr("Play the video about {tour}").replace("{tour}", title)}
            </span>
          </button>
        )}
      </div>

      <figcaption className="px-4 py-3 text-xs leading-relaxed text-cream/70">
        {tr("A short introduction to this tour. Everything described here is also written on this page.")}
      </figcaption>
    </figure>
  );
}
