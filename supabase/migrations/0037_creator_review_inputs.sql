-- The half of the assessment a human does.
--
-- Three of the six categories cannot be computed from submitted figures:
-- tourism audience relevance needs someone to read the audience-country
-- insights, content quality needs someone to watch the work, and consistency
-- needs a judgement about publishing rhythm. The scoring model already takes
-- them as ReviewInputs and marks them `pending` until they arrive.
--
-- Stored as the INPUTS, not as a finished score. The score is recomputed from
-- score_inputs + review_inputs wherever it is needed, so there is one
-- authority and no stale copy to disagree with it. The only place a score is
-- frozen is creators.final_score, where freezing is correct: a tier is valid
-- for six months and must not move under the creator because a band was
-- recalibrated afterwards.
--
-- Applied to the live project on 22 Nov 2026.

alter table public.collaboration_applications
  add column if not exists review_inputs jsonb,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;

comment on column public.collaboration_applications.review_inputs is
  'The human half of the assessment: tourismAudiencePercent, contentQuality breakdown, postsPerWeek. The score is recomputed from score_inputs + this, never stored twice.';
comment on column public.collaboration_applications.reviewed_by is
  'Who completed the human assessment.';
