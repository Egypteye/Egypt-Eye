"use client";

import { useState } from "react";
import type { PuzzleProps } from "@/lib/games/types";
import { Glyph, GLYPH_COUNT } from "../glyphs";

// Tier 3 — a stone combination-lock. Each wheel cycles independently via
// its own up/down arrows; match the shown key combination across all
// wheels. The target is always visible — this is a logic/matching puzzle,
// not a memory one.
export function HieroglyphWheels({ config, onSolved }: PuzzleProps) {
  const wheelCount = typeof config.wheelCount === "number" ? config.wheelCount : 3;
  const symbolsPerWheel = typeof config.symbolsPerWheel === "number" ? config.symbolsPerWheel : GLYPH_COUNT;

  // useState lazy initializers (not useMemo) — see SundialGate.tsx for why.
  const [target] = useState(() => Array.from({ length: wheelCount }, () => Math.floor(Math.random() * symbolsPerWheel)));
  const [values, setValues] = useState<number[]>(() =>
    target.map((t) => (t + 1 + Math.floor(Math.random() * (symbolsPerWheel - 1))) % symbolsPerWheel)
  );
  const [solved, setSolved] = useState(false);

  function turn(wheel: number, dir: 1 | -1) {
    if (solved) return;
    setValues((prev) => {
      const next = [...prev];
      next[wheel] = (next[wheel] + dir + symbolsPerWheel) % symbolsPerWheel;
      if (target.every((t, i) => t === next[i])) {
        setSolved(true);
        setTimeout(onSolved, 900);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-light/70">Match this combination</p>
        <div className="flex gap-3 rounded-2xl border border-gold/20 bg-black/20 px-4 py-3">
          {target.map((g, i) => (
            <Glyph key={i} index={g} className="h-7 w-7 text-gold" />
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {values.map((v, wheel) => (
          <div key={wheel} className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label="Turn wheel up"
              onClick={() => turn(wheel, -1)}
              className="text-cream/50 transition hover:text-gold-light"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 bg-[radial-gradient(circle_at_35%_30%,_#3a2f1c,_#1b2a20)] transition-all duration-200 sm:h-20 sm:w-20 ${
                target[wheel] === v ? "border-gold shadow-[0_0_25px_rgba(228,200,120,0.5)]" : "border-gold/25"
              }`}
            >
              <Glyph index={v} className={`h-8 w-8 transition-colors ${target[wheel] === v ? "text-gold" : "text-cream/50"}`} />
            </div>
            <button
              type="button"
              aria-label="Turn wheel down"
              onClick={() => turn(wheel, 1)}
              className="text-cream/50 transition hover:text-gold-light"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <p className="text-base text-cream/60">
        {solved ? "The wheels lock into place. Stone grinds against stone as the way opens." : "Turn each wheel to match the key above."}
      </p>
    </div>
  );
}
