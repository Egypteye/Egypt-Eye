"use client";

import { useEffect, useState } from "react";
import type { Image as SanityImageType } from "sanity";
import { SmartImage } from "./SmartImage";
import type { ImageTone } from "@/content/types";

type Slide = { image?: SanityImageType; tone: ImageTone; label?: string };

// Auto-rotating background with a slow Ken Burns zoom, standing in for real
// hero photography/video. Slides (and their real photos) are editable in the
// Studio under Site Settings > Homepage hero background photos.

export function HeroSlideshow({ images }: { images: readonly Slide[] }) {
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : [{ tone: "giza" as ImageTone, label: "Giza Pyramids" }];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {slides.map((slide, i) => (
        <SmartImage
          key={i}
          image={slide.image}
          tone={slide.tone}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          } ${i === index ? "animate-[kenburns_9s_ease-out_forwards]" : ""}`}
          priority={i === 0}
        />
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-2 sm:bottom-32">
          {slides.map((slide, i) => (
            <button
              key={i}
              aria-label={`Show ${slide.label ?? `slide ${i + 1}`}`}
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
