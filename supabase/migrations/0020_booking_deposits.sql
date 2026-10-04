-- Deposit bookings: securing a date with a held deposit.
--
-- This adds a payment dimension to `reservations` rather than a second
-- booking table. A deposit booking is an ordinary reservation — it shows up in
-- /admin/reservations and in My Account beside everything else, with the same
-- reference — that happens to carry money. Forking it would fork the status
-- machine, the account page, the admin list and the emails, and the two halves
-- would drift.
--
-- The central idea, and the reason for the column split: a held deposit is NOT
-- a confirmed booking. `status` carries the booking, `deposit_status` carries
-- the money, and they move independently. A payment event may advance the
-- money to 'authorized' and the booking no further than 'checking'. Only a
-- person reaches 'confirmed', and the capture happens at that moment.
--
-- See docs/booking-deposits.md for why the money is HELD rather than taken:
-- an authorization that is never captured is simply voided, so a date Egypt
-- Eye cannot confirm costs the customer nothing and needs no refund.

alter table public.reservations
  add column if not exists product_type text
    check (product_type is null or product_type in ('photoshoot', 'experience', 'tour', 'weeklyTrip')),
  add column if not exists product_slug text,
  -- The requested slot. `starts_at` is a timestamp rather than a date because
  -- a sunrise photoshoot and a sunset one on the same day are different
  -- bookings, and trip_start_date cannot tell them apart.
  add column if not exists starts_at timestamptz,
  add column if not exists slot_label text,
  add column if not exists deposit_amount numeric check (deposit_amount is null or deposit_amount >= 0),
  add column if not exists deposit_currency text not null default 'USD',
  add column if not exists deposit_status text not null default 'not_required'
    check (deposit_status in
      ('not_required', 'awaiting', 'authorized', 'captured', 'voided', 'refunded', 'failed')),
  -- When the hold was placed. The authorization expires, so this is what the
  -- admin list sorts by: a hold nobody has resolved is the most urgent row on
  -- the screen, not the oldest one.
  add column if not exists deposit_held_at timestamptz,
  add column if not exists deposit_paid_at timestamptz,
  add column if not exists payment_provider text,
  add column if not exists payment_order_id text,
  add column if not exists payment_authorization_id text,
  add column if not exists payment_capture_id text;

-- 'checking' and 'declined' join the existing set. 'declined' is Egypt Eye
-- being unable to do the date, which is a different thing from 'cancelled'
-- (the customer changing their mind) and must stay distinguishable: one of
-- them keeps the deposit and the other never charges it.
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check
  check (status in
    ('requested', 'checking', 'confirmed', 'in_trip', 'completed', 'cancelled', 'waitlisted', 'declined'));

-- The admin's working queue: everything holding money that nobody has decided
-- about yet, oldest hold first, because that is the one closest to expiring.
create index if not exists reservations_open_holds_idx
  on public.reservations (deposit_held_at)
  where deposit_status = 'authorized';

create index if not exists reservations_product_idx
  on public.reservations (product_type, product_slug, starts_at);

-- ---------------------------------------------------------------------------
-- Payment events: an append-only log of what the provider told us.
--
-- Separate from the reservation because webhooks arrive more than once, out of
-- order, and sometimes for bookings that no longer exist. Recording the raw
-- event keyed by the provider's own id makes the handler idempotent by
-- construction: inserting a duplicate violates the unique index and the second
-- delivery becomes a no-op rather than a second state change.
--
-- It is also the audit trail. When a customer asks why they were charged, the
-- answer has to come from what the provider actually sent, not from a column
-- that something later overwrote.
-- ---------------------------------------------------------------------------
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paypal',
  event_id text not null,
  event_type text not null,
  reservation_id uuid references public.reservations (id) on delete set null,
  reference text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create unique index if not exists payment_events_provider_event_idx
  on public.payment_events (provider, event_id);

alter table public.payment_events enable row level security;
-- No client policies at all. Payment events are written by the webhook route
-- with the service role and read by staff tooling; a browser has no business
-- reading another customer's payment history, and RLS with no policy is the
-- strongest way to say so (same pattern as newsletter_subscribers in 0001).
