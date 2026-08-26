import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import { travelAgentApplicationEmail } from "@/lib/email/templates";

// Receives a submission from the Travel Agent Program application form
// (/travel-agents), stores it in travel_agent_applications, and emails the
// team a heads-up. The admin review workflow (approve/reject, and — on
// approval — provisioning the agent's partner portal access) lives at
// src/app/(site)/admin/travel-agents.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanServices(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => clean(v, 100))
    .filter((v) => v.length > 0)
    .slice(0, 10);
}

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "This feature is not configured on this deployment" }, { status: 500 });
  }

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
  const services = cleanServices(body.services);
  const estimatedBookings = clean(body.estimatedBookings, 100);
  const message = clean(body.message, 2000);

  if (!companyName || !contactName || !EMAIL_RE.test(email) || !phone || !country || services.length === 0 || !estimatedBookings) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("travel_agent_applications")
    .insert({
      company_name: companyName,
      contact_name: contactName,
      email,
      phone,
      website: website || null,
      country,
      services,
      estimated_bookings: estimatedBookings,
      message: message || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("travel_agent_applications insert failed:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const site = await getSiteSettings();
    const { subject, html, text } = travelAgentApplicationEmail({
      companyName,
      contactName,
      email,
      phone,
      website,
      country,
      services: services.join(", "),
      estimatedBookings,
      message: message || undefined,
      reviewUrl: `${SITE_URL}/admin/travel-agents/${data.id}`,
    });
    await sendEmail({ to: site.contact.email, subject, html, text, replyTo: email });
  }

  return NextResponse.json({ ok: true });
}
