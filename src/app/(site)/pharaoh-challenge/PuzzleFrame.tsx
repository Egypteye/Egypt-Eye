"use client";

import type { ReactNode } from "react";

// Shared stone-chamber frame every puzzle renders inside — keeps the visual
// language (sandstone gradient, gold hairline border, torch-glow corners,
// chamber counter, flavor text) consistent across all five tiers without
// each puzzle re-implementing it.
export function PuzzleFrame({
  tierNumber,
  name,
  flavorText,
  hint,
  children,
}: {
  tierNumber: number;
  name: string;
  flavorText: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-[radial-gradient(ellipse_at_top,_#2a2118_0%,_#1b2a20_55%,_#14201a_100%)] p-6 shadow-[0_0_80px_-20px_rgba(201,162,39,0.35)] sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #e4c878 0, #e4c878 1px, transparent 1px, transparent 14px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-light/80">
          Chamber {tierNumber} of 5 — {name}
        </p>
        <p className="max-w-md text-sm text-cream/70">{flavorText}</p>
      </div>

      <div className="relative mt-8 flex flex-col items-center">{children}</div>

      {hint && <p className="relative mt-6 text-center text-xs text-cream/40">{hint}</p>}
    </div>
  );
}
