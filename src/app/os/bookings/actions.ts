"use server";

import { revalidatePath } from "next/cache";
import { requireOsStaff } from "@/lib/auth/session";
import {
  canEditContent,
  canEditLogistics,
  canEditMoney,
  canManageBookings,
} from "@/lib/auth/roles";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { expandDates, isIsoDate, parseInclusions } from "@/lib/os/model";

// Every write to a booking.
//
// Each one re-checks the role. A server action is a POST endpoint: whoever can
// reach the page can reach the action, and what the page chose to draw is not
// a constraint on what can be submitted to it. So the rules in
// @/lib/auth/roles are applied here, where the write happens, and the markup
// only uses them to avoid showing somebody a field they cannot save.

export type ActionResult = { ok: true; ref?: string } | { ok: false; error: string };

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function nullable(form: FormData, key: string): string | null {
  return str(form, key) || null;
}

/** A money field: blank reads as zero, a non-number is refused. */
function amount(form: FormData, key: string): number | null {
  const raw = str(form, key);
  if (!raw) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

function revalidateBooking(ref?: string, dates: string[] = []) {
  revalidatePath("/os");
  revalidatePath("/os/bookings");
  if (ref) revalidatePath(`/os/bookings/${ref}`);
  for (const date of dates) revalidatePath(`/os/day/${date}`);
}

/**
 * Creates a booking and the day rows it occupies.
 *
 * The form asks for a first and last day, not a list of dates, because that
 * is how a trip is sold ("four days from the 19th"). expandDates turns it into
 * the one row per date that the ground crew works from — which is what the
 * operations spreadsheet does by hand, one tab at a time.
 */
export async function createBooking(formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageBookings(user.role)) {
    return { ok: false, error: "Only the reservations desk can create a booking." };
  }

  const guestName = str(formData, "guest_name");
  if (!guestName) return { ok: false, error: "The guest's name is required." };

  const pax = Number(str(formData, "pax"));
  if (!Number.isInteger(pax) || pax < 1) return { ok: false, error: "Enter how many guests, as a whole number." };

  const startDate = str(formData, "start_date");
  const endDate = str(formData, "end_date") || startDate;
  if (!isIsoDate(startDate)) return { ok: false, error: "A first day of service is required." };
  if (!isIsoDate(endDate)) return { ok: false, error: "That last day isn't a valid date." };

  let dates: string[];
  try {
    dates = expandDates(startDate, endDate);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Check the dates." };
  }

  const totalUsd = amount(formData, "total_usd");
  const depositUsd = amount(formData, "deposit_usd");
  if (totalUsd === null) return { ok: false, error: "Enter the total as a number, or leave it blank." };
  if (depositUsd === null) return { ok: false, error: "Enter the deposit as a number, or leave it blank." };
  if (depositUsd > totalUsd) {
    return { ok: false, error: "The deposit is larger than the total — check both figures." };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("os_bookings")
    .insert({
      guest_name: guestName,
      guest_phone: nullable(formData, "guest_phone"),
      guest_email: nullable(formData, "guest_email"),
      source: nullable(formData, "source"),
      service_type: nullable(formData, "service_type"),
      pax,
      total_usd: totalUsd,
      deposit_usd: depositUsd,
      reservation_owner: nullable(formData, "reservation_owner") ?? user.firstName ?? user.email,
      notes: nullable(formData, "notes"),
      lead_id: nullable(formData, "lead_id"),
      created_by: user.id,
    })
    .select("id, ref")
    .single();

  if (error) {
    console.error("createBooking failed:", error);
    return { ok: false, error: error.message };
  }

  const serviceType = nullable(formData, "service_type");
  const serviceLocation = nullable(formData, "service_location");

  const { error: daysError } = await supabase.from("os_booking_days").insert(
    dates.map((date) => ({
      booking_id: data.id,
      service_date: date,
      service_type: serviceType,
      service_location: serviceLocation,
    })),
  );

  if (daysError) {
    // The booking exists but has no days, which would leave it invisible on
    // every day sheet. Removing it is the right repair: nothing else
    // references it yet, and a half-created booking is worse than none.
    await supabase.from("os_bookings").delete().eq("id", data.id);
    console.error("createBooking days failed:", daysError);
    return { ok: false, error: `The booking could not be scheduled: ${daysError.message}` };
  }

  // If this came from the follow-up list, close that lead out as booked
  // rather than leaving the desk chasing someone who has already paid.
  const leadId = nullable(formData, "lead_id");
  if (leadId) {
    await supabase.from("os_leads").update({ outcome: "booked" }).eq("id", leadId);
    revalidatePath("/os/follow-ups");
  }

  revalidateBooking(data.ref as string, dates);
  // The ref goes back to the caller rather than this action redirecting.
  // redirect() throws, so the form never sees a resolved result and would
  // flash "that didn't save" on its way to a booking that saved perfectly.
  return { ok: true, ref: data.ref as string };
}

/** Guest, contact and service details. */
export async function updateBookingDetails(bookingId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageBookings(user.role)) {
    return { ok: false, error: "Only the reservations desk can change a booking's details." };
  }

  const guestName = str(formData, "guest_name");
  if (!guestName) return { ok: false, error: "The guest's name is required." };

  const pax = Number(str(formData, "pax"));
  if (!Number.isInteger(pax) || pax < 1) return { ok: false, error: "Enter how many guests, as a whole number." };

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("os_bookings")
    .update({
      guest_name: guestName,
      guest_phone: nullable(formData, "guest_phone"),
      guest_email: nullable(formData, "guest_email"),
      source: nullable(formData, "source"),
      service_type: nullable(formData, "service_type"),
      pax,
      reservation_owner: nullable(formData, "reservation_owner"),
      notes: nullable(formData, "notes"),
    })
    .eq("id", bookingId)
    .select("ref")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  revalidateBooking(data?.ref as string | undefined);
  return { ok: true };
}

/**
 * The money, on its own action with its own role check.
 *
 * Separate from the details form so that operations — who must read the
 * balance to collect it — cannot submit a price change by posting to the form
 * that happens to be on the same screen.
 */
export async function updateBookingMoney(bookingId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canEditMoney(user.role)) {
    return { ok: false, error: "Only the reservations desk can change what a booking is worth." };
  }

  const totalUsd = amount(formData, "total_usd");
  const depositUsd = amount(formData, "deposit_usd");
  if (totalUsd === null) return { ok: false, error: "Enter the total as a number." };
  if (depositUsd === null) return { ok: false, error: "Enter the deposit as a number." };
  if (depositUsd > totalUsd) {
    return { ok: false, error: "The deposit is larger than the total — check both figures." };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("os_bookings")
    .update({ total_usd: totalUsd, deposit_usd: depositUsd })
    .eq("id", bookingId)
    .select("ref")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  revalidateBooking(data?.ref as string | undefined);
  return { ok: true };
}

/**
 * One day's logistics: who is driving, from where, at what time.
 *
 * Operations may save this and nothing else. The content fields come through
 * updateDayContent instead, and the money is not on this form at all.
 */
export async function updateDayLogistics(dayId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canEditLogistics(user.role)) {
    return { ok: false, error: "Your role can't change a day's logistics." };
  }

  const pickupTime = str(formData, "pickup_time");
  // Left null rather than coerced: "not decided yet" is a real state the day
  // before a tour, and a stored 00:00 would read as a midnight pick-up.
  if (pickupTime && !/^\d{2}:\d{2}$/.test(pickupTime)) {
    return { ok: false, error: "Enter the pick-up time as HH:MM, or leave it blank." };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("os_booking_days")
    .update({
      service_type: nullable(formData, "service_type"),
      service_location: nullable(formData, "service_location"),
      pickup_time: pickupTime || null,
      pickup_location: nullable(formData, "pickup_location"),
      operator_name: nullable(formData, "operator_name"),
      guide_name: nullable(formData, "guide_name"),
      inclusions: parseInclusions(str(formData, "inclusions")),
      inclusions_notes: nullable(formData, "inclusions_notes"),
      notes: nullable(formData, "notes"),
    })
    .eq("id", dayId)
    .select("service_date, booking:os_bookings(ref)")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  const row = data as { service_date?: string; booking?: { ref?: string } | { ref?: string }[] } | null;
  const booking = Array.isArray(row?.booking) ? row?.booking[0] : row?.booking;
  revalidateBooking(booking?.ref, row?.service_date ? [row.service_date] : []);
  return { ok: true };
}

/** The social team's columns on one day. */
export async function updateDayContent(dayId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canEditContent(user.role)) {
    return { ok: false, error: "Your role can't change the content fields." };
  }

  const photoLink = nullable(formData, "photo_link");
  if (photoLink && !/^https?:\/\//i.test(photoLink)) {
    return { ok: false, error: "The photo link needs to start with http:// or https://" };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("os_booking_days")
    .update({
      photographer: nullable(formData, "photographer"),
      assist: nullable(formData, "assist"),
      // An unticked checkbox is absent from FormData, so this reads as false
      // rather than undefined — the flag is never left at its old value by
      // somebody unticking it.
      data_collected: str(formData, "data_collected") === "on",
      photo_link: photoLink,
    })
    .eq("id", dayId)
    .select("service_date, booking:os_bookings(ref)")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  const row = data as { service_date?: string; booking?: { ref?: string } | { ref?: string }[] } | null;
  const booking = Array.isArray(row?.booking) ? row?.booking[0] : row?.booking;
  revalidateBooking(booking?.ref, row?.service_date ? [row.service_date] : []);
  return { ok: true };
}

/** Adds a day to an existing booking — an extension, or a day sold later. */
export async function addBookingDay(bookingId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageBookings(user.role)) {
    return { ok: false, error: "Only the reservations desk can add a day to a booking." };
  }

  const date = str(formData, "service_date");
  if (!isIsoDate(date)) return { ok: false, error: "Pick a valid date." };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("os_booking_days").insert({
    booking_id: bookingId,
    service_date: date,
    service_type: nullable(formData, "service_type"),
    service_location: nullable(formData, "service_location"),
  });

  if (error) {
    // The unique (booking_id, service_date) constraint. Saying so is more
    // useful than the Postgres text, and the constraint is what stops the
    // crew being sent to the same guest twice on one morning.
    return {
      ok: false,
      error: error.code === "23505" ? "That booking already has a row for that date." : error.message,
    };
  }

  const { data } = await supabase.from("os_bookings").select("ref").eq("id", bookingId).maybeSingle();
  revalidateBooking(data?.ref as string | undefined, [date]);
  return { ok: true };
}

/** Removes one day from a booking — a day dropped, not a booking cancelled. */
export async function removeBookingDay(dayId: string): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageBookings(user.role)) {
    return { ok: false, error: "Only the reservations desk can remove a day." };
  }

  const supabase = createAdminSupabaseClient();
  const { data: day } = await supabase
    .from("os_booking_days")
    .select("service_date, booking_id")
    .eq("id", dayId)
    .maybeSingle();

  // A booking with no days is invisible on every day sheet, so the last one
  // cannot be removed. Cancelling the booking is the action that was meant.
  if (day) {
    const { count } = await supabase
      .from("os_booking_days")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", day.booking_id as string);
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "That's the booking's only day — cancel the booking instead." };
    }
  }

  const { error } = await supabase.from("os_booking_days").delete().eq("id", dayId);
  if (error) return { ok: false, error: error.message };

  const { data } = await supabase
    .from("os_bookings")
    .select("ref")
    .eq("id", (day?.booking_id as string) ?? "")
    .maybeSingle();
  revalidateBooking(data?.ref as string | undefined, day?.service_date ? [String(day.service_date)] : []);
  return { ok: true };
}

/**
 * Cancels a booking. Never deletes one.
 *
 * The row stays, with its reason and its payment history, because a booking
 * that vanishes leaves a hole in the day sheet that nobody can explain a week
 * later — and takes the record of a deposit with it.
 */
export async function setBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed",
  reason: string,
): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageBookings(user.role)) {
    return { ok: false, error: "Only the reservations desk can cancel or complete a booking." };
  }

  const trimmed = reason.trim();
  if (status === "cancelled" && !trimmed) {
    return { ok: false, error: "Give a reason — it's the only record of why this day is empty." };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("os_bookings")
    .update({
      status,
      cancellation_reason: status === "cancelled" ? trimmed : null,
    })
    .eq("id", bookingId)
    .select("ref")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  const { data: days } = await supabase
    .from("os_booking_days")
    .select("service_date")
    .eq("booking_id", bookingId);

  revalidateBooking(
    data?.ref as string | undefined,
    ((days ?? []) as { service_date: string }[]).map((d) => String(d.service_date)),
  );
  return { ok: true };
}
