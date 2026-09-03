// Time in Egypt Eye OS is Cairo time, because an operations day is a local
// day: "tomorrow's trips" means the trips on tomorrow's date in Egypt, no
// matter which timezone the person looking at the screen is sitting in.
//
// Every formatter here pins the timezone explicitly rather than relying on the
// server's locale, which on a cloud host is UTC and would silently move a
// 23:00 desert shoot onto the wrong day.

export const CAIRO_TZ = "Africa/Cairo";

const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: CAIRO_TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Today's date in Cairo, as YYYY-MM-DD. */
export function todayInCairo(): string {
  return dateFmt.format(new Date());
}

/** Shift a YYYY-MM-DD date string by a number of days, staying a date string. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = Date.parse(from + "T00:00:00Z");
  const b = Date.parse(to + "T00:00:00Z");
  return Math.round((b - a) / 86_400_000);
}

export function startOfWeek(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Egypt's working week runs Saturday to Thursday, so weeks start Saturday.
  const shift = (dt.getUTCDay() + 1) % 7;
  dt.setUTCDate(dt.getUTCDate() - shift);
  return dt.toISOString().slice(0, 10);
}

export function startOfMonth(isoDate: string): string {
  return isoDate.slice(0, 8) + "01";
}

export function endOfMonth(isoDate: string): string {
  const [y, m] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m, 0));
  return dt.toISOString().slice(0, 10);
}

const weekdayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: CAIRO_TZ, weekday: "short" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: CAIRO_TZ, day: "numeric", month: "short" });
const longDayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: CAIRO_TZ, weekday: "long", day: "numeric", month: "long" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { timeZone: CAIRO_TZ, month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: CAIRO_TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: CAIRO_TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
});

/** A date string (YYYY-MM-DD) as "Thu 4 Sep". */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const dt = new Date(isoDate + "T12:00:00Z");
  return `${weekdayFmt.format(dt)} ${dayFmt.format(dt)}`;
}

export function formatLongDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  return longDayFmt.format(new Date(isoDate + "T12:00:00Z"));
}

export function formatMonth(isoDate: string): string {
  return monthFmt.format(new Date(isoDate + "T12:00:00Z"));
}

/** A time column value (HH:MM:SS) as "06:30". */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "—";
  return time.slice(0, 5);
}

/** A timestamptz as "4 Sep, 06:30" in Cairo. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateTimeFmt.format(new Date(iso));
}

export function formatClock(iso: string | null | undefined): string {
  if (!iso) return "—";
  return timeFmt.format(new Date(iso));
}

/** "in 3 hours", "2 days ago" — for activity feeds and due dates. */
export function relativeTime(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "—";
  const diffMs = new Date(iso).getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60_000);
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  const sign = diffMs >= 0 ? 1 : -1;
  if (minutes < 1) return "just now";
  if (minutes < 60) return rtf.format(sign * minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(sign * hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(sign * days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(sign * months, "month");
  return rtf.format(sign * Math.round(months / 12), "year");
}

/** How a date reads on an operations board. */
export function dayLabel(isoDate: string, today = todayInCairo()): string {
  const delta = daysBetween(today, isoDate);
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta === -1) return "Yesterday";
  return formatDate(isoDate);
}

/**
 * The current instant, as a number.
 *
 * Wrapped rather than calling Date.now() inline because a Server Component's
 * render must be pure for React's compiler: reading the clock directly in a
 * component body is flagged, and hiding it behind a helper does not fix the
 * underlying concern — so callers use this once, at the top of a render, and
 * pass the value down rather than re-reading it per row.
 */
export function nowMs(): number {
  return Date.now();
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}
