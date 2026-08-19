"use client";

import { useState } from "react";
import { TourCard } from "@/components/TourCard";
import { tours } from "@/content/tours";
import type { Tour } from "@/content/types";

const FILTERS: { label: string; value: Tour["category"] | "all" }[] = [
  { label: "All Tours", value: "all" },
  { label: "One-Day Tours", value: "one-day" },
  { label: "Multi-Day Tours", value: "multi-day" },
  { label: "Jordan", value: "jordan" },
];

export function ToursGrid() {
  const [filter, setFilter] = useState<Tour["category"] | "all">("all");
  const filtered = filter === "all" ? tours : tours.filter((t) => t.category === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.value
                ? "bg-ink text-cream"
                : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tour) => (
          <TourCard key={tour.slug} tour={tour} />
        ))}
      </div>
    </div>
  );
}
