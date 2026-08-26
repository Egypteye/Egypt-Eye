"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseLines(raw: unknown): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// --- Hotels ---------------------------------------------------------------

export async function createHotel(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  if (!name || !location || !shortDescription) return;

  const baseSlug = slugify(name) || `hotel-${Date.now()}`;
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabase.from("hotels").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const propertyType = formData.get("propertyType") === "apartment" ? "apartment" : "hotel";

  const { data } = await supabase
    .from("hotels")
    .insert({ name, slug, location, short_description: shortDescription, property_type: propertyType, enabled: false })
    .select("id")
    .single();

  revalidatePath("/admin/hotels");
  if (data) redirect(`/admin/hotels/${data.id}`);
}

export async function updateHotel(hotelId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  await supabase
    .from("hotels")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      property_type: formData.get("propertyType") === "apartment" ? "apartment" : "hotel",
      location: String(formData.get("location") ?? "").trim(),
      short_description: String(formData.get("shortDescription") ?? "").trim(),
      full_description: String(formData.get("fullDescription") ?? "").trim(),
      highlights: parseLines(formData.get("highlights")),
      amenities: parseLines(formData.get("amenities")),
      photos: parseLines(formData.get("photos")),
      special_notes: String(formData.get("specialNotes") ?? "").trim() || null,
      deal_headline: String(formData.get("dealHeadline") ?? "").trim() || null,
      deal_description: String(formData.get("dealDescription") ?? "").trim() || null,
      child_family_policy: String(formData.get("childFamilyPolicy") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", hotelId);

  revalidatePath("/admin/hotels");
  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}

export async function toggleHotelEnabled(hotelId: string, enabled: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("hotels").update({ enabled, updated_at: new Date().toISOString() }).eq("id", hotelId);
  revalidatePath("/admin/hotels");
  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}

export async function deleteHotel(hotelId: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("hotels").delete().eq("id", hotelId);
  revalidatePath("/admin/hotels");
  revalidatePath("/hotel-deals");
  redirect("/admin/hotels");
}

// --- Rooms ------------------------------------------------------------------

export async function addRoom(hotelId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase.from("hotel_rooms").insert({
    hotel_id: hotelId,
    name,
    room_category: String(formData.get("roomCategory") ?? "standard"),
    view: String(formData.get("view") ?? "").trim() || null,
    max_occupancy: Number(formData.get("maxOccupancy") ?? 2),
    description: String(formData.get("description") ?? "").trim() || null,
  });

  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}

export async function updateRoom(hotelId: string, roomId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  await supabase
    .from("hotel_rooms")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      room_category: String(formData.get("roomCategory") ?? "standard"),
      view: String(formData.get("view") ?? "").trim() || null,
      max_occupancy: Number(formData.get("maxOccupancy") ?? 2),
      description: String(formData.get("description") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId);

  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}

export async function deleteRoom(hotelId: string, roomId: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("hotel_rooms").delete().eq("id", roomId);
  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}

// --- Rates --------------------------------------------------------------

export async function addRate(hotelId: string, roomId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const contactForRate = formData.get("contactForRate") === "on";
  const priceRaw = String(formData.get("pricePerNight") ?? "").trim();

  await supabase.from("hotel_rates").insert({
    room_id: roomId,
    occupancy: String(formData.get("occupancy") ?? "double"),
    meal_plan: String(formData.get("mealPlan") ?? "Bed & Breakfast").trim() || "Bed & Breakfast",
    price_per_night: contactForRate ? null : priceRaw ? Number(priceRaw) : null,
    contact_for_rate: contactForRate,
    valid_until: String(formData.get("validUntil") ?? "").trim() || null,
  });

  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}

export async function updateRate(hotelId: string, rateId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const contactForRate = formData.get("contactForRate") === "on";
  const priceRaw = String(formData.get("pricePerNight") ?? "").trim();

  await supabase
    .from("hotel_rates")
    .update({
      occupancy: String(formData.get("occupancy") ?? "double"),
      meal_plan: String(formData.get("mealPlan") ?? "Bed & Breakfast").trim() || "Bed & Breakfast",
      price_per_night: contactForRate ? null : priceRaw ? Number(priceRaw) : null,
      contact_for_rate: contactForRate,
      valid_until: String(formData.get("validUntil") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rateId);

  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}

export async function deleteRate(hotelId: string, rateId: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("hotel_rates").delete().eq("id", rateId);
  revalidatePath(`/admin/hotels/${hotelId}`);
  revalidatePath("/hotel-deals");
}
