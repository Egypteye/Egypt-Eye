import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getDeparture } from "@/lib/departures";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { sendEmail } from "@/lib/email/resend";
import { tripSeatConfirmationEmail, tripSeatTeamEmail } from "@/lib/email/templates";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { site } from "@/content/site";
import { createAttempt } from "@/lib/booking/attempts";
import { paymentProviderFor } from "@/lib/booking/activeProvider";
import { quoteDeposit } from "@/lib/booking/quote";
import { siteUrl } from "@/content/seo";

// Reserves seats on a Weekly Trips departure.
//
// Separate from /api/reservations, which builds a reservation out of a
// journey the visitor assembled themselves and has no notion of capacity.
// This one books against a fixed departure with a finite number of seats, so
// the decision of whether a seat exists cannot be made here: it happens
// inside book_departure_seats(), which holds a row lock while it checks and
// claims. See supabase/migrations/0018_weekly_trips.sql.
//
// The row it writes is an ordinary reservation with departure_id and seats
// set, so a seat booking shows up in /admin/reservations and in My Account
// next to everything else, with the same reference format.
//
// Payment depends on the departure. With Instant Booking off it behaves as it
// always has — the seat is held, the desk confirms and takes payment directly,
// and the email is careful to say that a held seat on a trip which hasn't met
// its minimum is not yet a confirmed trip.
//
// With Instant Booking on, a 25% deposit is taken through PayPal, and two
// things change that are easy to miss:
//
//   The confirmation email is NOT sent here. It is sent by fulfilAttempt()
//   after the money is verified, because telling somebody their seat is held
//   while the payment is still unmade would confirm a seat that may be about
//   to be released.
//
//   The seat carries an expiry. book_departure_seats claims it immediately —
//   correctly, under a row lock — so an abandoned checkout would otherwise
//   hold a seat until a human noticed. seat_hold_expires_at is what the
//   reconcile sweep reads to give it back. See migration 0023.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SEATS_PER_BOOKING = 10;

type Body = {
  departureId?: unknown;
  seats?: unknown;
  guestName?: unknown;
  guestEmail?: unknown;
  guestPhone?: unknown;
  preferences?: unknown;
  joinWaitlist?: unknown;
};

function generateReference(): string {
  return `EE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// What the visitor is told when the departure moved under them between
// loading the page and pressing the button. Every one of these is a normal
// thing to happen on a page that caches, not an error.
const OUTCOME_MESSAGES: Record<string, string> = {
  not_found: "That departure is no longer listed. Please pick another date.",
  cancelled: "This departure has been cancelled. Please pick another date.",
  departed: "This departure has already left. Please pick another date.",
  closed: "Bookings for this departure have closed. Please pick another date.",
  not_enough_seats: "There aren't enough seats left on this departure for that many travellers.",
  invalid_seats: "Please choose a valid number of seats.",
};

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Trip bookings aren't set up on this deployment yet." },
      { status: 500 }
    );
  }

  const { allowed } = await checkRateLimit({
    bucket: "trip-seat-booking",
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

  const departureId = typeof body.departureId === "string" ? body.departureId.trim() : "";
  const seats = Number.isInteger(body.seats) ? Number(body.seats) : 0;
  const guestName = typeof body.guestName === "string" ? body.guestName.trim().slice(0, 200) : "";
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim().toLowerCase() : "";
  const guestPhone = typeof body.guestPhone === "string" ? body.guestPhone.trim().slice(0, 40) || null : null;
  const preferences = typeof body.preferences === "string" ? body.preferences.trim().slice(0, 2000) || null : null;
  const joinWaitlist = body.joinWaitlist === true;

  if (!departureId) {
    return NextResponse.json({ error: "Please choose a departure date." }, { status: 400 });
  }
  if (!guestName || !EMAIL_RE.test(guestEmail)) {
    return NextResponse.json({ error: "A valid name and email are required." }, { status: 400 });
  }
  if (seats < 1 || seats > MAX_SEATS_PER_BOOKING) {
    return NextResponse.json(
      { error: `Please choose between 1 and ${MAX_SEATS_PER_BOOKING} seats. For a larger group, message us and we'll run it privately.` },
      { status: 400 }
    );
  }

  // Read the departure for its trip content and for the email. The booking
  // decision is NOT made from this read — it is re-made under a lock inside
  // the function below, because anything read here can be stale by the time
  // the insert happens.
  const departure = await getDeparture(departureId);
  if (!departure) {
    return NextResponse.json({ error: OUTCOME_MESSAGES.not_found }, { status: 404 });
  }

  const user = await getCurrentUser();
  const reference = generateReference();
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase.rpc("book_departure_seats", {
    p_departure_id: departureId,
    p_seats: seats,
    p_reference: reference,
    p_customer_id: user?.id ?? null,
    p_guest_name: guestName,
    p_guest_email: guestEmail,
    p_guest_phone: guestPhone,
    p_preferences: preferences,
    p_journey_snapshot: [
      {
        type: "weeklyTrip",
        slug: departure.trip.slug,
        title: departure.trip.title,
        departureId,
        departsOn: departure.departsOn,
        seats,
      },
    ],
    p_allow_waitlist: joinWaitlist,
  });

  if (error) {
    console.error("book_departure_seats failed:", error);
    return NextResponse.json(
      { error: "Something went wrong holding your seat. Please try again, or message us on WhatsApp." },
      { status: 500 }
    );
  }

  const result = Array.isArray(data) ? data[0] : data;
  const outcome: string = result?.outcome ?? "not_found";

  if (outcome !== "requested" && outcome !== "waitlisted") {
    return NextResponse.json(
      {
        error: OUTCOME_MESSAGES[outcome] ?? "That departure can't be booked right now.",
        outcome,
        // Lets the form offer the waitlist instead of just failing.
        canWaitlist: outcome === "not_enough_seats" && !joinWaitlist,
      },
      { status: 409 }
    );
  }

  const reservationId: string = result.reservation_id;
  const waitlisted = outcome === "waitlisted";
  const seatsLeft: number = typeof result.seats_left === "number" ? result.seats_left : departure.seatsLeft;
  const totalUsd = waitlisted ? null : Math.round(departure.priceUsd * seats * 100) / 100;

  // Re-derive "does it run" from the seat count this booking just produced,
  // rather than the figure read before it — otherwise the traveller who
  // tipped it over the minimum is the one person told it still needs them.
  const seatsTakenAfter = waitlisted ? departure.seatsTaken : departure.capacity - seatsLeft;
  const guaranteed = seatsTakenAfter >= departure.minSeats;
  const seatsToGuarantee = Math.max(0, departure.minSeats - seatsTakenAfter);

  // --- The deposit, for a departure that takes one ------------------------
  //
  // Weekly Trips are the only product with a finite supply, and the seat is
  // already claimed by this point — book_departure_seats takes it under a row
  // lock, which is what stops the departure overselling. That is correct, and
  // it is also what makes the next few lines necessary: the seat is held
  // before the money arrives, so if the money never arrives the seat has to go
  // back. `seat_hold_expires_at` is what the reconcile sweep reads to do that.
  //
  // A waitlisted booking is never charged. Nothing is owed until a seat
  // actually opens, which is why the RPC prices those at null.
  const provider = paymentProviderFor({ isAdmin: user?.role === "admin" });
  const takingDeposit = !waitlisted && departure.instantBooking && provider.enabled;

  let payment: {
    orderId: string;
    clientId: string | null;
    amountUsd: number;
    lines: { label: string; unitCents: number; quantity: number; amountCents: number }[];
    sandbox: boolean;
  } | null = null;

  if (takingDeposit) {
    // The same quote engine every other product uses, handed the departure's
    // own price. One place computes a deposit on this site.
    const quoted = quoteDeposit(
      {
        slug: departure.trip.slug,
        title: departure.trip.title,
        bookable: true,
        price: { amount: departure.priceUsd },
      },
      "weeklyTrip",
      { people: seats, extras: [] }
    );

    if (quoted.ok) {
      const opened = await createAttempt({
        reservationId,
        reference,
        quote: quoted.quote,
        description: `${departure.trip.title} — ${seats} seat${seats === 1 ? "" : "s"}`,
        returnUrl: `${siteUrl}/secure/return?ref=${encodeURIComponent(reference)}`,
        cancelUrl: `${siteUrl}/weekly-trips/${departure.trip.slug}`,
      });

      if (opened.ok) {
        // Only now does the seat become a *held* seat rather than a booked
        // one. Set after the attempt exists, so a failure above leaves the
        // booking exactly as it behaved before deposits: a request the desk
        // confirms, holding its seat, with nobody expecting a payment.
        await supabase
          .from("reservations")
          .update({ seat_hold_expires_at: new Date(Date.now() + 30 * 60_000).toISOString() })
          .eq("id", reservationId);

        payment = {
          orderId: opened.orderId,
          clientId: opened.clientId,
          amountUsd: quoted.quote.totalCents / 100,
          lines: quoted.quote.lines,
          sandbox: provider.env === "sandbox",
        };
      } else {
        // The seat is kept and the booking stands as a request. Telling the
        // customer their seat is gone because PayPal was unreachable would be
        // worse than asking the desk to follow it up.
        console.error(`trip deposit could not be opened for ${reference}: ${opened.message}`);
      }
    } else {
      console.error(`trip deposit quote failed for ${reference}: ${quoted.reason}`);
    }
  }

  // The confirmation email is held back when a payment is pending.
  //
  // The rule the whole payment system is built on: nothing tells a customer
  // their booking is in hand until the money is verified. For a deposit
  // departure that email is sent by fulfilAttempt() after capture, not here —
  // sending it now would confirm a seat that is about to be released.
  const { subject, html, text } = tripSeatConfirmationEmail({
    guestName,
    reference,
    tripTitle: departure.trip.title,
    tripPath: `/weekly-trips/${departure.trip.slug}`,
    departsOn: departure.departsOn,
    departureTime: departure.departureTime,
    seats,
    totalUsd,
    waitlisted,
    guaranteed,
    seatsToGuarantee,
  });
  if (!payment) {
    await sendIdempotentEmail({
      idempotencyKey: `trip-seat-confirmation:${reservationId}`,
      notificationType: waitlisted ? "trip_waitlist_confirmation" : "trip_seat_confirmation",
      to: guestEmail,
      subject,
      html,
      text,
      customerId: user?.id,
      reservationId,
    });
  }

  // The desk needs to know a seat went, and a failure to reach them must not
  // fail the booking the traveller has already made — the seat is held
  // either way, and it is visible in /admin/reservations regardless.
  try {
    const team = tripSeatTeamEmail({
      reference,
      tripTitle: departure.trip.title,
      departsOn: departure.departsOn,
      seats,
      seatsLeft,
      capacity: departure.capacity,
      guaranteed,
      seatsToGuarantee,
      waitlisted,
      guestName,
      guestEmail,
      guestPhone,
      preferences,
      reviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com"}/admin/reservations/${reservationId}`,
    });
    await sendEmail({
      to: site.contact.email,
      subject: team.subject,
      html: team.html,
      text: team.text,
      replyTo: guestEmail,
    });
  } catch (err) {
    console.error("trip seat team notification failed:", err);
  }

  return NextResponse.json({
    ok: true,
    // Present only when a deposit is actually being taken. The form shows the
    // PayPal buttons on this and nothing else, so a departure with the switch
    // off cannot render a pay button by accident.
    payment,
    reference,
    waitlisted,
    seats,
    seatsLeft,
    guaranteed,
    seatsToGuarantee,
    total: totalUsd,
  });
}
