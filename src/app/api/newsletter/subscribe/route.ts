import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import { newsletterVerifyEmail } from "@/lib/email/templates";

// Real double opt-in: this route only ever creates/updates a
// newsletter_subscribers row and emails a confirmation link. Nothing is
// "subscribed" (verified, eligible for the discount email) until the
// visitor clicks that link — see /api/newsletter/verify.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

type SubscribeBody = { email?: unknown; firstName?: unknown; source?: unknown };

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "The newsletter isn't set up on this deployment yet." }, { status: 500 });
  }

  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : undefined;
  const source = typeof body.source === "string" && body.source ? body.source.slice(0, 60) : "newsletter";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, first_name, verified, verify_token, unsubscribed")
    .eq("email", email)
    .maybeSingle();

  let verifyToken: string;

  if (!existing) {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, first_name: firstName || null, source })
      .select("verify_token")
      .single();
    if (error || !data) {
      console.error("newsletter subscribe insert failed:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
    verifyToken = data.verify_token;
  } else if (existing.verified && !existing.unsubscribed) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  } else if (existing.unsubscribed) {
    // Resubscribing after unsubscribing — treat as a fresh opt-in with a
    // fresh token, still requiring confirmation.
    const newToken = crypto.randomUUID();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        unsubscribed: false,
        unsubscribed_at: null,
        verified: false,
        verified_at: null,
        verify_token: newToken,
        first_name: firstName || existing.first_name,
        source,
        consent_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      console.error("newsletter resubscribe update failed:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
    verifyToken = newToken;
  } else {
    // Already pending verification — resend the same link rather than
    // silently doing nothing (they may have lost the first email).
    verifyToken = existing.verify_token;
  }

  const verifyUrl = `${SITE_URL}/api/newsletter/verify?token=${verifyToken}`;
  const { subject, html, text } = newsletterVerifyEmail({ firstName, verifyUrl });
  const result = await sendEmail({ to: email, subject, html, text });
  if (!result.ok) {
    console.error("newsletter verification email failed:", result.error);
    return NextResponse.json({ error: "Couldn't send the confirmation email. Please try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, alreadySubscribed: false });
}
