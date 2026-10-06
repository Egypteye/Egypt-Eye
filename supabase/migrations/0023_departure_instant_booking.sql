-- Instant Booking for Weekly Trips, and the seat hold that makes it safe.
--
-- Every other product on this site is unlimited: two people can book the same
-- photoshoot slot and the worst case is a conversation. A departure has a van
-- with a fixed number of seats, and book_departure_seats() already claims one
-- the moment a booking is made — under FOR UPDATE, so it cannot oversell.
--
-- Adding a deposit opens a gap that does not exist anywhere else in the
-- system: seats are claimed now, the money arrives later, and in between the
-- customer can close the tab. Without this migration an abandoned checkout
-- holds seats until a human notices, and a popular departure reads as full to
-- real customers who would have paid.
--
-- Two designs were available.
--
--   Pay first, then claim the seat. No seat is ever held for a non-payer, but
--   a customer can pay and find the seats gone in the interval, which needs an
--   automatic refund path and is a far worse thing to get wrong.
--
--   Claim the seat, release it if the money never comes. An abandoned checkout
--   costs the departure some availability for a bounded time, and it heals
--   itself.
--
-- The second is chosen: the failure costs availability rather than trust, and
-- it is recoverable without touching anybody's money.

-- The switch, per departure rather than per trip, because the price it takes a
-- percentage of is per departure too. A trip is version-controlled content; a
-- departure is the thing the team actually edits week to week.
alter table public.trip_departures
  add column if not exists instant_booking boolean not null default false;

comment on column public.trip_departures.instant_booking is
  'Offer this departure online, taking the deposit on the spot. Needs price_usd set. Off by default: a price is information, the switch is what puts it on sale.';

-- When an unpaid claim lapses. Null means the seats are not held pending a
-- payment at all, which is every booking taken before this existed and every
-- booking on a departure with the switch off — the request-then-confirm flow,
-- which must keep working untouched.
alter table public.reservations
  add column if not exists seat_hold_expires_at timestamptz;

comment on column public.reservations.seat_hold_expires_at is
  'For Instant Booking departures: when seats claimed for an unpaid booking are released. Cleared on capture. Null means no pending-payment hold.';

-- Tells an abandoned checkout apart from a customer who cancelled. Both end up
-- 'cancelled', because that is the status that gives the seat back, but the
-- desk needs to know which it is looking at.
alter table public.reservations
  add column if not exists seat_hold_released_at timestamptz;

-- The sweep reads exactly this: live holds, oldest first.
create index if not exists reservations_seat_hold_idx
  on public.reservations (seat_hold_expires_at)
  where seat_hold_expires_at is not null and departure_id is not null;

-- ---------------------------------------------------------------------------
-- Releasing a lapsed hold.
--
-- The mirror of book_departure_seats, and it takes the same lock for the same
-- reason: releasing a seat is a write to seats_taken, and a release racing a
-- booking must not lose an increment.
--
-- It is deliberately conservative. It refuses to release when anything about
-- the booking says money may be involved, because wrongly releasing a seat
-- somebody paid for is far worse than holding one nobody did a little longer.
create or replace function public.release_departure_seats(p_reservation_id uuid)
returns table (released integer, outcome text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.reservations%rowtype;
  v_paid integer;
begin
  select * into r from public.reservations where id = p_reservation_id;
  if not found then
    return query select 0, 'not_found'::text;
    return;
  end if;

  -- Nothing to release: either it never held seats, or a previous run of this
  -- already released them. Idempotent on purpose — the sweep is at-least-once.
  if r.departure_id is null or r.seats is null or r.seat_hold_expires_at is null then
    return query select 0, 'no_hold'::text;
    return;
  end if;

  -- Only a booking that actually claimed a seat has one to give back.
  -- 'waitlisted' rows never incremented seats_taken.
  if r.status <> 'requested' then
    return query select 0, 'not_releasable'::text;
    return;
  end if;

  -- The guard that matters. If any attempt against this booking holds money,
  -- or might yet, the seats stay. 'pending' is money PayPal has but has not
  -- credited — not ours yet, and absolutely not a reason to take a seat back.
  select count(*) into v_paid
  from public.payment_attempts
  where reservation_id = p_reservation_id
    and status in ('captured', 'pending', 'refunded', 'reversed', 'mismatch');

  if v_paid > 0 then
    -- Clear the hold so the sweep stops looking at it, but keep the seats.
    update public.reservations
      set seat_hold_expires_at = null, updated_at = now()
      where id = p_reservation_id;
    return query select 0, 'paid'::text;
    return;
  end if;

  -- The seat is given back by SETTING THE STATUS, not by touching seats_taken.
  --
  -- trip_departures_seat_sync (migration 0018) already fires on this update:
  -- 'requested' is seat-taking, 'cancelled' is not, so the trigger decrements
  -- seats_taken by exactly r.seats. Doing it here as well would release every
  -- seat twice and quietly under-count a departure until somebody noticed a
  -- van with more people than seats.
  --
  -- It needs no explicit FOR UPDATE either: the trigger's own UPDATE takes a
  -- row lock on the departure, which serialises against the SELECT ... FOR
  -- UPDATE that book_departure_seats holds.
  --
  -- The booking is not deleted. An abandoned checkout is a lead the desk can
  -- follow up, and deleting it would throw away the only record that somebody
  -- wanted these seats.
  update public.reservations
    set status = 'cancelled',
        seat_hold_expires_at = null,
        seat_hold_released_at = now(),
        updated_at = now()
    where id = p_reservation_id;

  return query select r.seats, 'released'::text;
end;
$$;

-- Same lockdown as book_departure_seats: PUBLIC includes anon, and anon must
-- never be able to free somebody else's seats.
revoke execute on function public.release_departure_seats(uuid) from public;
grant execute on function public.release_departure_seats(uuid) to service_role;
