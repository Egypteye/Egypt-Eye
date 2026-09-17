"use client";

import { useRef, useState } from "react";
import type { PuzzleProps } from "@/lib/games/types";

// Tier 5, the finale — concentric stone rings that must all point to the
// notch at the top at the same time.
//
// Rewritten from a drag-to-rotate puzzle to a stepped, button-driven one.
// The original measured pointer coordinates against getBoundingClientRect()
// and rotated three overlapping hit-zones, which was unreliable on touch
// (overlapping bands, lost pointer capture) and completely unplayable by
// keyboard. Every interaction here is a real <button>, so mouse, touch and
// keyboard all take the identical code path and there is no coordinate math
// left to get wrong.
//
// The twist that keeps it a puzzle rather than a chore: turning a ring also
// turns every ring inside it — "turn them as one", per the tier's flavor
// text. That is always solvable by working outside-in (fixing a ring never
// disturbs one further out), so a random start can never be a dead end.

const STEPS = 8; // 45° per press — at most 7 presses to bring any ring home
const DEG_PER_STEP = 360 / STEPS;

// Ring diameters in px, outermost first. Sized to sit inside the 224px stage
// with room for the marker dots to render on the stroke.
const DIAMETERS = [208, 152, 96, 48];

function ringLabel(index: number, total: number): string {
  if (total === 3) return ["Outer", "Middle", "Inner"][index];
  return `Ring ${index + 1}`;
}

export function EyeOfRaThreshold({ config, onSolved }: PuzzleProps) {
  const ringCount = Math.min(
    Math.max(typeof config.ringCount === "number" ? config.ringCount : 3, 2),
    DIAMETERS.length
  );

  // useState lazy initializer (not useMemo) — see SundialGate.tsx for why.
  // Never starts already-solved: at least one ring is off the notch.
  const [steps, setSteps] = useState<number[]>(() => {
    const start = Array.from({ length: ringCount }, () => Math.floor(Math.random() * STEPS));
    // `.some(s => s > 0)` rather than `.every(s => s === 0)`: TypeScript infers
    // a type predicate from the latter and narrows the array to `0[]`, which
    // then rejects the assignment below.
    if (!start.some((s) => s > 0)) start[0] = 1 + Math.floor(Math.random() * (STEPS - 1));
    return start;
  });
  const [solved, setSolved] = useState(false);
  // onSolved advances the whole game (it writes the tier completion server
  // side), so it must fire exactly once even if a press lands mid-transition.
  const firedRef = useRef(false);

  function turn(fromRing: number) {
    if (solved) return;
    // Computed here rather than inside a setSteps updater: updaters must stay
    // pure (React may re-run them), so the win check and its side effects
    // belong in the event handler, not in the reducer.
    const next = steps.map((s, i) => (i >= fromRing ? (s + 1) % STEPS : s));
    setSteps(next);

    if (!firedRef.current && next.every((s) => s === 0)) {
      firedRef.current = true;
      setSolved(true);
      setTimeout(onSolved, 1200);
    }
  }

  const alignedCount = steps.filter((s) => s === 0).length;

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="relative h-56 w-56 select-none">
        {/* The fixed notch every ring is aiming for, at 12 o'clock. */}
        <div
          aria-hidden="true"
          className={`absolute left-1/2 top-0 h-5 w-1.5 -translate-x-1/2 rounded-full transition-colors duration-300 ${
            solved ? "bg-gold" : "bg-gold/50"
          }`}
        />

        {DIAMETERS.slice(0, ringCount).map((diameter, ring) => {
          const isAligned = steps[ring] === 0;
          return (
            <div
              key={ring}
              className="absolute left-1/2 top-1/2 rounded-full border transition-colors duration-300"
              style={{
                width: diameter,
                height: diameter,
                transform: "translate(-50%, -50%)",
                borderColor: isAligned ? "#c9a227" : "rgba(228,200,120,0.22)",
                background:
                  ring === ringCount - 1
                    ? "radial-gradient(circle, rgba(228,200,120,0.14), transparent 70%)"
                    : "transparent",
              }}
            >
              {/* Rotating layer. translate(-50%,-50%) keeps its rotation
                  origin on the ring's true centre — without it the marker
                  orbits an off-centre point and swings outside the stage. */}
              <div
                className="absolute left-1/2 top-1/2 h-full w-full transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ transform: `translate(-50%, -50%) rotate(${steps[ring] * DEG_PER_STEP}deg)` }}
              >
                <div
                  className={`absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                    isAligned ? "bg-gold shadow-[0_0_16px_rgba(228,200,120,0.9)]" : "bg-gold-light/50"
                  }`}
                />
              </div>
            </div>
          );
        })}

        {solved && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/egypt-eye-mark-gold.png"
              alt=""
              className="h-16 w-16 animate-[fade-up_0.8s_ease-out_both] drop-shadow-[0_0_25px_rgba(228,200,120,0.9)]"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {Array.from({ length: ringCount }, (_, ring) => {
          const isAligned = steps[ring] === 0;
          return (
            <button
              key={ring}
              type="button"
              onClick={() => turn(ring)}
              disabled={solved}
              aria-label={`Turn the ${ringLabel(ring, ringCount).toLowerCase()} ring${
                isAligned ? " — currently aligned" : ""
              }`}
              className={`flex min-h-[48px] min-w-[104px] items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 ${
                isAligned
                  ? "border-gold bg-gold/20 text-gold-light"
                  : "border-gold/25 bg-black/20 text-cream/70 hover:border-gold/50 hover:text-cream"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" />
                <path d="M20 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {ringLabel(ring, ringCount)}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="text-center text-base text-cream/60">
        {solved
          ? "All rings turn as one. The Eye opens."
          : `${alignedCount} of ${ringCount} rings aligned — turning a ring also turns the ones inside it.`}
      </p>
    </div>
  );
}
