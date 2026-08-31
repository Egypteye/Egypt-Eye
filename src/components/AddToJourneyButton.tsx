"use client";

import { useState } from "react";
import { toggleJourneyItem, useJourneyItems, type JourneyItemType } from "@/lib/journey";

export type JourneySuggestion = {
  type: JourneyItemType;
  slug: string;
  title: string;
  subtitle?: string;
};

export function AddToJourneyButton({
  type,
  slug,
  title,
  subtitle,
  suggestions,
  className = "",
}: {
  type: JourneyItemType;
  slug: string;
  title: string;
  subtitle?: string;
  /** Related tours/experiences to suggest in a toast right after this item is added. */
  suggestions?: JourneySuggestion[];
  className?: string;
}) {
  const items = useJourneyItems();
  const added = items.some((i) => i.type === type && i.slug === slug);
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const nowAdded = toggleJourneyItem({ type, slug, title, subtitle });
          if (nowAdded && suggestions && suggestions.length > 0) setShowSuggestions(true);
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

      {showSuggestions && suggestions && suggestions.length > 0 && (
        <SuggestionToast
          label={`Added “${title}” — travelers also like`}
          suggestions={suggestions}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </>
  );
}

// A fixed (not popover-anchored) toast — cards this button lives in are
// `overflow-hidden` for their rounded corners, so anything positioned
// relative to the button itself would get clipped. Fixed positioning
// escapes that regardless of which card/page renders the button. Exported
// so /my-journey can reuse the same look for its own "you might also like"
// popup, built from everything already in the journey rather than a single
// just-added item.
//
// `bottom-24` (not `bottom-4`) clears the WhatsApp button (bottom-6, 56px
// tall) — at bottom-4 this toast's own suggestion rows sat right underneath
// it, so its "+Add" targets were unreachable.
export function SuggestionToast({
  label,
  suggestions,
  onClose,
}: {
  label: string;
  suggestions: JourneySuggestion[];
  onClose: () => void;
}) {
  return (
    <div
      className="animate-fade-up fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl border border-gold/20 bg-ink p-4 shadow-2xl shadow-black/20 sm:inset-x-auto sm:right-4"
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-light">{label}</p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className="shrink-0 text-cream/50 transition hover:text-cream"
        >
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {suggestions.slice(0, 3).map((s) => (
          <SuggestionRow key={`${s.type}:${s.slug}`} suggestion={s} />
        ))}
      </div>
    </div>
  );
}

function SuggestionRow({ suggestion }: { suggestion: JourneySuggestion }) {
  const items = useJourneyItems();
  const added = items.some((i) => i.type === suggestion.type && i.slug === suggestion.slug);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-cream/5 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-cream">{suggestion.title}</p>
        {suggestion.subtitle && <p className="truncate text-xs text-cream/50">{suggestion.subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={() => toggleJourneyItem(suggestion)}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
          added ? "bg-gold/20 text-gold-light" : "bg-gold text-ink hover:bg-gold-light"
        }`}
      >
        {added ? "✓ Added" : "+ Add"}
      </button>
    </div>
  );
}
