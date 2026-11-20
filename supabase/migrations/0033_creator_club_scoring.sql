-- Creator Club: the performance data a score is computed from, and the score.
--
-- social_accounts (0003) already holds {platform, handle, followers} and is
-- left alone. This adds the per-platform performance history the scoring
-- engine needs, plus the result.
--
-- The score is stored because it is computed SERVER-SIDE from these inputs
-- and must not be recomputed differently later: a creator approved at a tier
-- keeps that tier for its validity period even if the bands are recalibrated
-- afterwards. score_inputs is the snapshot the number was derived from, in
-- the same spirit as payment_attempts.quote.
--
-- Applied to the live project on 19 Nov 2026 as "creator_club_scoring_0033".

alter table public.collaboration_applications
  add column if not exists score_inputs jsonb,
  add column if not exists preliminary_score integer,
  add column if not exists preliminary_tier text,
  add column if not exists eligible boolean,
  add column if not exists score_breakdown jsonb,
  add column if not exists score_computed_at timestamptz,
  add column if not exists admin_score integer,
  add column if not exists admin_score_reason text,
  add column if not exists assigned_tier text;

comment on column public.collaboration_applications.score_inputs is
  'Snapshot of the platform/video figures the preliminary score was computed from. Self-reported until verified against screenshots.';
comment on column public.collaboration_applications.preliminary_score is
  'Computed server-side by scoreCreator(). Never accepted from the client.';
comment on column public.collaboration_applications.eligible is
  'Whether any single eligible platform met the 10,000-follower gate. Independent of the score.';
comment on column public.collaboration_applications.admin_score is
  'Manual override. admin_score_reason must accompany it.';

create index if not exists collaboration_applications_tier_idx
  on public.collaboration_applications (preliminary_tier);
create index if not exists collaboration_applications_eligible_idx
  on public.collaboration_applications (eligible);
