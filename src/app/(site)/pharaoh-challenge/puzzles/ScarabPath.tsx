"use client";

import { useEffect, useState } from "react";
import type { PuzzleProps } from "@/lib/games/types";
import { Glyph } from "../glyphs";

const TILE_COUNT = 4;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tier 2 — four scarab-carved floor tiles light up in sequence, then go
// dark. Tap them back in the same order. A wrong tap simply replays the
// sequence — no penalty, just observation and memory.
export function ScarabPath({ config, onSolved }: PuzzleProps) {
  const length = typeof config.sequenceLength === "number" ? config.sequenceLength : 4;

  // useState lazy initializer (not useMemo) — see SundialGate.tsx for why.
  const [sequence] = useState(() => Array.from({ length }, () => Math.floor(Math.random() * TILE_COUNT)));
  const [phase, setPhase] = useState<"showing" | "input" | "solved">("showing");
  const [litIndex, setLitIndex] = useState(-1);
  const [playerStep, setPlayerStep] = useState(0);
  const [wrongTile, setWrongTile] = useState<number | null>(null);

  async function playSequence(seq: number[]) {
    setPlayerStep(0);
    setLitIndex(-1);
    await sleep(500);
    for (const tile of seq) {
      setLitIndex(tile);
      await sleep(550);
      setLitIndex(-1);
      await sleep(200);
    }
    setPhase("input");
  }

  useEffect(() => {
    // Deferred one macrotask so playSequence's first (synchronous, pre-await)
    // setState calls happen outside the effect's own call stack — a real
    // extra-render cost isn't a concern for a one-time puzzle-intro sequence.
    // Deliberately mount-only: sequence never changes after its initial
    // generation, and playSequence is a fresh closure every render.
    const timeout = setTimeout(() => void playSequence(sequence), 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTap(tile: number) {
    if (phase !== "input") return;
    if (tile === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setLitIndex(tile);
      setTimeout(() => setLitIndex(-1), 200);
      if (nextStep === sequence.length) {
        setPhase("solved");
        setTimeout(onSolved, 900);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      setWrongTile(tile);
      setTimeout(() => {
        setWrongTile(null);
        setPhase("showing");
        void playSequence(sequence); // replay the same sequence, no penalty
      }, 500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: TILE_COUNT }, (_, i) => {
          const isLit = litIndex === i;
          const isWrong = wrongTile === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleTap(i)}
              disabled={phase !== "input"}
              aria-label={`Floor tile ${i + 1}`}
              className={`flex h-16 w-16 items-center justify-center rounded-xl border transition-all duration-200 sm:h-20 sm:w-20 ${
                isWrong
                  ? "border-terracotta bg-terracotta/20"
                  : isLit
                    ? "scale-105 border-gold bg-gold/25 shadow-[0_0_30px_rgba(228,200,120,0.6)]"
                    : "border-gold/20 bg-black/20"
              }`}
            >
              <Glyph index={i} className={`h-8 w-8 ${isLit ? "text-gold" : "text-cream/40"}`} />
            </button>
          );
        })}
      </div>
      <p className="text-sm text-cream/60">
        {phase === "showing" && "Watch the path the light takes…"}
        {phase === "input" && "Now walk it yourself — tap the tiles in order."}
        {phase === "solved" && "The stones settle. The way is clear."}
      </p>
    </div>
  );
}
