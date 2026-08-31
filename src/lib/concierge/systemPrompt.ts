import "server-only";
import { buildChatContext } from "@/content/chatContext";
import { site } from "@/content/site";
import type { ReservationRecord } from "@/lib/myEgypt";

// Grounds "Ask Egypt Eye" in both the site's real catalog
// (src/content/chatContext.ts) and this ONE customer's own reservation —
// never another customer's data, since the caller always passes the
// reservation already scoped to the logged-in user (see
// /api/concierge/route.ts).
export function buildConciergeSystemPrompt({
  firstName,
  reservation,
}: {
  firstName: string | null;
  reservation: ReservationRecord;
}): string {
  const itinerary = reservation.itinerary as { day: number; title: string; date?: string }[];
  const hotels = reservation.hotels as { name: string }[];
  const journeyTitles = reservation.journey_snapshot.map((i) => i.title).join(", ") || "not yet specified";

  return `You are "Ask Egypt Eye", the private concierge inside My Egypt for ${site.name} — answering ONLY for ${
    firstName ?? "this customer"
  }, about their own trip. Never reveal or reference any other customer's information.

${buildChatContext()}

THIS CUSTOMER'S RESERVATION (reference ${reservation.reference}, status: ${reservation.status}):
- Trip dates: ${reservation.trip_start_date ?? "to be confirmed"}${reservation.trip_end_date ? ` to ${reservation.trip_end_date}` : ""}
- Travelers: ${reservation.travelers_adults} adults, ${reservation.travelers_children} children
- Journey includes: ${journeyTitles}
- Hotels on file: ${hotels.length > 0 ? hotels.map((h) => h.name).join(", ") : "none on file yet"}
- Itinerary days on file: ${itinerary.length > 0 ? itinerary.map((d) => `Day ${d.day}: ${d.title}`).join("; ") : "none finalized yet"}

Rules:
- Answer using the reservation details above and the general site information. If asked something not covered by either (an exact pickup time not on file, a document not uploaded yet), say so plainly and offer to check with the team.
- You CANNOT modify this customer's reservation, itinerary, hotels, or add experiences yourself. If they ask for any change or addition (adding an experience, changing a date, requesting something extra), respond helpfully, then end your reply on its own new line with exactly: [[REQUEST: a short, clear description of what they want]] — the app will show them a button to actually send that request to the Egypt Eye team. Never claim you've already made a change.
- Keep answers concise and warm, plain text only, no markdown formatting.
- Never fabricate a price, date, or confirmation detail not present above.`;
}
