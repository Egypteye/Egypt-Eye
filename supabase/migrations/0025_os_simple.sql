-- Egypt Eye OS — the shared workspace for reservations, operations and social.
--
-- This replaces three spreadsheets that currently hold the same booking three
-- times: the reservations desk's handwritten follow-up list, the operations
-- day sheet ("Egypt Eye Ops/Res"), and the social media content tracker
-- ("Egypt Eye Workplace"). Each team re-types what the one before it already
-- wrote, so a changed pick-up time or a collected deposit is only ever right
-- in one of the three.
--
-- Two shapes come straight out of reading those sheets:
--
-- * A multi-day trip appears once PER DAY on the operations sheet — the Glow
--   girls' four-day booking is on all four date tabs. So operations' unit is a
--   day of service, not a booking. ops_booking_days is that unit.
--
-- * The same sheet repeats the full $3,680 on every one of those four rows.
--   Read down a column and the business looks four times its size. Money
--   therefore lives on ops_bookings and ONLY there; a day row has no price
--   column to get wrong. Totalling a date means joining to the booking, which
--   is the honest answer rather than the convenient one.
--
-- Access: RLS is on with NO client policies, the same arrangement as
-- newsletter_subscribers in 0001. Nothing in a browser can read or write
-- these tables with an anon key, whatever it claims about itself. Every read
-- and write goes through a server action that has already called
-- requireOsStaff() (src/lib/auth/session.ts) and then uses the service-role
-- key. Front-end checks decide what to *draw*; they are never what keeps
-- a guest's phone number or a booking's money out of the wrong hands.

-- ---------------------------------------------------------------------------
-- Pre-flight: refuse to run if these names are already taken.
--
-- This database already holds 84 tables from an earlier, far larger OS, among
-- them an `os_leads` with a completely different 48-column shape. Those names
-- are why everything below is prefixed `ops_` rather than `os_`.
--
-- The check exists because `create table if not exists` does not fail on a
-- name clash — it silently does nothing and reports success. The migration
-- would have looked like it worked, and the follow-up screen would then have
-- failed at runtime asking for a column that table has never had. A loud
-- failure here is the whole point: if one of these names is taken, stop, and
-- let a person decide what to do about it.
--
-- Nothing in this migration reads, writes, alters or drops any `os_` table.
-- That data is left exactly as it is.
-- ---------------------------------------------------------------------------
do $$
declare
  taken text;
begin
  select string_agg(c.relname, ', ' order by c.relname) into taken
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and c.relname in ('ops_followups', 'ops_bookings', 'ops_booking_days')
    and not exists (
      -- A table this migration itself created on an earlier run is fine:
      -- re-running must stay safe. One of its own columns proves authorship.
      select 1 from information_schema.columns ic
      where ic.table_schema = 'public'
        and ic.table_name = c.relname
        and ic.column_name in ('next_follow_up_on', 'total_cents', 'service_date')
    );

  if taken is not null then
    raise exception
      'Egypt Eye OS: % already exists with a different shape. This migration has NOT been applied. Nothing was changed.',
      taken;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Roles: operations and social join customer / admin / reservations.
--
-- Widened, not replaced, so existing rows keep their role. Role changes are
-- still filtered by prevent_role_self_escalation() from 0001 — a signed-in
-- user cannot promote themselves into the OS by patching their own profile,
-- because that trigger silently discards any role change not made by the
-- service role.
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'admin', 'reservations', 'operations', 'social'));

-- ---------------------------------------------------------------------------
-- Keeps updated_at honest without every caller having to remember it.
-- ---------------------------------------------------------------------------
create or replace function public.ops_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- ops_followups — the handwritten FOLLOW UP LIST, with the dates made actionable.
--
-- The paper version already has the right columns; what it cannot do is tell
-- anyone that today is the day. next_follow_up_on is the whole point of this
-- table being in a database: it is indexed, so "who am I chasing today" is a
-- query rather than a reading of five sheets of paper.
--
-- platform is free text on purpose. The paper list writes "B" (Booking.com),
-- "Ig" and "TikTok" — short forms that mean something to whoever wrote them
-- and grow as new channels appear. An enum would refuse the next one on the
-- day it mattered, so the UI suggests the known channels, spelled out, and
-- the column accepts whatever is actually true.
-- ---------------------------------------------------------------------------
create table if not exists public.ops_followups (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  platform text,
  contact text,
  requested_on date not null default current_date,
  travel_window text,
  interest text,
  pax integer check (pax is null or pax > 0),
  itinerary_status text not null default 'not_sent'
    check (itinerary_status in ('not_sent', 'sent')),
  last_follow_up_on date,
  next_follow_up_on date,
  outcome text not null default 'pending'
    check (outcome in ('pending', 'booked', 'lost')),
  notes text,
  owner text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The index that makes the reminders screen a query and not a scan: only
-- rows still being chased carry a next-follow-up date worth looking at.
create index if not exists ops_followups_next_follow_up_idx
  on public.ops_followups (next_follow_up_on)
  where outcome = 'pending';

create index if not exists ops_followups_requested_on_idx on public.ops_followups (requested_on desc);

drop trigger if exists ops_followups_touch_updated_at on public.ops_followups;
create trigger ops_followups_touch_updated_at
  before update on public.ops_followups
  for each row execute function public.ops_touch_updated_at();

-- ---------------------------------------------------------------------------
-- ops_bookings — one row per sale. The single place money is written down.
-- ---------------------------------------------------------------------------
create sequence if not exists public.ops_booking_ref_seq;

-- A short reference the team can say out loud in a WhatsApp group, which is
-- how these bookings actually get passed to the ground crew today.
--
-- Not written inline as lpad(nextval(...), 4, '0'), because Postgres lpad
-- TRUNCATES when the input is longer than the target width: lpad('10000', 4,
-- '0') is '1000'. The ten-thousandth booking would be handed the same
-- reference as the thousandth and the insert would fail on the unique index,
-- with nothing on screen to explain why bookings had stopped being created.
-- greatest() keeps the four-digit look without putting a ceiling on it.
create or replace function public.ops_next_booking_ref()
returns text
language plpgsql
volatile
as $$
declare
  n bigint := nextval('public.ops_booking_ref_seq');
begin
  return 'EE-' || lpad(n::text, greatest(4, length(n::text)), '0');
end;
$$;

create table if not exists public.ops_bookings (
  id uuid primary key default gen_random_uuid(),

  ref text not null unique default public.ops_next_booking_ref(),

  guest_name text not null,
  guest_phone text,
  guest_email text,

  -- Where the booking came from. The operations sheet calls this
  -- "Organization" and the social sheet calls it "Platform"; both hold the
  -- same fact (Egypt Eye's own booking vs Airbnb vs an inbound DM), so it is
  -- one column here instead of two that can disagree.
  source text,

  service_type text,
  pax integer not null check (pax > 0),

  -- Whole cents, like amount_cents in 0022 and every other money column
  -- here. Not numeric(10,2): the figure crosses into JavaScript, where 0.1
  -- and 0.2 do not add up, and an integer cannot acquire a rounding error on
  -- the way through. Converted once, at the form, by usdToCents().
  total_cents integer not null default 0 check (total_cents >= 0),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),

  -- Derived, so "remaining" cannot drift from the two numbers it comes from.
  -- The operations sheet keeps Remaining as a typed-in third column, which is
  -- exactly how a sheet ends up saying a guest owes money they have paid.
  remaining_cents integer generated always as (total_cents - deposit_cents) stored,

  -- Status, never deletion. A cancelled booking that vanishes takes its
  -- payment history with it and leaves the day sheet unexplained.
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'completed')),
  cancellation_reason text,

  -- The desk that owns the guest relationship, as a name, because the sheets
  -- name people ("Maro") who may not all have OS accounts. created_by is the
  -- separate, non-negotiable fact of which account typed this in.
  reservation_owner text,
  created_by uuid references public.profiles (id) on delete set null,

  notes text,

  -- Where this came from, when it started life as a follow-up row.
  lead_id uuid references public.ops_followups (id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A deposit larger than the total is always a typo, and it would make
  -- remaining_cents negative on every screen that shows it.
  constraint ops_bookings_deposit_within_total check (deposit_cents <= total_cents),
  -- Cancelling without saying why is what makes a day sheet unreadable a
  -- week later.
  constraint ops_bookings_cancelled_has_reason
    check (status <> 'cancelled' or cancellation_reason is not null)
);

create index if not exists ops_bookings_created_at_idx on public.ops_bookings (created_at desc);
create index if not exists ops_bookings_lead_idx on public.ops_bookings (lead_id);

drop trigger if exists ops_bookings_touch_updated_at on public.ops_bookings;
create trigger ops_bookings_touch_updated_at
  before update on public.ops_bookings
  for each row execute function public.ops_touch_updated_at();

-- ---------------------------------------------------------------------------
-- ops_booking_days — one row per excursion date. The operations day sheet.
--
-- This is the table the ground crew reads each morning, and the reason the
-- date tabs in the spreadsheet can go away: a date is a query here, not a
-- copy of the booking.
--
-- It carries no money. See the header.
-- ---------------------------------------------------------------------------
create table if not exists public.ops_booking_days (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.ops_bookings (id) on delete cascade,

  service_date date not null,
  service_type text,
  service_location text,

  -- Nullable because "pick-up time to be confirmed" is a real and common
  -- state the day before a tour, and a fake 00:00 reads as midnight.
  pickup_time time,
  pickup_location text,

  operator_name text,
  guide_name text,

  -- An array rather than a comma-separated string: the sheet's Inclusions
  -- column holds a list (Camel, Jumping Horse, Pro Reels), and counting how
  -- many camels a week needs should not require parsing prose.
  inclusions text[] not null default '{}',
  inclusions_notes text,
  notes text,

  -- The social team's columns. They live on the day, not the booking, because
  -- a four-day trip is shot on four days and only one of them might be the
  -- one with the reel in it.
  photographer text,
  assist text,
  data_collected boolean not null default false,
  photo_link text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One row per booking per date. Without this, re-saving a booking's days
  -- quietly doubles the day sheet and the crew shows up twice.
  constraint ops_booking_days_unique_date unique (booking_id, service_date)
);

-- The index behind the "today" screen, which is the first thing operations
-- opens every morning.
create index if not exists ops_booking_days_service_date_idx
  on public.ops_booking_days (service_date);

drop trigger if exists ops_booking_days_touch_updated_at on public.ops_booking_days;
create trigger ops_booking_days_touch_updated_at
  before update on public.ops_booking_days
  for each row execute function public.ops_touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS on, no client policies. Server-side access only, via the service role.
-- ---------------------------------------------------------------------------
alter table public.ops_followups enable row level security;
alter table public.ops_bookings enable row level security;
alter table public.ops_booking_days enable row level security;
