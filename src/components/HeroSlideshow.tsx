"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SanityImage as SanityImageType } from "@/content/types";
import { SmartImage } from "./SmartImage";
import type { ImageTone } from "@/content/types";

type Slide = {
  image?: SanityImageType;
  tone: ImageTone;
  headline?: string;
  subtext?: string;
  linkLabel?: string;
  linkHref?: string;
};

const SLIDE_DURATION_MS = 6000;

// Full hero: background photo, gradient, and the per-slide headline/CTA all
// change together every 6 seconds. All slide images are mounted at once,
// stacked and cross-faded via opacity — swapping the visible one never
// triggers a fresh network fetch (which is what caused the old "freeze": a
// remounted, non-preloaded image has nothing to paint until it downloads).
// Each image keeps its own slow, continuous, independent Ken Burns drift, so
// there's no animation to restart/resync when a slide becomes active again.
// Slides are editable in the Studio under Site Settings > Homepage hero slides.
export function HeroSlideshow({
  slides: rawSlides,
  eyebrow,
}: {
  slides: readonly Slide[];
  eyebrow?: string;
}) {
  const [index, setIndex] = useState(0);
  // Bumped on every manual (arrow/dot) navigation so the auto-advance timer
  // below restarts from zero instead of firing early right after a manual
  // change.
  const [tick, setTick] = useState(0);
  const slides = rawSlides.length > 0 ? rawSlides : [{ tone: "giza" as ImageTone }];

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [slides.length, tick]);

  function goTo(i: number) {
    setIndex(((i % slides.length) + slides.length) % slides.length);
    setTick((t) => t + 1);
  }

  const active = slides[index];

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {slides.map((slide, i) => (
        <SmartImage
          key={i}
          image={slide.image}
          tone={slide.tone}
          className={`absolute inset-0 animate-[kenburns-drift_26000ms_ease-in-out_infinite_alternate] transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          priority
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-5 pb-56 pt-24 text-center sm:gap-6 sm:px-8 sm:pb-28 sm:pt-40">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
          {eyebrow && (
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
              {eyebrow}
            </p>
          )}
          {active.headline && (
            <h1
              key={`h-${index}`}
              className="animate-fade-up mt-4 text-balance font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-6xl"
            >
              {active.headline}
            </h1>
          )}
          {active.subtext && (
            <p key={`s-${index}`} className="animate-fade-up mt-4 max-w-xl text-lg text-cream/80">
              {active.subtext}
            </p>
          )}
          <div key={`b-${index}`} className="animate-fade-up mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/customize"
              className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              Design Your Dream Tour
            </Link>
            {active.linkHref && active.linkLabel && (
              <Link
                href={active.linkHref}
                className="rounded-full border border-cream/30 bg-cream/10 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition hover:bg-cream/20"
              >
                {active.linkLabel}
              </Link>
            )}
          </div>

          {/* Prev/next + dots all sit together in the normal content flow,
              below the CTAs — never floating mid-headline (which is what
              happened when the arrows were vertically centered on the whole
              section) and never pinned to the very bottom (which is what
              hid the dots behind the search bar card on mobile, since that
              card straddles the hero/content boundary and grows tall
              enough on small screens to cover anything fixed down there). */}
          {slides.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => goTo(index - 1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition hover:bg-cream/30"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show ${slide.headline ?? `slide ${i + 1}`}`}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-gold" : "w-1.5 bg-cream/40 hover:bg-cream/70"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goTo(index + 1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition hover:bg-cream/30"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
