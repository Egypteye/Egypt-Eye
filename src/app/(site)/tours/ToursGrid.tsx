"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TourCard } from "@/components/TourCard";
import type { Tour } from "@/content/types";

const TRIP_TYPES: { label: string; value: Tour["category"] | "all" }[] = [
  { label: "All Tours", value: "all" },
  { label: "One-Day Tours", value: "one-day" },
  { label: "Multi-Day Tours", value: "multi-day" },
  { label: "Jordan", value: "jordan" },
];

const DURATIONS: { label: string; value: string }[] = [
  { label: "Any Length", value: "all" },
  { label: "1 Day", value: "1" },
  { label: "2–5 Days", value: "2-5" },
  { label: "6–7 Days", value: "6-7" },
  { label: "8–11 Days", value: "8-11" },
  { label: "12+ Days", value: "12+" },
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
    case "12+":
      return days >= 12;
    default:
      return true;
  }
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/5 py-6 first:pt-0 last:border-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-soft/60">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function ToursGrid({ tours }: { tours: Tour[] }) {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as Tour["category"] | null) ?? "all";
  const initialDuration = searchParams.get("duration") ?? "all";
  const initialCity = searchParams.get("city");

  const [filter, setFilter] = useState<Tour["category"] | "all">(initialType);
  const [duration, setDuration] = useState(initialDuration);
  const [destination, setDestination] = useState<string | null>(initialCity);
  const [style, setStyle] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const allDestinations = useMemo(
    () => Array.from(new Set(tours.flatMap((t) => t.destinations))).sort(),
    [tours]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tours
      .filter((t) => filter === "all" || t.category === filter)
      .filter((t) => duration === "all" || inDurationBucket(t.lengthDays, duration))
      .filter((t) => !destination || t.destinations.includes(destination))
      .filter((t) => !style || t.travelStyle?.includes(style))
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.destinations.some((d) => d.toLowerCase().includes(q))
      );
  }, [tours, filter, duration, destination, style, query]);

  const activeFilterCount =
    (filter !== "all" ? 1 : 0) + (duration !== "all" ? 1 : 0) + (destination ? 1 : 0) + (style ? 1 : 0) + (query ? 1 : 0);

  function clearAll() {
    setFilter("all");
    setDuration("all");
    setDestination(null);
    setStyle(null);
    setQuery("");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:items-start lg:gap-10">
      {/* Filters sidebar */}
      <aside className="hidden rounded-2xl border border-black/5 bg-cream p-6 lg:sticky lg:top-24 lg:block">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold text-ink">Filter Tours</p>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-xs font-semibold text-gold-dark hover:underline">
              Clear all
            </button>
          )}
        </div>

        <div className="relative mt-5">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/40"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Trip name or destination…"
            className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none"
          />
        </div>

        <FilterGroup title="Trip Type">
          <div className="flex flex-col gap-1">
            {TRIP_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  filter === t.value ? "bg-ink text-cream" : "text-ink-soft hover:bg-sand-dim"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Duration">
          <div className="flex flex-col gap-1">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  duration === d.value ? "bg-ink text-cream" : "text-ink-soft hover:bg-sand-dim"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Destination">
          <div className="max-h-52 overflow-y-auto pr-1">
            <div className="flex flex-col gap-1">
              {allDestinations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDestination(destination === d ? null : d)}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm transition ${
                    destination === d ? "bg-gold/15 font-semibold text-gold-dark" : "text-ink-soft hover:bg-sand-dim"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </FilterGroup>

        <FilterGroup title="Suitable For">
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(style === s ? null : s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  style === s
                    ? "border-gold-dark bg-gold/15 text-gold-dark"
                    : "border-black/10 text-ink-soft/70 hover:border-gold/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterGroup>
      </aside>

      {/* Results */}
      <div>
        <p className="text-sm text-ink-soft/60">
          {filtered.length} tour{filtered.length === 1 ? "" : "s"} match{filtered.length === 1 ? "es" : ""}
        </p>
        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-ink-soft/60">
            No tours match those filters yet — message us and we&rsquo;ll build one that does.
          </p>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((tour) => (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
