import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import { tourEnquiryEmail } from "@/lib/email/templates";

// Receives a submission from the "Email an Enquiry" popup on a tour,
// experience, or photoshoot page and emails the full request to the
// reservations team (Site Settings > Contact > Email) via Resend — replacing
// the old plain mailto link, which only ever carried a subject line and no
// customer details at all.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ITEM_PATHS: Record<string, string> = {
  tour: "tours",
  experience: "experiences",
  photoshoot: "photoshoots",
  signatureExperience: "signature-experiences",
};

const ITEM_LABELS: Record<string, string> = {
  tour: "Tour",
  experience: "Experience",
  photoshoot: "Photoshoot",
  signatureExperience: "Signature Experience",
};

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "enquiry",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const itemType = clean(body.itemType, 20);
  const itemSlug = clean(body.itemSlug, 200);
  const itemTitle = clean(body.itemTitle, 200);
  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 60);
  const nationality = clean(body.nationality, 100);
  const travelers = clean(body.travelers, 20);
  const startDate = clean(body.startDate, 40);
  const endDate = clean(body.endDate, 40);
  const flexibleDates = body.flexibleDates === true;
  const hotel = clean(body.hotel, 200);
  const pickupLocation = clean(body.pickupLocation, 300);
  const preferredTime = clean(body.preferredTime, 100);
  const message = clean(body.message, 2000);

  if (!ITEM_PATHS[itemType] || !itemSlug || !itemTitle) {
    return NextResponse.json({ error: "Missing tour/experience/photoshoot reference" }, { status: 400 });
  }
  if (!name || !EMAIL_RE.test(email) || !phone || !nationality || !travelers) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email delivery is not configured on this deployment" }, { status: 500 });
  }

  const travelDates = flexibleDates
    ? startDate
      ? `Flexible, around ${startDate}`
      : "Flexible / not decided yet"
    : startDate && endDate
      ? `${startDate} – ${endDate}`
      : startDate || "Not specified";

  const site = await getSiteSettings();
  const itemUrl = `${SITE_URL}/${ITEM_PATHS[itemType]}/${itemSlug}`;

  const { subject, html, text } = tourEnquiryEmail({
    itemLabel: ITEM_LABELS[itemType],
    itemTitle,
    itemUrl,
    name,
    email,
    phone,
    nationality,
    travelDates,
    travelers,
    hotel: hotel || undefined,
    pickupLocation: pickupLocation || undefined,
    preferredTime: preferredTime || undefined,
    message: message || undefined,
  });

  const result = await sendEmail({ to: site.contact.email, subject, html, text, replyTo: email });
  if (!result.ok) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
