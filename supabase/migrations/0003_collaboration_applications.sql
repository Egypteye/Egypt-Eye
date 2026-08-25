-- Backs the "Collaborate With Egypt Eye" creator/influencer application
-- form (src/app/(site)/collaborate) and its admin review workflow
-- (src/app/(site)/admin/collaborations). Deliberately separate from any
-- future affiliate/referral system — this table is specifically for
-- content-creator collaborations, which may involve free experiences or
-- one-off custom agreements rather than a standard commission structure.

create table if not exists public.collaboration_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  social_accounts jsonb not null default '[]'::jsonb, -- [{platform, handle, followers}]
  engagement_rate text,
  audience_countries text,
  travel_dates text,
  portfolio_url text,
  collaboration_type text not null,
  message text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'approved', 'negotiating', 'confirmed', 'completed', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collaboration_applications_status_idx on public.collaboration_applications (status);
create index if not exists collaboration_applications_created_idx on public.collaboration_applications (created_at desc);

alter table public.collaboration_applications enable row level security;
-- Server-only, same tier as newsletter_subscribers/discount_campaigns —
-- applicants never read this table directly; the admin review pages use
-- the service-role client exclusively.
