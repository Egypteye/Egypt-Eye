"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { TourCard } from "@/components/TourCard";
import type { Tour } from "@/content/types";

const FILTERS: { label: string; value: Tour["category"] | "all" }[] = [
  { label: "All Tours", value: "all" },
  { label: "One-Day Tours", value: "one-day" },
  { label: "Multi-Day Tours", value: "multi-day" },
  { label: "Jordan", value: "jordan" },
];

function inDurationBucket(days: number, bucket: string) {
  switch (bucket) {
    case "1":
      return days <= 1;
    case "2-5":
      return days >= 2 && days <= 5;
    case "6-7":
      return days >= 6 && days <= 7;
    case "8-11":
      return days >= 8 && days <= 11;
    default:
      return true;
  }
}

export function ToursGrid({ tours }: { tours: Tour[] }) {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as Tour["category"] | null) ?? "all";
  const initialDuration = searchParams.get("duration") ?? "all";
  const city = searchParams.get("city");

  const [filter, setFilter] = useState<Tour["category"] | "all">(initialType);
  const [duration] = useState(initialDuration);

  const filtered = tours
    .filter((t) => filter === "all" || t.category === filter)
    .filter((t) => duration === "all" || inDurationBucket(t.lengthDays, duration))
    .filter((t) => !city || t.destinations.some((d) => d.toLowerCase().includes(city.toLowerCase())));

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
      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft/60">
          No tours match those filters yet — message us and we&rsquo;ll build one that does.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
