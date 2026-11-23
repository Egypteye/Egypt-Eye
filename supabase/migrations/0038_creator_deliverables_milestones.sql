-- What a creator owes, and the daily gate on a multi-day complimentary trip.
--
-- QUANTITIES ARE NOT SET HERE. The owner approved increasing the proposed
-- per-tier figures on 19 Nov 2026 and explicitly did not approve the numbers,
-- so a brief is built per collaboration and nothing is defaulted. A quantity
-- invented in a migration would end up in a campaign brief a creator signs.
--
-- Applied to the live project on 22 Nov 2026.

create table if not exists public.creator_deliverables (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.creator_collaborations (id) on delete cascade,
  kind text not null check (kind in ('reel','tiktok','story','photo','raw_clip','other')),
  quantity integer not null check (quantity > 0),
  stage text not null check (stage in ('before_departure','after_departure')),
  due_on date,
  status text not null default 'pending' check (status in (
    'pending','submitted','approved','revision_requested','published'
  )),
  requires_approval boolean not null default false,
  published_url text,
  asset_url text,
  approved_at timestamptz,
  approved_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_deliverables_collab_idx
  on public.creator_deliverables (collaboration_id, stage);
alter table public.creator_deliverables enable row level security;

-- Daily milestones apply ONLY to a complimentary multi-day package. A
-- single-day collaboration never gets them, and the agreed policy is explicit
-- that the daily continuation rule must not be applied to unrelated
-- single-day work. A check constraint cannot see the parent row, so that rule
-- lives in src/lib/creatorClub/deliverables.ts and is asserted by its check.
create table if not exists public.creator_milestones (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.creator_collaborations (id) on delete cascade,
  day_number integer not null check (day_number >= 1),
  due_on date,
  requirement text not null check (length(btrim(requirement)) > 0),
  status text not null default 'pending' check (status in (
    'pending','completed','missed','waived'
  )),
  completed_at timestamptz,
  verified_by text,
  evidence_url text,
  waiver_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collaboration_id, day_number),
  constraint waiver_needs_a_reason
    check (status <> 'waived' or length(btrim(coalesce(waiver_reason,''))) > 0)
);

create index if not exists creator_milestones_collab_idx
  on public.creator_milestones (collaboration_id, day_number);
alter table public.creator_milestones enable row level security;

comment on table public.creator_deliverables is
  'What a creator owes for one collaboration. Quantities come from the signed brief; nothing is defaulted, because the per-tier figures are not approved.';
comment on table public.creator_milestones is
  'Daily gate on a complimentary multi-day package only. Never created for single-day work.';
comment on column public.creator_milestones.waiver_reason is
  'Required when waived. Illness, unsafe weather, technical failure, or an operational change caused by Egypt Eye.';
