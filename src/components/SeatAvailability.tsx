"use client";

import { useTr } from "@/i18n/LocaleProvider";
import type { Departure, DepartureState } from "@/lib/departureModel";

// The one place a departure's availability turns into words and a colour.
//
// Every surface that shows a departure - the hub list, the featured panel, a
// trip page, a card - renders this, so availability can never mean one thing
// in one place and something else in another. The state itself is computed in
// departureModel.ts; this only decides how to say it.
//
// =========================================================================
// WHY THERE IS NO SEAT COUNT HERE
// =========================================================================
// These pills used to print the real remaining number: "3 seats left". That
// was never fake - it came from the same row-locked inventory the booking API
// books against - but a public count is a public count, and the business has
// decided the website does not expose how full a vehicle is. A visitor sees
// whether they can still come, not the state of the order book.
//
// So: no remaining count, no seats-taken count, no proportion bar, and no
// "x of y". The one number that survives is in GuaranteeNote below, and it is
// a different fact for a different reason.
//
// scripts/check-weekly-trips.mts asserts this file contains no seat count, by
// rendering every state and reading the output.

const TONE: Record<DepartureState, string> = {
  open: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  // Deliberately not green. "Dates announced" is news, not an invitation to
  // click: a departure in this state has no price and no booking form.
  announced: "bg-sky-50 text-sky-900 ring-sky-600/20",
  almost_full: "bg-amber-50 text-amber-900 ring-amber-600/25",
  sold_out: "bg-rose-50 text-rose-800 ring-rose-600/20",
  closed: "bg-black/5 text-ink-soft ring-black/10",
  departed: "bg-black/5 text-ink-soft ring-black/10",
  cancelled: "bg-rose-50 text-rose-800 ring-rose-600/20",
};

/**
 * The pill.
 *
 * The six labels are written here as literal tr("...") calls rather than
 * looked up from a table, which looks like repetition and is not. The i18n
 * extractor finds translatable strings by scanning for exactly this call
 * shape, so a label held in an object and passed through tr() is invisible to
 * it and ships in English to the five other locales. That regression was
 * introduced here once already and caught by the check below.
 *
 * The check script reads these same literals back out of this function and
 * asserts that none of them can carry a number, so a lookup table was never
 * what made the rule enforceable.
 */
export function SeatPill({ departure, className = "" }: { departure: Departure; className?: string }) {
  const tr = useTr();
  const { state } = departure;

  const label =
    state === "cancelled"
      ? tr("Cancelled")
      : state === "announced"
        ? tr("Date announced")
      : state === "departed"
        ? tr("Departed")
        : state === "closed"
          ? tr("Booking closed")
          : state === "sold_out"
            ? tr("Fully booked")
            : state === "almost_full"
              ? tr("Almost full")
              : tr("Still available");

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
 * This is the one place a number survives, and it is deliberate. "Needs 2
 * more travellers to run" is not a scarcity signal - it points the opposite
 * way, at a trip that is emptier than it needs to be - and it answers a
 * question a traveller genuinely has before paying: will this go ahead at
 * all? Discovering the answer by email a week beforehand is the reason people
 * do not book a second time.
 *
 * It is a count of people still needed, never of seats still for sale, and
 * the two cannot be derived from one another without the capacity, which is
 * not published.
 */
export function GuaranteeNote({ departure, className = "" }: { departure: Departure; className?: string }) {
  const tr = useTr();
  // Not shown on a departure that is not yet on sale. "Needs 3 more
  // travellers to run" is a fact about a booking process that has not opened,
  // and it would publish the minimum group size for a date carrying no price.
  if (departure.state === "cancelled" || departure.state === "departed" || departure.state === "announced") {
    return null;
  }

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
  if (n <= 0) return null;
  return (
    <span className={`text-xs font-semibold text-ink-soft ${className}`}>
      {n === 1
        ? tr("Needs 1 more traveller to run")
        : tr("Needs {n} more travellers to run").replace("{n}", String(n))}
    </span>
  );
}
