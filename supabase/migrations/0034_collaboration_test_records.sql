-- Marking test submissions without deleting them, and without touching the
-- seven production statuses.
--
-- A dedicated boolean rather than a status value: "test" is orthogonal to
-- where an application sits in the review workflow, and adding it to STATUSES
-- would have meant every status check in the admin screens growing a special
-- case. A flag also stays reversible — clearing it restores the row exactly.
--
-- Applied to the live project on 20 Nov 2026, flagging five developer
-- submissions verified beforehand as 5 of 36, every one carrying an
-- @example.com address and still at status 'new'. Those ids are deliberately
-- NOT repeated here: this file should be safe to run against any environment.

alter table public.collaboration_applications
  add column if not exists is_test boolean not null default false;

comment on column public.collaboration_applications.is_test is
  'Submitted by a developer to exercise the form. Hidden from the normal admin list and excluded from reporting; visible under the admin test filter. Reversible: set false to restore.';

create index if not exists collaboration_applications_is_test_idx
  on public.collaboration_applications (created_at desc)
  where is_test = true;
