-- What migration 0023's seat release actually does, run against a real
-- Postgres rather than reasoned about.
--
-- The release is the one piece of this system that cannot be checked from
-- TypeScript: it is SQL whose correctness depends on a trigger in another
-- migration. scripts/check-booking.mts greps the file for the shape; this
-- runs it.
--
--   npm run check:sql
--
-- Three properties, and the first is the one that nearly shipped broken:
--
--   A release gives the seats back EXACTLY ONCE. trip_departures_seat_sync
--   (0018) already decrements seats_taken when a reservation leaves a
--   seat-taking status, so a function that also decremented by hand would
--   double-release. A single booking cannot show this — greatest(0, ...)
--   clamps the result to the same 0 either way — so the test books TWO
--   parties and releases one, where a double-release shows up as 1 instead
--   of 4.
--
--   A seat somebody PAID for is never released, even once its hold lapses.
--
--   Releasing twice is a no-op, because the sweep is at-least-once.
\set ON_ERROR_STOP on

-- A departure with 10 seats, Instant Booking on.
insert into public.trip_departures (id, trip_slug, departs_on, price_usd, capacity, min_seats, instant_booking)
values ('11111111-1111-1111-1111-111111111111', 'white-desert-overnight-camp', current_date + 30, 200, 10, 2, true);

-- Somebody books 3 seats through the RPC, exactly as the route does.
select reservation_id, outcome, seats_left
from public.book_departure_seats(
  '11111111-1111-1111-1111-111111111111'::uuid, 3, 'EE-TEST-1', null,
  'Test Guest', 'test@example.com', null, null, null, false);

select 'after booking: seats_taken=' || seats_taken from public.trip_departures where id='11111111-1111-1111-1111-111111111111';

-- The route marks it as held pending payment.
update public.reservations set seat_hold_expires_at = now() - interval '31 minutes' where reference='EE-TEST-1';

-- The sweep releases it.
select 'release -> ' || outcome || ' / seats=' || released
from public.release_departure_seats((select id from public.reservations where reference='EE-TEST-1'));

select 'after release: seats_taken=' || seats_taken from public.trip_departures where id='11111111-1111-1111-1111-111111111111';
select 'reservation status=' || status from public.reservations where reference='EE-TEST-1';

-- Idempotent: running it again must not release a second time.
select 'second call -> ' || outcome || ' / seats=' || released
from public.release_departure_seats((select id from public.reservations where reference='EE-TEST-1'));
select 'STILL: seats_taken=' || seats_taken from public.trip_departures where id='11111111-1111-1111-1111-111111111111';
insert into public.trip_departures (id, trip_slug, departs_on, price_usd, capacity, min_seats, instant_booking)
values ('22222222-2222-2222-2222-222222222222', 'white-desert-overnight-camp', current_date + 40, 200, 10, 2, true);

-- TWO bookings on the same departure: 3 seats and 4 seats.
select 1 from public.book_departure_seats('22222222-2222-2222-2222-222222222222'::uuid, 3, 'EE-A', null, 'A', 'a@x.com', null, null, null, false);
select 1 from public.book_departure_seats('22222222-2222-2222-2222-222222222222'::uuid, 4, 'EE-B', null, 'B', 'b@x.com', null, null, null, false);
select 'both booked: seats_taken=' || seats_taken || ' (expect 7)' from public.trip_departures where id='22222222-2222-2222-2222-222222222222';

-- Abandon only A. A double-release would take 6 and leave 1, not 4.
update public.reservations set seat_hold_expires_at = now() - interval '1 hour' where reference='EE-A';
select 'release A -> ' || outcome from public.release_departure_seats((select id from public.reservations where reference='EE-A'));
select 'seats_taken=' || seats_taken || ' (expect 4 — a double-release would show 1)' from public.trip_departures where id='22222222-2222-2222-2222-222222222222';

-- B pays. The guard must refuse to release even once the hold lapses.
insert into public.payment_attempts (reservation_id, amount_cents, quote, status)
values ((select id from public.reservations where reference='EE-B'), 20000, '{}'::jsonb, 'captured');
update public.reservations set seat_hold_expires_at = now() - interval '1 hour' where reference='EE-B';
select 'release B (paid) -> ' || outcome || ' / seats=' || released
from public.release_departure_seats((select id from public.reservations where reference='EE-B'));
select 'seats_taken=' || seats_taken || ' (expect 4 — a paid seat must never be released)' from public.trip_departures where id='22222222-2222-2222-2222-222222222222';
select 'B hold cleared: ' || coalesce(seat_hold_expires_at::text,'null') || ' / status=' || status from public.reservations where reference='EE-B';
