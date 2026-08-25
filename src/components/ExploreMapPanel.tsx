"use client";

import Link from "next/link";
import { useState } from "react";
import { EgyptMap } from "./EgyptMap";
import type { DestinationHub, EgyptCity, Mood } from "@/content/types";

// Each mood gets its own color so the row reads at a glance (blue for
// water/beaches, orange for history, etc.) rather than one uniform brand
// gold for every button — a deliberate, scoped exception to the site's
// single-accent system, since these are functional filter chips, not
// brand chrome.
const MOODS: { value: Mood; label: string; dot: string; active: string }[] = [
  { value: "history", label: "History & Monuments", dot: "bg-orange-600", active: "border-orange-600 bg-orange-600 text-white" },
  { value: "beaches", label: "Red Sea & Beaches", dot: "bg-blue-600", active: "border-blue-600 bg-blue-600 text-white" },
  { value: "desert", label: "Desert & Oases", dot: "bg-amber-700", active: "border-amber-700 bg-amber-700 text-white" },
  { value: "diving", label: "Diving & Snorkeling", dot: "bg-teal-600", active: "border-teal-600 bg-teal-600 text-white" },
  { value: "nile", label: "Nile & River Towns", dot: "bg-green-600", active: "border-green-600 bg-green-600 text-white" },
  { value: "coast", label: "Mediterranean Coast", dot: "bg-indigo-600", active: "border-indigo-600 bg-indigo-600 text-white" },
];

// The map + everything directly around it on /explore-egypt: the mood
// buttons that help an undecided visitor narrow things down, the map
// itself, and the flat list of hub names below it. Kept as one client
// component (rather than adding "use client" to the whole page) since the
// mood-filter selection is the only piece of state involved.
export function ExploreMapPanel({
  hubs,
  cities,
  selectedSlug,
}: {
  hubs: DestinationHub[];
  cities: EgyptCity[];
  selectedSlug: string;
}) {
  const [mood, setMood] = useState<Mood | null>(null);

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/50">
          Not sure where to start? Pick a mood
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood((cur) => (cur === m.value ? null : m.value))}
              aria-pressed={mood === m.value}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                mood === m.value ? m.active : "border-black/10 text-ink-soft/70 hover:border-black/25 hover:text-ink"
              }`}
            >
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${mood === m.value ? "bg-white" : m.dot}`} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <EgyptMap hubs={hubs} cities={cities} selectedSlug={selectedSlug} linkBase="/explore-egypt" moodFilter={mood} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {hubs.map((hub) => (
          <Link
            key={hub.slug}
            href={`/explore-egypt/${hub.slug}`}
            scroll={false}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              hub.slug === selectedSlug
                ? "border-gold-dark bg-gold/15 text-gold-dark"
                : "border-black/10 text-ink-soft/70 hover:border-gold/40 hover:text-ink"
            }`}
          >
            {hub.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
