-- Instant Booking for Weekly Trips, and the seat hold that makes it safe.
-- Rationale and the full reasoning: docs/booking-deposits.md, "Weekly Trips,
-- and the seat hold". Kept short deliberately — the Supabase SQL editor
-- truncates long scripts, which breaks the dollar-quoted function below.

alter table public.trip_departures
  add column if not exists instant_booking boolean not null default false;

alter table public.reservations
  add column if not exists seat_hold_expires_at timestamptz;

alter table public.reservations
  add column if not exists seat_hold_released_at timestamptz;

create index if not exists reservations_seat_hold_idx
  on public.reservations (seat_hold_expires_at)
  where seat_hold_expires_at is not null and departure_id is not null;

-- Gives back seats claimed for a booking nobody paid for.
-- It sets the STATUS and lets trip_departures_seat_sync (migration 0018)
-- adjust seats_taken. Touching seats_taken here as well would release twice.
create or replace function public.release_departure_seats(p_reservation_id uuid)
returns table (released integer, outcome text)
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not exists (select 1 from public.reservations where id = p_reservation_id) then
    return query select 0, 'not_found'::text;
    return;
  end if;

  if exists (
    select 1 from public.reservations
    where id = p_reservation_id
      and (departure_id is null or seats is null or seat_hold_expires_at is null)
  ) then
    return query select 0, 'no_hold'::text;
    return;
  end if;

  if exists (
    select 1 from public.reservations
    where id = p_reservation_id and status <> 'requested'
  ) then
    return query select 0, 'not_releasable'::text;
    return;
  end if;

  -- Never release a seat any payment holds or might yet hold.
  if exists (
    select 1 from public.payment_attempts
    where reservation_id = p_reservation_id
      and status in ('captured', 'pending', 'refunded', 'reversed', 'mismatch')
  ) then
    update public.reservations
      set seat_hold_expires_at = null, updated_at = now()
      where id = p_reservation_id;
    return query select 0, 'paid'::text;
    return;
  end if;

  return query
    with freed as (
      update public.reservations
        set status = 'cancelled',
            seat_hold_expires_at = null,
            seat_hold_released_at = now(),
            updated_at = now()
        where id = p_reservation_id
        returning seats
    )
    select coalesce(freed.seats, 0)::integer, 'released'::text from freed;
end;
$fn$;

revoke execute on function public.release_departure_seats(uuid) from public;
grant execute on function public.release_departure_seats(uuid) to service_role;
