import "server-only";

// Thin wrapper around Resend's HTTP API — same provider and pattern already
// used by src/app/api/customize-request/route.ts, just factored out so
// every new transactional email (discount code, newsletter verification,
// reservation confirmation, pre-trip notices) shares one implementation.
// Returns false on failure instead of throwing, so a caller can log it
// without ever surfacing a raw error to the visitor.
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  from: fromOverride,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /**
   * The From header, for callers that are not Egypt Eye.
   *
   * Added when Flying Dresses Egypt — a separate brand on its own domain in
   * this same app — started sending its own enquiry emails. Without it every
   * message from that brand arrived as "Egypt Eye Travel", which is a
   * different company as far as the customer is concerned.
   *
   * Optional, so every existing caller is byte-for-byte unchanged: omit it and
   * RESEND_FROM_EMAIL still decides. Whatever is passed must be a sender
   * Resend has a verified domain for, or Resend rejects the send and this
   * returns ok:false — which is the correct failure, since the alternative is
   * silently spoofing a domain.
   */
  from?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const from =
    fromOverride || process.env.RESEND_FROM_EMAIL || "Egypt Eye Travel <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text, reply_to: replyTo }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend send failed:", res.status, errText);
      return { ok: false, error: `Resend ${res.status}: ${errText}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend request failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Moved to ./breakdown so check scripts can reach it; re-exported here
// because several modules already import it from this file.
export { escapeHtml } from "./breakdown";
