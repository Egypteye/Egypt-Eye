"use client";

import { useRef, useState } from "react";
import type { PuzzleProps } from "@/lib/games/types";

function angleFromCenter(cx: number, cy: number, x: number, y: number) {
  const deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
  return (deg + 360) % 360;
}

function angleDiff(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const RADII = [92, 62, 32]; // outer, middle, inner — px, matched to the 224px stage below

// Tier 5, the finale — three concentric stone rings, each turned
// independently by dragging within its own radius band, must all align
// their marks along the same axis at once. Hardest tier: tighter tolerance,
// three simultaneous alignments instead of one.
export function EyeOfRaThreshold({ config, onSolved }: PuzzleProps) {
  const tolerance = typeof config.toleranceDegrees === "number" ? config.toleranceDegrees : 10;
  const ringCount = typeof config.ringCount === "number" ? config.ringCount : 3;

  // useState lazy initializer (not useMemo) — see SundialGate.tsx for why.
  const [targets] = useState(() => Array.from({ length: ringCount }, () => Math.floor(Math.random() * 360)));
  const [angles, setAngles] = useState<number[]>(() => targets.map((t) => (t + 90 + Math.random() * 180) % 360));
  const [solved, setSolved] = useState(false);
  const [activeRing, setActiveRing] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  function ringFromDistance(dist: number): number {
    // Distance in px from center -> which ring band it falls in.
    if (dist > (RADII[0] + RADII[1]) / 2) return 0;
    if (dist > (RADII[1] + RADII[2]) / 2) return 1;
    return 2;
  }

  function handlePointerDown(clientX: number, clientY: number, pointerId: number, target: HTMLElement) {
    const rect = stageRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(clientX - cx, clientY - cy);
    const ring = ringFromDistance(dist);
    setActiveRing(ring);
    target.setPointerCapture(pointerId);
    updateRing(ring, clientX, clientY);
  }

  function updateRing(ring: number, clientX: number, clientY: number) {
    const rect = stageRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const deg = angleFromCenter(cx, cy, clientX, clientY);
    setAngles((prev) => {
      const next = [...prev];
      next[ring] = deg;
      if (!solved && next.every((a, i) => angleDiff(a, targets[i]) <= tolerance)) {
        setSolved(true);
        setTimeout(onSolved, 1200);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={stageRef}
        className="relative h-56 w-56 touch-none select-none"
        onPointerDown={(e) => handlePointerDown(e.clientX, e.clientY, e.pointerId, e.target as HTMLElement)}
        onPointerMove={(e) => activeRing !== null && updateRing(activeRing, e.clientX, e.clientY)}
        onPointerUp={() => setActiveRing(null)}
      >
        {RADII.map((r, ring) => {
          const isAligned = angleDiff(angles[ring], targets[ring]) <= tolerance;
          return (
            <div
              key={ring}
              className="absolute left-1/2 top-1/2 rounded-full border transition-colors duration-200"
              style={{
                width: r * 2,
                height: r * 2,
                transform: `translate(-50%, -50%)`,
                borderColor: isAligned ? "#c9a227" : "rgba(228,200,120,0.25)",
                background:
                  ring === 2
                    ? "radial-gradient(circle, rgba(228,200,120,0.12), transparent 70%)"
                    : "transparent",
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 h-full w-full"
                style={{ transform: `rotate(${angles[ring]}deg)` }}
              >
                <div
                  className={`absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    isAligned ? "bg-gold shadow-[0_0_16px_rgba(228,200,120,0.9)]" : "bg-gold-light/60"
                  }`}
                />
              </div>
            </div>
          );
        })}

        {/* Fixed target marks — one per ring, each positioned on its own radius */}
        {RADII.map((r, i) => (
          <div
            key={`target-${i}`}
            className="absolute left-1/2 top-1/2 h-full w-full"
            style={{ transform: `rotate(${targets[i]}deg)` }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/25"
              style={{ top: 112 - r, width: 8, height: 8 }}
            />
          </div>
        ))}

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
      <p className="text-sm text-cream/60">
        {solved ? "All three rings turn as one. The Eye opens." : "Turn each ring — drag near its band — until all three align."}
      </p>
    </div>
  );
}
