"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const COUNTRIES = [
  { value: "egypt", label: "Egypt" },
  { value: "jordan", label: "Jordan" },
];

const DURATIONS = [
  { value: "all", label: "Any length" },
  { value: "1", label: "1 day" },
  { value: "2-5", label: "2 – 5 days" },
  { value: "6-7", label: "6 – 7 days" },
  { value: "8-11", label: "8 – 11 days" },
];

const SERVICES = [
  { value: "tours", label: "Tours" },
  { value: "experiences", label: "Extra Experiences" },
];

export function SearchBar({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [country, setCountry] = useState("egypt");
  const [duration, setDuration] = useState("all");
  const [service, setService] = useState("tours");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (service === "experiences") {
      router.push("/experiences");
      return;
    }

    const params = new URLSearchParams();
    if (country === "jordan") {
      params.set("type", "jordan");
    }
    if (duration !== "all") params.set("duration", duration);

    const qs = params.toString();
    router.push(`/tours${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid grid-cols-2 gap-x-3 gap-y-2 rounded-2xl bg-cream p-4 shadow-2xl shadow-black/20 sm:flex sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-black/10 sm:p-3 ${className}`}
    >
      <label className="flex flex-1 flex-col gap-1 px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
          Country
        </span>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded bg-transparent text-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
          Length
        </span>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="rounded bg-transparent text-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
          Service
        </span>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="rounded bg-transparent text-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="col-span-2 mt-1 flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light sm:ml-3 sm:mt-0"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="9" cy="9" r="6" />
          <path d="M17 17l-4-4" strokeLinecap="round" />
        </svg>
        Search
      </button>
    </form>
  );
}
