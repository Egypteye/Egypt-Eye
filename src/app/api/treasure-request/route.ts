import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import { treasureRequestTeamEmail, treasureRequestConfirmationEmail } from "@/lib/email/templates";
import { treasureCategoryBySlug, treasureProductsFor } from "@/content/treasures";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { site } from "@/content/site";

// A Boutique request: a reservation, an availability question, or a
// shop appointment, depending on the category and where the traveller is.
//
// It is a request rather than an order because the site has no payment rail
// and, more importantly, because none of these pieces has a settled price
// until someone has seen the name, the photograph or the size. The reply is
// where the specification and the price are agreed. See docs/boutique.md.
//
// Multipart rather than JSON so the papyrus photograph can travel with the
// request instead of becoming a second step the customer has to remember.

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PHOTO_BUCKET = "treasure-uploads";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** How long the team's link to an uploaded photo stays valid. */
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 30;

function clean(value: FormDataEntryValue | null, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "treasure-request",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot, same as every other form on the site.
  if (clean(form.get("company"), 100)) return NextResponse.json({ ok: true });

  const categorySlug = clean(form.get("category"), 40);
  const category = treasureCategoryBySlug(categorySlug);
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  // The product is resolved from the catalogue rather than trusted from the
  // form, so a submitted title can never name something Egypt Eye doesn't sell.
  const productSlug = clean(form.get("product"), 120);
  const product = treasureProductsFor(category.slug).find((p) => p.slug === productSlug);

  const name = clean(form.get("name"), 200);
  const email = clean(form.get("email"), 200);
  const phone = clean(form.get("phone"), 60);
  const journey = clean(form.get("journey"), 30) === "in-egypt" ? "in-egypt" : "before-arrival";
  const arrival = clean(form.get("arrival"), 40);
  const departure = clean(form.get("departure"), 40);

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A name and a valid email are required." }, { status: 400 });
  }

  // Personalisation answers are read off the category's own field list, so a
  // new question is asked, validated and emailed without touching this file.
  const answers: { label: string; value: string }[] = [];
  for (const field of category.personalization) {
    if (field.kind === "photo") continue;
    const max = field.kind === "choice" ? 120 : field.maxLength;
    const value = clean(form.get(field.name), max);
    if (field.required && !value) {
      return NextResponse.json({ error: `${field.label} is required.` }, { status: 400 });
    }
    if (value) answers.push({ label: field.label, value });
  }

  // ---------------------------------------------------------------------
  // The photograph, where the category asks for one.
  //
  // Uploaded with the service role into a PRIVATE bucket — never a public
  // one. A customer's face is not something to leave on a guessable public
  // URL, and the team reaches it through a signed link that expires.
  // ---------------------------------------------------------------------
  let photoUrl: string | null = null;
  let photoNote: string | null = null;
  const photoField = category.personalization.find((f) => f.kind === "photo");
  if (photoField) {
    const file = form.get(photoField.name);
    if (file instanceof File && file.size > 0) {
      if (!PHOTO_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Photos must be JPEG, PNG or WebP." }, { status: 400 });
      }
      if (file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: "That photo is over 8 MB. Please send a smaller one." }, { status: 400 });
      }
      if (!supabaseAdminConfigured) {
        // Storage isn't wired up on this deployment. The request is still
        // worth taking — losing the whole commission over a missing bucket
        // would be worse than asking for the photo in the reply.
        photoNote = "A photo was attached but storage is not configured on this deployment — ask the customer to reply with it.";
      } else {
        try {
          const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
          const path = `${category.slug}/${crypto.randomUUID()}.${ext}`;
          const supabase = createAdminSupabaseClient();
          const { error: uploadError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(path, file, { contentType: file.type, upsert: false });
          if (uploadError) throw uploadError;
          const { data: signed } = await supabase.storage
            .from(PHOTO_BUCKET)
            .createSignedUrl(path, SIGNED_URL_SECONDS);
          photoUrl = signed?.signedUrl ?? null;
          if (!photoUrl) photoNote = `Photo stored at ${PHOTO_BUCKET}/${path} but a signed link could not be created.`;
        } catch (err) {
          console.error("treasure photo upload failed:", err);
          photoNote = "A photo was attached but could not be stored — ask the customer to reply with it.";
        }
      }
    } else if (photoField.required) {
      return NextResponse.json({ error: `${photoField.label} is required.` }, { status: 400 });
    }
  }

  const team = treasureRequestTeamEmail({
    categoryTitle: category.title,
    productName: product?.name ?? null,
    productIsPlaceholder: product?.placeholder ?? false,
    journey,
    arrival,
    departure,
    name,
    email,
    phone,
    answers,
    photoUrl,
    photoNote,
    pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com"}/boutique/${category.slug}`,
  });

  const result = await sendEmail({
    to: site.contact.email,
    subject: team.subject,
    html: team.html,
    text: team.text,
    replyTo: email,
  });
  if (!result?.ok) {
    return NextResponse.json({ error: "Failed to send your request. Please try again." }, { status: 502 });
  }

  // The customer's copy is best-effort: their request is already with the
  // team, and failing the whole submission because a receipt bounced would
  // make them send it twice.
  try {
    const confirmation = treasureRequestConfirmationEmail({
      name,
      categoryTitle: category.title,
      productName: product?.name ?? null,
      journey,
    });
    await sendEmail({
      to: email,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    });
  } catch (err) {
    console.error("treasure request confirmation failed:", err);
  }

  return NextResponse.json({ ok: true });
}
