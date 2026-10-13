import "server-only";
import { escapeHtml } from "./breakdown";
import { brand, contact } from "@/content/flyingDresses";

/**
 * Transactional email for Flying Dresses Egypt.
 *
 * Separate from ./templates.ts, which is Egypt Eye's: that module's layout is
 * signed "Egypt Eye Travel and Tours" and links to egypteyetravel.com, and a
 * customer who enquired about a flying dress should not receive mail from a
 * tour operator they have never heard of. Same reasoning as the separate root
 * layout — one app, two businesses.
 *
 * Both templates are plain tables with inline styles, because that is what
 * survives Outlook, Gmail's CSS stripping and every dark-mode client in
 * between. No web fonts, no background images, no flexbox, and every colour
 * stated explicitly so a client that inverts the palette cannot land ivory
 * text on ivory.
 */

const INK = "#14110f";
const IVORY = "#f8f4ed";
const GOLD = "#8a6a28";
const MUTED = "#554d46";

/** The From header. Needs a Resend-verified domain to actually send. */
export const FLYING_DRESSES_FROM =
  process.env.FLYING_DRESSES_FROM_EMAIL || `${brand.name} <${contact.email}>`;

function layout({ preheader, bodyHtml }: { preheader: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(brand.name)}</title></head>
<body style="margin:0;padding:0;background:${IVORY};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2d9c9;">
  <tr><td style="padding:22px 28px;background:${INK};">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:${IVORY};letter-spacing:0.02em;">${escapeHtml(brand.shortName)}</div>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c9a85f;margin-top:3px;">Egypt</div>
  </td></tr>
  <tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${INK};">
    ${bodyHtml}
  </td></tr>
  <tr><td style="padding:18px 28px;background:${IVORY};border-top:1px solid #e2d9c9;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};">
    ${escapeHtml(brand.name)} · ${escapeHtml(contact.location)} · <a href="mailto:${escapeHtml(contact.email)}" style="color:${GOLD};">${escapeHtml(contact.email)}</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function rowsTable(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
${rows
  .map(
    ([label, value]) =>
      `<tr>
<td style="padding:7px 12px 7px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
<td style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${INK};vertical-align:top;">${escapeHtml(value)}</td>
</tr>`
  )
  .join("\n")}
</table>`;
}

/**
 * The team's copy — the one that has to be useful at 7am on a phone.
 *
 * Everything the customer chose, in the order the desk needs it, with the
 * enquiry subject first. Nothing is summarised away: if someone picked four
 * extras, all four are listed, because the alternative is a reply that misses
 * one.
 */
export function flyingDressesTeamEmail({
  subject,
  rows,
  message,
  pageUrl,
}: {
  subject: string;
  rows: [string, string][];
  message: string;
  pageUrl: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${GOLD};">New enquiry</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.25;color:${INK};font-weight:normal;">${escapeHtml(subject)}</h1>
    ${rowsTable(rows)}
    ${
      message
        ? `<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};">Their message</p>
           <p style="margin:0 0 20px;padding:12px 14px;background:${IVORY};border-left:2px solid #c9a85f;white-space:pre-wrap;">${escapeHtml(message)}</p>`
        : ""
    }
    <p style="margin:0;font-size:13px;color:${MUTED};">Sent from <a href="${escapeHtml(pageUrl)}" style="color:${GOLD};">${escapeHtml(pageUrl)}</a>. Reply to this email to answer them directly.</p>
  `;

  const text = [
    `NEW ENQUIRY — ${subject}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(message ? ["", "Their message:", message] : []),
    "",
    `Sent from ${pageUrl}`,
  ].join("\n");

  return { subject: `Enquiry — ${subject}`, html: layout({ preheader: subject, bodyHtml }), text };
}

/**
 * The customer's copy.
 *
 * It says what happens next and it says, twice, that nothing is booked and
 * nothing has been charged. That is not legal caution for its own sake: this
 * site has no checkout, a dress choice is a preference rather than a hold, and
 * a confirmation email that reads like a reservation is how somebody turns up
 * at a rooftop on a morning nobody has agreed to.
 */
export function flyingDressesCustomerEmail({
  name,
  subject,
  hasPrice,
}: {
  name: string;
  subject: string;
  /** False for rental, accessories and men's wear, which are quoted. */
  hasPrice: boolean;
}) {
  const next = hasPrice
    ? "We will come back to you to confirm the date is free, and with anything you need to know before the day."
    : "We will come back to you with the price and the terms in writing, before you are asked to commit to anything.";

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">Thank you — we have your enquiry about <strong>${escapeHtml(subject)}</strong>.</p>
    <p style="margin:0 0 16px;">${escapeHtml(next)}</p>
    <p style="margin:0 0 16px;padding:12px 14px;background:${IVORY};border-left:2px solid #c9a85f;font-size:14px;color:${MUTED};">
      Nothing is booked yet and nothing has been charged. If you chose a dress, we have noted it as your preference — we will tell you before your shoot if it is not available on the day.
    </p>
    <p style="margin:0;">If it is easier, reply to this email or message us on WhatsApp at ${escapeHtml(contact.whatsapp)}.</p>
  `;

  const text = `Hi ${name},

Thank you — we have your enquiry about ${subject}.

${next}

Nothing is booked yet and nothing has been charged. If you chose a dress, we have noted it as your preference — we will tell you before your shoot if it is not available on the day.

If it is easier, reply to this email or message us on WhatsApp at ${contact.whatsapp}.

${brand.name}`;

  return {
    subject: `We have your enquiry — ${brand.name}`,
    html: layout({ preheader: `We have your enquiry about ${subject}.`, bodyHtml }),
    text,
  };
}
