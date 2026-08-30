-- Backs the Affiliate Program application form (src/app/(site)/affiliate)
-- and its admin review workflow (src/app/(site)/admin/affiliates).
--
-- Deliberately its own table, separate from both travel_agent_applications
-- (0011) and collaboration_applications (0003) — the collaborations table's
-- own comment already called this out as a planned future addition: an
-- affiliate promotes Egypt Eye for an ongoing commission on bookings they
-- refer, which is a different relationship from a one-off creator trip or
-- a B2B agency partnership. Kept intentionally simple for a first version
-- (an application + manual admin approval, no auto-generated referral code
-- or commission ledger yet) — the same "start simple, extend later without
-- a schema rewrite" approach 0011's own comment describes for travel agents.

create table if not exists public.affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  website_or_platform text not null,
  audience_size text,
  promotion_methods text[] not null default '{}',
  payout_method text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_applications_status_idx on public.affiliate_applications (status);
create index if not exists affiliate_applications_created_idx on public.affiliate_applications (created_at desc);

alter table public.affiliate_applications enable row level security;
-- Server-only, same tier as collaboration_applications/travel_agent_applications —
-- applicants never read this table directly; the admin review pages use
-- the service-role client exclusively.
