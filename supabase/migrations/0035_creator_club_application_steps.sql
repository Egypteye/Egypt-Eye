-- Fields the seven-step application collects beyond the original form.
--
-- Three jsonb columns rather than twenty scalar ones. The creator profile and
-- travel preferences are free-text answers a human reads; they are never
-- filtered, sorted or aggregated, so columns would buy nothing and every
-- future question would need another migration. The two things admin WILL
-- filter on — country and the public creator name — are first-class.
--
-- acknowledgements records which operational points the applicant confirmed
-- and when. It is evidence, not configuration: if a creator later disputes
-- that a package covers them alone, the row says what they were shown.
--
-- Applied to the live project on 20 Nov 2026.

alter table public.collaboration_applications
  add column if not exists creator_name text,
  add column if not exists country text,
  add column if not exists creator_profile jsonb,
  add column if not exists travel_preferences jsonb,
  add column if not exists acknowledgements jsonb;

comment on column public.collaboration_applications.creator_name is
  'Public/handle name, where it differs from the legal name in full_name.';
comment on column public.collaboration_applications.creator_profile is
  'Free-text answers about the creator''s work: content types, languages, why Egypt Eye, best work.';
comment on column public.collaboration_applications.travel_preferences is
  'Free-text answers about the intended trip: destinations, requested experience, travelling alone.';
comment on column public.collaboration_applications.acknowledgements is
  'Which operational points the applicant confirmed, and when. Evidence of what they were shown, not settings.';

create index if not exists collaboration_applications_country_idx
  on public.collaboration_applications (country);
