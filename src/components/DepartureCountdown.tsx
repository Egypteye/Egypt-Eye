"use client";

import { useSyncExternalStore } from "react";
import { useTr } from "@/i18n/LocaleProvider";
import { countdownTo } from "@/lib/departureModel";

// The clock on the featured departure.
//
// =========================================================================
// WHAT IT IS NOT
// =========================================================================
// It is not a deadline and it is not a scarcity device. It counts to the
// moment the group actually leaves, taken from the departure's own date in
// Cairo - so it can never be set to "expire" early to manufacture urgency,
// and when it reaches zero nothing is lost that was not already gone.
//
// It is also not what decides whether a trip is over. deriveDeparture does
// that, from the date and the status. If this hits zero on a page somebody
// left open, the honest thing is to stop showing a clock and say the day has
// arrived - not to quietly renumber itself against the next trip, which would
// attach this departure's name to another departure's time.
//
// =========================================================================
// HYDRATION
// =========================================================================
// The server has no "now" that will still be true when the browser paints, so
// rendering a real countdown on the server guarantees a mismatch. It renders
// the reserved space instead and fills in after mount, which also keeps the
// layout from shifting when the digits arrive.
//
// Seconds appear only inside the last day. A seconds counter on a trip three
// weeks out is a slot machine, not information.

// The clock is an external, mutable source, so it is read through
// useSyncExternalStore rather than mirrored into state from an effect. That
// is what makes the server render and the first client render agree by
// construction: getServerSnapshot returns 0, which this component shows as
// reserved space, and the real time arrives on the first subscribed tick.
//
// The snapshot is whole seconds and is cached, because getSnapshot is called
// during render and must return the same value every time within one pass -
// handing back a fresh Date.now() each call is an infinite re-render.
let cachedSecond = 0;

function subscribeToSeconds(onChange: () => void): () => void {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

function secondsNow(): number {
  const s = Math.floor(Date.now() / 1000);
  if (s !== cachedSecond) cachedSecond = s;
  return cachedSecond;
}

/** 0 on the server: "we do not know what time it will be when you see this". */
function secondsOnServer(): number {
  return 0;
}

export function DepartureCountdown({ targetMs, className = "" }: { targetMs: number; className?: string }) {
  const tr = useTr();
  const second = useSyncExternalStore(subscribeToSeconds, secondsNow, secondsOnServer);

  const c = second === 0 ? null : countdownTo(targetMs, second * 1000);

  if (c?.done) {
    return (
      <p className={`text-sm font-semibold uppercase tracking-[0.2em] text-gold-light ${className}`}>
        {tr("Departing today")}
      </p>
    );
  }

  const showSeconds = c !== null && c.days === 0;
  const units: { value: number | null; label: string }[] = [
    { value: c?.days ?? null, label: tr("days") },
    { value: c?.hours ?? null, label: tr("hours") },
    { value: c?.minutes ?? null, label: tr("mins") },
    ...(showSeconds ? [{ value: c?.seconds ?? null, label: tr("secs") }] : []),
  ];

  // One static sentence for assistive technology. A live region that
  // re-announces every second would make the page unusable with a screen
  // reader, so the digits below are hidden from it entirely.
  const spoken =
    c === null
      ? tr("Departure countdown loading")
      : c.days > 0
        ? tr("Departs in {n} days").replace("{n}", String(c.days))
        : tr("Departs in under a day");

  return (
    <div className={className}>
      <span className="sr-only">{spoken}</span>
      <div aria-hidden className="flex items-center gap-2 sm:gap-3">
        {units.map((u) => (
          <div
            key={u.label}
            className="min-w-[3.25rem] rounded-xl bg-cream/10 px-2.5 py-2 text-center ring-1 ring-inset ring-cream/15 backdrop-blur-sm sm:min-w-[3.75rem]"
          >
            <span className="block font-display text-xl font-semibold tabular-nums text-cream sm:text-2xl">
              {u.value === null ? "--" : String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 block text-[0.625rem] uppercase tracking-[0.15em] text-cream/60">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
