"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { weeklyTripBySlug } from "@/content/weeklyTrips";
import type { ActionResult } from "./types";

// Scheduling the Weekly Trips calendar.
//
// This is the weekly operation the whole product runs on, so it is a server
// action on a plain form rather than anything cleverer — the team adds a date,
// a price and a seat count, and it is live. No deploy, no CMS round trip.
//
// seats_taken is deliberately not editable here. It is maintained by
// book_departure_seats() and the reservation trigger (migration 0018), and a
// hand-typed value would immediately disagree with the bookings that actually
// exist. To free a seat, cancel the booking in /admin/reservations and the
// trigger gives it back.

function revalidateEverywhere(tripSlug?: string) {
  revalidatePath("/admin/departures");
  revalidatePath("/weekly-trips");
  if (tripSlug) revalidatePath(`/weekly-trips/${tripSlug}`);
}

export async function createDeparture(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const tripSlug = String(formData.get("trip_slug") ?? "").trim();
  const trip = weeklyTripBySlug(tripSlug);
  if (!trip) return { ok: false, error: "Pick a trip." };

  const departsOn = String(formData.get("departs_on") ?? "").trim();
  if (!departsOn) return { ok: false, error: "A departure date is required." };

  const returnsOnRaw = String(formData.get("returns_on") ?? "").trim();
  const returnsOn = returnsOnRaw || null;
  if (returnsOn && returnsOn < departsOn) {
    return { ok: false, error: "The return date can't be before the departure date." };
  }

  const price = Number(formData.get("price_usd"));
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Enter a valid price." };

  const capacity = Number(formData.get("capacity"));
  if (!Number.isInteger(capacity) || capacity < 1) return { ok: false, error: "Enter a valid capacity." };

  const minSeats = Number(formData.get("min_seats"));
  if (!Number.isInteger(minSeats) || minSeats < 1) return { ok: false, error: "Enter a valid minimum." };
  if (minSeats > capacity) return { ok: false, error: "The minimum can't be larger than the capacity." };

  const childPriceRaw = String(formData.get("child_price_usd") ?? "").trim();
  const childPrice = childPriceRaw ? Number(childPriceRaw) : null;
  if (childPrice !== null && (!Number.isFinite(childPrice) || childPrice < 0)) {
    return { ok: false, error: "Enter a valid child price, or leave it blank." };
  }

  const closesRaw = String(formData.get("booking_closes_at") ?? "").trim();

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("trip_departures").insert({
    trip_slug: tripSlug,
    departs_on: departsOn,
    returns_on: returnsOn,
    departure_time: String(formData.get("departure_time") ?? "").trim() || null,
    price_usd: price,
    child_price_usd: childPrice,
    capacity,
    min_seats: minSeats,
    booking_closes_at: closesRaw ? new Date(closesRaw).toISOString() : null,
    meeting_point: String(formData.get("meeting_point") ?? "").trim() || null,
    note: String(formData.get("note") ?? "").trim() || null,
  });

  if (error) {
    console.error("createDeparture failed:", error);
    return { ok: false, error: error.message };
  }

  revalidateEverywhere(tripSlug);
  return { ok: true };
}

/**
 * Cancels a departure, with a reason travellers will read.
 *
 * The row is kept rather than deleted. Bookings reference it, the page shows
 * the cancellation to anyone who had a seat, and deleting it would silently
 * orphan both. The reason is required for the same purpose — "cancelled" with
 * no explanation is what makes people stop booking.
 */
export async function cancelDeparture(id: string, reason: string): Promise<ActionResult> {
  await requireAdmin();
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Give a reason — it's shown to anyone who booked." };

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("trip_departures")
    .update({ status: "cancelled", cancellation_reason: trimmed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("trip_slug")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  revalidateEverywhere(data?.trip_slug);
  return { ok: true };
}

/** Puts a cancelled departure back on sale. */
export async function reinstateDeparture(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("trip_departures")
    .update({ status: "scheduled", cancellation_reason: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("trip_slug")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  revalidateEverywhere(data?.trip_slug);
  return { ok: true };
}

/**
 * Moves a departure to a new date — a reschedule rather than a cancellation.
 *
 * Keeping the same row keeps the bookings attached to it, which is the whole
 * point: cancel-and-recreate would drop every seat already sold on the floor
 * and the travellers with them.
 */
export async function rescheduleDeparture(id: string, departsOn: string, returnsOn: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (!departsOn) return { ok: false, error: "A new departure date is required." };
  if (returnsOn && returnsOn < departsOn) {
    return { ok: false, error: "The return date can't be before the departure date." };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("trip_departures")
    .update({ departs_on: departsOn, returns_on: returnsOn, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("trip_slug")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  revalidateEverywhere(data?.trip_slug);
  return { ok: true };
}

/** Adjusts capacity — a bigger vehicle, or a smaller one. */
export async function updateCapacity(id: string, capacity: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isInteger(capacity) || capacity < 1) return { ok: false, error: "Enter a valid capacity." };

  const supabase = createAdminSupabaseClient();
  // The not_oversold constraint refuses a capacity below the seats already
  // sold, which is the correct answer — the fix is to move a booking, not to
  // pretend the vehicle is smaller than the people in it.
  const { data, error } = await supabase
    .from("trip_departures")
    .update({ capacity, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("trip_slug")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: error.message.includes("not_oversold")
        ? "That's fewer seats than are already booked on this departure."
        : error.message,
    };
  }
  revalidateEverywhere(data?.trip_slug);
  return { ok: true };
}

/** Marks a past departure done, so it drops out of the upcoming queries. */
export async function completeDeparture(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("trip_departures")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("trip_slug")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  revalidateEverywhere(data?.trip_slug);
  return { ok: true };
}
