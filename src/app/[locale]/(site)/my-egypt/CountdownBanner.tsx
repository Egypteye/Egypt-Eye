"use client";

import { useEffect, useState } from "react";

// Calendar-date arithmetic (not raw millisecond subtraction) so the count
// flips exactly at local midnight regardless of time-of-day or DST, rather
// than showing a fractional day that rounds unpredictably.
function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function CountdownBanner({ tripStartDate, tripEndDate }: { tripStartDate: string | null; tripEndDate: string | null }) {
  const [days, setDays] = useState<number | null>(tripStartDate ? daysUntil(tripStartDate) : null);

  useEffect(() => {
    if (!tripStartDate) return;
    const id = setInterval(() => setDays(daysUntil(tripStartDate)), 60_000);
    return () => clearInterval(id);
  }, [tripStartDate]);

  if (!tripStartDate || days === null) {
    return (
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-light">My Egypt</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">Your trip dates are being finalized</h1>
      </div>
    );
  }

  const inTrip = tripEndDate ? days <= 0 && daysUntil(tripEndDate) >= 0 : days <= 0;

  if (inTrip) {
    return (
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-light">My Egypt</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">You&rsquo;re in Egypt 🇪🇬</h1>
      </div>
    );
  }

  if (days < 0) {
    return (
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-light">My Egypt</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">Welcome back from Egypt</h1>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-light">Your Egypt begins in</p>
      <p className="mt-2 font-display text-6xl font-bold text-cream sm:text-7xl">{days}</p>
      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-cream/60">{days === 1 ? "Day" : "Days"}</p>
    </div>
  );
}
