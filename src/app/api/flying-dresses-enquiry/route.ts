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
import { accessoryByRef } from "@/content/flyingDressAccessories";
import { proposalDecorations } from "@/content/flyingDressProposal";
import { revealThemeById } from "@/content/flyingDressGenderReveal";
import { celebrationOccasionById } from "@/content/flyingDressBirthday";
import { productionServices } from "@/content/flyingDressMusic";

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

  // The accessories, resolved against the collection for the same reason as
  // everything else here: the request says WHICH, never what it is called. A
  // crafted payload could otherwise post `accessories: ["Pharaoh's Crown,
  // included"]` and the desk would read a piece we do not own as fact.
  //
  // Both the name and the reference go in, because they are read by different
  // people: the customer will say "the Nefertiti" on the phone and the desk
  // matches "Necklace 1" against the stock.
  const requestedAccessories = Array.isArray(body.accessories) ? body.accessories : [];
  const chosenAccessories = requestedAccessories
    .map((ref) => (typeof ref === "string" ? accessoryByRef(ref) : undefined))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => `${item.name} (${item.ref})`);

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

  // The proposal setup, resolved against the catalogue for the same reason
  // as everything else here: the request says WHICH, never what it is called.
  const setupId = clean(body.setup, 60);
  const setup = proposalDecorations.find((d) => d.id === setupId);

  // The gender reveal colour theme, resolved the same way. The LABEL the desk
  // reads comes off the catalogue, never off the request, so a crafted payload
  // cannot post a theme that promises something we do not offer.
  const theme = revealThemeById(clean(body.theme, 60));

  // The celebration fields. The OCCASION is resolved against the catalogue
  // like every other id here, so the label the desk reads is ours. The cake
  // and the songs are free text the customer wrote about their own evening:
  // they are trimmed and length-capped, not resolved, because there is no
  // catalogue of cakes to resolve them against and nothing in them is a
  // claim the business would be held to.
  const occasion = celebrationOccasionById(clean(body.occasion, 60));
  const cakeRequest = clean(body.cake, 600);
  const songs = clean(body.songs, 400);
  // A boolean, never a label from the request: the desk reads "yes" here and
  // quotes for it. `=== true` rather than truthiness, so a string arriving in
  // this field cannot turn into a transport booking.
  const wantsTransport = body.transport === true;

  // The music session. HOURS are the one number on this form that drives a
  // figure, so they are parsed rather than passed through: a rooftop is
  // charged by the hour and "twelve" or "-3" in that field is not an answer
  // the desk can quote from. Out of range becomes empty rather than clamped,
  // because a silently corrected 40 into 12 is a quotation nobody asked for.
  const hoursRaw = Number.parseInt(clean(body.hours, 10), 10);
  const hours =
    Number.isInteger(hoursRaw) && hoursRaw >= 1 && hoursRaw <= 12 ? String(hoursRaw) : "";
  const artist = clean(body.artist, 120);
  const reference = clean(body.reference, 500);
  // Resolved against the catalogue, like every other id here: the NAME the
  // desk reads comes off the catalogue, never off the request, so a crafted
  // payload cannot post a production service we do not offer.
  const requestedServices = Array.isArray(body.services) ? body.services : [];
  const chosenServices = requestedServices
    .map((id) =>
      typeof id === "string" ? productionServices.find((service) => service.id === id) : undefined
    )
    .filter((service): service is (typeof productionServices)[number] => Boolean(service))
    .map((service) => service.name);

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
  push("Accessories", chosenAccessories.join(", "));
  push("Proposal setup", setup?.name ?? "");
  push("Gender reveal colour theme", theme?.label ?? "");
  push("Celebrating", occasion?.label ?? "");
  push("Cake", cakeRequest);
  push("Music", songs);
  // Spelled out in the desk email, because transport on a celebration is an
  // additional charge and our photoshoot packages include it in the price.
  // A bare "Yes" in a row called Transport is the ambiguity that costs a
  // customer the difference.
  push("Transport", wantsTransport ? "Requested: additional charge, quote with the booking" : "");
  // "3" alone in a row called Hours is ambiguous against every other number
  // on this form, and this is the one that multiplies by a rate.
  push("Rooftop hours", hours ? `${hours} (rate: from $150 per hour)` : "");
  push("Artist", artist);
  push("Production requested", chosenServices.join(", "));
  push("Reference", reference);
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

  // THE DESK COPY IS TRIED TWICE, FROM TWO SENDERS, AND THE REASON IS A
  // LOST-ENQUIRY INCIDENT.
  // -------------------------------------------------------------------------
  // The brand sends as info@flyingdressesegypt.com. Resend refuses to send
  // from a domain it has not verified, so until that domain is verified — or
  // FLYING_DRESSES_FROM_EMAIL names one that is — every send fails, and the
  // visitor is told to go to WhatsApp. Some of them will. The rest are a
  // customer the business never hears from, and nothing anywhere records that
  // they tried.
  //
  // So a refusal by the first sender is not the end of it: the desk copy is
  // retried from whatever sender the platform has verified (RESEND_FROM_EMAIL,
  // via sendEmail's own default). The message is identical and replyTo still
  // points at the customer, so the desk can answer normally; only the envelope
  // differs, and an enquiry that arrives under the wrong From beats one that
  // never arrives.
  //
  // The CUSTOMER's receipt is deliberately NOT given the same treatment below.
  // A visitor who asked Flying Dresses a question should not receive mail from
  // another company's domain — that is a brand the owner asked to keep
  // separate, and a confused recipient is likelier to mark it as spam than to
  // read it. The desk copy is internal; the receipt is not.
  let result = await sendEmail({
    to: contact.email,
    from: FLYING_DRESSES_FROM,
    subject: team.subject,
    html: team.html,
    text: team.text,
    // So the desk can hit reply and reach the customer, rather than replying
    // to the brand's own inbox.
    replyTo: email,
  });

  let sentFromFallbackSender = false;
  if (!result.ok) {
    console.error("flying dresses enquiry: brand sender refused:", result.error);
    const retry = await sendEmail({
      to: contact.email,
      subject: `[via fallback sender] ${team.subject}`,
      html: team.html,
      text: team.text,
      replyTo: email,
    });
    if (retry.ok) {
      sentFromFallbackSender = true;
      result = retry;
    } else {
      console.error("flying dresses enquiry: fallback sender refused too:", retry.error);
    }
  }

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
    // Skipped when the brand sender is the thing that failed: it would fail
    // again, and the alternative — writing to a customer from another
    // company's domain — is worse than no receipt. The desk already has the
    // enquiry by this point, which is the part that earns the booking.
    if (sentFromFallbackSender) {
      console.error("flying dresses receipt skipped: brand sender unavailable");
      return NextResponse.json({ ok: true });
    }
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
