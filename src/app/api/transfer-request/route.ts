import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import { transferRequestEmail } from "@/lib/email/templates";

// Receives a submission from the Transfers booking form (/transfers) and
// emails the full request — route, vehicle, date/time, passenger/luggage
// counts, and either the instant price or "Quote requested" — to the
// reservations team via Resend. Mirrors /api/enquiry's shape (rate limit ->
// validate -> build email -> sendEmail) but with its own field set, since a
// transfer request's fields (route, vehicle, price) don't fit the
// tour/experience/photoshoot enquiry shape.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "transfer-request",
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

  // Honeypot: a hidden field real visitors never fill in.
  if (clean(body.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  const routeSummary = clean(body.routeSummary, 300);
  const priceSummary = clean(body.priceSummary, 100);
  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 60);
  const date = clean(body.date, 40);
  const time = clean(body.time, 40);
  const passengers = clean(body.passengers, 20);
  const luggage = clean(body.luggage, 20);
  const vehicle = clean(body.vehicle, 100);
  const notes = clean(body.notes, 2000);

  if (!routeSummary || !priceSummary || !vehicle) {
    return NextResponse.json({ error: "Missing transfer details" }, { status: 400 });
  }
  if (!name || !EMAIL_RE.test(email) || !phone || !date || !passengers) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email delivery is not configured on this deployment" }, { status: 500 });
  }

  const site = await getSiteSettings();

  const { subject, html, text } = transferRequestEmail({
    routeSummary,
    priceSummary,
    name,
    email,
    phone,
    date,
    time: time || "Not specified",
    passengers,
    luggage: luggage || "Not specified",
    vehicle,
    notes: notes || undefined,
  });

  const result = await sendEmail({ to: site.contact.email, subject, html, text, replyTo: email });
  if (!result.ok) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
