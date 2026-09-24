-- ===========================================================================
-- EGYPT EYE OS — helper functions the application calls by RPC
-- ===========================================================================
-- Reference allocation lives in the database rather than the application
-- because two coordinators creating a trip in the same second must not get the
-- same number, and a sequence is the only thing that actually guarantees that.
-- A `select max(ref) + 1` in application code does not.
--
-- These are SECURITY INVOKER and are only reachable with the service-role key,
-- since EXECUTE is revoked from anon and authenticated below.
-- ===========================================================================

create or replace function public.nextval_os_trip_ref()
returns bigint language sql volatile as $$ select nextval('public.os_trip_ref_seq') $$;

create or replace function public.nextval_os_quote_ref()
returns bigint language sql volatile as $$ select nextval('public.os_quote_ref_seq') $$;

create or replace function public.nextval_os_approval_ref()
returns bigint language sql volatile as $$ select nextval('public.os_approval_ref_seq') $$;

create or replace function public.nextval_os_incident_ref()
returns bigint language sql volatile as $$ select nextval('public.os_incident_ref_seq') $$;

-- Ranked full-text search over the knowledge base. Kept in SQL because it uses
-- the generated tsvector column and its GIN index; doing it in the application
-- would mean pulling every article across the wire to score it.
create or replace function public.os_search_knowledge(p_org uuid, p_query text, p_limit int default 10)
returns table (id uuid, slug text, title text, category text, summary text, rank real)
language sql stable as $$
  select a.id, a.slug, a.title, a.category, a.summary,
         ts_rank(a.search_vector, websearch_to_tsquery('simple', p_query)) as rank
  from public.os_knowledge_articles a
  where a.org_id = p_org
    and a.status = 'published'
    and a.search_vector @@ websearch_to_tsquery('simple', p_query)
  order by rank desc
  limit p_limit;
$$;

-- A cheap change cursor. The OS polls this to decide whether a screen needs to
-- re-render, instead of holding a websocket open per user or refetching whole
-- pages on a timer. One small query answers "has anything I care about moved".
create or replace function public.os_pulse(p_org uuid)
returns table (trips timestamptz, assignments timestamptz, tasks timestamptz, messages timestamptz, notifications timestamptz)
language sql stable as $$
  select
    (select max(updated_at) from public.os_trips where org_id = p_org),
    (select max(assigned_at) from public.os_trip_assignments where org_id = p_org),
    (select max(updated_at) from public.os_tasks where org_id = p_org),
    (select max(created_at) from public.os_messages),
    (select max(created_at) from public.os_notifications where org_id = p_org);
$$;

revoke execute on function
  public.nextval_os_trip_ref(),
  public.nextval_os_quote_ref(),
  public.nextval_os_approval_ref(),
  public.nextval_os_incident_ref(),
  public.os_search_knowledge(uuid, text, int),
  public.os_pulse(uuid)
from anon, authenticated;
