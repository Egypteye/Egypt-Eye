import "server-only";
import { googleAccessToken, forgetGoogleToken, GoogleAuthError } from "./auth";

// ---------------------------------------------------------------------------
// GOOGLE CALENDAR API v3 — the four calls this integration makes
// ---------------------------------------------------------------------------
// insert, patch, delete, and a get used only to detect an event somebody
// removed by hand on the Google side. Nothing else is needed, so nothing else
// is here.
//
// Every error is thrown as a CalendarApiError carrying Google's own message
// and whether it is worth retrying. That distinction is the whole reason this
// file exists as a layer: the sweep must retry a 503 forever and must not
// retry a 404 even once, and it cannot tell the difference from a string.
// ---------------------------------------------------------------------------

const SCOPE = "https://www.googleapis.com/auth/calendar.events";
const BASE = "https://www.googleapis.com/calendar/v3";

export class CalendarApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Whether trying the identical call again later could succeed. */
    readonly retryable: boolean,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "CalendarApiError";
  }
}

export type CalendarEvent = {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone: string } | { date: string };
  end: { dateTime: string; timeZone: string } | { date: string };
  colorId?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  transparency?: "opaque" | "transparent";
  extendedProperties?: { private?: Record<string, string> };
  reminders?: { useDefault: boolean; overrides?: { method: "popup" | "email"; minutes: number }[] };
};

type GoogleErrorBody = { error?: { message?: string; status?: string; errors?: { reason?: string }[] } };

async function call<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  retriedAfter401 = false,
): Promise<T | null> {
  let token: string;
  try {
    token = await googleAccessToken(SCOPE);
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      // Credentials being wrong is not something a retry fixes, and retrying
      // it every hour for a week would just fill the log with the same line.
      throw new CalendarApiError(error.message, 401, false, error.detail);
    }
    throw error;
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status === 204 || response.status === 404) return null;
  if (response.ok) return (await response.json().catch(() => null)) as T | null;

  // A token can expire between the cache check and the call. One retry with a
  // fresh token, then treat it as a real authorization failure.
  if (response.status === 401 && !retriedAfter401) {
    forgetGoogleToken();
    return call<T>(method, path, body, true);
  }

  const parsed = (await response.json().catch(() => ({}))) as GoogleErrorBody;
  const message = parsed.error?.message ?? `HTTP ${response.status}`;
  const reason = parsed.error?.errors?.[0]?.reason;

  // 403 is two different problems wearing one number: the calendar was never
  // shared with the service account, or the quota is spent. The first is a
  // configuration error a person must fix; the second passes on its own.
  const rateLimited = reason === "rateLimitExceeded" || reason === "userRateLimitExceeded";
  const retryable = response.status === 429 || response.status >= 500 || (response.status === 403 && rateLimited);

  throw new CalendarApiError(message, response.status, retryable, reason);
}

const enc = encodeURIComponent;

export async function insertEvent(calendarId: string, event: CalendarEvent): Promise<{ id: string; etag: string }> {
  const created = await call<{ id: string; etag: string }>("POST", `/calendars/${enc(calendarId)}/events`, event);
  if (!created?.id) throw new CalendarApiError("Google accepted the event but returned no id", 502, true);
  return created;
}

export async function patchEvent(
  calendarId: string,
  eventId: string,
  event: CalendarEvent,
): Promise<{ id: string; etag: string } | null> {
  return call<{ id: string; etag: string }>("PATCH", `/calendars/${enc(calendarId)}/events/${enc(eventId)}`, event);
}

/** Returns false when the event was already gone, which is a success here. */
export async function deleteEvent(calendarId: string, eventId: string): Promise<boolean> {
  try {
    await call<null>("DELETE", `/calendars/${enc(calendarId)}/events/${enc(eventId)}`);
    return true;
  } catch (error) {
    if (error instanceof CalendarApiError && (error.status === 404 || error.status === 410)) return false;
    throw error;
  }
}

/**
 * Confirms the calendar exists and the service account can write to it.
 * Used by the admin screen so "connected" is something established rather
 * than asserted from the presence of an environment variable.
 */
export async function checkCalendarAccess(calendarId: string): Promise<{ ok: true; summary: string } | { ok: false; reason: string; detail?: string }> {
  try {
    const list = await call<{ summary?: string }>("GET", `/calendars/${enc(calendarId)}/events?maxResults=1`);
    return { ok: true, summary: list?.summary ?? calendarId };
  } catch (error) {
    if (error instanceof CalendarApiError) {
      if (error.status === 404) {
        return {
          ok: false,
          reason: "That calendar does not exist, or has not been shared with the service account",
          detail: "In Google Calendar, open the calendar's settings, and under 'Share with specific people' add the service account's email with 'Make changes to events'.",
        };
      }
      if (error.status === 403) {
        return {
          ok: false,
          reason: "The service account can see that calendar but may not write to it",
          detail: "Its sharing permission needs to be 'Make changes to events', not 'See all event details'.",
        };
      }
      return { ok: false, reason: error.message, detail: error.detail };
    }
    return { ok: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}
