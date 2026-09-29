"use client";

import { useTr } from "@/i18n/LocaleProvider";
import type { Departure, DepartureState } from "@/lib/departureModel";

// The one place a departure's availability turns into words and a colour.
//
// Every surface that shows a departure — the hub list, the trip page, a card
// — renders this, so "3 seats left" can never mean one thing in one place and
// something else in another. The state itself is computed in
// departureModel.ts; this only decides how to say it.

const TONE: Record<DepartureState, string> = {
  open: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  almost_full: "bg-amber-50 text-amber-900 ring-amber-600/25",
  sold_out: "bg-rose-50 text-rose-800 ring-rose-600/20",
  closed: "bg-black/5 text-ink-soft ring-black/10",
  departed: "bg-black/5 text-ink-soft ring-black/10",
  cancelled: "bg-rose-50 text-rose-800 ring-rose-600/20",
};

/**
 * The seat count, or why there isn't one.
 *
 * Exact numbers are shown only once they are low enough to matter. "9 of 12
 * seats left" on a trip two months out is noise that also quietly tells every
 * visitor how empty it is; "Seats available" is the same fact without the
 * discouragement. Below the threshold the exact number is the useful thing,
 * and it is true, so it is shown.
 */
export function SeatPill({ departure, className = "" }: { departure: Departure; className?: string }) {
  const tr = useTr();
  const { state, seatsLeft } = departure;

  const label =
    state === "cancelled"
      ? tr("Cancelled")
      : state === "departed"
        ? tr("Departed")
        : state === "closed"
          ? tr("Bookings closed")
          : state === "sold_out"
            ? tr("Sold out")
            : state === "almost_full"
              ? seatsLeft === 1
                ? tr("1 seat left")
                : tr("{n} seats left").replace("{n}", String(seatsLeft))
              : tr("Seats available");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE[state]} ${className}`}
    >
      {state === "almost_full" && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

/**
 * Whether the trip is actually going to run.
 *
 * Shown because the honest version converts better than hiding it. "Needs 2
 * more travellers" is a reason to bring a friend and a reason to book now;
 * discovering the same fact by email a week before departure is a reason not
 * to book again.
 */
export function GuaranteeNote({ departure, className = "" }: { departure: Departure; className?: string }) {
  const tr = useTr();
  if (departure.state === "cancelled" || departure.state === "departed") return null;

  if (departure.guaranteed) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 ${className}`}>
        <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
          <path d="M6.2 11.3 3.5 8.6l.9-.9 1.8 1.8 5.4-5.4.9.9z" />
        </svg>
        {tr("Confirmed to run")}
      </span>
    );
  }

  const n = departure.seatsToGuarantee;
  return (
    <span className={`text-xs font-semibold text-ink-soft ${className}`}>
      {n === 1
        ? tr("Needs 1 more traveller to run")
        : tr("Needs {n} more travellers to run").replace("{n}", String(n))}
    </span>
  );
}

/**
 * A thin bar of how full the trip is.
 *
 * Purely reinforcement for the pill beside it — hidden from assistive tech,
 * since the number is already in the text and a duplicate reading of it is
 * noise rather than information.
 */
export function SeatBar({ departure }: { departure: Departure }) {
  if (departure.state === "cancelled" || departure.state === "departed") return null;
  const pct = departure.capacity > 0 ? Math.min(100, Math.round((departure.seatsTaken / departure.capacity) * 100)) : 0;
  const full = departure.seatsLeft === 0;
  return (
    <div aria-hidden className="h-1 w-full overflow-hidden rounded-full bg-black/10">
      <div
        className={`h-full rounded-full transition-all ${full ? "bg-rose-500/70" : pct >= 70 ? "bg-amber-500/80" : "bg-emerald-600/70"}`}
        style={{ width: `${Math.max(pct, 4)}%` }}
      />
    </div>
  );
}
