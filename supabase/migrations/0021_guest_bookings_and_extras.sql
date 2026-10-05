-- Guest bookings without an email address, and priced extras on a booking.
--
-- Two changes, both of which came out of the same observation: the booking
-- popup was asking for things it did not need and not asking for the one thing
-- it did.
--
-- 1. `guest_email` stops being required.
--
--    Requiring an email to hold a date loses bookings from people who are
--    ready to pay right now, and it buys nothing in return — an address
--    nobody verifies is not identity, and a booking is reachable or it is
--    not. What the desk actually needs is one channel that works, so the
--    phone number (with its country code, composed in lib/booking/phone.ts)
--    becomes the required one and the address becomes optional.
--
--    The check constraint is the part that matters. Dropping NOT NULL on its
--    own would allow a reservation with no way at all to reach the customer,
--    which is a row nobody can act on holding money somebody has paid. At
--    least one of the two has to be present, and the database is the right
--    place to say so because three routes write this table.
--
-- 2. Extras are snapshotted onto the booking.
--
--    A product's extras and their prices live in Sanity and will change. What
--    a customer selected, and what they were quoted for it, must not change
--    with them — so the chosen rows are copied onto the reservation rather
--    than referenced. `addons_total` is stored alongside rather than summed on
--    read for the same reason: it is the figure that was shown.
--
--    Extras are NOT part of the deposit. The PayPal payment link is one fixed
--    amount per deposit tier and cannot charge a variable total, so these are
--    settled with the balance. `deposit_amount` stays the deposit alone, and
--    nothing here should ever be added to it. See lib/booking/extras.ts.

alter table public.reservations
  alter column guest_email drop not null;

-- Normalise before constraining: a row whose address was stored as an empty
-- string reads as "has an email" to a null check while being just as useless
-- as no email at all.
update public.reservations
  set guest_email = null
  where guest_email is not null and btrim(guest_email) = '';

update public.reservations
  set guest_phone = null
  where guest_phone is not null and btrim(guest_phone) = '';

alter table public.reservations
  drop constraint if exists reservations_contact_present_check;
alter table public.reservations
  add constraint reservations_contact_present_check
  check (
    (guest_email is not null and btrim(guest_email) <> '')
    or (guest_phone is not null and btrim(guest_phone) <> '')
    -- A signed-in customer is reachable through their account even if this
    -- row carries neither, which is how reservations made from an account
    -- have always worked.
    or customer_id is not null
  );

alter table public.reservations
  -- [{ "label": "Camel Ride", "priceUsd": 25 }, …] exactly as it was shown.
  add column if not exists addons jsonb not null default '[]'::jsonb,
  add column if not exists addons_total numeric
    check (addons_total is null or addons_total >= 0);

-- The desk's filter for "booked with no email", which needs a different
-- follow-up: there is nothing to write to, so somebody has to call.
create index if not exists reservations_guest_no_email_idx
  on public.reservations (created_at desc)
  where guest_email is null;
