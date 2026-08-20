import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";

// Receives a Customize Your Tour submission and emails it via Resend
// (https://resend.com) to the address in Site Settings > Contact > Email.
// Requires RESEND_API_KEY (and optionally RESEND_FROM_EMAIL) to be set in
// this deployment's environment variables — see README for setup.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmittedField = { label?: unknown; value?: unknown };

export async function POST(request: NextRequest) {
  let body: { fields?: SubmittedField[]; subject?: unknown; replyToEmail?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const fields = Array.isArray(body.fields)
    ? body.fields
        .filter(
          (f): f is { label: string; value: string } =>
            typeof f?.label === "string" && typeof f?.value === "string" && f.value.trim().length > 0
        )
        .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
    : [];

  if (fields.length === 0) {
    return NextResponse.json({ error: "No form data received" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email delivery is not configured on this deployment" },
      { status: 500 }
    );
  }

  const site = await getSiteSettings();
  const from = process.env.RESEND_FROM_EMAIL || "Egypt Eye Website <onboarding@resend.dev>";
  const subject =
    typeof body.subject === "string" && body.subject.trim() ? body.subject.trim().slice(0, 200) : "New Custom Tour Request";
  const replyTo =
    typeof body.replyToEmail === "string" && EMAIL_RE.test(body.replyToEmail) ? body.replyToEmail : undefined;

  const text = fields.map((f) => `${f.label}: ${f.value}`).join("\n");
  const html = `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table style="font-family:sans-serif;border-collapse:collapse">${fields
    .map(
      (f) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555;vertical-align:top"><strong>${escapeHtml(
          f.label
        )}</strong></td><td style="padding:4px 0">${escapeHtml(f.value)}</td></tr>`
    )
    .join("")}</table>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: site.contact.email,
      subject,
      text,
      html,
      reply_to: replyTo,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Resend send failed:", res.status, errText);
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
