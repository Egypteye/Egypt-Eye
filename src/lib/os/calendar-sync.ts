import "server-only";
import { createHash } from "node:crypto";
import { osdb, getOrg } from "./db";
import { CAIRO_TZ, formatTime } from "./dates";
import { googleConfigured } from "./google/auth";
import { insertEvent, patchEvent, deleteEvent, CalendarApiError, type CalendarEvent } from "./google/calendar";

// ---------------------------------------------------------------------------
// PUBLISHING TRIPS TO GOOGLE CALENDAR
// ---------------------------------------------------------------------------
// One direction only: the OS decides, Google displays. See the header of
// migration 0025 for why, and for why this is a queue rather than an inline
// call at the moment somebody saves a trip.
//
// The shape of the work:
//
//   queueTripPublish(tripId)   cheap, never throws, called from trip actions
//   publishPending(limit)      called by the hourly sweep; talks to Google
//   publishTripNow(tripId)     the "Publish now" button in Admin
//
// A trip action calling queueTripPublish must never fail because of it. A
// reservations agent moving a trip to Thursday is doing something real; the
// calendar is a convenience laid on top, and it does not get a vote on whether
// their save succeeds.
// ---------------------------------------------------------------------------

export const CALENDAR_SCOPE_NOTE =
  "One-way. The OS is the schedule; the Google event is a copy of it that gets overwritten on the next publish.";

export function calendarId(): string | null {
  return process.env.GOOGLE_CALENDAR_ID?.trim() || null;
}

/** Whether this deployment can publish at all — credentials AND a target. */
export function calendarPublishingConfigured(): boolean {
  return googleConfigured() && calendarId() !== null;
}

// ---------------------------------------------------------------------------
// WHICH TRIPS BELONG IN A CREW MEMBER'S CALENDAR
// ---------------------------------------------------------------------------
const DEFAULT_PUBLISH_STATUSES = ["confirmed", "planning", "assigned", "ready", "in_progress"];

async function publishStatuses(orgId: string): Promise<string[]> {
  const { data } = await osdb()
    .from("os_settings").select("value").eq("org_id", orgId).eq("key", "calendar.publish_statuses").maybeSingle();
  const value = data?.value;
  return Array.isArray(value) && value.every((v) => typeof v === "string") ? (value as string[]) : DEFAULT_PUBLISH_STATUSES;
}

async function maxAttempts(orgId: string): Promise<number> {
  const { data } = await osdb()
    .from("os_settings").select("value").eq("org_id", orgId).eq("key", "calendar.max_attempts").maybeSingle();
  const n = Number(data?.value);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

// ---------------------------------------------------------------------------
// THE EVENT
// ---------------------------------------------------------------------------
type TripForCalendar = {
  id: string;
  ref: string;
  title: string;
  status: string;
  trip_date: string;
  starts_at: string | null;
  ends_at: string | null;
  start_time: string | null;
  end_time: string | null;
  pickup_location: string | null;
  pickup_time: string | null;
  dropoff_location: string | null;
  guests_adults: number;
  guests_children: number;
  readiness_state: string;
  special_requests: string | null;
  os_locations: { name: string } | null;
  os_trip_types: { name: string } | null;
  os_clients: { full_name: string } | null;
};

// Status → Google's fixed palette. Chosen so a glance at a week says the one
// thing a driver needs: is this locked in, or is somebody still arranging it.
const COLOUR: Record<string, string> = {
  confirmed: "9",   // blueberry
  planning: "7",    // peacock
  assigned: "5",    // banana
  ready: "10",      // basil — green, go
  in_progress: "6", // tangerine
};

function eventFor(trip: TripForCalendar, crew: string[], siteUrl: string | null): CalendarEvent {
  const guests = trip.guests_adults + trip.guests_children;
  const location = trip.os_locations?.name ?? trip.pickup_location ?? undefined;

  // What a person actually needs on a phone at 5am, in the order they need it.
  // Deliberately NOT here: client phone numbers and emails. A shared calendar
  // is the loosest container in the company — anyone it is shared with, now or
  // later, reads everything on it forever.
  const lines: string[] = [];
  if (trip.os_trip_types?.name) lines.push(trip.os_trip_types.name);
  if (guests > 0) {
    lines.push(`${guests} guest${guests === 1 ? "" : "s"}${trip.guests_children ? ` (${trip.guests_children} children)` : ""}`);
  }
  if (trip.os_clients?.full_name) lines.push(`Client: ${trip.os_clients.full_name}`);
  if (trip.pickup_location) {
    lines.push(`Pickup: ${trip.pickup_location}${trip.pickup_time ? ` at ${formatTime(trip.pickup_time)}` : ""}`);
  }
  if (trip.dropoff_location) lines.push(`Drop-off: ${trip.dropoff_location}`);
  if (crew.length) lines.push(`Crew: ${crew.join(", ")}`);
  if (trip.special_requests) lines.push(`Requests: ${trip.special_requests}`);
  if (trip.readiness_state !== "green") {
    lines.push(trip.readiness_state === "red" ? "⚠ Not ready — details may still change" : "Some details are still being arranged");
  }
  lines.push("");
  lines.push(siteUrl ? `Full details: ${siteUrl}/os/trips/${trip.ref}` : `Full details: ${trip.ref} in Egypt Eye OS`);
  lines.push("");
  lines.push("Published from Egypt Eye OS. Editing this event changes nothing — the OS overwrites it.");

  // A trip with no time is a real thing — a date is agreed before an hour is —
  // and it belongs on the calendar as an all-day entry rather than being
  // invented into a 9am slot that nobody agreed to.
  const timed = Boolean(trip.starts_at && trip.ends_at);
  const start = timed
    ? { dateTime: new Date(trip.starts_at as string).toISOString(), timeZone: CAIRO_TZ }
    : { date: trip.trip_date };
  const end = timed
    ? { dateTime: new Date(trip.ends_at as string).toISOString(), timeZone: CAIRO_TZ }
    : { date: trip.trip_date };

  return {
    summary: `${trip.ref} — ${trip.title}`,
    description: lines.join("\n"),
    location,
    start,
    end,
    colorId: COLOUR[trip.status],
    status: "confirmed",
    transparency: "opaque",
    extendedProperties: { private: { osTripId: trip.id, osRef: trip.ref, osSource: "egypt-eye-os" } },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 12 * 60 }, { method: "popup", minutes: 60 }] },
  };
}

/** Stable fingerprint of everything published, so an unchanged trip costs nothing. */
function hashOf(event: CalendarEvent): string {
  return createHash("sha256").update(JSON.stringify(event)).digest("hex").slice(0, 32);
}

const TRIP_SELECT =
  "id, ref, title, status, trip_date, starts_at, ends_at, start_time, end_time, pickup_location, pickup_time, " +
  "dropoff_location, guests_adults, guests_children, readiness_state, special_requests, " +
  "os_locations (name), os_trip_types (name), os_clients (full_name)";

async function crewNames(tripId: string): Promise<string[]> {
  const { data } = await osdb()
    .from("os_trip_assignments")
    .select("role_key, os_employees (full_name)")
    .eq("trip_id", tripId)
    .in("status", ["assigned", "confirmed"]);
  return (data ?? [])
    .map((row) => (row.os_employees as { full_name?: string } | null)?.full_name)
    .filter((name): name is string => Boolean(name));
}

// ---------------------------------------------------------------------------
// THE QUEUE
// ---------------------------------------------------------------------------

/**
 * Marks a trip as needing a publish. Safe to call from anywhere, including
 * inside a transaction that matters more than this does — it swallows its own
 * errors on purpose, because a calendar row failing to queue must never be the
 * reason a trip edit reports failure to the person who made it.
 */
export async function queueTripPublish(tripId: string): Promise<void> {
  if (!calendarPublishingConfigured()) return;
  try {
    const target = calendarId();
    if (!target) return;
    const org = await getOrg();
    const db = osdb();

    const { data: existing } = await db
      .from("os_calendar_links")
      .select("id, state")
      .eq("trip_id", tripId).eq("provider", "google").eq("calendar_id", target)
      .maybeSingle();

    if (existing) {
      // 'removed' stays removed until something re-publishes it deliberately;
      // anything else goes back in the queue with its attempt count reset, so
      // a fresh edit gets a fresh set of retries rather than inheriting the
      // exhausted ones from a problem that may since have been fixed.
      await db.from("os_calendar_links")
        .update({ state: "pending", attempts: 0, last_error: null })
        .eq("id", existing.id);
    } else {
      await db.from("os_calendar_links").insert({
        org_id: org.id, trip_id: tripId, provider: "google", calendar_id: target, state: "pending",
      });
    }
  } catch {
    // Deliberately silent. The hourly sweep re-queues anything it finds out of
    // step, so a missed queue write self-heals within the hour.
  }
}

/** Marks a trip's event for deletion — cancelled, or no longer publishable. */
export async function queueTripRemoval(tripId: string): Promise<void> {
  if (!calendarPublishingConfigured()) return;
  try {
    await osdb().from("os_calendar_links")
      .update({ state: "removing", attempts: 0, last_error: null })
      .eq("trip_id", tripId).eq("provider", "google")
      .not("event_id", "is", null)
      .in("state", ["pending", "synced", "failed"]);
  } catch {
    /* same reasoning as queueTripPublish */
  }
}

// ---------------------------------------------------------------------------
// THE PUBLISHER
// ---------------------------------------------------------------------------

export type PublishResult = {
  configured: boolean;
  created: number;
  updated: number;
  deleted: number;
  unchanged: number;
  failed: number;
  errors: string[];
};

const EMPTY: PublishResult = { configured: false, created: 0, updated: 0, deleted: 0, unchanged: 0, failed: 0, errors: [] };

/**
 * Works the queue. Called by the hourly sweep, and by the Admin button.
 *
 * `limit` exists because a serverless function has a wall clock, and because
 * the first run after connecting Google will have a queue the size of the
 * whole trip list. Publishing a hundred events in one invocation is how you
 * find out what Google's rate limit is; publishing twenty an hour is how you
 * never need to know.
 */
export async function publishPending(limit = 25): Promise<PublishResult> {
  if (!calendarPublishingConfigured()) return { ...EMPTY };

  // Deliberately NOT filtered to the currently-configured calendar: a row
  // written before GOOGLE_CALENDAR_ID changed still points at the old one, and
  // that is exactly the row that needs working — to delete the event stranded
  // there. Each row carries the calendar it belongs to.
  const org = await getOrg();
  const db = osdb();
  const statuses = await publishStatuses(org.id);
  const attemptCap = await maxAttempts(org.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || null;

  const result: PublishResult = { ...EMPTY, configured: true, errors: [] };

  const { data: due } = await db
    .from("os_calendar_links")
    .select("id, trip_id, calendar_id, event_id, content_hash, state, attempts")
    .eq("org_id", org.id)
    .in("state", ["pending", "removing"])
    .order("last_attempt_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  for (const link of due ?? []) {
    const attempts = (link.attempts as number) + 1;
    const stamp = new Date().toISOString();

    try {
      if (link.state === "removing") {
        if (link.event_id) await deleteEvent(link.calendar_id as string, link.event_id as string);
        await db.from("os_calendar_links")
          .update({ state: "removed", event_id: null, event_etag: null, content_hash: null,
                    attempts, last_attempt_at: stamp, synced_at: stamp, last_error: null })
          .eq("id", link.id);
        result.deleted += 1;
        continue;
      }

      const { data: tripRow } = await db
        .from("os_trips").select(TRIP_SELECT).eq("id", link.trip_id).maybeSingle();
      const trip = tripRow as unknown as TripForCalendar | null;

      // The trip is gone, or has left the publishable set (cancelled, closed,
      // back to draft). Either way its event should not be sitting in a
      // calendar implying work that is not happening.
      if (!trip || !statuses.includes(trip.status)) {
        if (link.event_id) {
          await deleteEvent(link.calendar_id as string, link.event_id as string);
          result.deleted += 1;
        }
        await db.from("os_calendar_links")
          .update({ state: "removed", event_id: null, event_etag: null, content_hash: null,
                    attempts, last_attempt_at: stamp, synced_at: stamp, last_error: null })
          .eq("id", link.id);
        continue;
      }

      const event = eventFor(trip, await crewNames(link.trip_id as string), siteUrl);
      const hash = hashOf(event);

      if (link.event_id && hash === link.content_hash) {
        await db.from("os_calendar_links")
          .update({ state: "synced", attempts: 0, last_attempt_at: stamp, last_error: null })
          .eq("id", link.id);
        result.unchanged += 1;
        continue;
      }

      if (link.event_id) {
        const patched = await patchEvent(link.calendar_id as string, link.event_id as string, event);
        if (patched) {
          await db.from("os_calendar_links")
            .update({ state: "synced", event_etag: patched.etag, content_hash: hash,
                      attempts: 0, last_attempt_at: stamp, synced_at: stamp, last_error: null })
            .eq("id", link.id);
          result.updated += 1;
          continue;
        }
        // Patch came back empty: somebody deleted the event in Google. Fall
        // through and create a new one rather than leaving the trip invisible.
      }

      const created = await insertEvent(link.calendar_id as string, event);
      await db.from("os_calendar_links")
        .update({ state: "synced", event_id: created.id, event_etag: created.etag, content_hash: hash,
                  attempts: 0, last_attempt_at: stamp, synced_at: stamp, last_error: null })
        .eq("id", link.id);
      result.created += 1;
    } catch (error) {
      const retryable = error instanceof CalendarApiError ? error.retryable : true;
      const message = error instanceof Error ? error.message : String(error);
      const detail = error instanceof CalendarApiError && error.detail ? ` (${error.detail})` : "";
      const givingUp = !retryable || attempts >= attemptCap;

      await db.from("os_calendar_links")
        .update({
          state: givingUp ? "failed" : link.state,
          attempts,
          last_attempt_at: stamp,
          last_error: `${message}${detail}`,
        })
        .eq("id", link.id);

      result.failed += 1;
      if (result.errors.length < 5) result.errors.push(`${message}${detail}`);
    }
  }

  return result;
}

/**
 * Re-queues anything that has drifted: a publishable trip with no link row at
 * all, and a link row whose trip has since left the publishable set. This is
 * what makes a missed queue write harmless, and what fills the queue the first
 * time somebody connects Google to an OS that already has trips in it.
 */
export async function reconcileCalendar(): Promise<{ queued: number; removing: number }> {
  if (!calendarPublishingConfigured()) return { queued: 0, removing: 0 };

  const target = calendarId() as string;
  const org = await getOrg();
  const db = osdb();
  const statuses = await publishStatuses(org.id);

  // Only forward-looking work. Back-filling years of finished trips into a
  // crew calendar is noise, and it is a lot of API calls to produce it.
  const horizon = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const { data: shouldPublish } = await db
    .from("os_trips").select("id").eq("org_id", org.id).in("status", statuses).gte("trip_date", horizon).limit(500);

  const { data: linked } = await db
    .from("os_calendar_links").select("trip_id, state").eq("org_id", org.id).eq("calendar_id", target);

  const linkedIds = new Set((linked ?? []).map((l) => l.trip_id as string));
  const missing = (shouldPublish ?? []).map((t) => t.id as string).filter((id) => !linkedIds.has(id));

  for (const id of missing) await queueTripPublish(id);

  // Anything holding a live event whose trip is no longer publishable.
  const publishableIds = new Set((shouldPublish ?? []).map((t) => t.id as string));
  const stale = (linked ?? []).filter(
    (l) => ["synced", "pending"].includes(l.state as string) && !publishableIds.has(l.trip_id as string),
  );
  for (const l of stale) await queueTripRemoval(l.trip_id as string);

  return { queued: missing.length, removing: stale.length };
}

/** One trip, right now — the Admin "Publish now" path. */
export async function publishTripNow(tripId: string): Promise<PublishResult> {
  await queueTripPublish(tripId);
  return publishPending(1);
}

// ---------------------------------------------------------------------------
// STATUS, FOR THE ADMIN SCREEN
// ---------------------------------------------------------------------------
export type CalendarSyncStatus = {
  configured: boolean;
  calendarId: string | null;
  counts: { synced: number; pending: number; removing: number; failed: number; removed: number };
  failures: { ref: string; title: string; error: string; attempts: number; at: string | null }[];
  lastSyncedAt: string | null;
};

export async function calendarSyncStatus(): Promise<CalendarSyncStatus> {
  const configured = calendarPublishingConfigured();
  const empty: CalendarSyncStatus = {
    configured,
    calendarId: calendarId(),
    counts: { synced: 0, pending: 0, removing: 0, failed: 0, removed: 0 },
    failures: [],
    lastSyncedAt: null,
  };
  if (!configured) return empty;

  const org = await getOrg();
  const { data } = await osdb()
    .from("os_calendar_links")
    .select("state, last_error, attempts, last_attempt_at, synced_at, os_trips (ref, title)")
    .eq("org_id", org.id);

  const rows = data ?? [];
  for (const row of rows) {
    const state = row.state as keyof CalendarSyncStatus["counts"];
    if (state in empty.counts) empty.counts[state] += 1;
    const synced = row.synced_at as string | null;
    if (synced && (!empty.lastSyncedAt || synced > empty.lastSyncedAt)) empty.lastSyncedAt = synced;
  }

  empty.failures = rows
    .filter((r) => r.state === "failed")
    .slice(0, 10)
    .map((r) => {
      const trip = r.os_trips as { ref?: string; title?: string } | null;
      return {
        ref: trip?.ref ?? "—",
        title: trip?.title ?? "Trip no longer exists",
        error: (r.last_error as string) ?? "Unknown error",
        attempts: (r.attempts as number) ?? 0,
        at: (r.last_attempt_at as string) ?? null,
      };
    });

  return empty;
}
