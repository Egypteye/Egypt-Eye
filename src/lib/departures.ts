import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { weeklyTripBySlug } from "@/content/weeklyTrips";
import { deriveDeparture, todayInCairo, type Departure, type DepartureRow } from "./departureModel";

// Reading Weekly Trip departures out of Supabase.
//
// Only the fetching lives here. What a departure MEANS — sold out, closed,
// guaranteed — is in departureModel.ts, which has no server import so the
// client-side booking form shares the identical rules rather than
// reimplementing them and drifting.
//
// Every function here degrades to an empty result rather than throwing. A
// deployment without Supabase configured, or a database having a bad minute,
// should still build and still serve the trip pages: they say dates are
// coming, which is a worse page than the real one but a far better outcome
// than a 500 on the whole section.

export type { Departure, DepartureRow } from "./departureModel";

const SELECT =
  "id, trip_slug, departs_on, returns_on, departure_time, price_usd, child_price_usd, instant_booking, " +
  "capacity, seats_taken, min_seats, booking_closes_at, status, cancellation_reason, " +
  "meeting_point, note, readiness, astro_event, moon_illumination, observing_window";

/**
 * Readiness levels a visitor is allowed to see.
 *
 * `research` is where a date sits while somebody is still checking whether it
 * can run at all - a permit, a vehicle, a supplier. Those are working notes,
 * not a schedule, and publishing one would announce a trip that may never
 * exist. Filtered here rather than in the page so there is one answer to
 * "what is public", and getDeparture below applies it too: a research
 * departure must not be reachable by guessing its id either.
 */
const PUBLIC_READINESS = ["announced", "open"] as const;

/**
 * Attaches trip content to rows, dropping any whose slug no longer resolves.
 *
 * A departure pointing at a deleted or renamed trip has no page to link to and
 * no content to render, so showing it would be worse than hiding it. CI catches
 * the same thing earlier — see scripts/check-departures.mts.
 */
function joinTrips(rows: DepartureRow[]): Departure[] {
  const out: Departure[] = [];
  for (const row of rows) {
    const trip = weeklyTripBySlug(row.trip_slug);
    if (!trip) continue;
    out.push(deriveDeparture(row, trip));
  }
  return out;
}

/**
 * Every departure still ahead of us, soonest first.
 *
 * Cancelled ones are included on purpose: someone holding a booking for a
 * cancelled date needs to learn that from the page rather than from silence.
 * The hub renders them differently rather than hiding them.
 */
export async function getUpcomingDepartures(limit = 60): Promise<Departure[]> {
  if (!supabaseAdminConfigured) return [];
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("trip_departures")
      .select(SELECT)
      .gte("departs_on", todayInCairo())
      .neq("status", "completed")
      .in("readiness", PUBLIC_READINESS as unknown as string[])
      .order("departs_on", { ascending: true })
      .limit(limit);
    if (error) {
      console.error("getUpcomingDepartures failed:", error.message);
      return [];
    }
    return joinTrips((data ?? []) as unknown as DepartureRow[]);
  } catch (err) {
    console.error("getUpcomingDepartures threw:", err);
    return [];
  }
}

/** The upcoming departures for one trip, soonest first. */
export async function getDeparturesForTrip(tripSlug: string, limit = 24): Promise<Departure[]> {
  if (!supabaseAdminConfigured) return [];
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("trip_departures")
      .select(SELECT)
      .eq("trip_slug", tripSlug)
      .gte("departs_on", todayInCairo())
      .neq("status", "completed")
      .in("readiness", PUBLIC_READINESS as unknown as string[])
      .order("departs_on", { ascending: true })
      .limit(limit);
    if (error) {
      console.error("getDeparturesForTrip failed:", error.message);
      return [];
    }
    return joinTrips((data ?? []) as unknown as DepartureRow[]);
  } catch (err) {
    console.error("getDeparturesForTrip threw:", err);
    return [];
  }
}

/** One departure by id, for the booking API to price and validate against. */
export async function getDeparture(id: string): Promise<Departure | null> {
  if (!supabaseAdminConfigured) return null;
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("trip_departures")
      .select(SELECT)
      .eq("id", id)
      .in("readiness", PUBLIC_READINESS as unknown as string[])
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as DepartureRow;
    const trip = weeklyTripBySlug(row.trip_slug);
    if (!trip) return null;
    return deriveDeparture(row, trip);
  } catch {
    return null;
  }
}

/**
 * Departures that have already run, newest first — the "past trips" proof.
 *
 * A calendar with only future dates on it gives a visitor no way to tell
 * whether any of this actually happens. This is what answers that.
 */
export async function getPastDepartures(limit = 8): Promise<Departure[]> {
  if (!supabaseAdminConfigured) return [];
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("trip_departures")
      .select(SELECT)
      .lt("departs_on", todayInCairo())
      .neq("status", "cancelled")
      .in("readiness", PUBLIC_READINESS as unknown as string[])
      .order("departs_on", { ascending: false })
      .limit(limit);
    if (error) return [];
    return joinTrips((data ?? []) as unknown as DepartureRow[]);
  } catch {
    return [];
  }
}

/**
 * Every scheduled departure, including the ones the public never sees.
 *
 * The admin screen is the one place `research` rows have to appear - they are
 * dates somebody is still working on, and hiding them there means the person
 * doing the work cannot see their own notes. PUBLIC_READINESS deliberately
 * does not apply.
 */
export async function getAllDeparturesForAdmin(limit = 200): Promise<Departure[]> {
  if (!supabaseAdminConfigured) return [];
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("trip_departures")
      .select(SELECT)
      .gte("departs_on", todayInCairo())
      .neq("status", "completed")
      .order("departs_on", { ascending: true })
      .limit(limit);
    if (error) {
      console.error("getAllDeparturesForAdmin failed:", error.message);
      return [];
    }
    return joinTrips((data ?? []) as unknown as DepartureRow[]);
  } catch (err) {
    console.error("getAllDeparturesForAdmin threw:", err);
    return [];
  }
}
