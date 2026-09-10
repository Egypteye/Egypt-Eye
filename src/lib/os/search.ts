import "server-only";
import { osdb, getOrg } from "./db";
import type { Actor } from "./actor";
import { can } from "./actor";
import { tripScopeFor, applyTripScope } from "./scope";

// ---------------------------------------------------------------------------
// GLOBAL SEARCH
// ---------------------------------------------------------------------------
// One box, every record type, and — critically — the same permission and scope
// rules as the screens themselves. A photographer searching "John Smith" finds
// the trips they are on with John Smith and nothing else; they do not learn
// that John Smith exists in the company at all through a search result.
//
// Each entity type is queried only when the actor holds the permission for it,
// so an unauthorised type is never even asked about.
// ---------------------------------------------------------------------------

export type SearchResult = {
  type: "trip" | "client" | "employee" | "resource" | "supplier" | "task" | "knowledge" | "document" | "incident";
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  badge?: string;
  score: number;
};

export async function globalSearch(actor: Actor, term: string, limit = 24): Promise<SearchResult[]> {
  const query = term.trim();
  if (query.length < 2) return [];

  const org = await getOrg();
  const db = osdb();
  const safe = query.replace(/[%,()]/g, " ").trim();
  if (!safe) return [];
  const like = `%${safe}%`;
  const results: SearchResult[] = [];

  const jobs: Promise<void>[] = [];

  if (can(actor, "trips.view")) {
    jobs.push((async () => {
      const scope = await tripScopeFor(actor, "trips.view");
      if (scope.kind === "none") return;
      let q = db
        .from("os_trips")
        .select("id, ref, title, trip_date, status, unit_id, os_clients ( full_name )")
        .eq("org_id", org.id)
        .is("archived_at", null)
        .or(`ref.ilike.${like},title.ilike.${like}`)
        .limit(8);
      q = applyTripScope(q, scope);
      const { data } = await q;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      for (const t of (data ?? []) as any[]) {
        results.push({
          type: "trip",
          id: t.id,
          title: `${t.ref} · ${t.title}`,
          subtitle: [t.os_clients?.full_name, t.trip_date].filter(Boolean).join(" · "),
          href: `/os/trips/${t.ref}`,
          badge: t.status,
          score: t.ref.toLowerCase() === safe.toLowerCase() ? 100 : 60,
        });
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    })());
  }

  if (can(actor, "clients.view")) {
    jobs.push((async () => {
      // A field role with 'own' scope on clients should only find the clients
      // whose trips they are on, so the search mirrors their trip scope.
      const scope = await tripScopeFor(actor, "clients.view");
      let clientIds: string[] | null = null;
      if (scope.kind === "own") {
        const { data } = await db.from("os_trips").select("client_id").in("id", scope.tripIds.length ? scope.tripIds : ["00000000-0000-0000-0000-000000000000"]);
        clientIds = Array.from(new Set((data ?? []).map((r) => r.client_id as string).filter(Boolean)));
      } else if (scope.kind === "none") {
        return;
      }

      let q = db
        .from("os_clients")
        .select("id, code, full_name, company_name, country, kind, vip")
        .eq("org_id", org.id)
        .is("archived_at", null)
        .or(`full_name.ilike.${like},company_name.ilike.${like},code.ilike.${like}`)
        .limit(8);
      if (clientIds) q = q.in("id", clientIds.length ? clientIds : ["00000000-0000-0000-0000-000000000000"]);
      const { data } = await q;
      for (const c of data ?? []) {
        results.push({
          type: "client",
          id: c.id as string,
          title: (c.company_name as string) || (c.full_name as string),
          subtitle: [c.country, c.kind === "agency" ? "Agency" : null].filter(Boolean).join(" · ") || null,
          href: `/os/clients/${c.id}`,
          badge: c.vip ? "VIP" : undefined,
          score: 55,
        });
      }
    })());
  }

  if (can(actor, "team.view")) {
    jobs.push((async () => {
      const { data } = await db
        .from("os_employees")
        .select("id, code, full_name, job_title, department")
        .eq("org_id", org.id)
        .is("archived_at", null)
        .or(`full_name.ilike.${like},code.ilike.${like},job_title.ilike.${like}`)
        .limit(6);
      for (const e of data ?? []) {
        results.push({
          type: "employee",
          id: e.id as string,
          title: e.full_name as string,
          subtitle: [e.job_title, e.department].filter(Boolean).join(" · ") || null,
          href: `/os/team/${e.id}`,
          score: 50,
        });
      }
    })());
  }

  if (can(actor, "resources.view")) {
    jobs.push((async () => {
      const { data } = await db
        .from("os_resources")
        .select("id, code, name, kind, status")
        .eq("org_id", org.id)
        .is("archived_at", null)
        .or(`name.ilike.${like},code.ilike.${like},plate.ilike.${like}`)
        .limit(6);
      for (const r of data ?? []) {
        results.push({
          type: "resource",
          id: r.id as string,
          title: r.name as string,
          subtitle: `${String(r.kind).replace("_", " ")} · ${r.code}`,
          href: `/os/resources/${r.id}`,
          badge: r.status as string,
          score: 45,
        });
      }
    })());
  }

  if (can(actor, "suppliers.view")) {
    jobs.push((async () => {
      const { data } = await db
        .from("os_suppliers")
        .select("id, code, name, city, categories")
        .eq("org_id", org.id)
        .is("archived_at", null)
        .or(`name.ilike.${like},code.ilike.${like}`)
        .limit(5);
      for (const s of data ?? []) {
        results.push({
          type: "supplier",
          id: s.id as string,
          title: s.name as string,
          subtitle: [s.city, (s.categories as string[])?.join(", ")].filter(Boolean).join(" · ") || null,
          href: `/os/suppliers/${s.id}`,
          score: 40,
        });
      }
    })());
  }

  if (can(actor, "knowledge.view")) {
    jobs.push((async () => {
      const { data } = await db.rpc("os_search_knowledge", { p_org: org.id, p_query: safe, p_limit: 6 });
      /* eslint-disable @typescript-eslint/no-explicit-any */
      for (const a of (data ?? []) as any[]) {
        results.push({
          type: "knowledge",
          id: a.id,
          title: a.title,
          subtitle: a.summary ?? a.category,
          href: `/os/knowledge/${a.slug}`,
          badge: a.category,
          score: 35 + Number(a.rank ?? 0) * 40,
        });
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    })());
  }

  if (can(actor, "tasks.view")) {
    jobs.push((async () => {
      let q = db
        .from("os_tasks")
        .select("id, title, status, trip_id, os_trips ( ref )")
        .eq("org_id", org.id)
        .is("archived_at", null)
        .ilike("title", like)
        .in("status", ["todo", "in_progress", "blocked"])
        .limit(5);
      if (actor.permissions["tasks.view"] === "own") q = q.eq("owner_employee_id", actor.employeeId);
      const { data } = await q;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      for (const t of (data ?? []) as any[]) {
        results.push({
          type: "task",
          id: t.id,
          title: t.title,
          subtitle: t.os_trips?.ref ? `Task on ${t.os_trips.ref}` : "Task",
          href: t.os_trips?.ref ? `/os/trips/${t.os_trips.ref}/tasks` : "/os/tasks",
          score: 30,
        });
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    })());
  }

  await Promise.all(jobs);

  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
