import "server-only";
import { escapeHtml } from "./resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

function baseLayout({ preheader, bodyHtml, footerHtml }: { preheader: string; bodyHtml: string; footerHtml: string }) {
  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,'Times New Roman',serif;">
  <span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#fffdf8;border-radius:20px;overflow:hidden;border:1px solid rgba(201,162,39,0.35);">
        <tr>
          <td style="background:#1b2a20;padding:28px 32px;text-align:center;">
            <span style="color:#e4c878;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Egypt Eye Travel and Tours</span>
          </td>
        </tr>
        <tr><td style="padding:32px;color:#1b2a20;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid rgba(27,42,32,0.08);color:#6b7d70;font-size:12px;font-family:Arial,sans-serif;line-height:1.6;">
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
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:999px;background:#1b2a20;">
    <a href="${href}" style="display:inline-block;padding:14px 28px;color:#fffdf8;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
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
      <div style="text-align:center;margin:24px 0;padding:20px;background:#faf7f0;border-radius:16px;border:1px dashed #8c6d1f;">
        <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8c6d1f;">4% Off Your Egypt Journey</div>
        <div style="font-family:'Courier New',monospace;font-size:26px;font-weight:bold;letter-spacing:2px;color:#1b2a20;margin-top:6px;">${escapeHtml(code)}</div>
      </div>
      ${expiryLine}
      <p style="margin:0 0 16px;">Use it during your reservation request on any tour or custom itinerary — we'll apply it to your estimate and confirm the final amount with you directly.</p>
      ${ctaButton("Plan My Egypt", `${SITE_URL}/explore-egypt`)}
      <p style="margin:16px 0 0;font-size:12px;color:#889;">One code per customer, one-time use, subject to the campaign's terms shown at checkout. Not combinable with other offers unless stated.</p>
    `,
    footerHtml: `You're receiving this because you subscribed to Egypt Eye travel updates. <a href="${unsubscribeUrl}" style="color:#6b7d70;">Unsubscribe</a> or manage your preferences anytime.`,
  });
  const text = `${greeting}\n\nYour unique 4% off code: ${code}\n${expiresAt ? `Valid until ${new Date(expiresAt).toLocaleDateString()}\n` : ""}\nUse it during your reservation request at ${SITE_URL}/explore-egypt\n\nUnsubscribe: ${unsubscribeUrl}`;
  return { subject: "Your Egypt Eye 4% Off Is Here 🇪🇬", html, text };
}

export function reservationConfirmationEmail({
  guestName,
  reference,
  itemTitles,
  tripStartDate,
  discountAmount,
  totalEstimate,
}: {
  guestName: string;
  reference: string;
  itemTitles: string[];
  tripStartDate: string | null;
  discountAmount: number;
  totalEstimate: number | null;
}) {
  const itemsHtml = itemTitles.length
    ? `<ul style="margin:0 0 16px;padding-left:20px;">${itemTitles.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
    : "";
  const pricingHtml =
    totalEstimate !== null
      ? `<p style="margin:0 0 16px;">Estimated total${discountAmount > 0 ? ` (after your discount)` : ""}: <strong>$${totalEstimate.toLocaleString()}</strong></p>`
      : `<p style="margin:0 0 16px;font-size:13px;color:#556;">Your final price will be confirmed with you directly, since part of your journey is custom-quoted.</p>`;

  const html = baseLayout({
    preheader: `Your Egypt journey is on its way — reference ${reference}.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(guestName)},</p>
      <p style="margin:0 0 16px;">Your Egypt journey is on its way. Our team is reviewing your request and will reach out with next steps shortly.</p>
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">Reference</p>
      <p style="margin:0 0 20px;font-family:'Courier New',monospace;font-size:18px;font-weight:bold;">${escapeHtml(reference)}</p>
      ${tripStartDate ? `<p style="margin:0 0 16px;">Trip start: <strong>${escapeHtml(new Date(tripStartDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</strong></p>` : ""}
      ${itemsHtml}
      ${pricingHtml}
      ${ctaButton("View My Journey", `${SITE_URL}/my-journey`)}
    `,
    footerHtml: `Questions? Just reply to this email — Egypt Eye Travel and Tours.`,
  });
  const text = `Hi ${guestName},\n\nYour Egypt journey is on its way. Reference: ${reference}\n${tripStartDate ? `Trip start: ${new Date(tripStartDate).toLocaleDateString()}\n` : ""}${itemTitles.length ? `\n${itemTitles.join("\n")}\n` : ""}\n${totalEstimate !== null ? `Estimated total: $${totalEstimate.toLocaleString()}` : "Your final price will be confirmed with you directly."}`;
  return { subject: `Your Egypt journey is on its way — ${reference}`, html, text };
}

// Team-facing (not customer-facing) — sent to Site Settings > Contact >
// Email whenever a visitor submits the "Email an Enquiry" popup on a tour,
// experience, or photoshoot page. Every field the reservations team needs
// to reply without asking the basics again, laid out as a scannable table
// with the enquired-about item called out first.
export function tourEnquiryEmail({
  itemLabel,
  itemTitle,
  itemUrl,
  name,
  email,
  phone,
  nationality,
  travelDates,
  travelers,
  message,
}: {
  itemLabel: string;
  itemTitle: string;
  itemUrl: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  travelDates: string;
  travelers: string;
  message?: string;
}) {
  const rows: [string, string][] = [
    ["Full name", name],
    ["Email", email],
    ["WhatsApp / Phone", phone],
    ["Nationality", nationality],
    ["Travel date(s)", travelDates],
    ["Number of travelers", travelers],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = baseLayout({
    preheader: `${name} asked about ${itemTitle} — reply directly to this email.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Enquiry — ${escapeHtml(itemLabel)}</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;"><a href="${itemUrl}" style="color:#1b2a20;text-decoration:none;">${escapeHtml(itemTitle)}</a></p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${
        message
          ? `<p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">Message</p><p style="margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(message)}</p>`
          : ""
      }
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to respond directly to ${escapeHtml(name)}.</p>
    `,
    footerHtml: `Sent from the "Email an Enquiry" form on ${escapeHtml(itemUrl)}.`,
  });

  const text = `New Enquiry — ${itemLabel}\n${itemTitle}\n${itemUrl}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}\n${
    message ? `\nMessage:\n${message}\n` : ""
  }\nReply to this email to respond directly to ${name}.`;

  return { subject: `New Enquiry: ${itemTitle}`, html, text };
}

export function transferRequestEmail({
  routeSummary,
  priceSummary,
  name,
  email,
  phone,
  date,
  time,
  passengers,
  luggage,
  vehicle,
  notes,
}: {
  routeSummary: string;
  priceSummary: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  passengers: string;
  luggage: string;
  vehicle: string;
  notes?: string;
}) {
  const rows: [string, string][] = [
    ["Route", routeSummary],
    ["Price", priceSummary],
    ["Vehicle", vehicle],
    ["Date", date],
    ["Time", time],
    ["Passengers", passengers],
    ["Luggage", luggage],
    ["Full name", name],
    ["Email", email],
    ["WhatsApp / Phone", phone],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = baseLayout({
    preheader: `${name} requested a transfer: ${routeSummary} — reply directly to this email.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Transfer Request</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(routeSummary)}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${
        notes
          ? `<p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">Notes</p><p style="margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(notes)}</p>`
          : ""
      }
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to respond directly to ${escapeHtml(name)}.</p>
    `,
    footerHtml: `Sent from the Transfers booking form on ${escapeHtml(SITE_URL)}/transfers.`,
  });

  const text = `New Transfer Request\n${routeSummary}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}\n${
    notes ? `\nNotes:\n${notes}\n` : ""
  }\nReply to this email to respond directly to ${name}.`;

  return { subject: `New Transfer Request: ${routeSummary}`, html, text };
}

// A one-off newsletter sent to the whole subscriber list from the admin
// composer (admin/newsletter). `bodyHtml` is admin-authored plain
// paragraphs (already escaped/trusted — written by staff, not a visitor),
// wrapped in the same branded layout as every other email so a newsletter
// doesn't look like a different product.
export function newsletterBroadcastEmail({
  subject,
  bodyHtml,
  bodyText,
  unsubscribeUrl,
}: {
  subject: string;
  bodyHtml: string;
  bodyText: string;
  unsubscribeUrl: string;
}) {
  const html = baseLayout({
    preheader: subject,
    bodyHtml,
    footerHtml: `You're receiving this because you subscribed to Egypt Eye travel updates. <a href="${unsubscribeUrl}" style="color:#6b7d70;">Unsubscribe</a> or manage your preferences anytime.`,
  });
  const text = `${bodyText}\n\nUnsubscribe: ${unsubscribeUrl}`;
  return { subject, html, text };
}

export function travelAgentApplicationEmail({
  companyName,
  contactName,
  email,
  phone,
  website,
  country,
  services,
  estimatedBookings,
  message,
}: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  services: string;
  estimatedBookings: string;
  message?: string;
}) {
  const rows: [string, string][] = [
    ["Company", companyName],
    ["Contact person", contactName],
    ["Email", email],
    ["WhatsApp / Phone", phone],
    ["Website", website || "Not provided"],
    ["Country", country],
    ["Services offered", services],
    ["Estimated bookings / year", estimatedBookings],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = baseLayout({
    preheader: `${companyName} applied to become an Egypt Eye travel agent partner.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Travel Agent Application</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(companyName)}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${
        message
          ? `<p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">Message</p><p style="margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(message)}</p>`
          : ""
      }
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to respond directly to ${escapeHtml(contactName)}.</p>
    `,
    footerHtml: `Sent from the Travel Agent application form on ${escapeHtml(SITE_URL)}/travel-agents.`,
  });

  const text = `New Travel Agent Application\n${companyName}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}\n${
    message ? `\nMessage:\n${message}\n` : ""
  }\nReply to this email to respond directly to ${contactName}.`;

  return { subject: `New Travel Agent Application: ${companyName}`, html, text };
}

export function collaborationApplicationEmail({
  fullName,
  email,
  socialsSummary,
  collaborationType,
  reviewUrl,
}: {
  fullName: string;
  email: string;
  socialsSummary: string;
  collaborationType: string;
  reviewUrl: string;
}) {
  const rows: [string, string][] = [
    ["Name", fullName],
    ["Email", email],
    ["Social accounts", socialsSummary],
    ["Collaboration type", collaborationType],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = baseLayout({
    preheader: `${fullName} applied to collaborate with Egypt Eye.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Collaboration Application</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(fullName)}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${ctaButton("Review in Admin", reviewUrl)}
    `,
    footerHtml: `Sent from the Collaborate With Egypt Eye application form.`,
  });

  const text = `New Collaboration Application\n${fullName}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}\n\nReview: ${reviewUrl}`;

  return { subject: `New Collaboration Application: ${fullName}`, html, text };
}
