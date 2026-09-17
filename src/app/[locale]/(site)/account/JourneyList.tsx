"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type JourneyItem = { id: string; item_type: string; slug: string; title: string; subtitle: string | null };
type Journey = { id: string; name: string; notes: string | null; updated_at: string; journey_items: JourneyItem[] };

export function JourneyList({ journeys }: { journeys: Journey[] }) {
  return (
    <div className="flex flex-col gap-4">
      {journeys.map((journey) => (
        <JourneyRow key={journey.id} journey={journey} />
      ))}
    </div>
  );
}

function JourneyRow({ journey }: { journey: Journey }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(journey.name);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === journey.name) {
      setEditing(false);
      setName(journey.name);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("journeys").update({ name: trimmed }).eq("id", journey.id);
    setSaving(false);
    setEditing(false);
    if (!error) router.refresh();
  }

  async function removeItem(itemId: string) {
    const supabase = createClient();
    await supabase.from("journey_items").delete().eq("id", itemId);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              disabled={saving}
              className="min-w-0 flex-1 rounded-lg border border-gold/40 bg-sand px-3 py-1.5 text-sm font-semibold text-ink outline-none"
            />
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="truncate text-left font-display text-base font-semibold text-ink hover:text-gold-dark">
              {journey.name} <span aria-hidden="true" className="text-xs text-ink-soft/40">✎</span>
            </button>
          )}
        </div>
        <button type="button" onClick={() => setExpanded((v) => !v)} className="shrink-0 text-xs font-semibold text-ink-soft/60 hover:text-ink">
          {journey.journey_items.length} item{journey.journey_items.length === 1 ? "" : "s"} {expanded ? "▲" : "▼"}
        </button>
      </div>

      {expanded && (
        <ul className="mt-4 flex flex-col gap-2 border-t border-black/5 pt-4">
          {journey.journey_items.length === 0 ? (
            <li className="text-sm text-ink-soft/50">No items in this journey yet.</li>
          ) : (
            journey.journey_items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink">
                  {item.title}
                  {item.subtitle && <span className="text-ink-soft/50"> — {item.subtitle}</span>}
                </span>
                <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title}`} className="shrink-0 text-ink-soft/40 hover:text-terracotta">
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
