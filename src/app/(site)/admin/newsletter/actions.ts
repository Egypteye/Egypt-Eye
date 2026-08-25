"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { newsletterBroadcastEmail } from "@/lib/email/templates";
import { escapeHtml } from "@/lib/email/resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function paragraphsToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

// Manually add a subscriber from the admin panel — skips double opt-in
// (staff is vouching for the address directly, e.g. importing a list from
// a trade show or a past customer), so it's marked verified immediately
// and does NOT mint a discount code (that stays exclusive to the popup/
// homepage signup flow, so "one welcome discount per customer" holds).
export async function addSubscriberManually(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim();
  if (!EMAIL_RE.test(email)) return;

  await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email,
        first_name: firstName || null,
        source: "admin",
        verified: true,
        verified_at: new Date().toISOString(),
      },
      { onConflict: "email", ignoreDuplicates: true }
    );

  revalidatePath("/admin/newsletter");
}

export async function setSubscriberUnsubscribed(subscriberId: string, unsubscribed: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed, unsubscribed_at: unsubscribed ? new Date().toISOString() : null })
    .eq("id", subscriberId);
  revalidatePath("/admin/newsletter");
}

export type BroadcastResult = { sent: number; skipped: number; failed: number };

// Sends one composed email to every verified, still-subscribed address.
// Sequential + synchronous — fine at the subscriber counts a new site has;
// if the list grows large enough to risk a serverless timeout, this is the
// point to move to a queued background job instead (the idempotency guard
// below already makes that swap safe — a retried/resumed job can't
// double-send to anyone it already reached).
export async function sendNewsletterBroadcast(formData: FormData): Promise<BroadcastResult> {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!subject || !body) return { sent: 0, skipped: 0, failed: 0 };

  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, unsubscribe_token")
    .eq("verified", true)
    .eq("unsubscribed", false);

  const subscribers = data ?? [];
  const bodyHtml = paragraphsToHtml(body);
  const broadcastKey = `broadcast:${Buffer.from(subject).toString("base64").slice(0, 40)}:${Date.now()}`;

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;
    const { subject: emailSubject, html, text } = newsletterBroadcastEmail({
      subject,
      bodyHtml,
      bodyText: body,
      unsubscribeUrl,
    });

    const result = await sendIdempotentEmail({
      idempotencyKey: `${broadcastKey}:${subscriber.id}`,
      notificationType: "newsletter_broadcast",
      to: subscriber.email,
      subject: emailSubject,
      html,
      text,
      subscriberId: subscriber.id,
    });

    if (result.sent) sent++;
    else if (result.alreadySent) skipped++;
    else failed++;
  }

  revalidatePath("/admin/newsletter");
  return { sent, skipped, failed };
}
