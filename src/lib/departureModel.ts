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
  price_usd: number | null;
  child_price_usd: number | null;
  capacity: number;
  seats_taken: number;
  min_seats: number;
  booking_closes_at: string | null;
  status: "scheduled" | "cancelled" | "completed";
  cancellation_reason: string | null;
  meeting_point: string | null;
  note: string | null;
  instant_booking?: boolean | null;
  readiness?: "research" | "announced" | "open" | null;
  astro_event?: string | null;
  moon_illumination?: number | null;
  observing_window?: string | null;
};

/**
 * What a visitor is actually looking at. Ordered by precedence — a cancelled
 * departure is cancelled whether or not it also happens to be full.
 */
export type DepartureState =
  | "cancelled"
  | "departed"
  /**
   * A real, public date that cannot yet be booked.
   *
   * The stargazing calendar is fixed a year out by the Moon, and the price
   * for a night that far away is not known. Rather than invent one, the date
   * is announced and the booking form withheld until the business sets a
   * price by hand.
   */
  | "announced"
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
  /** Null until the business has set it by hand. Never a placeholder. */
  priceUsd: number | null;
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
  /**
   * Whether this departure takes its deposit online.
   *
   * The same two halves as every other product: a price makes it possible,
   * the switch makes it offered. A departure with the switch off still takes
   * bookings — it just takes them as requests the desk confirms, which is how
   * every Weekly Trip worked before deposits existed.
   */
  instantBooking: boolean;
  /** True when a sold-out departure can still take waitlist names. */
  waitlistable: boolean;
  cancellationReason: string | null;
  meetingPoint: string | null;
  note: string | null;
  /** "Geminid meteor shower", "Total solar eclipse", or null for an ordinary night. */
  astroEvent: string | null;
  /** Illuminated fraction of the Moon at local midnight, 0-1, or null. */
  moonIllumination: number | null;
  /** The hours worth being outside, in words: "22:00 to 03:00". */
  observingWindow: string | null;
};

/** Few enough left that "Almost full" is a true sentence, whatever the vehicle. */
export const ALMOST_FULL_THRESHOLD = 3;

/**
 * Whether this departure may be called "Almost full".
 *
 * This threshold used to be much looser - half the seats gone - because the
 * pill printed the actual number: "6 seats left" is honest at any fill level,
 * and the number was hidden only while it would have read as "nobody has
 * booked this".
 *
 * The public pills no longer carry a count, which changes what the threshold
 * has to mean. A bare "Almost full" on a half-sold vehicle is not a quieter
 * version of the truth, it is a scarcity claim the data does not support -
 * the exact thing this brand refuses to do. So it is now a quarter of the
 * vehicle or three seats, whichever is fewer, and the label is a fact rather
 * than a nudge.
 *
 * Exported so the check script asserts against this rule rather than against
 * a threshold retyped beside it.
 */
export function isAlmostFull(seatsLeft: number, capacity: number): boolean {
  if (seatsLeft <= 0) return false;
  return seatsLeft <= Math.min(ALMOST_FULL_THRESHOLD, Math.max(1, Math.floor(capacity / 4)));
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

  // A departure is sellable only when the business has said so AND set a
  // price. Both halves matter: readiness is the deliberate act, and the price
  // is the thing that cannot be faked. A row that is somehow marked open with
  // no price is treated as merely announced rather than trusted - the
  // database constraint should make that impossible, and this is what holds
  // if it ever does not.
  const priceUsd = row.price_usd === null || row.price_usd === undefined ? null : Number(row.price_usd);
  const readiness = row.readiness ?? "open";
  const sellable = readiness === "open" && priceUsd !== null;

  const state: DepartureState =
    row.status === "cancelled"
      ? "cancelled"
      : departed
        ? "departed"
        : !sellable
          ? "announced"
          : closed
            ? "closed"
            : seatsLeft === 0
              ? "sold_out"
              : isAlmostFull(seatsLeft, row.capacity)
                ? "almost_full"
                : "open";

  return {
    id: row.id,
    trip,
    departsOn: row.departs_on,
    returnsOn: row.returns_on,
    departureTime: row.departure_time,
    priceUsd,
    instantBooking: row.instant_booking === true && priceUsd !== null && priceUsd > 0,
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
    astroEvent: row.astro_event ?? null,
    moonIllumination:
      row.moon_illumination === null || row.moon_illumination === undefined
        ? null
        : Number(row.moon_illumination),
    observingWindow: row.observing_window ?? null,
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
    if (!d.bookable || d.priceUsd === null) continue;
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

// ---------------------------------------------------------------------------
// THE FEATURED DEPARTURE, AND THE CLOCK THAT COUNTS DOWN TO IT
//
// Both are pure functions on departure data, deliberately: the hub, the
// countdown component and the check script all have to agree about which
// departure is "next" and when it leaves, and the only way to guarantee that
// is for them to call the same code rather than each reimplementing it.
// ---------------------------------------------------------------------------

/**
 * The departure the page leads with.
 *
 * Rules, in order:
 *   1. It must be bookable. The featured slot is the one conversion-focused
 *      section on the page, so pointing it at a sold-out or closed date
 *      spends the best position on something nobody can buy.
 *   2. Soonest first - that is what "next departure" means to a visitor.
 *   3. Ties broken by id, so two departures on the same date always resolve
 *      to the same one. Without this the featured trip could differ between
 *      two renders of the same data, and the countdown with it.
 *
 * Returns null when nothing is bookable, which the page treats as a real
 * state with its own copy rather than as an error. A sold-out or closed
 * departure is never promoted here; it still appears in the calendar below,
 * which is where someone holding a booking for it will look.
 */
export function selectFeaturedDeparture(departures: Departure[]): Departure | null {
  // A bookable date first - the featured slot is the page's one
  // conversion-focused section, and a date somebody can buy belongs there
  // ahead of one they cannot.
  //
  // Failing that, the soonest ANNOUNCED date. A year of real, dated
  // departures with no price yet is still the most useful thing on the page,
  // and leading with "no dates scheduled" while holding fourteen of them
  // would be false. The panel renders an announced departure without a price
  // or a booking button, so nothing is oversold by promoting it.
  //
  // Sold-out, closed, cancelled and departed dates are never featured: they
  // are not leads, and they stay visible in the calendar below where anyone
  // holding a booking will look.
  return pickSoonest(departures.filter((d) => d.bookable))
    ?? pickSoonest(departures.filter((d) => d.state === "announced"));
}

/** Soonest by date, ties broken by id so the choice is stable across renders. */
function pickSoonest(candidates: Departure[]): Departure | null {
  if (candidates.length === 0) return null;
  return candidates.reduce((best, d) => {
    if (d.departsOn !== best.departsOn) return d.departsOn < best.departsOn ? d : best;
    return d.id < best.id ? d : best;
  });
}

/**
 * The offset of a time zone at a given instant, in milliseconds.
 *
 * Egypt reintroduced daylight saving in 2023, so Africa/Cairo is +02:00 for
 * part of the year and +03:00 for the rest. A hardcoded offset would put
 * every countdown an hour out for half the season, which is exactly the kind
 * of error nobody notices until a traveller misses a pickup.
 */
function zoneOffsetMs(utcMs: number, timeZone: string): number {
  // Intl throws a RangeError on a non-finite instant. Everything downstream
  // of this is a page render, so it returns 0 and lets departureInstantMs
  // hand back NaN, which callers already have to handle.
  if (!Number.isFinite(utcMs)) return 0;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));

  const at: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") at[p.type] = Number(p.value);
  // hour comes back as 24 at midnight under hour12:false in some runtimes.
  const asIfUtc = Date.UTC(at.year!, at.month! - 1, at.day!, at.hour! % 24, at.minute!, at.second!);
  return asIfUtc - utcMs;
}

/**
 * A leading clock time in the free-text departure_time field, or null.
 *
 * The column is text, not `time` - it holds things like "06:30, Cairo" and
 * "Pickups from 6am" - so this reads a leading HH:MM and otherwise gives up.
 * Half-understanding "Pickups from 6am" would produce a countdown that is
 * confidently wrong, which is worse than one that counts to the start of the
 * departure day and says so.
 */
export function parseDepartureClock(departureTime: string | null): { hour: number; minute: number } | null {
  if (!departureTime) return null;
  const m = /^\s*(\d{1,2}):(\d{2})/.exec(departureTime);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/**
 * The instant a departure leaves, as epoch milliseconds.
 *
 * Built from the Cairo wall clock, because that is the clock the group meets
 * on. Where no usable time is recorded this is the start of the departure day
 * in Cairo - the countdown then measures time until departure day, which is
 * true, rather than inventing a pickup hour nobody agreed to.
 *
 * The two-pass offset correction handles the hour either side of a daylight
 * saving change, where the offset at the guessed instant and the offset at
 * the real instant differ.
 */
export function departureInstantMs(departsOn: string, departureTime: string | null): number {
  // NaN rather than a throw, for a date this cannot read. A malformed
  // departs_on is a bad row, not a reason for the whole Weekly Trips page to
  // return a 500 — the same choice departures.ts makes when Supabase is
  // unreachable. Callers test the result with Number.isFinite and simply
  // render no clock.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(departsOn);
  if (!m) return Number.NaN;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const clock = parseDepartureClock(departureTime);
  const naive = Date.UTC(y, mo - 1, d, clock?.hour ?? 0, clock?.minute ?? 0);
  let utc = naive - zoneOffsetMs(naive, "Africa/Cairo");
  utc = naive - zoneOffsetMs(utc, "Africa/Cairo");
  return utc;
}

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

/**
 * How long until a departure, never negative.
 *
 * Once the instant has passed this reports `done`, and every unit is zero.
 * The page uses `done` to stop rendering a clock, not to decide that the trip
 * is over: whether a departure is still upcoming is decided by its date and
 * status in deriveDeparture, which is the single authority. A countdown
 * reaching zero and a departure being finished are two different facts that
 * happen to coincide.
 */
export function countdownTo(targetMs: number, nowMs: number): Countdown {
  const ms = targetMs - nowMs;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  };
}
