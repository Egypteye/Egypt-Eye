-- Departures that exist before they have a price, and know why their date was
-- chosen.
--
-- ---------------------------------------------------------------------------
-- WHY price_usd HAS TO BECOME NULLABLE
-- ---------------------------------------------------------------------------
-- The stargazing calendar is scheduled a year ahead, because the dates are
-- fixed by the Moon rather than by us: the new moon in February 2027 is not
-- negotiable and the trip has to be announced against it. The price for that
-- night is not known a year out, and the business sets prices by hand.
--
-- Until now a departure could not exist without a price, so publishing a date
-- early meant typing a number nobody had agreed to. A placeholder price on a
-- live booking page is the worst of the available mistakes: it is a figure a
-- customer can screenshot. So the column becomes nullable and the readiness
-- ladder below decides what a priceless departure is allowed to do.
--
-- ---------------------------------------------------------------------------
-- THE READINESS LADDER
-- ---------------------------------------------------------------------------
--   research   - internal only. Never rendered to a visitor. Where a date
--                sits while somebody is still checking whether it can run.
--   announced  - public, and honest: the date is real and the trip is being
--                scheduled, but it cannot be booked and shows no price.
--   open       - bookable. Requires a price, which the constraint enforces
--                rather than trusting the application to remember.
--
-- This is separate from `status` (scheduled / cancelled / completed), which
-- is about what happened to a departure, not about how ready it is to sell.
-- A departure can be announced and cancelled; it cannot be open and unpriced.

alter table public.trip_departures
  alter column price_usd drop not null;

alter table public.trip_departures
  add column if not exists readiness text not null default 'open'
    check (readiness in ('research', 'announced', 'open'));

-- The guarantee that matters: nothing reaches a booking form without a price.
-- Written as a table constraint so it holds against a hand-edited row in the
-- Supabase SQL editor, which is how this business actually touches data.
alter table public.trip_departures
  drop constraint if exists trip_departures_open_needs_price;
alter table public.trip_departures
  add constraint trip_departures_open_needs_price
    check (readiness <> 'open' or price_usd is not null);

-- ---------------------------------------------------------------------------
-- WHY THE DATE WAS CHOSEN
-- ---------------------------------------------------------------------------
-- A stargazing departure is sold on the darkness of one particular night, so
-- the reason for the date is customer-facing content, not an internal note.
-- These are stored per departure rather than computed at render time on
-- purpose: the figures are checked by a person against an astronomical
-- source before the date is published, and a stored number can be audited
-- later against what was actually advertised.
--
-- scripts/check-astronomy.mts re-derives them from first principles and fails
-- the build if a published date drifts from the sky.

alter table public.trip_departures
  -- "Geminid meteor shower", "Total solar eclipse". Null for an ordinary date.
  add column if not exists astro_event text,
  -- Illuminated fraction of the Moon at local midnight, 0-1.
  add column if not exists moon_illumination numeric
    check (moon_illumination is null or (moon_illumination >= 0 and moon_illumination <= 1)),
  -- The hours actually worth being outside, in words: "22:00 to 03:00".
  add column if not exists observing_window text;

-- Announced departures are public, so the existing anonymous read policy
-- already covers them. Research rows are not, and the application filters
-- them out; this index keeps that filter cheap as the calendar grows.
create index if not exists trip_departures_public_idx
  on public.trip_departures (departs_on)
  where status = 'scheduled' and readiness in ('announced', 'open');

comment on column public.trip_departures.readiness is
  'research = internal only; announced = public date, not bookable, no price; open = bookable, price required.';
comment on column public.trip_departures.price_usd is
  'Null until the business sets it by hand. A departure cannot be readiness=open while this is null.';

-- ---------------------------------------------------------------------------
-- A DEPARTURE THAT IS NOT FOR SALE CANNOT BE BOOKED, INCLUDING BY HAND
-- ---------------------------------------------------------------------------
-- book_departure_seats checked status, dates, the booking deadline and the
-- seat count, and nothing about whether the departure was actually on sale.
-- With a priceless announced departure in the table that is a real hole: a
-- POST straight at /api/trip-seats with its id would take the booking and
-- write a reservation whose total is `round(null * seats)` - that is, null.
--
-- The page not rendering a button is not a guard. This is the guard, because
-- it is inside the same locked read that stops the departure overselling.
create or replace function public.book_departure_seats(
  p_departure_id uuid,
  p_seats integer,
  p_reference text,
  p_customer_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_preferences text,
  p_journey_snapshot jsonb,
  p_allow_waitlist boolean default true
)
returns table (reservation_id uuid, outcome text, seats_left integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.trip_departures%rowtype;
  v_left integer;
  v_status text;
  v_total numeric;
  v_id uuid;
begin
  if p_seats is null or p_seats < 1 or p_seats > 20 then
    return query select null::uuid, 'invalid_seats'::text, null::integer;
    return;
  end if;

  -- FOR UPDATE is the entire point of this function: it serialises every
  -- concurrent booking of the same departure behind this line.
  select * into d from public.trip_departures where id = p_departure_id for update;

  if not found then
    return query select null::uuid, 'not_found'::text, null::integer;
    return;
  end if;

  if d.status = 'cancelled' then
    return query select null::uuid, 'cancelled'::text, 0;
    return;
  end if;

  if d.status = 'completed' or d.departs_on < current_date then
    return query select null::uuid, 'departed'::text, 0;
    return;
  end if;

  -- THE NEW GUARD. Everything else in this function is unchanged from 0018,
  -- copied from the live definition rather than retyped.
  --
  -- Announced and research departures are real dates that are not on sale,
  -- and a departure with no price cannot be charged for: round(null * seats)
  -- is null, so without this a booking would be taken and recorded as owing
  -- nothing. The page not rendering a button is not a guard; this is, because
  -- it sits inside the same locked read that stops the departure overselling.
  if coalesce(d.readiness, 'open') <> 'open' or d.price_usd is null then
    return query select null::uuid, 'not_on_sale'::text, greatest(0, d.capacity - d.seats_taken);
    return;
  end if;

  if d.booking_closes_at is not null and now() >= d.booking_closes_at then
    return query select null::uuid, 'closed'::text, greatest(0, d.capacity - d.seats_taken);
    return;
  end if;

  v_left := d.capacity - d.seats_taken;

  if v_left < p_seats then
    if not p_allow_waitlist then
      return query select null::uuid, 'not_enough_seats'::text, v_left;
      return;
    end if;
    -- Waitlisted rows are deliberately priced at null: nothing is owed until
    -- a seat actually opens and the booking is converted.
    v_status := 'waitlisted';
    v_total := null;
  else
    v_status := 'requested';
    v_total := round(d.price_usd * p_seats, 2);
  end if;

  insert into public.reservations (
    reference, customer_id, guest_name, guest_email, guest_phone,
    journey_snapshot, trip_start_date, trip_end_date,
    travelers_adults, preferences, departure_id, seats,
    subtotal_estimate, total_estimate, status
  ) values (
    p_reference, p_customer_id, p_guest_name, p_guest_email, p_guest_phone,
    coalesce(p_journey_snapshot, '[]'::jsonb), d.departs_on, coalesce(d.returns_on, d.departs_on),
    p_seats, p_preferences, p_departure_id, p_seats,
    v_total, v_total, v_status
  )
  returning id into v_id;

  -- Only a real booking takes a seat.
  if v_status = 'requested' then
    update public.trip_departures
      set seats_taken = seats_taken + p_seats, updated_at = now()
      where id = p_departure_id;
    v_left := v_left - p_seats;
  end if;

  return query select v_id, v_status, v_left;
end;
$$;
