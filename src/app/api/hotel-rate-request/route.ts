import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import { hotelRateRequestEmail } from "@/lib/email/templates";

// Receives a submission from the "Check Latest Rates" button on a hotel
// detail page. Persisted to hotel_rate_requests so it shows up in
// admin/hotel-rate-requests, and also emailed to the reservations team for
// immediate visibility — the request is explicitly framed on the public
// page as "not live availability," so this is the step that turns a
// deal-rate listing into a confirmed quote.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "This feature is not configured on this deployment" }, { status: 500 });
  }

  const { allowed } = await checkRateLimit({
    bucket: "hotel-rate-request",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (clean(body.company, 100)) {
    // Honeypot.
    return NextResponse.json({ ok: true });
  }

  const hotelId = clean(body.hotelId, 100);
  const hotelName = clean(body.hotelName, 200);
  const roomId = clean(body.roomId, 100);
  const roomName = clean(body.roomName, 200);
  const roomsCount = clean(body.roomsCount, 10);
  const checkIn = clean(body.checkIn, 40);
  const checkOut = clean(body.checkOut, 40);
  const guests = clean(body.guests, 10);
  const mealPlan = clean(body.mealPlan, 100);
  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const message = clean(body.message, 2000);

  if (!hotelId || !hotelName || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("hotel_rate_requests")
    .insert({
      hotel_id: hotelId,
      hotel_name_snapshot: hotelName,
      room_id: roomId || null,
      room_name_snapshot: roomName || null,
      rooms_count: roomsCount ? Number(roomsCount) : null,
      check_in: checkIn || null,
      check_out: checkOut || null,
      guests: guests ? Number(guests) : null,
      meal_plan: mealPlan || null,
      name: name || null,
      email,
      message: message || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("hotel_rate_requests insert failed:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const site = await getSiteSettings();
    const { subject, html, text } = hotelRateRequestEmail({
      hotelName,
      roomName: roomName || undefined,
      roomsCount: roomsCount || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests || undefined,
      mealPlan: mealPlan || undefined,
      name: name || undefined,
      email,
      message: message || undefined,
      reviewUrl: `${SITE_URL}/admin/hotel-rate-requests`,
    });
    await sendEmail({ to: site.contact.email, subject, html, text, replyTo: email });
  }

  return NextResponse.json({ ok: true });
}
