import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendEmail } from "./resend";

// Sends an email at most once per idempotency key, ever — the real guard
// against a retried request (or a double-clicked verify link) triggering a
// duplicate discount-code email. `notification_log.idempotency_key` is
// UNIQUE, so the "claim" insert below is race-condition-safe: if two
// requests hit this at once, only one insert succeeds and only that one sends.
export async function sendIdempotentEmail({
  idempotencyKey,
  notificationType,
  to,
  subject,
  html,
  text,
  customerId,
  subscriberId,
  reservationId,
}: {
  idempotencyKey: string;
  notificationType: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  customerId?: string;
  subscriberId?: string;
  reservationId?: string;
}): Promise<{ sent: boolean; alreadySent: boolean }> {
  const supabase = createAdminSupabaseClient();

  const { error: claimError } = await supabase.from("notification_log").insert({
    idempotency_key: idempotencyKey,
    notification_type: notificationType,
    customer_id: customerId ?? null,
    subscriber_id: subscriberId ?? null,
    reservation_id: reservationId ?? null,
    status: "sent",
  });

  if (claimError) {
    // 23505 = unique_violation — another request already claimed (and
    // presumably sent) this exact notification.
    if (claimError.code === "23505") return { sent: false, alreadySent: true };
    console.error("notification_log claim failed:", claimError);
    return { sent: false, alreadySent: false };
  }

  const result = await sendEmail({ to, subject, html, text });
  if (!result.ok) {
    await supabase
      .from("notification_log")
      .update({ status: "failed", error_message: result.error ?? "unknown error" })
      .eq("idempotency_key", idempotencyKey);
    return { sent: false, alreadySent: false };
  }

  return { sent: true, alreadySent: false };
}
