import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import { markEnquiryDelivery, recordEnquiry } from "@/lib/enquiries/store";
import { campaignEnquiryEmail } from "@/lib/email/templates";
import { validateCampaignEnquiry } from "@/lib/campaign/enquiry";
import { CAMPAIGN_ACTIVE, CAMPAIGN_COPY } from "@/content/shakiraCampaign";

// The enquiry form on the "Egypt Eye Got You" campaign page.
//
// A separate route from /api/enquiry, which is tied to catalogue item types
// (tour, experience, photoshoot, signatureExperience) and would have had to
// be widened with a fake item type to carry a campaign package. The shared
// parts — rate limiting, store-before-send, delivery marking — are reused as
// they are.
//
// Everything the team is told about the package is looked up from the campaign
// config by id. The body supplies the id, never the name or the dates.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "campaign-enquiry",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // The campaign has a four-day life. Once it is switched off the page stops
  // offering the form, and the route stops accepting one — otherwise a stale
  // tab keeps generating leads for a party that has happened.
  if (!CAMPAIGN_ACTIVE) {
    return NextResponse.json({ error: "This campaign has ended." }, { status: 410 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.trim()) {
    // Honeypot. Answer as though it worked.
    return NextResponse.json({ ok: true });
  }

  const parsed = validateCampaignEnquiry(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const enquiry = parsed.value;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email delivery is not configured on this deployment" }, { status: 500 });
  }

  const site = await getSiteSettings();
  const pageUrl = `${SITE_URL}${CAMPAIGN_COPY.path}`;

  const { subject, html, text } = campaignEnquiryEmail({ ...enquiry, pageUrl });

  // Store first, send second — the ordering asserted by
  // scripts/check-enquiry-storage.mts. A refused send must still leave a
  // record that a real traveller asked.
  const enquiryId = await recordEnquiry({
    kind: "campaign",
    brand: "egypt_eye",
    subjectTitle: enquiry.packageName,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    details: {
      campaign: "shakira-got-you",
      packageId: enquiry.packageId,
      packageDates: enquiry.packageDates,
      packageDuration: enquiry.packageDuration,
      partyDate: enquiry.partyDate,
      travellers: enquiry.travellers,
      notes: enquiry.notes,
    },
  });

  const result = await sendEmail({ to: site.contact.email, subject, html, text, replyTo: enquiry.email });
  await markEnquiryDelivery(enquiryId, result);

  if (!result.ok) {
    return NextResponse.json({ error: "Failed to send your enquiry. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
