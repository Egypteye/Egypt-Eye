import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getExperienceBySlug, getPhotoshootBySlug, getSiteSettings } from "@/sanity/fetchers";
import { resolveDeposit } from "@/lib/booking/deposit";
import { paymentProvider } from "@/lib/booking/paymentProvider";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { sendEmail } from "@/lib/email/resend";
import { bookingRequestTeamEmail, bookingRequestCustomerEmail } from "@/lib/email/templates";
import { site } from "@/content/site";
import { siteUrl } from "@/content/seo";

// Creates a deposit booking — the "Secure your date" path.
//
// Two rules decide the shape of this file, both from docs/booking-deposits.md.
//
// First: the reservation is written BEFORE the customer is sent to pay. If it
// were written after, every abandoned payment would be invisible and anyone
// who paid and closed the tab would have paid for a booking that does not
// exist. Writing it first means an unpaid request is a lead the desk can
// follow up, which is strictly better than nothing.
//
// Second: this route never confirms anything. It creates a request. A payment
// later moves the money to 'authorized' and the booking to 'checking', and a
// person moves it to 'confirmed'. Nothing here may shorten that.
//
// When no payment provider is configured the route still works: the booking is
// recorded as a request with no deposit, and the response says so, so the page
// can show an honest "we have your request" instead of a broken checkout.

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PEOPLE = 20;

type Body = {
  productType?: unknown;
  productSlug?: unknown;
  startsAt?: unknown;
  slotLabel?: unknown;
  people?: unknown;
  guestName?: unknown;
  guestEmail?: unknown;
  guestPhone?: unknown;
  notes?: unknown;
};

function generateReference(): string {
  return `EE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * The requested slot, validated.
 *
 * Rejects anything unparseable or in the past. The upper bound is a guard
 * against a mistyped year silently creating a booking for 2125 that would sit
 * in the queue forever.
 */
function parseStartsAt(value: unknown): { ok: true; iso: string } | { ok: false; message: string } {
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, message: "Please choose a date." };
  }
  const when = new Date(value);
  if (Number.isNaN(when.getTime())) return { ok: false, message: "That date could not be read." };

  // Midnight today, so a booking made during the day for later today is fine.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (when < today) return { ok: false, message: "Please choose a date in the future." };

  const twoYears = new Date();
  twoYears.setFullYear(twoYears.getFullYear() + 2);
  if (when > twoYears) {
    return { ok: false, message: "Please choose a date within the next two years, or message us." };
  }
  return { ok: true, iso: when.toISOString() };
}

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Bookings aren't set up on this deployment yet." },
      { status: 500 }
    );
  }

  const { allowed } = await checkRateLimit({
    bucket: "deposit-booking",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later, or message us on WhatsApp." },
      { status: 429 }
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const productType = body.productType === "photoshoot" || body.productType === "experience" ? body.productType : null;
  const productSlug = typeof body.productSlug === "string" ? body.productSlug.trim() : "";
  const guestName = typeof body.guestName === "string" ? body.guestName.trim().slice(0, 200) : "";
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim().toLowerCase() : "";
  const guestPhone = typeof body.guestPhone === "string" ? body.guestPhone.trim().slice(0, 40) || null : null;
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) || null : null;
  const slotLabel = typeof body.slotLabel === "string" ? body.slotLabel.trim().slice(0, 120) || null : null;
  const people = Number.isInteger(body.people) ? Number(body.people) : 1;

  if (!productType || !productSlug) {
    return NextResponse.json({ error: "That booking link is incomplete." }, { status: 400 });
  }
  if (!guestName || !EMAIL_RE.test(guestEmail)) {
    return NextResponse.json({ error: "A valid name and email are required." }, { status: 400 });
  }
  if (people < 1 || people > MAX_PEOPLE) {
    return NextResponse.json(
      { error: `Please enter between 1 and ${MAX_PEOPLE} people. For a larger group, message us.` },
      { status: 400 }
    );
  }
  const when = parseStartsAt(body.startsAt);
  if (!when.ok) return NextResponse.json({ error: when.message }, { status: 400 });

  // The product decides whether it can be booked this way and for how much.
  // Read server-side, never taken from the request: a deposit amount that
  // arrived in a POST body would be a price the customer set themselves.
  const [product, settings] = await Promise.all([
    productType === "photoshoot" ? getPhotoshootBySlug(productSlug) : getExperienceBySlug(productSlug),
    getSiteSettings(),
  ]);
  if (!product) {
    return NextResponse.json({ error: "That experience could not be found." }, { status: 404 });
  }

  const deposit = resolveDeposit(product, settings.defaultDepositUsd);
  if (!deposit.bookable) {
    return NextResponse.json(
      { error: "This experience isn't available for online booking. Please message us and we'll arrange it." },
      { status: 400 }
    );
  }

  const provider = paymentProvider();
  // A PayPal payment link is the simple path: Egypt Eye creates the links in
  // PayPal, one per deposit amount, and pastes them into the Studio. The money
  // moves when the customer pays rather than being held, so the wording and
  // the refund promise differ — see PaymentMode in lib/booking/wording.ts.
  //
  // Taken from the product server-side and already host-checked, so a link can
  // only ever point at PayPal however the field was edited.
  const paymentLink = deposit.paymentLink;
  const user = await getCurrentUser();
  const reference = generateReference();
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      reference,
      customer_id: user?.id ?? null,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      preferences: notes,
      product_type: productType,
      product_slug: productSlug,
      starts_at: when.iso,
      slot_label: slotLabel,
      travelers_adults: people,
      trip_start_date: when.iso.slice(0, 10),
      journey_snapshot: [
        { type: productType, slug: productSlug, title: product.title, startsAt: when.iso, slotLabel, people },
      ],
      // The booking is a request until a person says otherwise, whether or not
      // a deposit is ever paid.
      status: "requested",
      deposit_amount: provider.enabled || paymentLink ? deposit.amountUsd : null,
      deposit_status: provider.enabled || paymentLink ? "awaiting" : "not_required",
      payment_provider: provider.enabled ? provider.name : paymentLink ? "paypal-link" : null,
    })
    .select("id, reference")
    .single();

  if (error || !data) {
    console.error("booking insert failed:", error);
    return NextResponse.json(
      { error: "Something went wrong saving your request. Please try again, or message us on WhatsApp." },
      { status: 500 }
    );
  }

  // Emails are best-effort: a booking that was written must never be reported
  // as failed because a mail provider was slow. Same posture as
  // /api/reservations.
  // Emails are best-effort: a booking that was written must never be reported
  // as failed because a mail provider was slow. The desk also has the admin
  // list regardless, and the customer has the reference in the response.
  try {
    const customer = bookingRequestCustomerEmail({
      reference,
      guestName,
      productTitle: product.title,
      startsAt: when.iso,
      slotLabel,
      people,
      depositUsd: provider.enabled || paymentLink ? deposit.amountUsd : null,
      paymentLink,
    });
    await sendIdempotentEmail({
      idempotencyKey: `booking-request:${data.id}`,
      notificationType: "booking_request",
      to: guestEmail,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
      customerId: user?.id,
      reservationId: data.id,
    });
  } catch (err) {
    console.error("booking customer email failed (booking was saved):", err);
  }

  try {
    const team = bookingRequestTeamEmail({
      reference,
      productTitle: product.title,
      productType,
      startsAt: when.iso,
      slotLabel,
      people,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      depositUsd: provider.enabled ? deposit.amountUsd : null,
      accountState: user ? "signed-in" : "guest",
    });
    await sendEmail({
      to: site.contact.email,
      subject: team.subject,
      html: team.html,
      text: team.text,
      // So a reply from the desk goes to the traveller, not into a void.
      replyTo: guestEmail,
    });
  } catch (err) {
    console.error("booking team email failed (booking was saved):", err);
  }

  // The payment-link path. Nothing to call: the customer is handed the link
  // and pays in PayPal, and the desk matches the payment to the reference.
  if (paymentLink) {
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: { amountUsd: deposit.amountUsd, paymentLink },
      next: "payLink" as const,
    });
  }

  // No payment rail at all: the honest answer is that we have the request, not
  // that a date is secured.
  if (!provider.enabled) {
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: null,
      next: "awaitingTeam" as const,
    });
  }

  const hold = await provider.createHold({
    reference: data.reference,
    amountUsd: deposit.amountUsd,
    description: `Deposit to secure ${product.title} — ${data.reference}`,
    returnUrl: `${siteUrl}/secure/return?ref=${data.reference}`,
    cancelUrl: `${siteUrl}/secure/${productType}/${productSlug}?ref=${data.reference}`,
  });

  if (!hold.ok) {
    // The booking stands; only the payment could not be started. Saying so is
    // better than losing the request, and the desk already has the email.
    console.error("createHold failed:", hold.reason, hold.message);
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: null,
      next: "awaitingTeam" as const,
      notice: "We have your request. We could not open the deposit page just now, so our team will follow up directly.",
    });
  }

  await supabase
    .from("reservations")
    .update({ payment_order_id: hold.orderId })
    .eq("id", data.id);

  return NextResponse.json({
    ok: true,
    reference: data.reference,
    deposit: { amountUsd: deposit.amountUsd, approvalUrl: hold.approvalUrl },
    next: "payDeposit" as const,
  });
}
