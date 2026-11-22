-- The Creator Club as an operating system, not an inbox.
--
-- An application is a submission: it arrives once, is reviewed once, and is
-- then history. A creator is a relationship that outlives it — tiers expire
-- and are renewed, packages are redeemed, deliverables fall due, a promo code
-- earns commission. Keeping both in collaboration_applications would mean a
-- creator who applies twice has two identities and no history, which is the
-- shape that makes a partnership programme unmanageable a year in.
--
-- Mirrors travel_agent_applications -> travel_agents (0011) in shape and
-- access tier: RLS on with no policies, so nothing but the service role can
-- read it, exactly as every other admin-only table here.
--
-- Applied to the live project on 22 Nov 2026.

create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.collaboration_applications (id) on delete set null,
  email text not null unique,
  full_name text not null,
  creator_name text,
  country text,
  final_score integer check (final_score between 0 and 100),
  score_verified_at timestamptz,
  score_verified_by text,
  tier text check (tier in ('Explorer','Rising Creator','Established Creator','Premium Creator','Elite Creator')),
  tier_assigned_at timestamptz,
  tier_valid_until timestamptz,
  status text not null default 'active'
    check (status in ('active','suspended','expired','rejected')),
  status_reason text,
  airport_pickup_granted boolean not null default false,
  commission_percent numeric check (commission_percent >= 0 and commission_percent <= 100),
  discount_code_id uuid references public.discount_codes (id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creators_tier_idx on public.creators (tier);
create index if not exists creators_status_idx on public.creators (status);
create index if not exists creators_valid_until_idx on public.creators (tier_valid_until);
alter table public.creators enable row level security;

create table if not exists public.creator_score_adjustments (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.creators (id) on delete cascade,
  application_id uuid references public.collaboration_applications (id) on delete cascade,
  previous_score integer,
  new_score integer,
  previous_tier text,
  new_tier text,
  reason text not null check (length(btrim(reason)) > 0),
  actor text not null,
  created_at timestamptz not null default now(),
  constraint adjustment_targets_something
    check (creator_id is not null or application_id is not null)
);

create index if not exists creator_score_adjustments_creator_idx
  on public.creator_score_adjustments (creator_id, created_at desc);
alter table public.creator_score_adjustments enable row level security;

create table if not exists public.creator_collaborations (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators (id) on delete cascade,
  status text not null default 'planning' check (status in (
    'planning','awaiting_agreement','agreement_signed','trip_confirmed',
    'active','awaiting_content','completed','cancelled'
  )),
  requested_experience text,
  approved_benefit_ids text[] not null default '{}',
  airport_pickup boolean not null default false,
  retail_value_cents integer check (retail_value_cents >= 0),
  operational_cost_cents integer check (operational_cost_cents >= 0),
  is_multi_day boolean not null default false,
  starts_on date,
  ends_on date,
  agreement_ref text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_collaborations_creator_idx
  on public.creator_collaborations (creator_id, created_at desc);
create index if not exists creator_collaborations_status_idx
  on public.creator_collaborations (status);
alter table public.creator_collaborations enable row level security;
