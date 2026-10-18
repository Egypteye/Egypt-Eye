import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email/resend";
import {
  FLYING_DRESSES_FROM,
  flyingDressesCustomerEmail,
  flyingDressesTeamEmail,
} from "@/lib/email/flyingDresses";
import {
  RENTAL_DELIVERY_LABELS,
  addOns,
  brand,
  contact,
  dresses,
  mensOutfits,
  packageBySlug,
  rentalServiceBySlug,
} from "@/content/flyingDresses";
import { experienceBySlug, experiencePath } from "@/content/flyingDressExperiences";

/**
 * The Flying Dresses enquiry.
 *
 * An ENQUIRY, not a booking. There is no payment rail on this brand's site and
 * no availability to check against — so this route takes a message, emails it
 * to the desk, emails the customer a receipt that says nothing is confirmed,
 * and stops. It never writes a reservation and never tells anybody they have
 * one.
 *
 * -------------------------------------------------------------------------
 * EVERYTHING IS RESOLVED SERVER-SIDE, NOT TRUSTED
 * -------------------------------------------------------------------------
 * Same rule as lib/booking/outfits.ts and lib/booking/extras.ts: the request
 * carries WHICH thing was chosen, never anything about it. Slugs and ids are
 * matched against the catalogue here and the label the email shows is read off
 * the catalogue, never off the request.
 *
 * Without that, a crafted request could post `dress: "Cherry (free upgrade)"`
 * or `package: "Rooftop — $49"` and put it in an email the business then has
 * to explain. An unknown id is dropped silently rather than erroring, because
 * a page cached before a colour was retired should still produce an enquiry.
 *
 * Prices are not accepted from the request AT ALL. There is no price field in
 * the payload and no total computed here. The quote happens in the reply.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "flying-dresses-enquiry",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot, same field name as every other form on this deployment.
  if (clean(body.company, 100)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 60);

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please give us your name and a valid email address." },
      { status: 400 }
    );
  }

  // ---------------------------------------------------------------------
  // What they are asking about. Exactly one of the two, resolved from the
  // catalogue. A request naming neither is still a valid general enquiry.
  // ---------------------------------------------------------------------
  const pkg = packageBySlug(clean(body.package, 60));
  const service = rentalServiceBySlug(clean(body.service, 60));
  // Resolved against the catalogue, never echoed back from the client, for the
  // same reason as the package and the service above: whatever arrives here
  // ends up in an email the business reads as fact.
  const experience = experienceBySlug(clean(body.experience, 60));

  const subject = pkg
    ? `${pkg.title} — $${pkg.priceUsd} per person`
    : service
      ? service.title
      : experience
        ? experience.title
        : "A flying-dress photoshoot";

  // Rental, accessories and men's wear are quoted rather than priced. Drives
  // which "what happens next" the customer's receipt carries.
  const hasPrice = Boolean(pkg);

  // ---------------------------------------------------------------------
  // The wardrobe. Ids in, catalogue names out.
  // ---------------------------------------------------------------------
  const dressId = clean(body.dress, 60).toLowerCase();
  const dress = dresses.find((d) => d.id.toLowerCase() === dressId);

  const mensId = clean(body.mens, 60).toLowerCase();
  const mens = mensOutfits.find((m) => m.id.toLowerCase() === mensId);

  // Extras, matched by id against the published add-ons. The label and the
  // price qualification both come from the catalogue, so an email can never
  // quote "$35" for something the brochure calls "starts at $35".
  const requestedExtras = Array.isArray(body.extras) ? body.extras : [];
  const extras = requestedExtras
    .map((id) => (typeof id === "string" ? addOns.find((a) => a.id === id) : undefined))
    .filter((a): a is (typeof addOns)[number] => Boolean(a))
    .map((a) =>
      a.priceUsd === null
        ? `${a.label} (price on request)`
        : `${a.label} (${a.fromPrice ? "from " : ""}$${a.priceUsd})`
    );

  const deliveryKey = clean(body.delivery, 40);
  const delivery =
    deliveryKey === "hotel-delivery" || deliveryKey === "collection"
      ? RENTAL_DELIVERY_LABELS[deliveryKey]
      : "";

  const date = clean(body.date, 40);
  const people = clean(body.people, 20);
  const hotel = clean(body.hotel, 200);
  const message = clean(body.message, 2000);

  const rows: [string, string][] = [];
  const push = (label: string, value: string) => {
    if (value) rows.push([label, value]);
  };

  push("Name", name);
  push("Email", email);
  push("Phone / WhatsApp", phone);
  push("Asking about", subject);
  if (pkg) push("Location", pkg.name);
  push("Preferred date", date);
  push("People", people);
  push("Dress", dress?.name ?? "");
  push("Men's attire", mens?.name ?? "");
  push("Extras", extras.join(", "));
  push("Hotel / pickup area", hotel);
  push("Delivery", delivery);

  const pageUrl = pkg
    ? `${brand.url}/flying-dresses/experiences/${pkg.slug}`
    : experience
      ? `${brand.url}/flying-dresses${experiencePath(experience)}`
      : service
        ? `${brand.url}/flying-dresses/rentals/${service.slug}`
        : `${brand.url}/flying-dresses/enquire`;

  const team = flyingDressesTeamEmail({ subject, rows, message, pageUrl });

  const result = await sendEmail({
    to: contact.email,
    from: FLYING_DRESSES_FROM,
    subject: team.subject,
    html: team.html,
    text: team.text,
    // So the desk can hit reply and reach the customer, rather than replying
    // to the brand's own inbox.
    replyTo: email,
  });

  if (!result.ok) {
    // The customer is told the form failed and pointed at WhatsApp by the
    // form itself. Never a raw provider error — see sendEmail's own note.
    return NextResponse.json(
      { error: "We could not send that. Please message us on WhatsApp instead." },
      { status: 502 }
    );
  }

  // The receipt is best-effort. Their enquiry is already with the desk, and
  // failing the whole submission because a receipt bounced would make them
  // send it twice.
  try {
    const receipt = flyingDressesCustomerEmail({ name, subject, hasPrice });
    await sendEmail({
      to: email,
      from: FLYING_DRESSES_FROM,
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text,
    });
  } catch (err) {
    console.error("flying dresses receipt failed:", err);
  }

  return NextResponse.json({ ok: true });
}
