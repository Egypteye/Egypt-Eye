-- Egypt Eye: accounts, newsletter, discounts, journeys, reservations, My Egypt, concierge.
--
-- Run this once in Supabase → SQL Editor (or via the Supabase CLI) after
-- creating the project. Safe to re-run: every statement is guarded with
-- IF NOT EXISTS / CREATE OR REPLACE.
--
-- Design notes:
-- * auth.users (Supabase Auth) owns passwords/sessions/email verification/
--   password reset — we never touch credentials ourselves. `profiles` is a
--   1:1 public extension of it, created automatically by a trigger.
-- * Row Level Security is enabled everywhere. Tables a signed-in visitor
--   should read directly (profiles, journeys, reservations, discount_codes,
--   concierge_requests) get a "you can only see your own rows" policy.
--   Tables that must never be trusted from the browser (newsletter_
--   subscribers, discount_campaigns, discount_redemptions) get RLS enabled
--   with NO client policies at all — every write to them goes through a
--   server-side Next.js route using the service-role key, which is the
--   only thing authorized to bypass RLS.
-- * Uniqueness is enforced at the database level wherever "this must never
--   happen twice" matters (one code per redemption, one subscriber per
--   email, one profile per user) — the real guarantee against double
--   redemption and duplicate signups lives here, not in application code.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles — 1:1 extension of auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, marketing_consent, marketing_consent_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false),
    case when coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false)
      then now() else null end
  )
  on conflict (id) do nothing;

  -- If this email already had a newsletter subscription (and/or a discount
  -- code minted from it) before creating an account, link them to the new
  -- account now — so "My Account" shows the offer without the customer
  -- having to dig through their inbox, per the spec's account+discount
  -- connection requirement. Never overwrites an existing link.
  update public.newsletter_subscribers
    set customer_id = new.id
    where email = new.email and customer_id is null;

  update public.discount_codes
    set customer_id = new.id
    where customer_id is null
      and subscriber_id in (select id from public.newsletter_subscribers where email = new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'customer');
  -- customers can edit their own row but can never grant themselves 'admin'

-- ---------------------------------------------------------------------------
-- newsletter_subscribers — server-only access (no client RLS policy)
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  marketing_consent boolean not null default true,
  consent_at timestamptz not null default now(),
  source text not null default 'newsletter',
  verified boolean not null default false,
  verify_token uuid not null default gen_random_uuid(),
  verified_at timestamptz,
  unsubscribed boolean not null default false,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
-- Intentionally no policies: only the service-role key (server routes) may
-- read/write this table. Verify/unsubscribe links are authenticated by their
-- unguessable token, checked server-side, not by a Postgres policy.

-- ---------------------------------------------------------------------------
-- discount_campaigns — configurable from the backend, server-only access
-- ---------------------------------------------------------------------------
create table if not exists public.discount_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'fixed')),
  value numeric not null,
  max_discount_amount numeric,
  min_booking_value numeric,
  one_time_use boolean not null default true,
  new_customers_only boolean not null default false,
  eligible_tour_slugs text[],
  excluded_tour_slugs text[],
  eligible_experience_slugs text[],
  excluded_experience_slugs text[],
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  code_validity_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.discount_campaigns enable row level security;
-- Server-only (service role). Admins manage this via /admin, never the browser directly.

insert into public.discount_campaigns (
  name, slug, discount_type, value, min_booking_value, one_time_use,
  new_customers_only, active, code_validity_days
)
values (
  'Newsletter 4% Off', 'newsletter-4-off', 'percentage', 4, 500, true,
  false, true, 365
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- discount_codes — one unique code per eligible customer
-- ---------------------------------------------------------------------------
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  campaign_id uuid not null references public.discount_campaigns (id) on delete cascade,
  customer_id uuid references public.profiles (id) on delete set null,
  subscriber_id uuid references public.newsletter_subscribers (id) on delete set null,
  status text not null default 'available' check (status in ('available', 'redeemed', 'expired', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint discount_codes_owner_check check (customer_id is not null or subscriber_id is not null)
);

create index if not exists discount_codes_customer_idx on public.discount_codes (customer_id);
create index if not exists discount_codes_subscriber_idx on public.discount_codes (subscriber_id);

alter table public.discount_codes enable row level security;

drop policy if exists "discount_codes_select_own" on public.discount_codes;
create policy "discount_codes_select_own" on public.discount_codes for select
  using (auth.uid() = customer_id);
-- All writes (mint/redeem/expire) happen server-side with the service role.

-- ---------------------------------------------------------------------------
-- discount_redemptions — the unique row here IS the "already used" guarantee
-- ---------------------------------------------------------------------------
create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null unique references public.discount_codes (id) on delete cascade,
  reservation_id uuid not null,
  discount_amount numeric not null,
  redeemed_at timestamptz not null default now()
);
-- `code_id` UNIQUE means a second attempt to insert a redemption row for the
-- same code fails at the database level — the real, race-condition-safe
-- guard against double redemption (see src/lib/discounts/redeem.ts).

alter table public.discount_redemptions enable row level security;
-- Server-only.

-- ---------------------------------------------------------------------------
-- journeys / journey_items — the account-saved version of "My Journey"
-- ---------------------------------------------------------------------------
create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null default 'My Egypt Journey',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journeys enable row level security;

drop policy if exists "journeys_all_own" on public.journeys;
create policy "journeys_all_own" on public.journeys for all
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

create table if not exists public.journey_items (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  item_type text not null check (item_type in ('tour', 'experience', 'photoshoot', 'destination')),
  slug text not null,
  title text not null,
  subtitle text,
  created_at timestamptz not null default now(),
  unique (journey_id, item_type, slug)
);

alter table public.journey_items enable row level security;

drop policy if exists "journey_items_all_own" on public.journey_items;
create policy "journey_items_all_own" on public.journey_items for all
  using (exists (select 1 from public.journeys j where j.id = journey_id and j.customer_id = auth.uid()))
  with check (exists (select 1 from public.journeys j where j.id = journey_id and j.customer_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- reservations — created server-side only (discount math must be trusted)
-- ---------------------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid references public.profiles (id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  journey_snapshot jsonb not null default '[]'::jsonb,
  trip_start_date date,
  trip_end_date date,
  travelers_adults integer not null default 1,
  travelers_children integer not null default 0,
  preferences text,
  discount_code_id uuid references public.discount_codes (id) on delete set null,
  subtotal_estimate numeric,
  discount_amount numeric not null default 0,
  total_estimate numeric,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'in_trip', 'completed', 'cancelled')),
  itinerary jsonb not null default '[]'::jsonb,
  hotels jsonb not null default '[]'::jsonb,
  transfers jsonb not null default '[]'::jsonb,
  guides jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_customer_idx on public.reservations (customer_id);

alter table public.reservations enable row level security;

drop policy if exists "reservations_select_own" on public.reservations;
create policy "reservations_select_own" on public.reservations for select
  using (auth.uid() = customer_id);
-- Insert/update happen server-side only (service role) — reservation totals
-- and discount amounts must never be writable directly by a client.

create table if not exists public.reservation_change_requests (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  customer_id uuid references public.profiles (id) on delete set null,
  request_type text not null default 'add_experience',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.reservation_change_requests enable row level security;

drop policy if exists "change_requests_select_own" on public.reservation_change_requests;
create policy "change_requests_select_own" on public.reservation_change_requests for select
  using (auth.uid() = customer_id);

-- ---------------------------------------------------------------------------
-- concierge_requests — "Ask Egypt Eye" inside My Egypt
-- ---------------------------------------------------------------------------
create table if not exists public.concierge_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  reservation_id uuid references public.reservations (id) on delete set null,
  question text not null,
  answer text,
  requires_staff boolean not null default false,
  staff_status text not null default 'none' check (staff_status in ('none', 'pending', 'sent', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.concierge_requests enable row level security;

drop policy if exists "concierge_select_own" on public.concierge_requests;
create policy "concierge_select_own" on public.concierge_requests for select
  using (auth.uid() = customer_id);
-- Inserts happen via the server route (which still checks the caller's own
-- session first) so the AI-generated `answer` can never be client-supplied.

-- ---------------------------------------------------------------------------
-- notification_log — idempotency + audit trail for every automated email
-- ---------------------------------------------------------------------------
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  notification_type text not null,
  customer_id uuid references public.profiles (id) on delete set null,
  subscriber_id uuid references public.newsletter_subscribers (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error_message text,
  sent_at timestamptz not null default now()
);

alter table public.notification_log enable row level security;
-- Server-only.
