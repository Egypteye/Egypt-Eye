import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import { affiliateApplicationEmail } from "@/lib/email/templates";

// Receives a submission from the Affiliate Program application form
// (/affiliate), stores it in affiliate_applications, and emails the team a
// heads-up. The admin review workflow lives at src/app/(site)/admin/affiliates.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanMethods(value: unknown): string[] {
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
    bucket: "affiliate-apply",
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

  const fullName = clean(body.fullName, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 60);
  const websiteOrPlatform = clean(body.websiteOrPlatform, 300);
  const audienceSize = clean(body.audienceSize, 100);
  const promotionMethods = cleanMethods(body.promotionMethods);
  const payoutMethod = clean(body.payoutMethod, 100);
  const message = clean(body.message, 2000);

  if (!fullName || !EMAIL_RE.test(email) || !websiteOrPlatform || promotionMethods.length === 0) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("affiliate_applications")
    .insert({
      full_name: fullName,
      email,
      phone: phone || null,
      website_or_platform: websiteOrPlatform,
      audience_size: audienceSize || null,
      promotion_methods: promotionMethods,
      payout_method: payoutMethod || null,
      message: message || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("affiliate_applications insert failed:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const site = await getSiteSettings();
    const { subject, html, text } = affiliateApplicationEmail({
      fullName,
      email,
      websiteOrPlatform,
      audienceSize,
      promotionMethods: promotionMethods.join(", "),
      reviewUrl: `${SITE_URL}/admin/affiliates/${data.id}`,
    });
    await sendEmail({ to: site.contact.email, subject, html, text, replyTo: email });
  }

  return NextResponse.json({ ok: true });
}
