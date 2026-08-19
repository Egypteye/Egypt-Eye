"use client";

import { useRef, useState } from "react";
import { TourCard } from "./TourCard";
import type { Tour } from "@/content/types";

const TABS: { label: string; value: Tour["category"] | "all" }[] = [
  { label: "Top Tours", value: "all" },
  { label: "One-Day", value: "one-day" },
  { label: "Multi-Day", value: "multi-day" },
  { label: "Jordan", value: "jordan" },
];

export function PopularToursCarousel({ tours }: { tours: Tour[] }) {
  const [tab, setTab] = useState<Tour["category"] | "all">("all");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const filtered = tab === "all" ? tours : tours.filter((t) => t.category === tab);

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t.value
                  ? "bg-ink text-cream"
                  : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink-soft transition hover:bg-sand-dim"
          >
            ←
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink-soft transition hover:bg-sand-dim"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
      >
        {filtered.map((tour) => (
          <div key={tour.slug} className="w-[85%] shrink-0 snap-start sm:w-[380px]">
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </div>
  );
}
