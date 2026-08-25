import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import { travelAgentApplicationEmail } from "@/lib/email/templates";

// Receives a submission from the Travel Agent Program application form
// (/travel-agents) and emails it to the reservations team. Deliberately
// email-only (no database table) per the request to "keep the system
// simple and easy to expand later" — if a future admin review workflow is
// wanted, the natural next step is a `travel_agent_applications` table
// (mirroring how influencer applications are stored) plus an admin list
// page; nothing here would need to change to add that, since this route
// already validates and shapes the data cleanly before sending it on.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "travel-agent-apply",
    key: getClientIp(request),
    max: 5,
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

  const companyName = clean(body.companyName, 200);
  const contactName = clean(body.contactName, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 60);
  const website = clean(body.website, 300);
  const country = clean(body.country, 100);
  const services = clean(body.services, 300);
  const estimatedBookings = clean(body.estimatedBookings, 100);
  const message = clean(body.message, 2000);

  if (!companyName || !contactName || !EMAIL_RE.test(email) || !phone || !country || !services || !estimatedBookings) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email delivery is not configured on this deployment" }, { status: 500 });
  }

  const site = await getSiteSettings();

  const { subject, html, text } = travelAgentApplicationEmail({
    companyName,
    contactName,
    email,
    phone,
    website,
    country,
    services,
    estimatedBookings,
    message: message || undefined,
  });

  const result = await sendEmail({ to: site.contact.email, subject, html, text, replyTo: email });
  if (!result.ok) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
