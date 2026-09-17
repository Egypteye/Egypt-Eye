"use server";

import { revalidatePath } from "next/cache";
import { requireReservationsStaff } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function updateReservationStatus(reservationId: string, formData: FormData) {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  const status = String(formData.get("status") ?? "requested");
  await supabase.from("reservations").update({ status, updated_at: new Date().toISOString() }).eq("id", reservationId);
  revalidatePath(`/admin/reservations/${reservationId}`);
  revalidatePath("/admin/reservations");
}

export async function addHotel(reservationId: string, formData: FormData) {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("reservations").select("hotels").eq("id", reservationId).single();
  const hotels = Array.isArray(data?.hotels) ? data.hotels : [];
  hotels.push({
    name: String(formData.get("name") ?? ""),
    checkIn: String(formData.get("checkIn") ?? "") || undefined,
    checkOut: String(formData.get("checkOut") ?? "") || undefined,
    address: String(formData.get("address") ?? "") || undefined,
    confirmationNumber: String(formData.get("confirmationNumber") ?? "") || undefined,
  });
  await supabase.from("reservations").update({ hotels, updated_at: new Date().toISOString() }).eq("id", reservationId);
  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function addTransfer(reservationId: string, formData: FormData) {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("reservations").select("transfers").eq("id", reservationId).single();
  const transfers = Array.isArray(data?.transfers) ? data.transfers : [];
  transfers.push({
    date: String(formData.get("date") ?? "") || undefined,
    time: String(formData.get("time") ?? "") || undefined,
    from: String(formData.get("from") ?? ""),
    to: String(formData.get("to") ?? ""),
    driverName: String(formData.get("driverName") ?? "") || undefined,
    driverPhone: String(formData.get("driverPhone") ?? "") || undefined,
  });
  await supabase.from("reservations").update({ transfers, updated_at: new Date().toISOString() }).eq("id", reservationId);
  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function addGuide(reservationId: string, formData: FormData) {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("reservations").select("guides").eq("id", reservationId).single();
  const guides = Array.isArray(data?.guides) ? data.guides : [];
  guides.push({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? "") || undefined,
    languages: String(formData.get("languages") ?? "") || undefined,
  });
  await supabase.from("reservations").update({ guides, updated_at: new Date().toISOString() }).eq("id", reservationId);
  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function addDocument(reservationId: string, formData: FormData) {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("reservations").select("documents").eq("id", reservationId).single();
  const documents = Array.isArray(data?.documents) ? data.documents : [];
  documents.push({ label: String(formData.get("label") ?? ""), url: String(formData.get("url") ?? "") });
  await supabase.from("reservations").update({ documents, updated_at: new Date().toISOString() }).eq("id", reservationId);
  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function addItineraryDay(reservationId: string, formData: FormData) {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("reservations").select("itinerary").eq("id", reservationId).single();
  const itinerary = Array.isArray(data?.itinerary) ? data.itinerary : [];
  itinerary.push({
    day: itinerary.length + 1,
    date: String(formData.get("date") ?? "") || undefined,
    title: String(formData.get("title") ?? ""),
    items: [],
  });
  await supabase.from("reservations").update({ itinerary, updated_at: new Date().toISOString() }).eq("id", reservationId);
  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function addItineraryItem(reservationId: string, dayIndex: number, formData: FormData) {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("reservations").select("itinerary").eq("id", reservationId).single();
  const itinerary = Array.isArray(data?.itinerary) ? data.itinerary : [];
  if (!itinerary[dayIndex]) return;
  const items = Array.isArray(itinerary[dayIndex].items) ? itinerary[dayIndex].items : [];
  items.push({
    time: String(formData.get("time") ?? "") || undefined,
    title: String(formData.get("title") ?? ""),
    location: String(formData.get("location") ?? "") || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  itinerary[dayIndex].items = items;
  await supabase.from("reservations").update({ itinerary, updated_at: new Date().toISOString() }).eq("id", reservationId);
  revalidatePath(`/admin/reservations/${reservationId}`);
}

export async function resolveChangeRequest(requestId: string, reservationId: string, status: "approved" | "declined") {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  await supabase.from("reservation_change_requests").update({ status }).eq("id", requestId);
  revalidatePath(`/admin/reservations/${reservationId}`);
}
