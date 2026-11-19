import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import { collaborationApplicationEmail } from "@/lib/email/templates";
import { collaborationRecipient } from "@/lib/email/recipients";
import {
  validateMediaKit,
  isMediaKitPath,
  MEDIA_KIT_BUCKET,
} from "@/lib/collaborations/mediaKit";
import { parsePlatformAccounts } from "@/lib/creatorClub/intake";
import { scoreCreator } from "@/lib/creatorClub/scoring";

// Receives a submission from the "Collaborate With Egypt Eye" creator
// application form (/collaborate). Unlike Travel Agent applications, this
// one is persisted (collaboration_applications table) so the admin team
// can track status through a real review workflow — see
// src/app/(site)/admin/collaborations.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  // The PDF does NOT travel through this route: Vercel caps a function body
  // at 4.5 MB, below a real media kit, and rejects it before our code runs.
  // The browser uploads it straight to storage via /upload-url and reports
  // the path here. See src/lib/collaborations/mediaKit.ts.
  const claimedPath = clean(form.get("mediaKitPath"), 200);
  const hasUpload = claimedPath !== "";

  if (hasUpload && !isMediaKitPath(claimedPath)) {
    return NextResponse.json({ error: "That media kit upload could not be verified." }, { status: 400 });
  }

  const decision = validateMediaKit({
    // Size and type are enforced by the bucket and by the browser before the
    // upload starts; by the time a path exists, storage has already accepted
    // the object as a PDF within the cap. What is still this route's job is
    // the rule storage knows nothing about: at least one of the two.
    file: hasUpload ? { type: "application/pdf", size: 1 } : null,
    link: clean(form.get("mediaKitUrl"), 1000),
  });
  if (!decision.ok) {
    return NextResponse.json({ error: decision.error }, { status: 400 });
  }
  const mediaKitUrl = decision.link;

  // A well-formed path is not proof the object is there. Confirming it stops
  // a row claiming a media kit the team cannot open — which, for a mandatory
  // field, is worse than no application at all.
  let mediaKitPath: string | null = null;
  if (hasUpload) {
    try {
      const folder = claimedPath.slice(0, claimedPath.indexOf("/"));
      const name = claimedPath.slice(claimedPath.indexOf("/") + 1);
      const { data: found, error: listError } = await createAdminSupabaseClient()
        .storage.from(MEDIA_KIT_BUCKET)
        .list(folder, { search: name, limit: 1 });
      if (listError) throw listError;
      mediaKitPath = found?.some((o) => o.name === name) ? claimedPath : null;
    } catch (err) {
      console.error("media kit verification failed:", err);
      mediaKitPath = null;
    }

    if (!mediaKitPath && !mediaKitUrl) {
      return NextResponse.json(
        { error: "We could not find that uploaded file. Please try again, or paste a link to your media kit instead." },
        { status: 400 },
      );
    }
  }
  const mediaKitNote =
    hasUpload && !mediaKitPath
      ? "A PDF upload was reported but the file could not be found — the link below is what came through."
      : null;

  // ---------------------------------------------------------------------
  // The preliminary score.
  //
  // Computed HERE, from the submitted performance figures, every time. A
  // score, tier or eligibility flag in the payload is never read — the form
  // previews a number using the same module, but the stored one is always
  // the server's. See src/lib/creatorClub/intake.ts.
  //
  // The figures are self-reported, so this is preliminary in the strongest
  // sense: it proposes a tier for a human to verify against the screenshots
  // and the media kit. Nothing is approved on the strength of it.
  // ---------------------------------------------------------------------
  let performanceRaw: unknown = null;
  try {
    performanceRaw = JSON.parse(clean(form.get("platformAccounts"), 20000) || "[]");
  } catch {
    performanceRaw = null;
  }
  const platformAccounts = parsePlatformAccounts(performanceRaw);
  const scored = scoreCreator(platformAccounts);

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
      score_inputs: platformAccounts.length > 0 ? platformAccounts : null,
      preliminary_score: platformAccounts.length > 0 ? scored.normalised : null,
      preliminary_tier: platformAccounts.length > 0 ? scored.tier : null,
      eligible: platformAccounts.length > 0 ? scored.eligible : null,
      score_breakdown: platformAccounts.length > 0 ? scored.categories : null,
      score_computed_at: platformAccounts.length > 0 ? new Date().toISOString() : null,
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
    }

    // The signed link is a convenience; /admin mints a fresh one on every
    // view, so a failure here costs nothing but a click.
    const emailNote =
      mediaKitNote ??
      (mediaKitPath && !mediaKitFileUrl
        ? "The PDF is stored — open the application in admin to read it."
        : null);

    const { subject, html, text } = collaborationApplicationEmail({
      fullName,
      email,
      socialsSummary,
      collaborationType,
      mediaKitFileUrl,
      mediaKitUrl,
      mediaKitNote: emailNote,
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
