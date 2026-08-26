import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { hydrateJourneyRefs, type JourneyRef } from "@/lib/journeyHydrate";
import { validateDiscountCode } from "@/lib/discounts/validate";
import { redeemDiscountCode } from "@/lib/discounts/redeem";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { reservationConfirmationEmail } from "@/lib/email/templates";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ReservationBody = {
  guestName?: unknown;
  guestEmail?: unknown;
  guestPhone?: unknown;
  tripStartDate?: unknown;
  tripEndDate?: unknown;
  travelersAdults?: unknown;
  travelersChildren?: unknown;
  preferences?: unknown;
  discountCode?: unknown;
  items?: JourneyRef[];
};

function generateReference(): string {
  return `EE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// Creates a real reservation request (no payment — the Egypt Eye team
// follows up with confirmed pricing, same as the existing Customize Your
// Tour flow). This is the ONLY place a discount code is actually consumed:
// validated fresh against the server's own data (never trusting whatever
// the client displayed) and redeemed only after the reservation row exists.
export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Reservations aren't set up on this deployment yet." }, { status: 500 });
  }

  const { allowed } = await checkRateLimit({ bucket: "reservation-submit", key: getClientIp(request), max: 10, windowSeconds: 3600 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later, or message us on WhatsApp." }, { status: 429 });
  }

  let body: ReservationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const guestName = typeof body.guestName === "string" ? body.guestName.trim().slice(0, 200) : "";
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim().toLowerCase() : "";
  const guestPhone = typeof body.guestPhone === "string" ? body.guestPhone.trim().slice(0, 40) : null;
  const tripStartDate = typeof body.tripStartDate === "string" && body.tripStartDate ? body.tripStartDate : null;
  const tripEndDate = typeof body.tripEndDate === "string" && body.tripEndDate ? body.tripEndDate : null;
  const travelersAdults = Number.isInteger(body.travelersAdults) ? Math.max(1, Number(body.travelersAdults)) : 1;
  const travelersChildren = Number.isInteger(body.travelersChildren) ? Math.max(0, Number(body.travelersChildren)) : 0;
  const preferences = typeof body.preferences === "string" ? body.preferences.trim().slice(0, 2000) : null;
  const discountCodeInput = typeof body.discountCode === "string" ? body.discountCode.trim() : "";
  const items = Array.isArray(body.items) ? body.items : [];

  if (!guestName || !EMAIL_RE.test(guestEmail)) {
    return NextResponse.json({ error: "A valid name and email are required." }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Your journey is empty — add something before requesting a reservation." }, { status: 400 });
  }

  const user = await getCurrentUser();
  const hydrated = await hydrateJourneyRefs(items);

  const priced = [...hydrated.tours, ...hydrated.experiences, ...hydrated.photoshoots].filter(
    (item): item is typeof item & { price: { amount: number } } => typeof item.price?.amount === "number"
  );
  const subtotal = Math.round(priced.reduce((sum, item) => sum + item.price.amount, 0) * 100) / 100;
  const tourSlugs = hydrated.tours.map((t) => t.slug);
  const experienceSlugs = hydrated.experiences.map((e) => e.slug);

  let discountCodeId: string | null = null;
  let discountAmount = 0;

  if (discountCodeInput) {
    const validation = await validateDiscountCode({
      code: discountCodeInput,
      customerId: user?.id ?? null,
      tourSlugs,
      experienceSlugs,
      subtotal,
    });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }
    discountCodeId = validation.code.id;
    discountAmount = validation.discountAmount;
  }

  const reference = generateReference();
  const journeySnapshot = [
    ...hydrated.tours.map((t) => ({ type: "tour", slug: t.slug, title: t.title })),
    ...hydrated.experiences.map((e) => ({ type: "experience", slug: e.slug, title: e.title })),
    ...hydrated.photoshoots.map((p) => ({ type: "photoshoot", slug: p.slug, title: p.title })),
    ...hydrated.destinations.map((d) => ({ type: "destination", slug: d.slug, title: d.name })),
  ];

  const supabase = createAdminSupabaseClient();
  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert({
      reference,
      customer_id: user?.id ?? null,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      journey_snapshot: journeySnapshot,
      trip_start_date: tripStartDate,
      trip_end_date: tripEndDate,
      travelers_adults: travelersAdults,
      travelers_children: travelersChildren,
      preferences,
      discount_code_id: discountCodeId,
      subtotal_estimate: subtotal > 0 ? subtotal : null,
      discount_amount: discountAmount,
      total_estimate: subtotal > 0 ? Math.round((subtotal - discountAmount) * 100) / 100 : null,
      status: "requested",
    })
    .select("id, reference, total_estimate, discount_amount")
    .single();

  if (error || !reservation) {
    console.error("reservation insert failed:", error);
    return NextResponse.json({ error: "Something went wrong submitting your reservation. Please try again." }, { status: 500 });
  }

  let finalDiscountAmount = discountAmount;
  if (discountCodeId) {
    const redeemed = await redeemDiscountCode({ codeId: discountCodeId, reservationId: reservation.id, discountAmount });
    if (!redeemed) {
      // Lost a race (the same code was redeemed a moment earlier by another
      // request) — correct the reservation rather than claim a discount
      // that was never actually applied.
      finalDiscountAmount = 0;
      await supabase
        .from("reservations")
        .update({ discount_amount: 0, discount_code_id: null, total_estimate: subtotal > 0 ? subtotal : null })
        .eq("id", reservation.id);
    }
  }

  const { subject, html, text } = reservationConfirmationEmail({
    guestName,
    reference,
    itemTitles: journeySnapshot.map((i) => i.title),
    tripStartDate,
    discountAmount: finalDiscountAmount,
  });
  await sendIdempotentEmail({
    idempotencyKey: `reservation-confirmation:${reservation.id}`,
    notificationType: "reservation_confirmation",
    to: guestEmail,
    subject,
    html,
    text,
    customerId: user?.id,
    reservationId: reservation.id,
  });

  return NextResponse.json({
    ok: true,
    reference,
    subtotal: subtotal > 0 ? subtotal : null,
    discountAmount: finalDiscountAmount,
    total: subtotal > 0 ? Math.round((subtotal - finalDiscountAmount) * 100) / 100 : null,
  });
}
