"use client";

import { useState } from "react";
import Image from "next/image";
import type { SanityImage as SanityImageType } from "@/content/types";
import { urlForImage } from "@/sanity/image";

// Thumbnail grid + simple click-to-open lightbox with prev/next, for the
// gallery photos on Experience/Photoshoot detail pages.
export function Gallery({ images, alt }: { images: SanityImageType[]; alt: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const urls = images.map((img) => urlForImage(img)?.url()).filter((u): u is string => Boolean(u));

  if (urls.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {urls.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={src}
              alt={`${alt} — photo ${i + 1}`}
              fill
              className="object-cover transition duration-300 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close gallery"
            className="absolute right-5 top-5 text-2xl text-white/80 transition hover:text-white"
          >
            ✕
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i === null ? i : (i - 1 + urls.length) % urls.length));
              }}
              aria-label="Previous photo"
              className="absolute left-4 text-3xl text-white/70 transition hover:text-white"
            >
              ‹
            </button>
          )}

          <div className="relative h-[80vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={urls[openIndex]}
              alt={`${alt} — photo ${openIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {openIndex < urls.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i === null ? i : (i + 1) % urls.length));
              }}
              aria-label="Next photo"
              className="absolute right-4 text-3xl text-white/70 transition hover:text-white"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
