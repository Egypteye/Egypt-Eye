"use server";

import { revalidatePath } from "next/cache";
import { requireOsStaff } from "@/lib/auth/session";
import { canManageLeads } from "@/lib/auth/roles";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { addDays, isIsoDate, todayInCairo } from "@/lib/os/model";

// The follow-up list's writes.
//
// Same rule as the bookings actions: the role is re-checked here, where the
// write happens, not only on the page that drew the form.

export type ActionResult = { ok: true } | { ok: false; error: string };

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function nullable(form: FormData, key: string): string | null {
  return str(form, key) || null;
}

function date(form: FormData, key: string): string | null | undefined {
  const raw = str(form, key);
  if (!raw) return null;
  return isIsoDate(raw) ? raw : undefined; // undefined means "refuse this"
}

function done() {
  revalidatePath("/os/follow-ups");
  revalidatePath("/os");
}

export async function createLead(formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageLeads(user.role)) {
    return { ok: false, error: "Only the reservations desk can add to the follow-up list." };
  }

  const guestName = str(formData, "guest_name");
  if (!guestName) return { ok: false, error: "A name is required." };

  const requestedOn = date(formData, "requested_on");
  const nextFollowUpOn = date(formData, "next_follow_up_on");
  if (requestedOn === undefined || nextFollowUpOn === undefined) {
    return { ok: false, error: "Check the dates." };
  }

  const paxRaw = str(formData, "pax");
  const pax = paxRaw ? Number(paxRaw) : null;
  if (pax !== null && (!Number.isInteger(pax) || pax < 1)) {
    return { ok: false, error: "Enter the number of guests as a whole number, or leave it blank." };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("ops_followups").insert({
    guest_name: guestName,
    platform: nullable(formData, "platform"),
    contact: nullable(formData, "contact"),
    requested_on: requestedOn ?? todayInCairo(),
    travel_window: nullable(formData, "travel_window"),
    interest: nullable(formData, "interest"),
    pax,
    itinerary_status: str(formData, "itinerary_status") === "sent" ? "sent" : "not_sent",
    // Defaulted rather than left empty: a lead with no next date is one
    // nobody is chasing, which is how the paper list loses people.
    next_follow_up_on: nextFollowUpOn ?? addDays(todayInCairo(), 2),
    notes: nullable(formData, "notes"),
    owner: nullable(formData, "owner") ?? user.firstName ?? user.email,
    created_by: user.id,
  });

  if (error) {
    console.error("createLead failed:", error);
    return { ok: false, error: error.message };
  }

  done();
  return { ok: true };
}

export async function updateLead(leadId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageLeads(user.role)) {
    return { ok: false, error: "Only the reservations desk can change a follow-up." };
  }

  const guestName = str(formData, "guest_name");
  if (!guestName) return { ok: false, error: "A name is required." };

  const lastFollowUpOn = date(formData, "last_follow_up_on");
  const nextFollowUpOn = date(formData, "next_follow_up_on");
  if (lastFollowUpOn === undefined || nextFollowUpOn === undefined) {
    return { ok: false, error: "Check the dates." };
  }

  const paxRaw = str(formData, "pax");
  const pax = paxRaw ? Number(paxRaw) : null;
  if (pax !== null && (!Number.isInteger(pax) || pax < 1)) {
    return { ok: false, error: "Enter the number of guests as a whole number, or leave it blank." };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("ops_followups")
    .update({
      guest_name: guestName,
      platform: nullable(formData, "platform"),
      contact: nullable(formData, "contact"),
      travel_window: nullable(formData, "travel_window"),
      interest: nullable(formData, "interest"),
      pax,
      itinerary_status: str(formData, "itinerary_status") === "sent" ? "sent" : "not_sent",
      last_follow_up_on: lastFollowUpOn,
      next_follow_up_on: nextFollowUpOn,
      notes: nullable(formData, "notes"),
    })
    .eq("id", leadId);

  if (error) return { ok: false, error: error.message };
  done();
  return { ok: true };
}

/**
 * "Followed up today, next one in N days" — the one action this screen exists
 * for, as a single click.
 *
 * It writes both dates at once: today's contact into last_follow_up_on, and
 * the next date forward. Doing it in two fields is what makes a paper list
 * drift, because the second half gets skipped when the phone rings.
 */
export async function logFollowUp(leadId: string, inDays: number): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageLeads(user.role)) {
    return { ok: false, error: "Only the reservations desk can log a follow-up." };
  }
  if (!Number.isInteger(inDays) || inDays < 1 || inDays > 180) {
    return { ok: false, error: "Pick a sensible number of days." };
  }

  const today = todayInCairo();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("ops_followups")
    .update({ last_follow_up_on: today, next_follow_up_on: addDays(today, inDays) })
    .eq("id", leadId);

  if (error) return { ok: false, error: error.message };
  done();
  return { ok: true };
}

/** Marks the itinerary as sent — the step the paper list tracks per row. */
export async function markItinerarySent(leadId: string): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageLeads(user.role)) {
    return { ok: false, error: "Only the reservations desk can change a follow-up." };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("ops_followups").update({ itinerary_status: "sent" }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  done();
  return { ok: true };
}

/**
 * Closes a lead out.
 *
 * 'booked' is normally set by creating the booking from the lead, which keeps
 * the two linked. This is here for the case where the booking was taken
 * elsewhere, and for 'lost' — which is kept rather than deleted, because
 * "how many of October's enquiries came to nothing, and from which platform"
 * is a question worth being able to answer.
 */
export async function closeLead(leadId: string, outcome: "booked" | "lost", note: string): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageLeads(user.role)) {
    return { ok: false, error: "Only the reservations desk can close a follow-up." };
  }

  const supabase = createAdminSupabaseClient();
  const trimmed = note.trim();
  const { data: existing } = await supabase.from("ops_followups").select("notes").eq("id", leadId).maybeSingle();
  const previous = (existing?.notes as string | null) ?? null;

  const { error } = await supabase
    .from("ops_followups")
    .update({
      outcome,
      // Appended, never overwritten: the reason it was lost is added to what
      // the desk already wrote, not instead of it.
      notes: trimmed ? [previous, trimmed].filter(Boolean).join("\n") : previous,
      next_follow_up_on: null,
    })
    .eq("id", leadId);

  if (error) return { ok: false, error: error.message };
  done();
  return { ok: true };
}

/** Puts a closed lead back on the list. */
export async function reopenLead(leadId: string): Promise<ActionResult> {
  const user = await requireOsStaff();
  if (!canManageLeads(user.role)) {
    return { ok: false, error: "Only the reservations desk can reopen a follow-up." };
  }

  const supabase = createAdminSupabaseClient();
  const today = todayInCairo();
  const { error } = await supabase
    .from("ops_followups")
    .update({ outcome: "pending", next_follow_up_on: addDays(today, 1) })
    .eq("id", leadId);

  if (error) return { ok: false, error: error.message };
  done();
  return { ok: true };
}
