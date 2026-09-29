import { NextRequest, NextResponse } from "next/server";
import {
  getExperiences,
  getPhotoshoots,
  getSignatureExperiences,
  getSiteSettings,
  getTours,
} from "@/sanity/fetchers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import { reviewSubmissionEmail } from "@/lib/email/templates";
import { collectReviewSubjects, subjectAnchor } from "@/lib/reviewSubjects";

// Receives a review written by a traveller at the foot of /testimonials and
// emails it to the team, in the same shape as the enquiry form: rate limit,
// honeypot, validate, send via Resend, never touch the site.
//
// It publishes nothing, and it deliberately writes nothing to the database
// either. A review only reaches the wall when a person has checked it against
// a real booking and added it in Studio — which is the promise the page makes
// to the reader ("every review here comes from a real Egypt Eye trip") and the
// one thing an open form could quietly break. The email is the queue.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A review long enough to be a review. Mirrors the form's minLength. */
const MIN_BODY = 30;
const MAX_BODY = 5000;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "review-submission",
    key: getClientIp(request),
    max: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many reviews from this connection. Please try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (clean(body.company, 100)) {
    // Honeypot — answer as though it worked, send nothing.
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const productKey = clean(body.product, 200);
  const reviewBody = clean(body.body, MAX_BODY);
  const rating = Number(body.rating);

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please add your name and a valid email address." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a rating from one to five stars." }, { status: 400 });
  }
  if (reviewBody.length < MIN_BODY) {
    return NextResponse.json(
      { error: `Please write a little more — at least ${MIN_BODY} characters.` },
      { status: 400 }
    );
  }

  // The product is resolved from the catalogue rather than trusted from the
  // form. The browser sends only an anchor key; the title and link in the
  // email are looked up here, so a crafted request can't put an invented
  // tour name in front of whoever reads it.
  const [tours, photoshoots, experiences, signatureExperiences] = await Promise.all([
    getTours(),
    getPhotoshoots(),
    getExperiences(),
    getSignatureExperiences(),
  ]);
  const subject = collectReviewSubjects({ tours, photoshoots, experiences, signatureExperiences }).find(
    (s) => subjectAnchor(s) === productKey
  );

  const site = await getSiteSettings();
  const { subject: emailSubject, html, text } = reviewSubmissionEmail({
    name,
    email,
    rating,
    productTitle: subject?.title ?? "Not specified",
    productUrl: subject ? `${SITE_URL}${subject.href}` : undefined,
    body: reviewBody,
    pageUrl: `${SITE_URL}/testimonials`,
  });

  const result = await sendEmail({
    to: site.contact.email,
    subject: emailSubject,
    html,
    text,
    replyTo: email,
  });
  if (!result.ok) {
    return NextResponse.json({ error: "We couldn't send your review just now. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
