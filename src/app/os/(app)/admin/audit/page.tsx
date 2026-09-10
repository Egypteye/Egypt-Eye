import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { formatDateTime, relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit log" };

// ---------------------------------------------------------------------------
// THE AUDIT LOG
// ---------------------------------------------------------------------------
// Every important change, with the exact before and after value, who did it,
// and from what. Append-only for every role the application can hold: the
// service-role key this app uses has INSERT and SELECT on this table and
// nothing else, so no code path in the repository can rewrite or erase it.
//
// A correction is a new entry, never an edit.
// ---------------------------------------------------------------------------

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.audit")) return <NoAccess what="the audit log" permission="admin.audit" />;

  const params = await searchParams;
  const entityType = (Array.isArray(params.entity) ? params.entity[0] : params.entity) ?? "";
  const q = ((Array.isArray(params.q) ? params.q[0] : params.q) ?? "").trim();

  const db = osdb();
  const org = await getOrg();

  let query = db
    .from("os_audit_log")
    .select("id, action, entity_type, entity_id, entity_label, actor_label, before, after, changed_fields, ip, user_agent, at")
    .eq("org_id", org.id)
    .order("at", { ascending: false })
    .limit(200);
  if (entityType) query = query.eq("entity_type", entityType);
  if (q) query = query.or(`actor_label.ilike.%${q}%,entity_label.ilike.%${q}%,action.ilike.%${q}%`);

  const { data } = await query;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const entityTypes = Array.from(new Set(rows.map((r) => r.entity_type as string))).sort();
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = rows.filter((r) => String(r.at).slice(0, 10) === today).length;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Audit log"
        description="Every important change, with the exact before and after value. Append-only — a correction is a new entry, never an edit."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Entries shown" value={rows.length} sub="Most recent 200" />
        <Stat label="Today" value={todayCount} />
        <Stat label="Record types" value={entityTypes.length} />
        <Stat label="People acting" value={new Set(rows.map((r) => r.actor_label)).size} />
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 sm:max-w-sm">
          <span className="text-os-faint"><Icon.Search size={15} /></span>
          <input name="q" defaultValue={q} placeholder="Person, record or action" className="w-full bg-transparent text-[13px] focus:outline-none" />
        </div>
        <select name="entity" defaultValue={entityType} className="rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 text-[12.5px]">
          <option value="">Everything</option>
          {entityTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}
        </select>
        <button type="submit" className="rounded-lg border border-os-line-strong bg-white px-3 py-1.5 text-[13px] font-medium text-os-text hover:bg-black/[0.03]">Filter</button>
        {q || entityType ? <Link href="/os/admin/audit" className="text-[12.5px] font-medium text-os-gold hover:underline">Clear</Link> : null}
      </form>

      {rows.length === 0 ? (
        <EmptyState title="Nothing matches" description="Widen the filter, or clear it." icon={<Icon.Shield size={26} />} />
      ) : (
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader title="Changes" subtitle="Newest first" action={<Badge tone="ink">Append only</Badge>} />
          </div>
          <ul>
            {rows.map((entry) => (
              <li key={entry.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[13px] font-medium text-os-text">{entry.actor_label}</span>
                  <code className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[11px] text-os-muted">{entry.action}</code>
                  {entry.entity_label ? <span className="text-[12.5px] text-os-muted">{entry.entity_label}</span> : null}
                  <span className="ml-auto text-[11px] text-os-faint" title={formatDateTime(entry.at)}>{relativeTime(entry.at)}</span>
                </div>

                {entry.changed_fields?.length ? (
                  <ul className="mt-1.5 space-y-0.5">
                    {(entry.changed_fields as string[]).map((field) => (
                      <li key={field} className="text-[11.5px] leading-snug">
                        <span className="font-medium capitalize text-os-text">{field.replace(/_/g, " ")}</span>
                        <span className="text-os-faint"> · </span>
                        <span className="text-os-muted line-through">{format(entry.before?.[field])}</span>
                        <span className="text-os-faint"> → </span>
                        <span className="text-os-text">{format(entry.after?.[field])}</span>
                      </li>
                    ))}
                  </ul>
                ) : entry.after ? (
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-os-muted">{format(entry.after)}</p>
                ) : null}

                <p className="mt-1 text-[10.5px] text-os-faint">
                  {entry.entity_type}
                  {entry.ip ? ` · ${entry.ip}` : ""}
                  {entry.user_agent ? ` · ${shortenAgent(entry.user_agent)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="mt-5 max-w-2xl text-[12px] leading-relaxed text-os-faint">
        This table has no UPDATE or DELETE grant for the role the application runs as, so nothing in this codebase can rewrite
        or erase it. A database owner with direct SQL access could, which is a property of Postgres rather than something an
        application can revoke from itself — the mitigation there is that nobody but the operator holds those credentials.
      </p>
    </>
  );
}

function format(value: unknown): string {
  if (value === null || value === undefined) return "empty";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 120);
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

function shortenAgent(agent: string): string {
  if (agent.includes("iPhone")) return "iPhone";
  if (agent.includes("Android")) return "Android";
  if (agent.includes("iPad")) return "iPad";
  if (agent.includes("Macintosh")) return "Mac";
  if (agent.includes("Windows")) return "Windows";
  if (agent.includes("Linux")) return "Linux";
  return "browser";
}
