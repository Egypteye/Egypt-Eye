-- Backs the Travel Agent Partner Program: the public application form
-- (src/app/(site)/travel-agents), its admin review workflow
-- (src/app/(site)/admin/travel-agents), and the approved-agent portal
-- (src/app/(site)/agent-portal).
--
-- Two tables, deliberately kept separate:
-- * travel_agent_applications — every submission from the public form,
--   reviewed by admin and moved through pending -> approved/rejected.
--   Mirrors collaboration_applications (0003) in shape and access tier.
-- * travel_agents — one row per APPROVED agency. Created at the moment an
--   admin approves an application. `user_id` starts null (the applicant
--   may not have an Egypt Eye account yet) and gets linked automatically,
--   by matching email, the moment a matching account exists — either via
--   the handle_new_user() trigger (new signup) or immediately at approval
--   time if an account with that email already existed. This is the same
--   "link by email" pattern newsletter_subscribers/discount_codes already
--   use (see 0001_init.sql, 0008_link_discount_codes_by_email.sql), so an
--   agent never needs a separate login system — they sign in through the
--   exact same /account/login every customer uses, and the portal at
--   /agent-portal simply checks whether their profile has a linked,
--   active travel_agents row.
--
-- Kept intentionally simple for a first version: one flat discount
-- percentage per agent (no per-tour rate tables), and "bookings" reuses
-- the existing reservations table via reservations.customer_id — an agent
-- placing a booking while signed in is no different from any other
-- customer. Both are easy to extend later without a schema rewrite.

create table if not exists public.travel_agent_applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  website text,
  country text not null,
  services text[] not null default '{}',
  estimated_bookings text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists travel_agent_applications_status_idx on public.travel_agent_applications (status);
create index if not exists travel_agent_applications_created_idx on public.travel_agent_applications (created_at desc);

alter table public.travel_agent_applications enable row level security;
-- Server-only, same tier as collaboration_applications — applicants never
-- read this table directly; the admin review pages use the service-role
-- client exclusively.

create table if not exists public.travel_agents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.travel_agent_applications (id) on delete set null,
  user_id uuid unique references public.profiles (id) on delete set null,
  email text not null unique,
  company_name text not null,
  contact_name text not null,
  country text,
  website text,
  phone text,
  services text[] not null default '{}',
  partner_discount_percent numeric not null default 10,
  status text not null default 'active' check (status in ('active', 'suspended')),
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists travel_agents_user_idx on public.travel_agents (user_id);
create index if not exists travel_agents_email_idx on public.travel_agents (email);

alter table public.travel_agents enable row level security;

drop policy if exists "travel_agents_select_own" on public.travel_agents;
create policy "travel_agents_select_own" on public.travel_agents for select
  using (auth.uid() = user_id);
-- All writes (approve, edit rate, suspend) happen server-side with the
-- service role, from /admin/travel-agents.

grant select on public.travel_agents to authenticated;

-- Extends handle_new_user() (0001_init.sql) with the same auto-link this
-- project already does for newsletter_subscribers/discount_codes: if this
-- email has an approved travel_agents row waiting for an account, connect
-- it the moment the account is created.
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

  update public.newsletter_subscribers
    set customer_id = new.id
    where email = new.email and customer_id is null;

  update public.discount_codes
    set customer_id = new.id
    where customer_id is null
      and subscriber_id in (select id from public.newsletter_subscribers where email = new.email);

  update public.travel_agents
    set user_id = new.id
    where email = new.email and user_id is null;

  return new;
end;
$$;

-- Backfill: links any travel_agents row approved for someone who already
-- had an Egypt Eye account (the trigger above only fires for BRAND NEW
-- signups). Safe to re-run — every update is guarded with `is null`.
update public.travel_agents ta
set user_id = p.id
from public.profiles p
where p.email = ta.email and ta.user_id is null;
