-- Pharaoh's Challenge — a reusable gamified-campaign system, backing the
-- 5-tier Ancient-Egypt puzzle marketing experience at /pharaoh-challenge.
--
-- Deliberately generic (game_campaigns/game_tiers, not "pharaoh_*") so a
-- future seasonal campaign is just new rows here plus new puzzle_type
-- components in src/app/(site)/pharaoh-challenge/puzzles — the attempt/
-- reward/analytics plumbing never changes.
--
-- Reward reuse: rewards are NOT a new table. Each game_tier points at an
-- existing public.discount_campaigns row (0001_init.sql) — the same engine
-- that already powers the newsletter 4% offer and shows up automatically in
-- My Account via discount_codes. Completing the challenge just mints one
-- discount_codes row, same as newsletter signup already does.
--
-- The one-attempt-per-account guarantee is a real database constraint
-- (unique (campaign_id, customer_id) on game_attempts), the same pattern
-- discount_redemptions.code_id already uses to make double-redemption
-- impossible — not something enforced by the client, and not bypassable by
-- refreshing, opening a new tab, or clearing browser storage.

-- ---------------------------------------------------------------------------
-- game_campaigns — public, read-only campaign shell
-- ---------------------------------------------------------------------------
create table if not exists public.game_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  theme text not null default '',
  story_intro text not null default '',
  story_outro text not null default '',
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_campaigns enable row level security;
create policy "game_campaigns are publicly readable" on public.game_campaigns for select using (true);
-- Public SELECT is intentional — same reasoning as hotels/site content: this
-- is just display copy, nothing secret. All writes go through /admin.

-- ---------------------------------------------------------------------------
-- game_tiers — 5 rows per campaign, admin-editable puzzle config
-- ---------------------------------------------------------------------------
create table if not exists public.game_tiers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.game_campaigns (id) on delete cascade,
  tier_number integer not null check (tier_number between 1 and 5),
  name text not null,
  puzzle_type text not null,
  flavor_text text not null default '',
  config jsonb not null default '{}'::jsonb,
  reward_discount_campaign_id uuid references public.discount_campaigns (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, tier_number)
);

alter table public.game_tiers enable row level security;
create policy "game_tiers are publicly readable" on public.game_tiers for select using (true);
-- No hidden "answer" lives here worth protecting — every puzzle's target
-- state is shown on screen as part of play (that's the puzzle itself), not a
-- secret the config could leak.

-- ---------------------------------------------------------------------------
-- game_attempts — one row per (campaign, customer), ever. The real guarantee.
-- ---------------------------------------------------------------------------
create table if not exists public.game_attempts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.game_campaigns (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  current_tier integer not null default 1,
  highest_tier_completed integer not null default 0,
  discount_code_id uuid references public.discount_codes (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (campaign_id, customer_id)
);

create index if not exists game_attempts_customer_idx on public.game_attempts (customer_id);

alter table public.game_attempts enable row level security;

drop policy if exists "game_attempts_select_own" on public.game_attempts;
create policy "game_attempts_select_own" on public.game_attempts for select
  using (auth.uid() = customer_id);
-- All writes (start/advance/complete) happen server-side with the service
-- role — never trust a client-reported tier or completion.

-- ---------------------------------------------------------------------------
-- game_tier_completions — one row per tier actually cleared, for drop-off analytics
-- ---------------------------------------------------------------------------
create table if not exists public.game_tier_completions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.game_attempts (id) on delete cascade,
  tier_number integer not null,
  completed_at timestamptz not null default now(),
  duration_ms integer,
  unique (attempt_id, tier_number)
);

alter table public.game_tier_completions enable row level security;
-- Server-only — no client policy.

-- ---------------------------------------------------------------------------
-- game_events — lightweight campaign analytics (this site has no 3rd-party
-- analytics platform configured; this gives the admin panel real numbers
-- without adding one)
-- ---------------------------------------------------------------------------
create table if not exists public.game_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.game_campaigns (id) on delete cascade,
  customer_id uuid references public.profiles (id) on delete set null,
  event_type text not null check (event_type in ('visit', 'start', 'tier_complete', 'reward_issued', 'share', 'claim')),
  tier_number integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_events_campaign_type_idx on public.game_events (campaign_id, event_type, created_at desc);

alter table public.game_events enable row level security;
-- Server-only — no client policy. customer_id is nullable so an anonymous
-- page visit (before login) can still be counted as a "visitor".

-- ---------------------------------------------------------------------------
-- Seed: the Pharaoh's Challenge campaign, its 5 tiers, and their reward
-- discount campaigns (reusing the existing discount engine).
-- ---------------------------------------------------------------------------
insert into public.discount_campaigns (name, slug, discount_type, value, one_time_use, new_customers_only, active, code_validity_days)
values
  ('Pharaoh''s Challenge — Tier 1', 'pharaoh-challenge-tier-1', 'percentage', 2, true, false, true, 180),
  ('Pharaoh''s Challenge — Tier 2', 'pharaoh-challenge-tier-2', 'percentage', 4, true, false, true, 180),
  ('Pharaoh''s Challenge — Tier 3', 'pharaoh-challenge-tier-3', 'percentage', 6, true, false, true, 180),
  ('Pharaoh''s Challenge — Tier 4', 'pharaoh-challenge-tier-4', 'percentage', 8, true, false, true, 180),
  ('Pharaoh''s Challenge — Tier 5', 'pharaoh-challenge-tier-5', 'percentage', 10, true, false, true, 180)
on conflict (slug) do nothing;

insert into public.game_campaigns (slug, name, theme, story_intro, story_outro, active, starts_at, ends_at)
values (
  'pharaohs-challenge',
  'Pharaoh''s Challenge',
  'The Second Sunrise',
  'Beneath the sand, a sealed chamber has been found — untouched since antiquity. Five mechanisms guard the way in. You are the one who gets to open it.',
  'The last mechanism gives way. Light floods the chamber, and at its heart, the Eye opens — watching, the way it always has.',
  true,
  now(),
  now() + interval '30 days'
)
on conflict (slug) do nothing;

insert into public.game_tiers (campaign_id, tier_number, name, puzzle_type, flavor_text, config, reward_discount_campaign_id)
select c.id, t.tier_number, t.name, t.puzzle_type, t.flavor_text, t.config::jsonb, dc.id
from public.game_campaigns c
join (
  values
    (1, 'The Sundial Gate', 'sundial-gate',
     'The outer gate turns on an ancient sun-disc. Align it with the light, and it will open.',
     '{"toleranceDegrees": 18}', 'pharaoh-challenge-tier-1'),
    (2, 'The Scarab Path', 'scarab-path',
     'Four stones cross the floor ahead. Watch which ones catch the torchlight — then walk the same path.',
     '{"sequenceLength": 4}', 'pharaoh-challenge-tier-2'),
    (3, 'The Hieroglyph Wheels', 'hieroglyph-wheels',
     'A lock of turning stone bars the passage. Three wheels, one true combination.',
     '{"wheelCount": 3, "symbolsPerWheel": 6}', 'pharaoh-challenge-tier-3'),
    (4, 'Shadow of the Obelisk', 'obelisk-shadow',
     'An obelisk stands at the chamber''s heart. Move the light, and its shadow will show the way.',
     '{"toleranceDegrees": 12}', 'pharaoh-challenge-tier-4'),
    (5, 'The Final Threshold', 'eye-of-ra-threshold',
     'Three rings, carved in a forgotten hand, seal the last door. Turn them as one, and the Eye will open.',
     '{"ringCount": 3, "toleranceDegrees": 10}', 'pharaoh-challenge-tier-5')
) as t(tier_number, name, puzzle_type, flavor_text, config, reward_slug) on true
join public.discount_campaigns dc on dc.slug = t.reward_slug
where c.slug = 'pharaohs-challenge'
on conflict (campaign_id, tier_number) do nothing;
