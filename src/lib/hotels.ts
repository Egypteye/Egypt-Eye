import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type HotelRate = {
  id: string;
  room_id: string;
  occupancy: "single" | "double";
  meal_plan: string;
  price_per_night: number | null;
  currency: string;
  contact_for_rate: boolean;
  valid_until: string | null;
  display_order: number;
};

export type HotelRoom = {
  id: string;
  hotel_id: string;
  name: string;
  room_category: "standard" | "suite";
  view: string | null;
  max_occupancy: number;
  description: string | null;
  display_order: number;
  rates: HotelRate[];
};

export type Hotel = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string;
  location: string;
  highlights: string[];
  amenities: string[];
  photos: string[];
  special_notes: string | null;
  deal_headline: string | null;
  deal_description: string | null;
  child_family_policy: string | null;
  enabled: boolean;
  display_order: number;
  property_type: "hotel" | "apartment";
};

export type HotelWithRooms = Hotel & { rooms: HotelRoom[] };

// A rate counts as "live" (shown with a price) only if it isn't marked
// contact-only and hasn't expired — an expired-but-priced rate still shows
// on the room, but falls back to "Contact us for the latest rate" instead
// of the stale number.
export function isRateExpired(rate: Pick<HotelRate, "valid_until">): boolean {
  if (!rate.valid_until) return false;
  return new Date(rate.valid_until) < new Date(new Date().toDateString());
}

// Public, read-only fetchers — used by /hotel-deals and /hotel-deals/[slug].
// Gracefully return empty/undefined if Supabase isn't configured yet,
// matching the rest of the site's fallback philosophy (never a hard crash
// on a public page for a missing env var).

export async function getEnabledHotels(): Promise<Hotel[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("hotels")
    .select("*")
    .eq("enabled", true)
    .order("display_order", { ascending: true });
  return (data ?? []) as Hotel[];
}

export async function getHotelBySlug(slug: string): Promise<HotelWithRooms | undefined> {
  if (!supabaseConfigured) return undefined;
  const supabase = await createServerSupabaseClient();
  const { data: hotel } = await supabase.from("hotels").select("*").eq("slug", slug).eq("enabled", true).single();
  if (!hotel) return undefined;

  const { data: rooms } = await supabase
    .from("hotel_rooms")
    .select("*")
    .eq("hotel_id", hotel.id)
    .order("display_order", { ascending: true });

  const roomIds = (rooms ?? []).map((r) => r.id as string);
  const { data: rates } =
    roomIds.length > 0
      ? await supabase.from("hotel_rates").select("*").in("room_id", roomIds).order("display_order", { ascending: true })
      : { data: [] };

  const roomsWithRates: HotelRoom[] = (rooms ?? []).map((room) => ({
    ...(room as HotelRoom),
    rates: ((rates ?? []) as HotelRate[]).filter((r) => r.room_id === room.id),
  }));

  return { ...(hotel as Hotel), rooms: roomsWithRates };
}
