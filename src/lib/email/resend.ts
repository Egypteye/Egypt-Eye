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
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "Egypt Eye Travel <onboarding@resend.dev>";

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

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
