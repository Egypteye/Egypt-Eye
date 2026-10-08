import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getExperienceBySlug, getPhotoshootBySlug, getSiteSettings } from "@/sanity/fetchers";
import { quoteDeposit } from "@/lib/booking/quote";
import { createAttempt } from "@/lib/booking/attempts";
import { composePhone } from "@/lib/booking/phone";
import type { PaymentMode } from "@/lib/booking/wording";
import { productRail } from "@/lib/booking/productRail";
import { siteUrl } from "@/content/seo";
import { sendEmail } from "@/lib/email/resend";
import { bookingRequestTeamEmail } from "@/lib/email/templates";

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
// later moves the money, and a person moves the booking to 'confirmed'.
// Nothing here may shorten that.
//
// Fourth, and the newest: **this route sends no email at all.** It used to send
// both the customer acknowledgement and the team notice at creation, before
// anybody had paid. Nothing they said was false — the team one said PAYMENT
// STATUS: NOT YET RECEIVED — but a message that arrives before the money does
// is read as a confirmation, and the team got one for every abandoned
// checkout. Emails now come from lib/booking/fulfilment.ts, after PayPal has
// been asked and has said COMPLETED, and from nowhere else. An unpaid request
// is visible in /admin/reservations instead.
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

  // Whether a deposit can be taken at all, and which rail would move the
  // money, both from the one function every surface reads — including the
  // product pages, which is the point of it.
  //
  // Sandbox on the real site is offered to admins only, so a customer can
  // never complete a test payment and believe they have booked. See
  // paymentProviderFor in activeProvider.ts.
  const { offer, rail, provider } = productRail(product, productType, settings.defaultDepositPercent, {
    isAdmin: user?.role === "admin",
  });
  if (!offer.available) {
    return NextResponse.json(
      { error: "This experience isn't available for online booking. Please message us and we'll arrange it." },
      { status: 400 }
    );
  }

  // Priced from the product, matched by label. Anything the browser sent that
  // is not on the product's own list is dropped, including a stale selection
  // from a page cached before an extra was removed: a booking with one extra
  // missing is recoverable, an error the customer cannot act on is not.

  // The amount, worked out once from what this customer actually selected, and
  // then used everywhere — the row, the link response and the payment attempt.
  // Computing it more than once is how a figure on one surface stops matching
  // a figure on another.
  const quoted = quoteDeposit(product, productType, { people, extras: body.extras }, settings.defaultDepositPercent);
  if (!quoted.ok) {
    // depositOffer already said a deposit was possible, so this is a real
    // disagreement rather than an unconfigured product — worth a loud log.
    console.error(`deposit quote failed for ${productSlug} after the offer said yes: ${quoted.reason}`);
    return NextResponse.json(
      { error: "We could not work out the deposit for that booking. Please message us and we'll sort it out." },
      { status: 500 }
    );
  }
  const depositUsd = quoted.quote.totalCents / 100;

  // Built from the QUOTE, not from a second pass over the request.
  //
  // This used to call selectExtras() on body.extras independently, which was a
  // second reading of the same input — and once extras carried quantities the
  // two readings stopped agreeing: the quote charged for three camel rides and
  // the row recorded one. The quote is the authority on what was selected and
  // what it costs, so the row and the emails are derived from it.
  const extraLines = quoted.quote.lines.filter((line) => line.kind === "extra");
  const chosenExtras = extraLines.map((line) => ({
    label: line.quantity > 1 ? `${line.label} × ${line.quantity}` : line.label,
    priceUsd: line.amountCents / 100,
  }));
  const extrasSum = extraLines.reduce((sum, line) => sum + line.amountCents, 0) / 100;

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
  // Resolved above by the same function the product pages read, so what a
  // customer was told about their money and what actually happens to it cannot
  // come apart. They used to be derived separately and did.
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
      deposit_quote: quoted.quote,
      deposit_amount: takingMoney ? depositUsd : null,
      deposit_status: takingMoney ? "awaiting" : "not_required",
      payment_provider: provider.enabled ? provider.name : paymentLink ? "paypal-link" : null,
    })
    .select("id, reference")
    .single();

  if (error || !data) {
    console.error("booking insert failed:", error);
    // A customer gets a sentence they can act on; an admin gets the reason.
    //
    // This cost an afternoon. A booking failed with "something went wrong",
    // which is the right thing to show a customer and useless to everyone
    // else — the actual cause was a database migration that had never been
    // applied, and the only place that said so was a server log nobody was
    // looking at. The person testing was signed in as an admin at the time.
    const detail =
      user?.role === "admin" && error
        ? ` [admin] ${error.message}${error.hint ? ` — ${error.hint}` : ""}`
        : "";
    return NextResponse.json(
      {
        error:
          "Something went wrong saving your request. Please try again, or message us on WhatsApp." + detail,
      },
      { status: 500 }
    );
  }

  // No CUSTOMER email is sent here, and that part is deliberate: a message
  // that arrives before the money does is read as a confirmation, whatever it
  // says. lib/booking/fulfilment.ts sends the customer's once PayPal has
  // confirmed the capture, and nothing else in the system may send one.
  //
  // The desk is a different question, and getting it wrong cost a day of
  // bookings. abe106f moved both emails behind the capture, which is right for
  // the customer and wrong here: a booking nobody pays for then reaches
  // nobody at all. It sits in `reservations` as status 'requested' and the
  // only way to find it is to open /admin/reservations and look. That stayed
  // invisible while no product had Instant Booking switched on — every
  // visitor used the enquiry button, which emails on submit — and surfaced
  // the day twelve products were made bookable and the gold button took over
  // the page.
  //
  // So the team notice is restored, on its own. bookingRequestTeamEmail was
  // written for exactly this and left behind with no caller; its own text
  // reads "Payment status: NOT YET RECEIVED", which is the honest thing to
  // tell the desk about a request that may never be paid.
  //
  // Failure cannot fail the booking. The row is already written and the
  // customer is already owed an answer; an email that does not send is a
  // problem for the log, not for them. `emailedCustomer: false` because that
  // is now always true here, and the desk needs to know the traveller is
  // waiting to hear from a person.
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
      depositUsd: takingMoney ? depositUsd : null,
      paymentLink,
      moneyMode,
      extras: chosenExtras,
      emailedCustomer: false,
      accountState: user ? "signed-in" : "guest",
    });
    const sent = await sendEmail({
      to: settings.contact.email,
      subject: team.subject,
      html: team.html,
      text: team.text,
      // So a reply from the desk goes to the traveller, not into a void.
      replyTo: guestEmail || undefined,
    });
    if (!sent.ok) {
      console.error(`booking team email failed for ${reference} (booking was saved): ${sent.error}`);
    }
  } catch (err) {
    console.error(`booking team email threw for ${reference} (booking was saved):`, err);
  }

  // The payment-link path. Nothing to call: the customer is handed the link
  // and pays in PayPal, and the desk matches the payment to the reference.
  if (paymentLink) {
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: { amountUsd: depositUsd, lines: quoted.quote.lines, paymentLink },
      extras: chosenExtras,
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
      next: "awaitingTeam" as const,
    });
  }

  // The attempt row is written before PayPal is asked for anything, so an
  // order we created but have no record of cannot happen. See
  // lib/booking/attempts.ts for why that ordering is the one that matters.
  const opened = await createAttempt({
    reservationId: data.id,
    reference: data.reference,
    quote: quoted.quote,
    description: `Deposit to secure ${product.title} — ${data.reference}`,
    returnUrl: `${siteUrl}/secure/return?ref=${data.reference}`,
    cancelUrl: `${siteUrl}/secure/${productType}/${productSlug}?ref=${data.reference}`,
  });

  if (!opened.ok) {
    // The booking stands; only the payment could not be started. Saying so is
    // better than losing the request.
    console.error("createAttempt failed:", opened.message);
    return NextResponse.json({
      ok: true,
      reference: data.reference,
      deposit: null,
      extras: chosenExtras,
      next: "awaitingTeam" as const,
      notice: "We have your request. We could not open the deposit page just now, so our team will follow up directly.",
    });
  }

  // Snapshotted onto the booking too, so the admin list and the emails can
  // read what was agreed without joining through the attempt.
  await supabase
    .from("reservations")
    .update({
      payment_order_id: opened.orderId,
      deposit_amount: quoted.quote.totalCents / 100,
    })
    .eq("id", data.id);

  return NextResponse.json({
    ok: true,
    reference: data.reference,
    deposit: {
      amountUsd: depositUsd,
      // The deposit, line by line, so the dialog can show how it was reached
      // rather than asserting a figure.
      lines: quoted.quote.lines,
      orderId: opened.orderId,
      // The browser needs this to load the SDK. It is public by design — it
      // identifies the merchant, it does not authorise anything, and the
      // secret never leaves the server.
      clientId: opened.clientId,
      // Chooses the customer's wording: "held, not charged" against an
      // authorization, "paid and refundable" against a capture.
      moneyMode,
      // So a test payment cannot be mistaken for a real one.
      sandbox: provider.env === "sandbox",
    },
    extras: chosenExtras,
    next: "payPal" as const,
  });
}
