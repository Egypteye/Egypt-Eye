import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import { shopVisitTeamEmail, shopVisitCustomerEmail } from "@/lib/email/templates";
import { visitAreaBySlug, visitAreas } from "@/content/shoppingTours";
import { site } from "@/content/site";

// A request to come and smell the oils.
//
// It is a REQUEST. Nothing here confirms a time, and both emails say so in
// those words: nobody has given us the shop's opening hours, so a page that
// told a traveller to turn up at eleven on Thursday would be inventing one.
// A person confirms, afterwards.
//
// The area is chosen by the customer — Old Cairo, or around the pyramids at
// Giza where there are several workshops to pick between. The specific map
// pins go in the TEAM's email only; publishing a map link to a third party's
// shop reads as a partnership we have not claimed.

export const runtime = "nodejs";

type Body = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  area?: unknown;
  preferredDate?: unknown;
  preferredTime?: unknown;
  visitors?: unknown;
  interests?: unknown;
  notes?: unknown;
  company?: unknown;
};

const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Could not read that request." }, { status: 400 });
  }

  // Same honeypot name as every other form here.
  if (text(body.company, 100)) return NextResponse.json({ ok: true });

  const { allowed } = await checkRateLimit({
    bucket: "shop-visit",
    key: getClientIp(request),
    max: 8,
    windowSeconds: 900,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  }

  const name = text(body.name, 120);
  const email = text(body.email, 200).toLowerCase();
  const phone = text(body.phone, 40);
  const areaSlug = text(body.area, 60);
  const preferredDate = text(body.preferredDate, 40);
  const preferredTime = text(body.preferredTime, 60);
  const notes = text(body.notes, 1500);
  const visitors = Math.min(Math.max(Number(body.visitors ?? 1) || 1, 1), 20);
  const interests = Array.isArray(body.interests)
    ? body.interests.slice(0, 12).map((v) => text(v, 60)).filter(Boolean)
    : [];

  if (!name) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Please give us an email we can reach you on." }, { status: 400 });
  }

  // The area is looked up here rather than trusted: a request naming a place
  // we do not go would otherwise reach the team as though it were an option.
  const area = visitAreaBySlug(areaSlug) ?? visitAreas[0];
  const reference = `EEV-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const facts = {
    reference,
    name,
    email,
    phone: phone || null,
    areaName: area.name,
    // Team-only routing. Never returned to the browser.
    mapUrls: area.pins.map((p) => p.mapUrl),
    preferredDate: preferredDate || null,
    preferredTime: preferredTime || null,
    visitors,
    interests,
    notes: notes || null,
  };

  let delivered = false;
  try {
    const team = shopVisitTeamEmail(facts);
    const sent = await sendEmail({
      to: site.contact.email,
      subject: team.subject,
      html: team.html,
      text: team.text,
      replyTo: email,
    });
    delivered = sent.ok;
  } catch (err) {
    console.error("shop visit: team email threw", err);
  }

  if (!delivered) {
    // The request did NOT reach anybody. Saying "we have it" here would be
    // the one lie this route must never tell.
    return NextResponse.json(
      {
        error:
          "We could not get that through to the team just now. Please message us on WhatsApp and we will sort it out.",
      },
      { status: 502 }
    );
  }

  // Best effort, and deliberately after the team's. A customer receipt that
  // fails must not make a delivered request look failed.
  try {
    const confirm = shopVisitCustomerEmail(facts);
    await sendEmail({ to: email, subject: confirm.subject, html: confirm.html, text: confirm.text });
  } catch (err) {
    console.error("shop visit: customer email threw", err);
  }

  return NextResponse.json({ ok: true, reference, areaName: area.name });
}
