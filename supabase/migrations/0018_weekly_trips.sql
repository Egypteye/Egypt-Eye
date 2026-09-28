-- Weekly Trips: scheduled small-group departures travellers join by the seat.
--
-- The whole product is three levels, and only the bottom two belong in a
-- database:
--
--   1. The TRIP — "Wadi El Hitan & the Magic Lake". Repeatable, rarely
--      changes, needs a translated SEO page with photos and an itinerary.
--      That lives in src/content/weeklyTrips.ts, exactly like tours do, so
--      it inherits i18n, SmartImage, structured data and the sitemap for
--      free. Nothing about it belongs here.
--   2. The DEPARTURE — "that trip, on 14 November 2026, 12 seats, $95".
--      Created weekly, edited constantly, and the thing availability is
--      computed from. That is this table.
--   3. The SEATS — who is on a given departure. That is an ordinary row in
--      `reservations` with `departure_id` and `seats` set, rather than a new
--      bookings table: a seat booking is a reservation, and reusing the
--      table means it already appears in /admin/reservations and in My
--      Account, and already has confirmation emails and a reference code.
--
-- Availability is DERIVED, never stored. seats_taken and capacity are facts;
-- "sold out", "guaranteed", "closed" and "departed" are opinions about them
-- that would go stale the moment a booking or the clock moved. The only
-- stored status is the one nothing can infer: whether a human cancelled it.

-- ---------------------------------------------------------------------------
-- trip_departures — one dated instance of a trip
-- ---------------------------------------------------------------------------
create table if not exists public.trip_departures (
  id uuid primary key default gen_random_uuid(),

  -- Points at a slug in src/content/weeklyTrips.ts rather than a foreign key,
  -- for the same reason reservations.journey_snapshot stores slugs: the trip
  -- catalogue is version-controlled content, not a database table. A slug
  -- that no longer exists is filtered out at read time and reported by
  -- scripts/check-departures.mts, so a renamed trip is caught in CI.
  trip_slug text not null,

  departs_on date not null,
  -- Null for a day trip. Set for anything overnight, which is what makes the
  -- same table serve a 6-hour Fayoum run and a 3-day White Desert camp.
  returns_on date,
  -- Local departure time as free text ("06:30, Cairo") rather than a
  -- timestamp: pickups are staggered across hotels and the honest answer is
  -- a window agreed per booking, not a single instant.
  departure_time text,

  price_usd numeric not null check (price_usd >= 0),
  -- Optional child rate. Null means children pay the adult price, which is
  -- the common case on a seat-based trip where the cost is the seat.
  child_price_usd numeric check (child_price_usd >= 0),

  capacity integer not null check (capacity > 0),
  seats_taken integer not null default 0 check (seats_taken >= 0),
  -- Below this the trip doesn't run. Shown on the page as "needs N more to
  -- go ahead", which is honest and converts better than hiding it.
  min_seats integer not null default 1 check (min_seats > 0),

  -- After this, the page stops taking bookings. Null means "until it
  -- departs". Stored rather than derived because the real deadline depends
  -- on the trip: a desert camp needs permits days ahead, a Fayoum day trip
  -- can take someone the night before.
  booking_closes_at timestamptz,

  -- Only what cannot be worked out from the numbers and the clock.
  status text not null default 'scheduled'
    check (status in ('scheduled', 'cancelled', 'completed')),
  cancellation_reason text,

  -- Per-departure overrides of the trip's own copy, for when one run differs.
  meeting_point text,
  note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- The real guarantee against overselling. Every path that adds a seat goes
  -- through a locked read first, but this is what holds if one ever doesn't.
  constraint trip_departures_not_oversold check (seats_taken <= capacity),
  constraint trip_departures_returns_after_departs
    check (returns_on is null or returns_on >= departs_on)
);

create index if not exists trip_departures_upcoming_idx
  on public.trip_departures (departs_on)
  where status = 'scheduled';
create index if not exists trip_departures_trip_idx
  on public.trip_departures (trip_slug, departs_on);

alter table public.trip_departures enable row level security;

-- Departures are public information — the whole point is that anyone can see
-- what is coming up — so unlike every other table here this one has a read
-- policy for anonymous visitors. Writes stay service-role only: seats_taken
-- must never be settable from a browser.
drop policy if exists "trip_departures_public_read" on public.trip_departures;
create policy "trip_departures_public_read" on public.trip_departures for select
  using (true);

-- ---------------------------------------------------------------------------
-- reservations — extended to carry a seat booking
-- ---------------------------------------------------------------------------
alter table public.reservations
  add column if not exists departure_id uuid references public.trip_departures (id) on delete set null;
alter table public.reservations
  add column if not exists seats integer check (seats is null or seats > 0);

create index if not exists reservations_departure_idx
  on public.reservations (departure_id) where departure_id is not null;

-- A sold-out departure still takes names. A waitlisted row consumes no seat
-- and costs nothing; it is the difference between a dead end and a booking
-- when someone drops out.
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check
  check (status in ('requested', 'confirmed', 'in_trip', 'completed', 'cancelled', 'waitlisted'));

-- ---------------------------------------------------------------------------
-- Booking a seat, atomically
-- ---------------------------------------------------------------------------
-- Two people hitting "reserve" on the last two seats of a 12-seat bus at the
-- same moment is not a hypothetical, it is a Saturday. Checking availability
-- in application code and then inserting cannot be made safe, so the whole
-- decision happens inside one transaction that holds a row lock on the
-- departure: read seats, decide, insert, increment.
--
-- Returns an outcome string rather than raising, because most failures here
-- are ordinary answers the page should render ("sold out", "closed"), not
-- errors. Only a genuine fault raises.
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

  -- Only a real booking takes a seat. The trigger below deliberately does not
  -- fire on insert, so this is the single place a seat is claimed.
  if v_status = 'requested' then
    update public.trip_departures
      set seats_taken = seats_taken + p_seats, updated_at = now()
      where id = p_departure_id;
    v_left := v_left - p_seats;
  end if;

  return query select v_id, v_status, v_left;
end;
$$;

-- Postgres grants EXECUTE on a new function to PUBLIC by default, and PUBLIC
-- includes anon — which would let anyone with the browser's anon key book
-- seats directly, bypassing rate limiting, validation and the confirmation
-- email. Lock it to the server.
--
-- service_role has to be granted back explicitly: it is a member of PUBLIC
-- like every other role, so the revoke above takes its EXECUTE with it, and
-- 0007's `alter default privileges` covers tables and sequences only, not
-- functions. Without this line every booking fails with error 42501.
revoke all on function public.book_departure_seats(uuid, integer, text, uuid, text, text, text, text, jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.book_departure_seats(uuid, integer, text, uuid, text, text, text, text, jsonb, boolean)
  to service_role;

-- 0007 set default privileges so new tables reach service_role automatically,
-- but those defaults only apply to objects created by the role that ran it.
-- Granting explicitly here means this migration works regardless of which
-- role applies it. Safe to re-run, and matches 0007's own belt-and-braces
-- approach after the same class of bug took out every service-role write.
grant all on public.trip_departures to service_role;
-- Departures are public information — this is the one table on the site a
-- visitor is meant to read directly, which is what its "using (true)" policy
-- above is for.
grant select on public.trip_departures to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Keeping seats_taken true after the booking exists
-- ---------------------------------------------------------------------------
-- Cancelling a booking in /admin/reservations has to give the seat back, and
-- promoting someone off the waitlist has to take one. Doing that in the admin
-- UI would mean every future surface that touches a reservation has to
-- remember; doing it here means none of them do.
--
-- AFTER UPDATE only. Inserts are handled by book_departure_seats above, which
-- already holds the lock — firing on insert too would double-count.
create or replace function public.trip_departure_seat_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  was_taking boolean;
  now_taking boolean;
begin
  if old.departure_id is null and new.departure_id is null then
    return new;
  end if;

  -- Every status except cancelled and waitlisted is someone holding a seat.
  was_taking := old.status in ('requested', 'confirmed', 'in_trip', 'completed');
  now_taking := new.status in ('requested', 'confirmed', 'in_trip', 'completed');

  if was_taking = now_taking
     and coalesce(old.seats, 0) = coalesce(new.seats, 0)
     and old.departure_id is not distinct from new.departure_id then
    return new;
  end if;

  if old.departure_id is not null and was_taking then
    update public.trip_departures
      set seats_taken = greatest(0, seats_taken - coalesce(old.seats, 0)), updated_at = now()
      where id = old.departure_id;
  end if;

  -- No capacity check here on purpose. If an admin promotes more people off
  -- the waitlist than there is room for, the not_oversold constraint raises
  -- and the edit is refused — which is the correct answer, and a louder one
  -- than silently letting the bus fill past its seats.
  if new.departure_id is not null and now_taking then
    update public.trip_departures
      set seats_taken = seats_taken + coalesce(new.seats, 0), updated_at = now()
      where id = new.departure_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_reservation_departure_seat_sync on public.reservations;
create trigger on_reservation_departure_seat_sync
  after update on public.reservations
  for each row execute function public.trip_departure_seat_sync();
