-- Media kits on collaboration applications.
--
-- The Collaborations team cannot judge reach, engagement or content quality
-- from a handle and a follower count, so the /collaborate form now requires a
-- media kit. Creators keep theirs either as a PDF or as a link to Drive,
-- Dropbox or their own site, so both are accepted and exactly one is required.
--
-- NOTE ON NUMBERING: this was applied to the live project on 18 Nov 2026 and
-- Supabase recorded it under the label "0028_collaboration_media_kits"
-- (version 20261118165938). That label is wrong — 0028 in this directory is
-- departure_readiness_and_astronomy. Supabase orders by the timestamp, not the
-- label, so it applied in the right place; only the name is misleading. The
-- file is numbered correctly here. Do not re-apply this: the columns and the
-- bucket already exist, which is why every statement is idempotent.
--
-- Deliberately NO check constraint requiring one of the two columns. The
-- retention sweep in 0027 anonymises a collaboration row by blanking the
-- applicant's details, and it must be able to clear these too; a constraint
-- would make that UPDATE fail and turn a privacy guarantee into a runtime
-- error. "At least one" is enforced in the API route, which is the only
-- writer, and asserted by scripts/check-media-kit.mts.

alter table public.collaboration_applications
  add column if not exists media_kit_url text;

alter table public.collaboration_applications
  add column if not exists media_kit_path text;

comment on column public.collaboration_applications.media_kit_url is
  'Link to an externally hosted media kit (Drive, Dropbox, own site). Normalised to http/https by normaliseMediaKitLink before it is stored.';

comment on column public.collaboration_applications.media_kit_path is
  'Object path inside the private collaboration-media-kits bucket. Never a URL: the admin page mints a short-lived signed link on demand, so nothing durable points at an applicant''s PDF.';

-- The bucket. Private, PDF only, and capped at the same 10 MB the route and
-- the form enforce, so a client that skips validation is still refused by
-- storage rather than quietly filling the project's quota.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'collaboration-media-kits',
  'collaboration-media-kits',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
