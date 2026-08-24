import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { checkRateLimit } from "@/lib/rateLimit";

// "Add to My Trip" inside My Egypt never modifies a confirmed reservation
// directly — it only ever files a request for the Egypt Eye team to review
// and confirm, per the spec's explicit "don't silently change a booking"
// requirement. The AI concierge (see /api/concierge) uses this same route
// for anything that would touch the booking.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Not available on this deployment yet." }, { status: 500 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { allowed } = await checkRateLimit({ bucket: "change-request", key: user.id, max: 20, windowSeconds: 3600 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { id: reservationId } = await params;

  let body: { requestType?: unknown; slug?: unknown; title?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const requestType = typeof body.requestType === "string" && body.requestType ? body.requestType.slice(0, 60) : "add_experience";
  const slug = typeof body.slug === "string" ? body.slug : undefined;
  const title = typeof body.title === "string" ? body.title.slice(0, 200) : undefined;
  const note = typeof body.note === "string" ? body.note.slice(0, 2000) : undefined;

  if (!title) return NextResponse.json({ error: "Missing details for this request." }, { status: 400 });

  const supabase = createAdminSupabaseClient();

  // Ownership check — a customer may only file a change request against
  // their own reservation, never one whose ID they merely guessed.
  const { data: reservation } = await supabase.from("reservations").select("id, customer_id").eq("id", reservationId).maybeSingle();
  if (!reservation || reservation.customer_id !== user.id) {
    return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
  }

  const { error } = await supabase.from("reservation_change_requests").insert({
    reservation_id: reservationId,
    customer_id: user.id,
    request_type: requestType,
    payload: { slug, title, note },
  });

  if (error) {
    console.error("change request insert failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
