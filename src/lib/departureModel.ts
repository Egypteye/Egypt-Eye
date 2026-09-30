import type { WeeklyTrip } from "@/content/types";

// The shape of a Weekly Trips departure, and the rules for reading one.
//
// Deliberately free of any server import so the booking form and the seat
// pills — which are client components — can share the exact same definition
// of "sold out" as the page that rendered them. The fetchers live next door
// in departures.ts, which is server-only.
//
// Nothing here is stored. The database holds capacity, seats taken, a date
// and whether a human cancelled it; every label a visitor reads is computed
// from those four things at render time. A stored "sold out" flag would be
// wrong the moment someone cancelled.

export type DepartureRow = {
  id: string;
  trip_slug: string;
  departs_on: string;
  returns_on: string | null;
  departure_time: string | null;
  price_usd: number;
  child_price_usd: number | null;
  capacity: number;
  seats_taken: number;
  min_seats: number;
  booking_closes_at: string | null;
  status: "scheduled" | "cancelled" | "completed";
  cancellation_reason: string | null;
  meeting_point: string | null;
  note: string | null;
};

/**
 * What a visitor is actually looking at. Ordered by precedence — a cancelled
 * departure is cancelled whether or not it also happens to be full.
 */
export type DepartureState =
  | "cancelled"
  | "departed"
  | "closed"
  | "sold_out"
  | "almost_full"
  | "open";

export type Departure = {
  id: string;
  trip: WeeklyTrip;
  departsOn: string;
  returnsOn: string | null;
  departureTime: string | null;
  priceUsd: number;
  childPriceUsd: number | null;
  capacity: number;
  seatsTaken: number;
  seatsLeft: number;
  minSeats: number;
  /** Met the minimum, so it runs. The trade calls this a guaranteed departure. */
  guaranteed: boolean;
  /** How many more are needed before it's confirmed to run. 0 once guaranteed. */
  seatsToGuarantee: number;
  bookingClosesAt: string | null;
  state: DepartureState;
  /** True only when a booking can actually be made right now. */
  bookable: boolean;
  /** True when a sold-out departure can still take waitlist names. */
  waitlistable: boolean;
  cancellationReason: string | null;
  meetingPoint: string | null;
  note: string | null;
};

/** Below this many seats left we say so out loud, whatever the vehicle. */
export const ALMOST_FULL_THRESHOLD = 3;

/**
 * Whether to show the exact seat count rather than "Seats available".
 *
 * A flat threshold of 3 was written for a 12-to-14 seat coach and does not
 * survive a smaller vehicle: an 8-seat departure with 4 left is half sold and
 * genuinely scarce, but scored "open" and told visitors nothing. Meanwhile 4
 * of 14 is nearly full and was also silent.
 *
 * So the count appears once at least half the seats are gone, or once very few
 * remain in absolute terms. That keeps the original reasoning intact — the
 * number is hidden precisely while it would read as "nobody has booked this"
 * — and makes it scale to whatever is actually being driven.
 */
export function showsSeatCount(seatsLeft: number, capacity: number): boolean {
  return seatsLeft <= ALMOST_FULL_THRESHOLD || seatsLeft * 2 <= capacity;
}

/**
 * Today's date in Egypt.
 *
 * Departures are dates, not instants, and the date that matters is the one in
 * Cairo — a traveller in Los Angeles should not see tomorrow's Cairo departure
 * vanish because it is already past midnight where they are.
 */
export function todayInCairo(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
}

export function deriveDeparture(row: DepartureRow, trip: WeeklyTrip): Departure {
  const seatsLeft = Math.max(0, row.capacity - row.seats_taken);
  const guaranteed = row.seats_taken >= row.min_seats;
  const closed = row.booking_closes_at !== null && Date.now() >= Date.parse(row.booking_closes_at);
  const departed = row.status === "completed" || row.departs_on < todayInCairo();

  const state: DepartureState =
    row.status === "cancelled"
      ? "cancelled"
      : departed
        ? "departed"
        : closed
          ? "closed"
          : seatsLeft === 0
            ? "sold_out"
            : showsSeatCount(seatsLeft, row.capacity)
              ? "almost_full"
              : "open";

  return {
    id: row.id,
    trip,
    departsOn: row.departs_on,
    returnsOn: row.returns_on,
    departureTime: row.departure_time,
    priceUsd: Number(row.price_usd),
    childPriceUsd: row.child_price_usd === null ? null : Number(row.child_price_usd),
    capacity: row.capacity,
    seatsTaken: row.seats_taken,
    seatsLeft,
    minSeats: row.min_seats,
    guaranteed,
    seatsToGuarantee: Math.max(0, row.min_seats - row.seats_taken),
    bookingClosesAt: row.booking_closes_at,
    state,
    bookable: state === "open" || state === "almost_full",
    // A sold-out trip still wants the name. A cancelled or departed one does
    // not — there is nothing to be next in line for.
    waitlistable: state === "sold_out",
    cancellationReason: row.cancellation_reason,
    meetingPoint: row.meeting_point,
    note: row.note,
  };
}

/**
 * The cheapest bookable seat on each trip, for "from $X" on cards.
 *
 * Only counts departures someone could actually book — quoting a price from a
 * sold-out or closed date is how a catalogue stops being trusted. A trip with
 * nothing bookable gets no entry, and its card says dates are coming rather
 * than a number.
 */
export function fromPriceByTrip(departures: Departure[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const d of departures) {
    if (!d.bookable) continue;
    const current = out.get(d.trip.slug);
    if (current === undefined || d.priceUsd < current) out.set(d.trip.slug, d.priceUsd);
  }
  return out;
}

/** The soonest bookable departure per trip, for a card's headline date. */
export function nextDepartureByTrip(departures: Departure[]): Map<string, Departure> {
  const out = new Map<string, Departure>();
  for (const d of departures) {
    if (!d.bookable) continue;
    if (!out.has(d.trip.slug)) out.set(d.trip.slug, d);
  }
  return out;
}

/** "Sat 14 Nov 2026", in the visitor's language. */
export function formatDepartureDate(iso: string, locale: string, opts?: { withYear?: boolean }): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(opts?.withYear === false ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(d);
}

/** "November 2026" — the heading a group of departures sits under. */
export function formatDepartureMonth(iso: string, locale: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

/** How many nights away, phrased for a date range on a card. */
export function formatDateRange(departsOn: string, returnsOn: string | null, locale: string): string {
  const start = formatDepartureDate(departsOn, locale);
  if (!returnsOn || returnsOn === departsOn) return start;
  return `${formatDepartureDate(departsOn, locale, { withYear: false })} – ${formatDepartureDate(returnsOn, locale)}`;
}

/** Groups departures under their month, preserving the date order they arrive in. */
export function groupByMonth(departures: Departure[], locale: string): { month: string; departures: Departure[] }[] {
  const out: { month: string; departures: Departure[] }[] = [];
  for (const d of departures) {
    const month = formatDepartureMonth(d.departsOn, locale);
    const last = out[out.length - 1];
    if (last && last.month === month) last.departures.push(d);
    else out.push({ month, departures: [d] });
  }
  return out;
}
