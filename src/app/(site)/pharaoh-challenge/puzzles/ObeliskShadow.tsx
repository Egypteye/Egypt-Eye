"use client";

import { useRef, useState } from "react";
import type { PuzzleProps } from "@/lib/games/types";

// Tier 4 — drag the sun along the sky; the obelisk's shadow swings the
// opposite way and lengthens near the horizon, shortens near noon. Land the
// shadow's tip on the marked ground glyph. Harder than Tier 1's alignment
// because the relationship is inverse: the shadow moves away from the
// light, not with it.
export function ObeliskShadow({ config, onSolved }: PuzzleProps) {
  const tolerance = typeof config.toleranceDegrees === "number" ? config.toleranceDegrees / 2 : 6; // % tolerance
  // Ground offset from the obelisk base, in percent of the scene width.
  // One of a handful of achievable left/right positions.
  // useState lazy initializer (not useMemo) — see SundialGate.tsx for why.
  const [target] = useState(() => {
    const side = Math.random() < 0.5 ? -1 : 1;
    const distance = 15 + Math.random() * 22; // 15–37
    return side * distance;
  });

  const [sunT, setSunT] = useState(0.5); // 0 = left horizon, 1 = right horizon
  const [dragging, setDragging] = useState(false);
  const [solved, setSolved] = useState(false);
  const arcRef = useRef<HTMLDivElement>(null);

  const shadowDir = sunT < 0.5 ? 1 : -1;
  const shadowLength = 8 + 32 * Math.abs(1 - 2 * sunT);
  const shadowOffset = shadowDir * shadowLength;

  function tFromPointer(clientX: number): number {
    const rect = arcRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function applyPointer(clientX: number) {
    const t = tFromPointer(clientX);
    setSunT(t);
    const dir = t < 0.5 ? 1 : -1;
    const length = 8 + 32 * Math.abs(1 - 2 * t);
    const offset = dir * length;
    if (!solved && Math.abs(offset - target) <= tolerance) {
      setSolved(true);
      setTimeout(onSolved, 900);
    }
  }

  const sunX = 10 + sunT * 80;
  const sunY = 82 - 68 * Math.sin(sunT * Math.PI);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={arcRef}
        className="relative h-52 w-72 touch-none select-none sm:h-56 sm:w-80"
        onPointerDown={(e) => {
          setDragging(true);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          applyPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging && applyPointer(e.clientX)}
        onPointerUp={() => setDragging(false)}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          <path d="M10 82 A40 68 0 0 1 90 82" stroke="#e4c87833" strokeWidth={1} fill="none" />
          <line x1="0" y1="82" x2="100" y2="82" stroke="#e4c87822" strokeWidth={1} />

          {/* Target glyph on the ground */}
          <circle cx={50 + target} cy={82} r={3.2} fill={solved ? "#c9a227" : "#e4c87888"} />

          {/* Shadow */}
          <line
            x1="50"
            y1="82"
            x2={50 + shadowOffset}
            y2="82"
            stroke={solved ? "#c9a227" : "#00000077"}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Obelisk */}
          <polygon points="47.5,82 52.5,82 51,42 49,42" fill="#8c6d1f" />
          <polygon points="49,42 51,42 50,37" fill="#e4c878" />
        </svg>

        {/* Draggable sun */}
        <div
          className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full transition-shadow ${
            solved
              ? "bg-gold shadow-[0_0_35px_10px_rgba(228,200,120,0.7)]"
              : "bg-gold-light shadow-[0_0_20px_5px_rgba(228,200,120,0.4)]"
          }`}
          style={{ left: `${sunX}%`, top: `${sunY}%` }}
        />
      </div>
      <p className="text-sm text-cream/60">
        {solved ? "The shadow falls true. The obelisk has shown the way." : "Move the sun — watch where the shadow falls."}
      </p>
    </div>
  );
}
