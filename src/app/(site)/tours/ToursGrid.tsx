"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TourCard } from "@/components/TourCard";
import type { Tour } from "@/content/types";

const FILTERS: { label: string; value: Tour["category"] | "all" }[] = [
  { label: "All Tours", value: "all" },
  { label: "One-Day Tours", value: "one-day" },
  { label: "Multi-Day Tours", value: "multi-day" },
  { label: "Jordan", value: "jordan" },
];

const TRAVEL_STYLES = [
  "Luxury",
  "Private",
  "Cultural",
  "Family",
  "Honeymoon",
  "Women's",
  "Slow Travel",
  "Adventure",
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
  const [style, setStyle] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tours
      .filter((t) => filter === "all" || t.category === filter)
      .filter((t) => duration === "all" || inDurationBucket(t.lengthDays, duration))
      .filter((t) => !city || t.destinations.some((d) => d.toLowerCase().includes(city.toLowerCase())))
      .filter((t) => !style || t.travelStyle?.includes(style))
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.destinations.some((d) => d.toLowerCase().includes(q))
      );
  }, [tours, filter, duration, city, style, query]);

  return (
    <div>
      <div className="relative max-w-md">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/40"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by destination, e.g. Luxor, Nile, Red Sea…"
          className="w-full rounded-full border border-black/10 bg-cream py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
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

      <div className="mt-3 flex flex-wrap gap-2">
        {TRAVEL_STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(style === s ? null : s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              style === s
                ? "border-gold-dark bg-gold/15 text-gold-dark"
                : "border-black/10 text-ink-soft/70 hover:border-gold/40"
            }`}
          >
            {s}
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
