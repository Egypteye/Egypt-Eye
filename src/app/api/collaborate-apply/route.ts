import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import { collaborationApplicationEmail } from "@/lib/email/templates";
import { collaborationRecipient } from "@/lib/email/recipients";
import crypto from "node:crypto";
import { validateMediaKit, MEDIA_KIT_MIME } from "@/lib/collaborations/mediaKit";

// Receives a submission from the "Collaborate With Egypt Eye" creator
// application form (/collaborate). Unlike Travel Agent applications, this
// one is persisted (collaboration_applications table) so the admin team
// can track status through a real review workflow — see
// src/app/(site)/admin/collaborations.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Private bucket. A media kit carries the applicant's name, face and rates. */
const MEDIA_KIT_BUCKET = "collaboration-media-kits";
/**
 * How long the link in the team's email stays valid.
 *
 * Thirty days, matching the papyrus commission photographs. It is a
 * convenience only: the admin page mints a fresh signed link every time it
 * is opened, so an application reviewed months later still works.
 */
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 30;

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

  // Multipart rather than JSON, so the media kit PDF travels with the
  // application instead of becoming a second step the applicant has to
  // remember. Same shape as /api/treasure-request, which carries a
  // commission photograph the same way.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (clean(form.get("company"), 100)) {
    // Honeypot.
    return NextResponse.json({ ok: true });
  }

  // The social rows are built client-side and arrive as one JSON field,
  // because FormData has no nested shape. A malformed value is treated as
  // "none given" and caught by the required-fields check below rather than
  // throwing.
  let socialsRaw: unknown = null;
  try {
    socialsRaw = JSON.parse(clean(form.get("socialAccounts"), 4000) || "[]");
  } catch {
    socialsRaw = null;
  }

  const fullName = clean(form.get("fullName"), 200);
  const email = clean(form.get("email"), 200);
  const phone = clean(form.get("phone"), 60);
  const socialAccounts = cleanSocialAccounts(socialsRaw);
  const engagementRate = clean(form.get("engagementRate"), 100);
  const audienceCountries = clean(form.get("audienceCountries"), 300);
  const travelDates = clean(form.get("travelDates"), 200);
  const portfolioUrl = clean(form.get("portfolioUrl"), 500);
  const collaborationType = clean(form.get("collaborationType"), 100);
  const message = clean(form.get("message"), 2000);

  if (!fullName || !EMAIL_RE.test(email) || socialAccounts.length === 0 || !collaborationType) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  // ---------------------------------------------------------------------
  // The media kit. Mandatory: a PDF, a link, or both.
  //
  // Validated BEFORE the row is inserted. Writing the application first and
  // rejecting afterwards would leave a half-application in the table that the
  // applicant believes they never sent.
  // ---------------------------------------------------------------------
  const mediaKitFile = form.get("mediaKitFile");
  const file = mediaKitFile instanceof File && mediaKitFile.size > 0 ? mediaKitFile : null;
  const decision = validateMediaKit({
    file: file ? { type: file.type, size: file.size } : null,
    link: clean(form.get("mediaKitUrl"), 1000),
  });
  if (!decision.ok) {
    return NextResponse.json({ error: decision.error }, { status: 400 });
  }
  const mediaKitUrl = decision.link;

  // Uploaded with the service role into a PRIVATE bucket. A media kit holds
  // the creator's name, photographs and usually their rates; it is not
  // something to leave on a guessable public URL.
  let mediaKitPath: string | null = null;
  let mediaKitNote: string | null = null;
  if (file) {
    try {
      const supabaseStorage = createAdminSupabaseClient();
      const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabaseStorage.storage
        .from(MEDIA_KIT_BUCKET)
        .upload(path, file, { contentType: MEDIA_KIT_MIME, upsert: false });
      if (uploadError) throw uploadError;
      mediaKitPath = path;
    } catch (err) {
      console.error("media kit upload failed:", err);
      // Refuse rather than accept. Unlike the papyrus photograph — where
      // losing the commission would be worse than chasing the photo by
      // reply — a media kit is the whole point of this form, and an
      // applicant who is told "received" while the file was dropped has no
      // way to know the team cannot see it.
      if (!mediaKitUrl) {
        return NextResponse.json(
          { error: "We could not store that file. Please try again, or paste a link to your media kit instead." },
          { status: 503 },
        );
      }
      mediaKitNote = "A PDF was attached but could not be stored — the link below is what came through.";
    }
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
      media_kit_url: mediaKitUrl,
      media_kit_path: mediaKitPath,
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

    // A link straight to the uploaded PDF, so the team can read the media kit
    // from the email rather than signing in first. Best effort: if the signed
    // link cannot be minted the email still goes, pointing at /admin, which
    // mints a fresh one on every view.
    let mediaKitFileUrl: string | null = null;
    if (mediaKitPath) {
      try {
        const { data: signed } = await createAdminSupabaseClient()
          .storage.from(MEDIA_KIT_BUCKET)
          .createSignedUrl(mediaKitPath, SIGNED_URL_SECONDS);
        mediaKitFileUrl = signed?.signedUrl ?? null;
      } catch (err) {
        console.error("media kit signed link failed:", err);
      }
      if (!mediaKitFileUrl && !mediaKitNote) {
        mediaKitNote = "The PDF is stored — open the application in admin to read it.";
      }
    }

    const { subject, html, text } = collaborationApplicationEmail({
      fullName,
      email,
      socialsSummary,
      collaborationType,
      mediaKitFileUrl,
      mediaKitUrl,
      mediaKitNote,
      reviewUrl: `${SITE_URL}/admin/collaborations/${data.id}`,
    });
    // Collaborations, not Reservations — see src/lib/email/recipients.ts.
    await sendEmail({
      to: collaborationRecipient(site.contact),
      subject,
      html,
      text,
      replyTo: email,
    });
  }

  return NextResponse.json({ ok: true });
}
