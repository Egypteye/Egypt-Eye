import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ReservationRecord = {
  id: string;
  reference: string;
  status: "requested" | "confirmed" | "in_trip" | "completed" | "cancelled";
  trip_start_date: string | null;
  trip_end_date: string | null;
  travelers_adults: number;
  travelers_children: number;
  journey_snapshot: { type: string; slug: string; title: string }[];
  itinerary: unknown[];
  hotels: unknown[];
  transfers: unknown[];
  guides: unknown[];
  documents: unknown[];
};

// My Egypt only unlocks once a reservation is past the "requested" stage —
// picks whichever one is most relevant to show right now: an in-progress
// trip first, then the soonest upcoming confirmed trip, then the most
// recently completed one.
export async function getActiveReservation(userId: string): Promise<ReservationRecord | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("reservations")
    .select(
      "id, reference, status, trip_start_date, trip_end_date, travelers_adults, travelers_children, journey_snapshot, itinerary, hotels, transfers, guides, documents"
    )
    .eq("customer_id", userId)
    .in("status", ["confirmed", "in_trip", "completed"])
    .order("trip_start_date", { ascending: true, nullsFirst: false });

  const reservations = (data ?? []) as ReservationRecord[];
  if (reservations.length === 0) return null;

  const inTrip = reservations.find((r) => r.status === "in_trip");
  if (inTrip) return inTrip;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = reservations.find((r) => r.status === "confirmed" && (!r.trip_start_date || r.trip_start_date >= today));
  if (upcoming) return upcoming;

  const confirmed = reservations.find((r) => r.status === "confirmed");
  if (confirmed) return confirmed;

  return reservations[reservations.length - 1]; // most recent completed
}

export type TripPhase = "upcoming" | "in_trip" | "completed";

export function getTripPhase(reservation: ReservationRecord): TripPhase {
  if (reservation.status === "completed") return "completed";
  const today = new Date().toISOString().slice(0, 10);
  if (reservation.trip_start_date && reservation.trip_end_date) {
    if (today >= reservation.trip_start_date && today <= reservation.trip_end_date) return "in_trip";
    if (today > reservation.trip_end_date) return "completed";
  } else if (reservation.trip_start_date && today >= reservation.trip_start_date) {
    return "in_trip";
  }
  return reservation.status === "in_trip" ? "in_trip" : "upcoming";
}
