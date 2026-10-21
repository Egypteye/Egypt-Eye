// Egypt Eye OS — the rules, with no database and no React attached.
//
// Everything here is a pure function so that scripts/check-os.mts can assert
// it offline. The parts of this tool that are expensive to get wrong are all
// arithmetic and dates: what a guest still owes, which day a driver is being
// sent to, and whether today is the day to chase a lead. None of those should
// have to be discovered in production.

// ---------------------------------------------------------------------------
// Dates
//
// Every date in the OS is a plain 'YYYY-MM-DD' string, exactly as Postgres
// stores a `date`. They are never turned into a Date and back for arithmetic,
// because that silently involves the server's timezone: `new Date("2026-10-21")`
// is midnight UTC, and in any timezone west of London it formats back as the
// 20th. The day sheet being off by one is not a cosmetic bug — it is a driver
// sent on the wrong morning.
// ---------------------------------------------------------------------------

/** The timezone the company actually operates in. */
export const OPS_TIMEZONE = "Africa/Cairo";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  // Rejects 2026-02-30 and friends: the round trip only survives a real date.
  const [y, m, d] = value.split("-").map(Number);
  const asUtc = new Date(Date.UTC(y, m - 1, d));
  return asUtc.getUTCFullYear() === y && asUtc.getUTCMonth() === m - 1 && asUtc.getUTCDate() === d;
}

/**
 * Today in Cairo, not today on the server.
 *
 * Vercel runs in UTC, so between midnight and 2am Cairo time
 * `new Date().toISOString().slice(0, 10)` still reads as yesterday. The team
 * opening the day sheet at 6am would be fine; the one checking tomorrow's
 * pick-ups at 1am would be shown the wrong sheet, and the follow-up list
 * would call a lead overdue a day early. en-CA is used because its short date
 * format is already YYYY-MM-DD.
 */
export function todayInCairo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OPS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Calendar arithmetic in UTC, so no local offset can shift the result. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const ms = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd);
  return Math.round(ms / 86_400_000);
}

/**
 * The dates a multi-day booking occupies, inclusive of both ends.
 *
 * This is what turns "a 4-day trip starting the 19th" into the four day-sheet
 * rows the ground crew needs, and it is why the operations spreadsheet has a
 * tab per date. Capped because a typo in the end date should produce an error
 * the user can read, not sixty thousand rows.
 */
export const MAX_BOOKING_DAYS = 60;

export function expandDates(startDate: string, endDate: string): string[] {
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
    throw new Error("expandDates needs two YYYY-MM-DD dates");
  }
  const span = daysBetween(startDate, endDate);
  if (span < 0) throw new Error("The last day cannot be before the first day.");
  if (span + 1 > MAX_BOOKING_DAYS) {
    throw new Error(`That is ${span + 1} days — check the dates.`);
  }
  const out: string[] = [];
  for (let i = 0; i <= span; i += 1) out.push(addDays(startDate, i));
  return out;
}

/** "Mon 19 Oct 2026" — unambiguous, and never the American month-first order. */
export function formatDate(date: string): string {
  if (!isIsoDate(date)) return date;
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Postgres hands back 'HH:MM:SS'; a pick-up time only ever needs 'HH:MM'. */
export function formatTime(time: string | null): string | null {
  if (!time) return null;
  const match = /^(\d{2}):(\d{2})/.exec(time);
  return match ? `${match[1]}:${match[2]}` : time;
}

// ---------------------------------------------------------------------------
// Money — whole cents, start to finish.
//
// Every money column in this project is integer cents, and so is every figure
// here. There is exactly one conversion, at the form, by usdToCents() from
// @/lib/booking/quote — the project's single authority on turning a typed
// price into money. Nothing below multiplies or divides by 100, so nothing
// below can introduce a rounding error, and formatCents() from the same
// module is the only thing that renders one.
// ---------------------------------------------------------------------------

export { formatCents, usdToCents } from "@/lib/booking/quote";

import { formatCents } from "@/lib/booking/quote";

/**
 * What the guest still owes, in cents.
 *
 * The database computes this as a generated column, so this exists for forms
 * and previews rather than as a second source of truth. It is the same
 * subtraction on purpose: the operations sheet keeps Remaining as a third
 * typed-in number, which is how a sheet comes to claim a guest owes money
 * they have already paid. Integer in, integer out — no rounding step to get
 * wrong.
 */
export function remainingCents(totalCents: number, depositCents: number): number {
  return totalCents - depositCents;
}

/**
 * Totals for a set of day rows, in cents.
 *
 * Takes each booking ONCE, however many of its days are in the set. This is
 * the whole reason money does not live on the day row: a four-day booking
 * appears on four day sheets, and adding up the rows would report the week at
 * four times its real value. Passed the day rows the screen is showing, it
 * answers what that day is actually worth.
 */
export function totalsForDays(
  days: { bookingId: string; totalCents: number; depositCents: number }[],
): { bookings: number; totalCents: number; depositCents: number; remainingCents: number } {
  const seen = new Map<string, { totalCents: number; depositCents: number }>();
  for (const day of days) {
    if (!seen.has(day.bookingId)) {
      seen.set(day.bookingId, { totalCents: day.totalCents, depositCents: day.depositCents });
    }
  }
  let totalCents = 0;
  let depositCents = 0;
  for (const booking of seen.values()) {
    totalCents += booking.totalCents;
    depositCents += booking.depositCents;
  }
  return {
    bookings: seen.size,
    totalCents,
    depositCents,
    remainingCents: remainingCents(totalCents, depositCents),
  };
}

// ---------------------------------------------------------------------------
// Follow-ups
// ---------------------------------------------------------------------------

export type FollowUpState = "overdue" | "today" | "soon" | "later" | "unscheduled";

/**
 * Where a lead sits relative to today — the sort order of the reminders
 * screen, and the only thing the paper list cannot do for itself.
 *
 * "soon" is the next seven days, which is the window the desk's own list
 * works in: the real rows are chased at two to fourteen day intervals.
 */
export function followUpState(nextFollowUpOn: string | null, today: string): FollowUpState {
  if (!nextFollowUpOn) return "unscheduled";
  const delta = daysBetween(today, nextFollowUpOn);
  if (delta < 0) return "overdue";
  if (delta === 0) return "today";
  if (delta <= 7) return "soon";
  return "later";
}

/** Overdue first, then today, then the rest — the order to work down. */
const STATE_ORDER: Record<FollowUpState, number> = {
  overdue: 0,
  today: 1,
  soon: 2,
  later: 3,
  unscheduled: 4,
};

export function compareFollowUps(
  a: { nextFollowUpOn: string | null },
  b: { nextFollowUpOn: string | null },
  today: string,
): number {
  const byState = STATE_ORDER[followUpState(a.nextFollowUpOn, today)] - STATE_ORDER[followUpState(b.nextFollowUpOn, today)];
  if (byState !== 0) return byState;
  // Within a band, the longest-waiting lead first. An unscheduled lead has no
  // date to sort by and keeps its arrival order.
  if (!a.nextFollowUpOn || !b.nextFollowUpOn) return 0;
  return a.nextFollowUpOn < b.nextFollowUpOn ? -1 : a.nextFollowUpOn > b.nextFollowUpOn ? 1 : 0;
}

/** Plain English for a date, so nobody has to count days in their head. */
export function describeFollowUp(nextFollowUpOn: string | null, today: string): string {
  if (!nextFollowUpOn) return "No follow-up set";
  const delta = daysBetween(today, nextFollowUpOn);
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta === -1) return "1 day overdue";
  if (delta < 0) return `${-delta} days overdue`;
  return `In ${delta} days`;
}

// ---------------------------------------------------------------------------
// Suggestions
//
// These are suggestions, never constraints. The columns they fill are free
// text in the database because the reservations desk writes "B" in the
// platform column of its paper list every day and nobody has yet told us what
// it stands for. A hard list here would refuse a value the team uses daily,
// so the UI offers the known ones and accepts anything.
// ---------------------------------------------------------------------------

export const PLATFORM_SUGGESTIONS = [
  "WhatsApp",
  "Email",
  "Instagram",
  "TikTok",
  "Booking.com",
  "Airbnb",
  "Referral",
  "Website",
] as const;

export const SOURCE_SUGGESTIONS = ["Egypt Eye", "Airbnb", "Booking.com", "Referral", "Other"] as const;

export const SERVICE_TYPE_SUGGESTIONS = [
  "Tour",
  "Photoshoot",
  "Flying dress",
  "Tour + Photoshoot",
  "Transfer",
] as const;

export const LOCATION_SUGGESTIONS = [
  "Pyramids of Giza",
  "Old Cairo",
  "Luxor",
  "Aswan",
  "Alexandria",
  "Dahshur",
  "Saqqara",
] as const;

export const INCLUSION_SUGGESTIONS = [
  "Camel",
  "Horse",
  "Jumping Horse",
  "Running Horse",
  "Quad bike",
  "Pro Reels",
  "Private transportation",
  "Entry tickets",
  "Lunch",
  "Tour guide",
  "Felucca",
] as const;

/**
 * Reads an inclusions field typed by a human into a clean list.
 *
 * Accepts commas or newlines, because both are what people type, and drops
 * blanks and duplicates so the array in the database stays countable.
 */
export function parseInclusions(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,\n]/)) {
    const value = part.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

// ---------------------------------------------------------------------------
// The WhatsApp hand-off
//
// Today a booking is confirmed and then re-typed into a WhatsApp group so the
// ground crew knows who to collect. The OS cannot post into that group on its
// own: sending to a WhatsApp group needs the WhatsApp Business Cloud API,
// which is a paid Meta product with its own number registration and approved
// message templates, and none of that is set up. Rather than build a Send
// button that quietly does nothing, this composes the exact message and the
// screen offers it to be copied. If the Business API is ever configured, this
// function is already the message body and only the transport changes.
// ---------------------------------------------------------------------------

export type WhatsAppBooking = {
  ref: string;
  guestName: string;
  guestPhone: string | null;
  pax: number;
  serviceType: string | null;
  source: string | null;
  totalCents: number;
  depositCents: number;
  notes: string | null;
};

export type WhatsAppDay = {
  serviceDate: string;
  serviceType: string | null;
  serviceLocation: string | null;
  pickupTime: string | null;
  pickupLocation: string | null;
  operatorName: string | null;
  guideName: string | null;
  inclusions: string[];
  notes: string | null;
};

export function whatsappMessage(booking: WhatsAppBooking, days: WhatsAppDay[]): string {
  const lines: string[] = [];

  lines.push(`*${booking.ref} — ${booking.guestName}*`);
  lines.push(`Guests: ${booking.pax}`);
  if (booking.guestPhone) lines.push(`Phone: ${booking.guestPhone}`);
  if (booking.serviceType) lines.push(`Service: ${booking.serviceType}`);
  if (booking.source) lines.push(`Booked via: ${booking.source}`);

  const ordered = [...days].sort((a, b) => (a.serviceDate < b.serviceDate ? -1 : 1));
  for (const day of ordered) {
    lines.push("");
    const heading = day.serviceType ? `${formatDate(day.serviceDate)} — ${day.serviceType}` : formatDate(day.serviceDate);
    lines.push(`*${heading}*`);
    if (day.serviceLocation) lines.push(`Where: ${day.serviceLocation}`);
    // "to be confirmed" rather than a blank line: a missing pick-up time is
    // the single most common reason a crew calls the desk at 6am, and saying
    // it is missing is more useful than leaving the line out.
    lines.push(`Pick-up: ${formatTime(day.pickupTime) ?? "to be confirmed"}${day.pickupLocation ? ` — ${day.pickupLocation}` : ""}`);
    if (day.operatorName) lines.push(`Driver: ${day.operatorName}`);
    if (day.guideName) lines.push(`Guide: ${day.guideName}`);
    if (day.inclusions.length > 0) lines.push(`Includes: ${day.inclusions.join(", ")}`);
    if (day.notes) lines.push(`Note: ${day.notes}`);
  }

  lines.push("");
  lines.push(`*Payment*`);
  lines.push(`Total: ${formatCents(booking.totalCents)}`);
  lines.push(`Deposit paid: ${formatCents(booking.depositCents)}`);
  const due = remainingCents(booking.totalCents, booking.depositCents);
  lines.push(due > 0 ? `TO COLLECT: ${formatCents(due)}` : "Paid in full — collect nothing.");

  if (booking.notes) {
    lines.push("");
    lines.push(`Notes: ${booking.notes}`);
  }

  return lines.join("\n");
}
