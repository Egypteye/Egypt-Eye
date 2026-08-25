import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import { collaborationApplicationEmail } from "@/lib/email/templates";

// Receives a submission from the "Collaborate With Egypt Eye" creator
// application form (/collaborate). Unlike Travel Agent applications, this
// one is persisted (collaboration_applications table) so the admin team
// can track status through a real review workflow — see
// src/app/(site)/admin/collaborations.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

type SocialAccount = { platform: string; handle: string; followers: string };

function cleanSocialAccounts(value: unknown): SocialAccount[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const platform = clean(record.platform, 60);
      const handle = clean(record.handle, 100);
      const followers = clean(record.followers, 40);
      if (!platform && !handle) return null;
      return { platform, handle, followers };
    })
    .filter((a): a is SocialAccount => a !== null)
    .slice(0, 10);
}

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "This feature is not configured on this deployment" }, { status: 500 });
  }

  const { allowed } = await checkRateLimit({
    bucket: "collaborate-apply",
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
  const socialAccounts = cleanSocialAccounts(body.socialAccounts);
  const engagementRate = clean(body.engagementRate, 100);
  const audienceCountries = clean(body.audienceCountries, 300);
  const travelDates = clean(body.travelDates, 200);
  const portfolioUrl = clean(body.portfolioUrl, 500);
  const collaborationType = clean(body.collaborationType, 100);
  const message = clean(body.message, 2000);

  if (!fullName || !EMAIL_RE.test(email) || socialAccounts.length === 0 || !collaborationType) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("collaboration_applications")
    .insert({
      full_name: fullName,
      email,
      phone: phone || null,
      social_accounts: socialAccounts,
      engagement_rate: engagementRate || null,
      audience_countries: audienceCountries || null,
      travel_dates: travelDates || null,
      portfolio_url: portfolioUrl || null,
      collaboration_type: collaborationType,
      message: message || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("collaboration_applications insert failed:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const site = await getSiteSettings();
    const socialsSummary = socialAccounts.map((a) => `${a.platform}: ${a.handle} (${a.followers || "?"})`).join("; ");
    const { subject, html, text } = collaborationApplicationEmail({
      fullName,
      email,
      socialsSummary,
      collaborationType,
      reviewUrl: `${SITE_URL}/admin/collaborations/${data.id}`,
    });
    await sendEmail({ to: site.contact.email, subject, html, text, replyTo: email });
  }

  return NextResponse.json({ ok: true });
}
