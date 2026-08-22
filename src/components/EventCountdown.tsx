"use client";

import { useEffect, useState } from "react";
import type { EventCountdown as EventCountdownData } from "@/content/types";
import { SmartImage } from "./SmartImage";

// Reusable countdown for any dated event — not written for the eclipse
// specifically. Reads its target from `event.targetDateTime`, an ISO string
// that carries its own UTC offset (e.g. "2027-08-02T13:02:14+03:00"), so the
// remaining time is correct for every visitor regardless of their own
// timezone with no conversion logic needed here.
//
// Three states: counting down, "day of" (target has passed but it's within
// 24h — e.g. totality is still ahead or just happened), and "ended" (more
// than 24h past). Cinematic, restrained styling — a drifting starfield and
// a soft glow, not a "sale ends in" ticker.

type Phase = "counting" | "today" | "ended";

function getPhase(msRemaining: number): Phase {
  if (msRemaining > 0) return "counting";
  if (msRemaining > -1000 * 60 * 60 * 24) return "today";
  return "ended";
}

function getTimeParts(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="font-display text-4xl font-semibold text-cream sm:text-6xl"
        style={{ textShadow: "0 0 24px rgba(236,192,106,0.35)" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/60">
        {label}
      </span>
    </div>
  );
}

export function EventCountdown({ event }: { event: EventCountdownData }) {
  const target = new Date(event.targetDateTime).getTime();
  const [msRemaining, setMsRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMsRemaining(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!event.active) return null;

  // Avoid a server/client mismatch flash — render nothing until the first
  // client tick has run.
  if (msRemaining === null) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-ink py-20">
        <div className="absolute inset-0 bg-star-field opacity-40" />
      </div>
    );
  }

  const phase = getPhase(msRemaining);
  const parts = phase === "counting" ? getTimeParts(msRemaining) : null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink">
      <SmartImage
        image={event.backgroundImage}
        tone={event.backgroundTone}
        className="absolute inset-0 opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />
      <div className="bg-star-field animate-drift-stars absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-6 px-6 py-16 text-center sm:px-12 sm:py-20">
        {event.displayTitle && (
          <p className="font-display text-2xl italic text-cream/90 sm:text-3xl">
            {event.displayTitle}
          </p>
        )}

        {phase === "counting" && parts && (
          <div className="flex items-start gap-6 sm:gap-10">
            <TimeUnit value={parts.days} label="Days" />
            <TimeUnit value={parts.hours} label="Hours" />
            <TimeUnit value={parts.minutes} label="Minutes" />
            <TimeUnit value={parts.seconds} label="Seconds" />
          </div>
        )}

        {phase === "today" && (
          <p className="max-w-xl font-display text-2xl font-semibold text-cream sm:text-3xl">
            {event.dayOfMessage || `Today is the day: ${event.name}.`}
          </p>
        )}

        {phase === "ended" && (
          <p className="max-w-xl font-display text-2xl font-semibold text-cream sm:text-3xl">
            {event.endedMessage || event.dayOfMessage || `${event.name} has passed.`}
          </p>
        )}

        {event.supportingText && (
          <p className="max-w-lg text-sm leading-relaxed text-cream/70">{event.supportingText}</p>
        )}
        {event.timezoneLabel && (
          <p className="text-xs uppercase tracking-[0.15em] text-cream/40">{event.timezoneLabel}</p>
        )}
      </div>
    </div>
  );
}
