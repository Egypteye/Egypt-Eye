import "server-only";
import { escapeHtml } from "./resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

function baseLayout({ preheader, bodyHtml, footerHtml }: { preheader: string; bodyHtml: string; footerHtml: string }) {
  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4efe2;font-family:Georgia,'Times New Roman',serif;">
  <span style="display:none;font-size:1px;color:#f4efe2;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#fffcf5;border-radius:20px;overflow:hidden;border:1px solid rgba(219,165,58,0.25);">
        <tr>
          <td style="background:#0b1930;padding:28px 32px;text-align:center;">
            <span style="color:#ecc06a;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Egypt Eye Travel and Tours</span>
          </td>
        </tr>
        <tr><td style="padding:32px;color:#0b1930;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid rgba(11,25,48,0.08);color:#7c7362;font-size:12px;font-family:Arial,sans-serif;line-height:1.6;">
            ${footerHtml}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:999px;background:#0b1930;">
    <a href="${href}" style="display:inline-block;padding:14px 28px;color:#fffcf5;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
  </td></tr></table>`;
}

export function newsletterVerifyEmail({ firstName, verifyUrl }: { firstName?: string | null; verifyUrl: string }) {
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi there,";
  const html = baseLayout({
    preheader: "Confirm your subscription to receive your 4% off code.",
    bodyHtml: `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 16px;">Thanks for signing up for Egypt Eye travel inspiration. Confirm your email below and we'll send your exclusive 4% off code right after.</p>
      ${ctaButton("Confirm My Subscription", verifyUrl)}
      <p style="margin:16px 0 0;font-size:13px;color:#556;">If you didn't request this, you can safely ignore this email.</p>
    `,
    footerHtml: `Egypt Eye Travel and Tours — private tours, experiences &amp; photoshoots across Egypt &amp; Jordan.`,
  });
  const text = `${greeting}\n\nConfirm your email to receive your 4% off code: ${verifyUrl}\n\nIf you didn't request this, you can ignore this email.`;
  return { subject: "Confirm your Egypt Eye subscription", html, text };
}

export function discountCodeEmail({
  firstName,
  code,
  expiresAt,
  unsubscribeUrl,
}: {
  firstName?: string | null;
  code: string;
  expiresAt: string | null;
  unsubscribeUrl: string;
}) {
  const greeting = firstName ? `Welcome, ${escapeHtml(firstName)}!` : "Welcome!";
  const expiryLine = expiresAt
    ? `<p style="margin:0 0 16px;font-size:13px;color:#556;">Valid until ${escapeHtml(
        new Date(expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      )}.</p>`
    : "";
  const html = baseLayout({
    preheader: `Your unique code: ${code} — 4% off your Egypt journey.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 20px;">You're in. Here's your exclusive 4% off code for any Egypt Eye tour or journey — yours alone, ready whenever you are.</p>
      <div style="text-align:center;margin:24px 0;padding:20px;background:#f4efe2;border-radius:16px;border:1px dashed #dba53a;">
        <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b17f24;">4% Off Your Egypt Journey</div>
        <div style="font-family:'Courier New',monospace;font-size:26px;font-weight:bold;letter-spacing:2px;color:#0b1930;margin-top:6px;">${escapeHtml(code)}</div>
      </div>
      ${expiryLine}
      <p style="margin:0 0 16px;">Use it during your reservation request on any tour or custom itinerary — we'll apply it to your estimate and confirm the final amount with you directly.</p>
      ${ctaButton("Plan My Egypt", `${SITE_URL}/explore-egypt`)}
      <p style="margin:16px 0 0;font-size:12px;color:#889;">One code per customer, one-time use, subject to the campaign's terms shown at checkout. Not combinable with other offers unless stated.</p>
    `,
    footerHtml: `You're receiving this because you subscribed to Egypt Eye travel updates. <a href="${unsubscribeUrl}" style="color:#7c7362;">Unsubscribe</a> or manage your preferences anytime.`,
  });
  const text = `${greeting}\n\nYour unique 4% off code: ${code}\n${expiresAt ? `Valid until ${new Date(expiresAt).toLocaleDateString()}\n` : ""}\nUse it during your reservation request at ${SITE_URL}/explore-egypt\n\nUnsubscribe: ${unsubscribeUrl}`;
  return { subject: "Your Egypt Eye 4% Off Is Here 🇪🇬", html, text };
}
