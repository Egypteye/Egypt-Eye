"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Image as SanityImageType } from "sanity";
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
// change together every 6 seconds. Only the active slide's image is ever
// mounted (not all of them stacked with opacity toggled), and it's re-keyed
// by `index` so React gives it a fresh DOM node on every change — the old
// version reused the same nodes and toggled classes, which is what made the
// Ken Burns zoom freeze/stutter instead of restarting cleanly each time.
// Slides are editable in the Studio under Site Settings > Homepage hero slides.
export function HeroSlideshow({
  slides: rawSlides,
  eyebrow,
}: {
  slides: readonly Slide[];
  eyebrow?: string;
}) {
  const [index, setIndex] = useState(0);
  const slides = rawSlides.length > 0 ? rawSlides : [{ tone: "giza" as ImageTone }];

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  const active = slides[index];

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <SmartImage
        key={index}
        image={active.image}
        tone={active.tone}
        className="absolute inset-0 animate-[kenburns_6500ms_ease-out_forwards]"
        priority={index === 0}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />

      <div className="relative flex h-full flex-col justify-center gap-6 px-5 pb-28 pt-40 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          {eyebrow && (
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
              {eyebrow}
            </p>
          )}
          {active.headline && (
            <h1
              key={`h-${index}`}
              className="animate-fade-up mt-4 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-6xl"
            >
              {active.headline}
            </h1>
          )}
          {active.subtext && (
            <p key={`s-${index}`} className="animate-fade-up mt-4 max-w-xl text-lg text-cream/80">
              {active.subtext}
            </p>
          )}
          <div key={`b-${index}`} className="animate-fade-up mt-6 flex flex-wrap gap-4">
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
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-28 left-0 right-0 z-10 flex justify-center gap-2 sm:bottom-32">
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show ${slide.headline ?? `slide ${i + 1}`}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-gold" : "w-1.5 bg-cream/40 hover:bg-cream/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
