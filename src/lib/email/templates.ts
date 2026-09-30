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
}: {
  guestName: string;
  reference: string;
  itemTitles: string[];
  tripStartDate: string | null;
  discountAmount: number;
}) {
  const itemsHtml = itemTitles.length
    ? `<ul style="margin:0 0 16px;padding-left:20px;">${itemTitles.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
    : "";
  const pricingHtml = `<p style="margin:0 0 16px;font-size:13px;color:#556;">We&rsquo;ll follow up with your confirmed pricing${discountAmount > 0 ? ", with your discount code applied" : ""}.</p>`;

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
  const text = `Hi ${guestName},\n\nYour Egypt journey is on its way. Reference: ${reference}\n${tripStartDate ? `Trip start: ${new Date(tripStartDate).toLocaleDateString()}\n` : ""}${itemTitles.length ? `\n${itemTitles.join("\n")}\n` : ""}\nWe'll follow up with your confirmed pricing${discountAmount > 0 ? ", with your discount code applied" : ""}.`;
  return { subject: `Your Egypt journey is on its way — ${reference}`, html, text };
}

/**
 * A new reservation request, sent to the desk.
 *
 * The traveller already got reservationConfirmationEmail above; this is the
 * other half, and it was missing — a reservation landed in the database and
 * in /admin/reservations and nobody was told, so the only way to find out was
 * to go looking. The Weekly Trips seat booking has had a team email since it
 * shipped; this brings an ordinary reservation in line with it.
 *
 * `accountState` is here because it changes what the desk does next. A
 * request from a signed-in customer can be answered against their history; a
 * guest request cannot, and a reply to it is also the moment to invite them
 * to create an account so the booking appears in it.
 */
export function reservationTeamEmail({
  reference,
  guestName,
  guestEmail,
  guestPhone,
  items,
  tripStartDate,
  tripEndDate,
  travelersAdults,
  travelersChildren,
  subtotal,
  discountAmount,
  total,
  preferences,
  accountState,
  reviewUrl,
}: {
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  items: { type: string; title: string }[];
  tripStartDate: string | null;
  tripEndDate: string | null;
  travelersAdults: number;
  travelersChildren: number;
  subtotal: number;
  discountAmount: number;
  total: number | null;
  preferences?: string | null;
  accountState: "signed-in" | "guest";
  reviewUrl: string;
}) {
  const date = (value: string | null) =>
    value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

  const travellers =
    travelersChildren > 0
      ? `${travelersAdults} ${travelersAdults === 1 ? "adult" : "adults"}, ${travelersChildren} ${travelersChildren === 1 ? "child" : "children"}`
      : `${travelersAdults} ${travelersAdults === 1 ? "adult" : "adults"}`;

  const dates =
    date(tripStartDate) && date(tripEndDate)
      ? `${date(tripStartDate)} → ${date(tripEndDate)}`
      : date(tripStartDate) ?? "Not given";

  // Money is only shown when the journey actually priced. A reservation of
  // destinations alone has no subtotal, and "$0" would read as free.
  const money = (n: number) => `$${n.toFixed(2)}`;
  const rows: [string, string][] = [
    ["Dates", dates],
    ["Travellers", travellers],
    ...(subtotal > 0
      ? ([
          ["Subtotal", money(subtotal)],
          ...(discountAmount > 0 ? ([["Discount", `-${money(discountAmount)}`]] as [string, string][]) : []),
          ["Estimate", total === null ? "—" : money(total)],
        ] as [string, string][])
      : ([["Estimate", "No priced items — quote required"]] as [string, string][])),
    ["Name", guestName],
    ["Email", guestEmail],
    ["Phone", guestPhone || "Not provided"],
    ["Account", accountState === "signed-in" ? "Signed in — shows in their account" : "Guest — no account yet"],
    ["Reference", reference],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const itemsHtml = items.length
    ? `<ul style="margin:0 0 20px;padding-left:20px;">${items
        .map((i) => `<li>${escapeHtml(i.title)} <span style="color:#889;font-size:12px;">(${escapeHtml(i.type)})</span></li>`)
        .join("")}</ul>`
    : "";

  const html = baseLayout({
    preheader: `${guestName} — ${items.length} ${items.length === 1 ? "item" : "items"}, ${travellers}${
      date(tripStartDate) ? `, from ${date(tripStartDate)}` : ""
    }.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Reservation Request</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(guestName)} — ${escapeHtml(reference)}</p>
      ${itemsHtml}
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${
        preferences
          ? `<p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">Notes from the traveller</p><p style="margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(preferences)}</p>`
          : ""
      }
      ${ctaButton("Open in Admin", reviewUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to reach the traveller directly.</p>
    `,
    footerHtml: `Sent from the reservation form.`,
  });

  const text = `New Reservation Request\n${guestName} — ${reference}\n\n${items
    .map((i) => `- ${i.title} (${i.type})`)
    .join("\n")}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}${
    preferences ? `\n\nNotes:\n${preferences}` : ""
  }\n\nAdmin: ${reviewUrl}`;

  return {
    subject: `New reservation: ${guestName} — ${reference}`,
    html,
    text,
  };
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
  hotel,
  pickupLocation,
  preferredTime,
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
  hotel?: string;
  pickupLocation?: string;
  preferredTime?: string;
  message?: string;
}) {
  const rows: [string, string][] = [
    ["Full name", name],
    ["Email", email],
    ["WhatsApp / Phone", phone],
    ["Nationality", nationality],
    ["Travel date(s)", travelDates],
    ["Number of travelers", travelers],
    ...(hotel ? ([["Hotel", hotel]] as [string, string][]) : []),
    ...(pickupLocation ? ([["Pickup / Drop-off", pickupLocation]] as [string, string][]) : []),
    ...(preferredTime ? ([["Preferred time", preferredTime]] as [string, string][]) : []),
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
  reviewUrl,
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
  reviewUrl: string;
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
      ${ctaButton("Review Application", reviewUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to respond directly to ${escapeHtml(contactName)}.</p>
    `,
    footerHtml: `Sent from the Travel Agent application form on ${escapeHtml(SITE_URL)}/travel-agents.`,
  });

  const text = `New Travel Agent Application\n${companyName}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}\n${
    message ? `\nMessage:\n${message}\n` : ""
  }\nReview: ${reviewUrl}\n\nReply to this email to respond directly to ${contactName}.`;

  return { subject: `New Travel Agent Application: ${companyName}`, html, text };
}

export function travelAgentApprovedEmail({
  contactName,
  companyName,
  discountPercent,
  loginUrl,
}: {
  contactName: string;
  companyName: string;
  discountPercent: number;
  loginUrl: string;
}) {
  const html = baseLayout({
    preheader: `${companyName} is now an approved Egypt Eye travel agent partner.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(contactName)},</p>
      <p style="margin:0 0 16px;">Great news — <strong>${escapeHtml(companyName)}</strong> is approved as an Egypt Eye Travel Agent Partner. You now have a ${discountPercent}% partner rate on our tours, experiences, and photoshoots.</p>
      <p style="margin:0 0 16px;">Sign in (or create your free account using this same email address, ${escapeHtml(contactName)}) to reach your partner portal — your rate, our full catalog, and every booking you place will be right there.</p>
      ${ctaButton("Go to My Partner Portal", loginUrl)}
      <p style="margin:16px 0 0;font-size:13px;color:#556;">Building an itinerary for a client? Reply to this email or reach us on WhatsApp and we'll quote it at your partner rate directly.</p>
    `,
    footerHtml: `Egypt Eye Travel and Tours — Travel Agent Partner Program.`,
  });
  const text = `Hi ${contactName},\n\n${companyName} is approved as an Egypt Eye Travel Agent Partner with a ${discountPercent}% partner rate.\n\nSign in or create your account with this same email to reach your partner portal: ${loginUrl}\n\nBuilding an itinerary for a client? Reply to this email and we'll quote it at your partner rate.`;

  return { subject: "You're approved — Egypt Eye Travel Agent Partner Program", html, text };
}

export function travelAgentRejectedEmail({ contactName, companyName }: { contactName: string; companyName: string }) {
  const html = baseLayout({
    preheader: `An update on your Egypt Eye Travel Agent Program application.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(contactName)},</p>
      <p style="margin:0 0 16px;">Thank you for your interest in the Egypt Eye Travel Agent Partner Program on behalf of <strong>${escapeHtml(companyName)}</strong>. After review, we're not able to move forward with a partnership at this time.</p>
      <p style="margin:0 0 16px;">This isn't necessarily final — we're happy to revisit this as your agency grows, or if your focus shifts closer to what we're set up to support. You're always welcome to reach out directly with any questions.</p>
    `,
    footerHtml: `Egypt Eye Travel and Tours — Travel Agent Partner Program.`,
  });
  const text = `Hi ${contactName},\n\nThank you for your interest in the Egypt Eye Travel Agent Partner Program on behalf of ${companyName}. After review, we're not able to move forward with a partnership at this time.\n\nThis isn't necessarily final — we're happy to revisit this as your agency grows. You're always welcome to reach out directly with any questions.`;

  return { subject: "An update on your Egypt Eye Travel Agent application", html, text };
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

export function affiliateApplicationEmail({
  fullName,
  email,
  websiteOrPlatform,
  audienceSize,
  promotionMethods,
  reviewUrl,
}: {
  fullName: string;
  email: string;
  websiteOrPlatform: string;
  audienceSize: string;
  promotionMethods: string;
  reviewUrl: string;
}) {
  const rows: [string, string][] = [
    ["Name", fullName],
    ["Email", email],
    ["Website / platform", websiteOrPlatform],
    ["Audience size", audienceSize || "Not provided"],
    ["Promotion methods", promotionMethods],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = baseLayout({
    preheader: `${fullName} applied to the Egypt Eye Affiliate Program.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Affiliate Application</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(fullName)}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${ctaButton("Review in Admin", reviewUrl)}
    `,
    footerHtml: `Sent from the Affiliate Program application form on ${escapeHtml(SITE_URL)}/affiliate.`,
  });

  const text = `New Affiliate Application\n${fullName}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}\n\nReview: ${reviewUrl}`;

  return { subject: `New Affiliate Application: ${fullName}`, html, text };
}

export function hotelRateRequestEmail({
  hotelName,
  roomName,
  roomsCount,
  checkIn,
  checkOut,
  guests,
  mealPlan,
  name,
  email,
  message,
  reviewUrl,
}: {
  hotelName: string;
  roomName?: string;
  roomsCount?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  mealPlan?: string;
  name?: string;
  email: string;
  message?: string;
  reviewUrl: string;
}) {
  const rows: [string, string][] = [
    ["Hotel", hotelName],
    ["Room type", roomName || "Not specified"],
    ["Number of rooms", roomsCount || "Not specified"],
    ["Check-in", checkIn || "Not specified"],
    ["Check-out", checkOut || "Not specified"],
    ["Guests", guests || "Not specified"],
    ["Meal plan", mealPlan || "Not specified"],
    ["Name", name || "Not provided"],
    ["Email", email],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = baseLayout({
    preheader: `${email} wants the latest rate and availability for ${hotelName}.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Hotel Rate Request</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(hotelName)}</p>
      <p style="margin:0 0 16px;font-weight:600;">Requesting the latest available rate, availability, and any current discount for this room and these dates.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${
        message
          ? `<p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">Details</p><p style="margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(message)}</p>`
          : ""
      }
      ${ctaButton("Review in Admin", reviewUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to respond directly.</p>
    `,
    footerHtml: `Sent from the "Check Latest Rates" button on the Hotel Deals page.`,
  });

  const text = `New Hotel Rate Request\n${hotelName}\nRequesting the latest available rate, availability, and any current discount.\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}\n${
    message ? `\nDetails:\n${message}\n` : ""
  }\nReview: ${reviewUrl}`;

  return { subject: `New Rate Request: ${hotelName}`, html, text };
}

// ---------------------------------------------------------------------------
// Weekly Trips — seat bookings
// ---------------------------------------------------------------------------

/**
 * What the traveller gets after reserving a seat.
 *
 * Two genuinely different messages behind one function, because a waitlist
 * confirmation that reads like a booking confirmation is how people end up at
 * a meeting point at 6am for a trip they were never on. The waitlisted version
 * says what it is in the subject line, states plainly that no seat is held,
 * and quotes no price.
 */
export function tripSeatConfirmationEmail({
  guestName,
  reference,
  tripTitle,
  tripPath,
  departsOn,
  departureTime,
  seats,
  totalUsd,
  waitlisted,
  guaranteed,
  seatsToGuarantee,
}: {
  guestName: string;
  reference: string;
  tripTitle: string;
  tripPath: string;
  departsOn: string;
  departureTime?: string | null;
  seats: number;
  totalUsd: number | null;
  waitlisted: boolean;
  guaranteed: boolean;
  seatsToGuarantee: number;
}) {
  const greeting = `Hi ${escapeHtml(guestName.split(" ")[0] || guestName)},`;
  const tripUrl = `${SITE_URL}${tripPath}`;
  const seatWord = seats === 1 ? "seat" : "seats";
  const when = departureTime ? `${departsOn} · ${departureTime}` : departsOn;

  if (waitlisted) {
    const html = baseLayout({
      preheader: `You're on the waitlist for ${tripTitle} on ${departsOn}.`,
      bodyHtml: `
        <p style="margin:0 0 16px;">${greeting}</p>
        <p style="margin:0 0 16px;">This departure is currently full, so we've put you on the waitlist rather than turning you away. <strong>No seat is held yet and nothing is owed.</strong></p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">
          <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Trip</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(tripTitle)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Date</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(when)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Waiting for</td><td style="padding:6px 0;font-weight:600;">${seats} ${seatWord}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Reference</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(reference)}</td></tr>
        </table>
        <p style="margin:0 0 16px;">If someone drops out we'll contact you in the order names came in. We'll also tell you when the next date for this trip goes up.</p>
        ${ctaButton("See Other Dates", tripUrl)}
      `,
      footerHtml: `Egypt Eye Travel and Tours — questions? Just reply to this email.`,
    });
    const text = `${greeting}\n\nThis departure is full, so you're on the waitlist. No seat is held yet and nothing is owed.\n\nTrip: ${tripTitle}\nDate: ${when}\nWaiting for: ${seats} ${seatWord}\nReference: ${reference}\n\nIf someone drops out we'll contact you in the order names came in.\n\nOther dates: ${tripUrl}`;
    return { subject: `Waitlist: ${tripTitle}, ${departsOn}`, html, text };
  }

  // A held seat is not the same as a confirmed trip. Saying so here is what
  // stops a minimum-group cancellation later from feeling like a bait and
  // switch.
  const runsLine = guaranteed
    ? `<p style="margin:0 0 16px;">This departure has already met its minimum group size, so <strong>it's confirmed to run.</strong></p>`
    : `<p style="margin:0 0 16px;">This trip needs <strong>${seatsToGuarantee} more ${seatsToGuarantee === 1 ? "traveller" : "travellers"}</strong> to go ahead. We'll confirm as soon as it does, and if it doesn't, you pay nothing.</p>`;

  const html = baseLayout({
    preheader: `Your ${seatWord} on ${tripTitle}, ${departsOn} — reference ${reference}.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 16px;">Your ${seatWord} on this departure ${seats === 1 ? "is" : "are"} held. Here's what we have:</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">
        <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Trip</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(tripTitle)}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Date</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(when)}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Seats</td><td style="padding:6px 0;font-weight:600;">${seats}</td></tr>
        ${totalUsd !== null ? `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Total</td><td style="padding:6px 0;font-weight:600;">$${totalUsd.toFixed(2)} USD</td></tr>` : ""}
        <tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;">Reference</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(reference)}</td></tr>
      </table>
      ${runsLine}
      <p style="margin:0 0 16px;">One of the team will be in touch shortly to confirm your pickup point and take payment. Nothing is charged through this website.</p>
      ${ctaButton("View the Trip", tripUrl)}
    `,
    footerHtml: `Egypt Eye Travel and Tours — questions about this booking? Just reply to this email.`,
  });

  const text = `${greeting}\n\nYour ${seatWord} on this departure ${seats === 1 ? "is" : "are"} held.\n\nTrip: ${tripTitle}\nDate: ${when}\nSeats: ${seats}${
    totalUsd !== null ? `\nTotal: $${totalUsd.toFixed(2)} USD` : ""
  }\nReference: ${reference}\n\n${
    guaranteed
      ? "This departure has met its minimum group size, so it's confirmed to run."
      : `This trip needs ${seatsToGuarantee} more traveller(s) to go ahead. We'll confirm as soon as it does, and if it doesn't, you pay nothing.`
  }\n\nOne of the team will be in touch to confirm your pickup point and take payment. Nothing is charged through this website.\n\n${tripUrl}`;

  return { subject: `Seat held: ${tripTitle}, ${departsOn} (${reference})`, html, text };
}

/** The operational heads-up to the Egypt Eye desk. */
export function tripSeatTeamEmail({
  reference,
  tripTitle,
  departsOn,
  seats,
  seatsLeft,
  capacity,
  guaranteed,
  seatsToGuarantee,
  waitlisted,
  guestName,
  guestEmail,
  guestPhone,
  preferences,
  reviewUrl,
}: {
  reference: string;
  tripTitle: string;
  departsOn: string;
  seats: number;
  seatsLeft: number;
  capacity: number;
  guaranteed: boolean;
  seatsToGuarantee: number;
  waitlisted: boolean;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  preferences?: string | null;
  reviewUrl: string;
}) {
  const rows: [string, string][] = [
    ["Trip", tripTitle],
    ["Departs", departsOn],
    [waitlisted ? "Waitlisted seats" : "Seats booked", String(seats)],
    ["Seats left", waitlisted ? "0 (full)" : `${seatsLeft} of ${capacity}`],
    [
      "Runs?",
      guaranteed ? "Yes — minimum met" : `Not yet — needs ${seatsToGuarantee} more`,
    ],
    ["Name", guestName],
    ["Email", guestEmail],
    ["Phone", guestPhone || "Not provided"],
    ["Reference", reference],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const heading = waitlisted ? "Waitlist Request" : "New Seat Booking";

  const html = baseLayout({
    preheader: `${guestName} — ${seats} ${seats === 1 ? "seat" : "seats"} on ${tripTitle}, ${departsOn}.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">${escapeHtml(heading)}</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(tripTitle)} — ${escapeHtml(departsOn)}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${
        preferences
          ? `<p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">Notes from the traveller</p><p style="margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(preferences)}</p>`
          : ""
      }
      ${ctaButton("Open in Admin", reviewUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to reach the traveller directly.</p>
    `,
    footerHtml: `Sent from the Weekly Trips booking form.`,
  });

  const text = `${heading}\n${tripTitle} — ${departsOn}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}${
    preferences ? `\n\nNotes:\n${preferences}` : ""
  }\n\nAdmin: ${reviewUrl}`;

  return {
    subject: `${waitlisted ? "Waitlist" : "Seat booking"}: ${tripTitle}, ${departsOn} (${seats})`,
    html,
    text,
  };
}

/**
 * A review written by a traveller on /testimonials, sent to the team.
 *
 * Deliberately NOT a publish step. Nothing on the site changes when this
 * lands: the review reaches a human, who checks it against a real booking
 * and adds it in Studio if it stands up. The footer says so, because the
 * traveller has been told the same thing on the page.
 */
export function reviewSubmissionEmail({
  name,
  email,
  rating,
  productTitle,
  productUrl,
  body,
  pageUrl,
}: {
  name: string;
  email: string;
  rating: number;
  productTitle: string;
  productUrl?: string;
  body: string;
  pageUrl: string;
}) {
  const stars = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Rating", `${stars}  (${rating} of 5)`],
    ["About", productTitle],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = baseLayout({
    preheader: `${name} left a ${rating}-star review of ${productTitle}.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">New Review — Awaiting Check</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${
        productUrl
          ? `<a href="${productUrl}" style="color:#1b2a20;text-decoration:none;">${escapeHtml(productTitle)}</a>`
          : escapeHtml(productTitle)
      }</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8c6d1f;">In their words</p>
      <p style="margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(body)}</p>
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Check this against a real booking before it goes on the site, and publish it as written — reply to this email to reach ${escapeHtml(name)}.</p>
    `,
    footerHtml: `Sent from the review form on ${escapeHtml(pageUrl)}. Nothing has been published; reviews are only added by hand in Studio.`,
  });

  const text = `New Review — Awaiting Check\n${productTitle}${productUrl ? `\n${productUrl}` : ""}\n\n${rows
    .map(([l, v]) => `${l}: ${v}`)
    .join("\n")}\n\nIn their words:\n${body}\n\nCheck this against a real booking before it goes on the site, and publish it as written. Reply to this email to reach ${name}.\nSent from the review form on ${pageUrl}.`;

  return { subject: `New review: ${rating}★ from ${name} — ${productTitle}`, html, text };
}

/**
 * A Take Egypt Home request, sent to the desk.
 *
 * Deliberately says "request" and not "order" throughout: nothing here has a
 * settled price, and the reply is where the specification is agreed. The
 * placeholder flag is carried into the mail because a request against a
 * sample listing means the customer liked an idea rather than a product that
 * exists yet, and the desk should know which conversation it is having.
 */
export function treasureRequestTeamEmail({
  categoryTitle,
  productName,
  productIsPlaceholder,
  journey,
  arrival,
  departure,
  name,
  email,
  phone,
  answers,
  photoUrl,
  photoNote,
  pageUrl,
}: {
  categoryTitle: string;
  productName: string | null;
  productIsPlaceholder: boolean;
  journey: "before-arrival" | "in-egypt";
  arrival: string;
  departure: string;
  name: string;
  email: string;
  phone: string;
  answers: { label: string; value: string }[];
  photoUrl: string | null;
  photoNote: string | null;
  pageUrl: string;
}) {
  const rows: [string, string][] = [
    ["Category", categoryTitle],
    ["Piece", productName ? `${productName}${productIsPlaceholder ? " (sample listing)" : ""}` : "Not specified"],
    ["Situation", journey === "in-egypt" ? "Already in Egypt" : "Before arrival"],
    ...(arrival ? ([["Arrives", arrival]] as [string, string][]) : []),
    ...(departure ? ([["Leaves", departure]] as [string, string][]) : []),
    ...answers.map(({ label, value }) => [label, value] as [string, string]),
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "Not provided"],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7d70;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const photoHtml = photoUrl
    ? `<p style="margin:0 0 20px;"><a href="${escapeHtml(photoUrl)}" style="color:#8c6d1f;font-weight:600;">Open the customer's photograph</a> <span style="color:#889;font-size:12px;">(private link, expires in 30 days)</span></p>`
    : photoNote
      ? `<p style="margin:0 0 20px;color:#a33;font-weight:600;">${escapeHtml(photoNote)}</p>`
      : "";

  const html = baseLayout({
    preheader: `${name} — ${categoryTitle}${productName ? `, ${productName}` : ""}.`,
    bodyHtml: `
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c6d1f;">Take Egypt Home — Request</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:bold;">${escapeHtml(name)} — ${escapeHtml(categoryTitle)}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rowsHtml}</table>
      ${photoHtml}
      <p style="margin:0 0 16px;font-size:13px;color:#556;">Nothing has been priced or promised. The reply is where the specification, the price and the collection date are agreed.</p>
      ${ctaButton("Open the category page", pageUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:#889;">Reply to this email to reach the traveller directly.</p>
    `,
    footerHtml: `Sent from Take Egypt Home.`,
  });

  const text = `Take Egypt Home — Request\n${name} — ${categoryTitle}\n\n${rows
    .map(([l, v]) => `${l}: ${v}`)
    .join("\n")}${photoUrl ? `\n\nPhoto: ${photoUrl}` : photoNote ? `\n\n${photoNote}` : ""}\n\nNothing has been priced or promised.\n${pageUrl}`;

  return { subject: `Take Egypt Home: ${categoryTitle} — ${name}`, html, text };
}

/**
 * The traveller's receipt. Its job is to set the expectation that a human
 * replies with a specification and a price, because that is the part a
 * shopping page trains people not to expect.
 */
export function treasureRequestConfirmationEmail({
  name,
  categoryTitle,
  productName,
  journey,
}: {
  name: string;
  categoryTitle: string;
  productName: string | null;
  journey: "before-arrival" | "in-egypt";
}) {
  const next =
    journey === "in-egypt"
      ? "We'll come back to you with what's available while you're here, and a time you can come and see it."
      : "We'll come back to you with the specification, the price, and the date it can be ready — before anything is made and before you're asked to commit to anything.";

  const html = baseLayout({
    preheader: `We have your ${categoryTitle.toLowerCase()} request.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;">Thank you — we have your request${productName ? ` for the <strong>${escapeHtml(productName)}</strong>` : ""} in ${escapeHtml(categoryTitle)}.</p>
      <p style="margin:0 0 16px;">${escapeHtml(next)}</p>
      <p style="margin:0 0 16px;font-size:13px;color:#556;">Nothing has been charged, and nothing is confirmed yet.</p>
      ${ctaButton("See the other collections", `${SITE_URL}/take-egypt-home`)}
    `,
    footerHtml: `Questions? Just reply to this email — Egypt Eye Travel and Tours.`,
  });

  const text = `Hi ${name},\n\nThank you — we have your request${productName ? ` for the ${productName}` : ""} in ${categoryTitle}.\n\n${next}\n\nNothing has been charged, and nothing is confirmed yet.\n\n${SITE_URL}/take-egypt-home`;

  return { subject: `We have your ${categoryTitle.toLowerCase()} request`, html, text };
}
