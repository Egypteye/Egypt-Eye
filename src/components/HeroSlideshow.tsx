"use client";

import { useEffect, useState } from "react";
import { PlaceholderImage } from "./PlaceholderImage";

const SLIDES: { tone: string; label: string }[] = [
  { tone: "giza", label: "Giza Pyramids" },
  { tone: "nile", label: "The Nile" },
  { tone: "luxor", label: "Luxor Temple" },
  { tone: "redsea", label: "Red Sea" },
  { tone: "desert", label: "Siwa Oasis" },
];

// Auto-rotating background with a slow Ken Burns zoom, standing in for real
// hero photography/video. Swap in a <video> element with real footage later —
// see README.

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {SLIDES.map((slide, i) => (
        <PlaceholderImage
          key={slide.tone}
          tone={slide.tone}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          } ${i === index ? "animate-[kenburns_9s_ease-out_forwards]" : ""}`}
        />
      ))}
      <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-2 sm:bottom-32">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.tone}
            aria-label={`Show ${slide.label}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-gold" : "w-1.5 bg-cream/40 hover:bg-cream/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
