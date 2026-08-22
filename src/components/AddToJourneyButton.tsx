"use client";

import { toggleJourneyItem, useJourneyItems, type JourneyItemType } from "@/lib/journey";

export function AddToJourneyButton({
  type,
  slug,
  title,
  subtitle,
  className = "",
}: {
  type: JourneyItemType;
  slug: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  const items = useJourneyItems();
  const added = items.some((i) => i.type === type && i.slug === slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleJourneyItem({ type, slug, title, subtitle });
      }}
      aria-pressed={added}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        added
          ? "border-gold-dark bg-gold/15 text-gold-dark"
          : "border-black/10 text-ink-soft/70 hover:border-gold/40 hover:text-ink"
      } ${className}`}
    >
      <span aria-hidden="true">{added ? "✓" : "+"}</span>
      {added ? "Added to My Journey" : "Add to My Journey"}
    </button>
  );
}
