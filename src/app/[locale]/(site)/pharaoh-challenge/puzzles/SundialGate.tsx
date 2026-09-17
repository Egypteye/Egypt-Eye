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

// Tier 1 — drag the golden disc around the ring until its sun-glyph lines
// up with the fixed notch carved into the gate. Easiest tier: generous
// tolerance, single continuous drag gesture.
export function SundialGate({ config, onSolved }: PuzzleProps) {
  const tolerance = typeof config.toleranceDegrees === "number" ? config.toleranceDegrees : 18;
  // A useState lazy initializer (not useMemo) — the React Compiler's purity
  // rule disallows calling Math.random directly during render/in useMemo,
  // but a state initializer function (called exactly once, on mount) is fine.
  const [target] = useState(() => Math.floor(Math.random() * 360));
  const ringRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(() => (target + 180) % 360);
  const [dragging, setDragging] = useState(false);
  const [solved, setSolved] = useState(false);
  const [missed, setMissed] = useState(false);

  function updateFromPointer(clientX: number, clientY: number) {
    const el = ringRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setRotation(angleFromCenter(cx, cy, clientX, clientY));
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (angleDiff(rotation, target) <= tolerance) {
      setSolved(true);
      setTimeout(onSolved, 900);
    } else {
      setMissed(true);
      setTimeout(() => setMissed(false), 500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={ringRef}
        className={`relative h-64 w-64 touch-none select-none rounded-full border-2 border-gold/30 bg-[conic-gradient(from_0deg,_#3a2f1c,_#1b2a20,_#3a2f1c)] transition-transform ${
          missed ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
        onPointerDown={(e) => {
          setDragging(true);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          updateFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && updateFromPointer(e.clientX, e.clientY)}
        onPointerUp={handlePointerUp}
      >
        {/* Fixed target notch */}
        <div
          className="absolute left-1/2 top-1/2 h-full w-full"
          style={{ transform: `translate(-50%, -50%) rotate(${target}deg)` }}
        >
          <div className={`absolute left-1/2 top-1 h-6 w-1.5 -translate-x-1/2 rounded-full ${solved ? "bg-gold" : "bg-gold/50"}`} />
        </div>

        {/* Draggable disc */}
        <div
          className="absolute inset-6 rounded-full border border-gold-light/40 bg-[radial-gradient(circle_at_35%_30%,_#e4c878,_#8c6d1f_75%)] shadow-inner transition-transform duration-100"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute left-1/2 top-2 h-8 w-8 -translate-x-1/2 text-ink">
            <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <circle cx="16" cy="16" r="6" />
              <path d="M16 3v4M16 25v4M3 16h4M25 16h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {solved && (
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_60px_20px_rgba(228,200,120,0.55)] transition-opacity duration-500" />
        )}
      </div>
      <p className="text-base text-cream/60">
        {solved ? "The disc catches the light — the gate slides open." : "Drag the disc to align it with the mark."}
      </p>
    </div>
  );
}
