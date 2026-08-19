"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const TRIP_TYPES = [
  { value: "all", label: "Any trip type" },
  { value: "one-day", label: "One-Day Tours" },
  { value: "multi-day", label: "Multi-Day Tours" },
  { value: "jordan", label: "Jordan" },
];

const DURATIONS = [
  { value: "all", label: "Any length" },
  { value: "1", label: "1 day" },
  { value: "2-5", label: "2 – 5 days" },
  { value: "6-7", label: "6 – 7 days" },
  { value: "8-11", label: "8 – 11 days" },
];

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [type, setType] = useState("all");
  const [duration, setDuration] = useState("all");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (duration !== "all") params.set("duration", duration);
    const qs = params.toString();
    router.push(`/tours${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 rounded-2xl bg-cream p-5 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-black/10 sm:p-3 ${className}`}
    >
      <label className="flex flex-1 flex-col gap-1 px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
          Trip type
        </span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-transparent text-sm font-medium text-ink outline-none"
        >
          {TRIP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
          How long
        </span>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="bg-transparent text-sm font-medium text-ink outline-none"
        >
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light sm:ml-3 sm:mt-0"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="9" cy="9" r="6" />
          <path d="M17 17l-4-4" strokeLinecap="round" />
        </svg>
        Search tours
      </button>
    </form>
  );
}
