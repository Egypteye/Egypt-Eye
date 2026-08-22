"use client";

import { useMemo, useState } from "react";
import type { Story } from "@/content/types";
import { StoryCard } from "@/components/StoryCard";

export function StoriesGrid({ stories }: { stories: Story[] }) {
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
            }`}
          >
            All Stories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === c ? "bg-ink text-cream" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft/60">No stories in this category yet.</p>
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
