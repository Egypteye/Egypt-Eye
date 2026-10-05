import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getExperienceBySlug, getPhotoshootBySlug, getSiteSettings } from "@/sanity/fetchers";
import { resolveDeposit } from "@/lib/booking/deposit";
import { extrasTotal, normaliseExtras, selectExtras } from "@/lib/booking/extras";
import { composePhone } from "@/lib/booking/phone";
import { paymentProvider } from "@/lib/booking/activeProvider";
import type { PaymentMode } from "@/lib/booking/wording";
import { resolveRail } from "@/lib/booking/rail";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { sendEmail } from "@/lib/email/resend";
import { bookingRequestTeamEmail, bookingRequestCustomerEmail } from "@/lib/email/templates";
import { site } from "@/content/site";
import { siteUrl } from "@/content/seo";

// Creates a deposit booking — the "Secure your date" path.
//
// Two rules decide the shape of this file, both from docs/booking-deposits.md.
//
// First: the reservation is written BEFORE the customer is sent to pay. If it
// were written after, every abandoned payment would be invisible and anyone
// who paid and closed the tab would have paid for a booking that does not
// exist. Writing it first means an unpaid request is a lead the desk can
// follow up, which is strictly better than nothing.
//
// Second: this route never confirms anything. It creates a request. A payment
// later moves the money to 'authorized' and the booking to 'checking', and a
// person moves it to 'confirmed'. Nothing here may shorten that.
//
// When no payment provider is configured the route still works: the booking is
// recorded as a request with no deposit, and the response says so, so the page
// can show an honest "we have your request" instead of a broken checkout.
//
// Third, and newer: an email address is optional and a phone number is not.
// Requiring an account or an email to hold a date loses bookings from people
// who are ready to pay, and it buys nothing — an email address nobody verifies
// is not identity. What the desk actually needs is one channel that reaches
// the customer, so the phone number, with its country code, is the required
// one. Everything downstream has to cope with having no address to write to:
// the acknowledgement email is skipped rather than failed, and the response
// says whether one was sent so the dialog can tell the customer to keep their
// reference instead of promising them an email that will never arrive.
//
// Extras arrive as labels and are priced here, from the product. A request
// that carried its own prices would be a customer setting them.

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PEOPLE = 20;

type Body = {
  productType?: unknown;
  productSlug?: unknown;
  startsAt?: unknown;
  slotLabel?: unknown;
  people?: unknown;
  guestName?: unknown;
  guestEmail?: unknown;
  guestPhone?: unknown;
  dialIso?: unknown;
  phoneNational?: unknown;
  extras?: unknown;
  notes?: unknown;
};

function generateReference(): string {
  return `EE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * The requested slot, validated.
 *
 * Rejects anything unparseable or in the past. The upper bound is a guard
 * against a mistyped year silently creating a booking for 2125 that would sit
 * in the queue forever.
 */
function parseStartsAt(value: unknown): { ok: true; iso: string } | { ok: false; message: string } {
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, message: "Please choose a date." };
  }
  const when = new Date(value);
  if (Number.isNaN(when.getTime())) return { ok: false, message: "That date could not be read." };

  // Midnight today, so a booking made during the day for later today is fine.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (when < today) return { ok: false, message: "Please choose a date in the future." };

  const twoYears = new Date();
  twoYears.setFullYear(twoYears.getFullYear() + 2);
  if (when > twoYears) {
    return { ok: false, message: "Please choose a date within the next two years, or message us." };
  }
  return { ok: true, iso: when.toISOString() };
}

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Bookings aren't set up on this deployment yet." },
      { status: 500 }
    );
  }

  const { allowed } = await checkRateLimit({
    bucket: "deposit-booking",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later, or message us on WhatsApp." },
      { status: 429 }
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const productType = body.productType === "photoshoot" || body.productType === "experience" ? body.productType : null;
  const productSlug = typeof body.productSlug === "string" ? body.productSlug.trim() : "";
  const guestName = typeof body.guestName === "string" ? body.guestName.trim().slice(0, 200) : "";
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim().toLowerCase() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) || null : null;
  const slotLabel = typeof body.slotLabel === "string" ? body.slotLabel.trim().slice(0, 120) || null : null;
  const people = Number.isInteger(body.people) ? Number(body.people) : 1;

  if (!productType || !productSlug) {
    return NextResponse.json({ error: "That booking link is incomplete." }, { status: 400 });
  }
  if (!guestName) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  // Optional, but if one was typed it has to be usable — a typo in the only
  // address we have is worse than no address, because nothing tells anyone.
  if (guestEmail !== "" && !EMAIL_RE.test(guestEmail)) {
    return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  }

  // The phone number, composed here rather than trusted from the browser so a
  // stored number is always a dial code plus digits whatever the form sent.
  // The free-text `guestPhone` is still read, because /secure/[type]/[slug]
  // posts to this same route with a single field and a page cached before this
  // change would too.
  const dialIsoGiven = typeof body.dialIso === "string" && body.dialIso.trim() !== "";
  const nationalGiven = typeof body.phoneNational === "string" && body.phoneNational.trim() !== "";
  const phone = dialIsoGiven || nationalGiven ? composePhone(body.dialIso, body.phoneNational) : null;
  if (phone && !phone.ok) {
    return NextResponse.json({ error: phone.message }, { status: 400 });
  }
  const legacyPhone = typeof body.guestPhone === "string" ? body.guestPhone.trim().slice(0, 40) : "";
  const guestPhone = phone?.ok ? phone.display : legacyPhone;

  // The rule is one usable channel, not one particular field — the same rule
  // reservations_contact_present_check enforces in 0021, deliberately, because
  // the two must not be able to disagree.
  //
  // It is stated this way rather than "phone required" because the two front
  // doors trade off differently and both are legitimate: the popup lets
  // someone book with no email at all, so it insists on a number; the /secure
  // page requires an email, so a number there is a bonus. A booking nobody can
  // reach is the only thing neither may produce — it would be a row holding
  // somebody's money that no one can act on.
  const user = await getCurrentUser();
  if (guestEmail === "" && guestPhone === "" && !user) {
    return NextResponse.json(
      { error: "Please give us a phone number or an email address so we can reach you." },
      { status: 400 }
    );
  }
  if (people < 1 || people > MAX_PEOPLE) {
    return NextResponse.json(
      { error: `Please enter between 1 and ${MAX_PEOPLE} people. For a larger group, message us.` },
      { status: 400 }
    );
  }
  const when = parseStartsAt(body.startsAt);
  if (!when.ok) return NextResponse.json({ error: when.message }, { status: 400 });

  // The product decides whether it can be booked this way and for how much.
  // Read server-side, never taken from the request: a deposit amount that
  // arrived in a POST body would be a price the customer set themselves.
  const [product, settings] = await Promise.all([
    productType === "photoshoot" ? getPhotoshootBySlug(productSlug) : getExperienceBySlug(productSlug),
    getSiteSettings(),
  ]);
  if (!product) {
    return NextResponse.json({ error: "That experience could not be found." }, { status: 404 });
  }

  const deposit = resolveDeposit(product, settings.defaultDepositUsd);
  if (!deposit.bookable) {
    return NextResponse.json(
      { error: "This experience isn't available for online booking. Please message us and we'll arrange it." },
      { status: 400 }
    );
  }

  // Priced from the product, matched by label. Anything the browser sent that
  // is not on the product's own list is dropped, including a stale selection
  // from a page cached before an extra was removed: a booking with one extra
  // missing is recoverable, an error the customer cannot act on is not.
  const chosenExtras = selectExtras(normaliseExtras(product.extras), body.extras);
  const extrasSum = extrasTotal(chosenExtras);

  const provider = paymentProvider();
  // A PayPal payment link is the fallback path: Egypt Eye creates the links in
  // PayPal, one per deposit amount, and pastes them into the Studio.
  //
  // Taken from the product server-side and already host-checked, so a link can
  // only ever point at PayPal however the field was edited.
  //
  // The API rail wins wherever it is configured, and it is strictly better on
  // the one thing that actually costs the desk time: a link payment has to be
  // matched to a booking by a human reading a reference out of a PayPal note
  // that the customer may have forgotten to type, while an API order carries
  // the reference in `custom_id` and reconciles itself.
  //
  // Resolved by the same function the product pages read, so what a customer
  // was told about their money and what actually happens to it cannot come
  // apart. They used to be derived separately and did.
  const rail = resolveRail(deposit, provider);
  const paymentLink = rail.paymentLink;
  const takingMoney = rail.canTakeMoney;
  const moneyMode: PaymentMode = rail.moneyMode;
  const reference = generateReference();
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      reference,
      customer_id: user?.id ?? null,
      guest_name: guestName,
      // Null rather than "" when absent, so "booked as a guest with no email"
      // is a state the database can be queried for instead of a blank string
      // that looks like a bug.
      guest_email: guestEmail === "" ? null : guestEmail,
      guest_phone: guestPhone,
      preferences: notes,
      product_type: productType,
      product_slug: productSlug,
      starts_at: when.iso,
      slot_label: slotLabel,
      travelers_adults: people,
      trip_start_date: when.iso.slice(0, 10),
      journey_snapshot: [
        {
          type: productType,
          slug: productSlug,
          title: product.title,
          startsAt: when.iso,
          slotLabel,
          people,
          extras: chosenExtras,
        },
      ],
      // Snapshotted, not referenced. The product's prices can change after a
      // booking is taken, and what the customer was quoted must not change
      // with them.
      addons: chosenExtras,
      addons_total: extrasSum > 0 ? extrasSum : null,
      // The booking is a request until a person says otherwise, whether or not
      // a deposit is ever paid.
      status: "requested",
      deposit_amount: takingMoney ? deposit.amountUsd : null,
      deposit_status: takingMoney ? "awaiting" : "not_required",
      payment_provider: provider.enabled ? provider.name : paymentLink ? "paypal-link" : null,
    })
    .select("id, reference")
    .single();

  if (error || !data) {
    console.error("booking insert failed:", error);
    return NextResponse.json(
      { error: "Something went wrong saving your request. Please try again, or message us on WhatsApp." },
      { status: 500 }
    );
  }

  // Emails are best-effort: a booking that was written must never be reported
  // as failed because a mail provider was slow. Same posture as
  // /api/reservations.
  // Emails are best-effort: a booking that was written must never be reported
  // as failed because a mail provider was slow. The desk also has the admin
  // list regardless, and the customer has the reference in the response.
  // Only when there is somewhere to send it. A guest booking with no email is
  // a supported outcome, so this is skipped rather than treated as a failure —
  // and `emailed` is reported back so the dialog can tell the customer to keep
  // their reference instead of waiting for a copy that is not coming.
  const emailed = guestEmail !== "";
  if (emailed) {
    try {
      const customer = bookingRequestCustomerEmail({
        reference,
        guestName,
        productTitle: product.title,
        startsAt: when.iso,
        slotLabel,
        people,
        depositUsd: takingMoney ? deposit.amountUsd : null,
        paymentLink,
        moneyMode,
        extras: chosenExtras,
      });
      await sendIdempotentEmail({
        idempotencyKey: `booking-request:${data.id}`,
        notificationType: "booking_request",
        to: guestEmail,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
        customerId: user?.id,
        reservationId: data.id,
      });
    } catch (err) {
      console.error("booking customer email failed (booking was saved):", err);
    }
  }

  try {
    const team = bookingRequestTeamEmail({
      reference,
      productTitle: product.title,
      productType,
      startsAt: when.iso,
      slotLabel,
      people,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      // Both of these were wrong. `provider.enabled ? amount : null` is false
      // in payment-link mode — which is the only mode in production — so the
      // desk was told "no deposit, online deposits are not switched on" for
      // every real booking, and the payment-status block added for exactly
      // this case could never render because the link was never passed.
      depositUsd: takingMoney ? deposit.amountUsd : null,
      paymentLink,
      moneyMode,
      extras: chosenExtras,
      emailedCustomer: emailed,
      accountState: user ? "signed-in" : "guest",
    });
    await sendEmail({
      to: site.contact.email,
      subject: team.subject,
      html: team.html,
      text: team.text,
      // So a reply from the desk goes to the traveller, not into a void.
      replyTo: guestEmail,
    });
  } catch (err) {
    console.error("booking team email failed (booking was saved):", err);
  }

  // The payment-link path. Nothing to call: the customer is handed the link
  // and pays in PayPal, and the desk matches the payment to the reference.
  if (paymentLink) {
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: { amountUsd: deposit.amountUsd, paymentLink },
      extras: chosenExtras,
      emailed,
      next: "payLink" as const,
    });
  }

  // No payment rail at all: the honest answer is that we have the request, not
  // that a date is secured.
  if (!provider.enabled) {
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: null,
      extras: chosenExtras,
      emailed,
      next: "awaitingTeam" as const,
    });
  }

  const hold = await provider.createHold({
    reference: data.reference,
    amountUsd: deposit.amountUsd,
    description: `Deposit to secure ${product.title} — ${data.reference}`,
    returnUrl: `${siteUrl}/secure/return?ref=${data.reference}`,
    cancelUrl: `${siteUrl}/secure/${productType}/${productSlug}?ref=${data.reference}`,
  });

  if (!hold.ok) {
    // The booking stands; only the payment could not be started. Saying so is
    // better than losing the request, and the desk already has the email.
    console.error("createHold failed:", hold.reason, hold.message);
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: null,
      emailed,
      next: "awaitingTeam" as const,
      notice: "We have your request. We could not open the deposit page just now, so our team will follow up directly.",
    });
  }

  // Stored before the customer is shown the buttons. The capture route reads
  // this column to decide whether an order id it is handed actually belongs to
  // this booking, so an order nobody recorded is an order nobody can settle —
  // which is the correct failure.
  await supabase
    .from("reservations")
    .update({ payment_order_id: hold.orderId })
    .eq("id", data.id);

  return NextResponse.json({
    ok: true,
    reference: data.reference,
    deposit: {
      amountUsd: deposit.amountUsd,
      orderId: hold.orderId,
      // The browser needs this to load the SDK. It is public by design — it
      // identifies the merchant, it does not authorise anything, and the
      // secret never leaves the server.
      clientId: provider.clientId,
      // Chooses the customer's wording: "held, not charged" against an
      // authorization, "paid and refundable" against a capture.
      moneyMode,
      // Used only if the browser cannot render the buttons at all.
      approvalUrl: hold.approvalUrl,
    },
    extras: chosenExtras,
    emailed,
    next: "payPal" as const,
  });
}
