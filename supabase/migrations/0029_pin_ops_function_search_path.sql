-- Pin search_path on the two ops_* functions.
--
-- scripts/check-sql.sh has been failing on these since the simplified OS
-- landed: `function(s) in public do not pin search_path: ops_touch_updated_at(),
-- ops_next_booking_ref()`. The check in 0027 exempts `os_%` and
-- `nextval_os_%` but not `ops_%`, and it is right not to - these are ordinary
-- public functions and should pin like every other one in this database.
--
-- Why it matters for a trigger function in particular: a function without a
-- pinned search_path resolves unqualified names against whatever path the
-- CALLER happens to have. ops_touch_updated_at fires on every insert and
-- update across the ops tables, so anyone who can set their own search_path
-- and create a schema ahead of `public` chooses what `now()` means for those
-- writes. Neither function is SECURITY DEFINER, so this is not a privilege
-- escalation - it is a correctness and tamper surface, and closing it costs
-- one line each.
--
-- Pinning to `public` rather than `''` because that is this database's
-- existing convention, and because it is safe here: pg_catalog is searched
-- implicitly whatever the setting, so now(), lpad(), length() and greatest()
-- still resolve, and the one non-catalog reference - the sequence - is
-- already schema-qualified.
--
-- The bodies are unchanged, copied from the live definitions rather than
-- retyped.

create or replace function public.ops_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.ops_next_booking_ref()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  n bigint := nextval('public.ops_booking_ref_seq');
begin
  return 'EE-' || lpad(n::text, greatest(4, length(n::text)), '0');
end;
$$;
