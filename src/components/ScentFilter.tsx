"use client";

import { useState } from "react";
import type { ScentFamily } from "@/content/types";
import { familyLabel } from "@/lib/boutique/scentFamilies";

// The scent-family filter.
//
// It hides cards with CSS rather than re-rendering a list, and that is the
// point: every product stays in the server-rendered HTML, so the collection is
// fully crawlable, every card is present for a reader with JavaScript off, and
// nothing about the page depends on this component having loaded.
//
// Only families that actually hold a product are offered. A filter that leads
// to an empty shelf is worse than no filter.
//
// There is deliberately no product-type filter. We do not know what most of
// these liquids are — see docs/oils-research.md — and a facet built on guesses
// would quietly hide half the collection behind a wrong answer.

export function ScentFilter({
  families,
  counts,
  total,
  children,
}: {
  families: ScentFamily[];
  counts: Record<string, number>;
  total: number;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<ScentFamily | "">("");
  if (families.length < 2) return <>{children}</>;

  const shown = active ? (counts[active] ?? 0) : total;

  return (
    <div data-scent-filter data-active={active}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActive("")}
          aria-pressed={active === ""}
          className={chip(active === "")}
        >
          All <span className="text-ink-soft/70">{total}</span>
        </button>
        {families.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive((prev) => (prev === f ? "" : f))}
            aria-pressed={active === f}
            className={chip(active === f)}
          >
            {familyLabel(f)} <span className="text-ink-soft/70">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown} of {total} shown
      </p>
      {children}
    </div>
  );
}

function chip(on: boolean): string {
  return `rounded-full border px-4 py-2 text-sm font-semibold transition ${
    on ? "border-gold/60 bg-gold/15 text-ink" : "border-black/10 bg-cream text-ink-soft hover:border-gold/30"
  }`;
}
