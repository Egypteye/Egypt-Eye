"use client";

import { useMemo, useState } from "react";
import type { Story } from "@/content/types";
import { StoryCard } from "@/components/StoryCard";
import { useTr } from "@/i18n/LocaleProvider";

export function StoriesGrid({ stories }: { stories: Story[] }) {
  const tr = useTr();
  // Literal tr() calls, not tr(variable) — the UI-manifest extractor only
  // recognizes a string literal argument, so each known category needs its
  // own call site. story.category isn't reclassified as translatable
  // content globally because "category" is also used opaquely elsewhere
  // (tour.category is compared with === against fixed English values).
  const categoryLabels: Record<string, string> = {
    "Ancient Egypt": tr("Ancient Egypt"),
    "Behind the Scenes": tr("Behind the Scenes"),
    "Celestial Events": tr("Celestial Events"),
    Culture: tr("Culture"),
    "Culture & Trends": tr("Culture & Trends"),
    News: tr("News"),
    "Travel Guides": tr("Travel Guides"),
  };
  const categories = useMemo(
    () => Array.from(new Set(stories.map((s) => s.category).filter((c): c is string => Boolean(c)))),
    [stories]
  );
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? stories.filter((s) => s.category === filter) : stories;

  if (stories.length === 0) return null;

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === null ? "bg-ink text-cream" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
            }`}>{tr("All Stories")}</button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === c ? "bg-ink text-cream" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
              }`}
            >
              {categoryLabels[c] ?? c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft/60">{tr("No stories in this category yet.")}</p>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>
      )}
    </div>
  );
}
