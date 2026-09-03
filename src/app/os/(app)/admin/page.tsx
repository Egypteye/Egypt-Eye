import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { PageHeader, Card, CardHeader, Stat, Badge } from "@/components/os/ui";
import { PERMISSION_KEYS } from "@/lib/os/permissions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin centre" };

// The state of the system itself. The most useful thing here is the honesty
// check: the catalog in the database compared against the one the application
// compiles against. If they ever drift, this says so loudly rather than
// letting a permission silently do nothing.
export default async function AdminOverviewPage() {
  const actor = await getActor();
  if (!actor) return null;

  const db = osdb();
  const org = await getOrg();

  const [{ data: perms }, { data: roles }, { data: employees }, { data: automations }, { data: audit }, { data: units }, { data: types }] = await Promise.all([
    db.from("os_permissions").select("key"),
    db.from("os_roles").select("id, key, name, rank, is_system").eq("org_id", org.id).is("archived_at", null).order("rank"),
    db.from("os_employees").select("id, status, user_id").eq("org_id", org.id).is("archived_at", null),
    db.from("os_automations").select("key, name, implemented, active, last_run_at, run_count, requires_integration").eq("org_id", org.id),
    can(actor, "admin.audit")
      ? db.from("os_audit_log").select("id, action, actor_label, entity_label, at").eq("org_id", org.id).order("at", { ascending: false }).limit(8)
      : Promise.resolve({ data: null }),
    db.from("os_business_units").select("id").eq("org_id", org.id).eq("active", true),
    db.from("os_trip_types").select("id").eq("org_id", org.id).eq("active", true),
  ]);

  const dbKeys = new Set((perms ?? []).map((p) => p.key as string));
  const codeKeys = new Set<string>(PERMISSION_KEYS);
  const missingInDb = [...codeKeys].filter((k) => !dbKeys.has(k));
  const missingInCode = [...dbKeys].filter((k) => !codeKeys.has(k));

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const automationRows = (automations ?? []) as any[];
  const auditRows = (audit ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const live = automationRows.filter((a) => a.implemented);
  const waiting = automationRows.filter((a) => !a.implemented);
  const staff = employees ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Admin centre"
        description="How Egypt Eye OS is configured, and whether it is healthy."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="People" value={staff.length} sub={`${staff.filter((e) => e.user_id).length} can sign in`} href={can(actor, "admin.users") ? "/os/admin/users" : undefined} />
        <Stat label="Roles" value={(roles ?? []).length} sub={`${(roles ?? []).filter((r) => !r.is_system).length} custom`} href={can(actor, "admin.roles") ? "/os/admin/roles" : undefined} />
        <Stat label="Permissions" value={dbKeys.size} sub={`Across ${(units ?? []).length} units and ${(types ?? []).length} services`} />
        <Stat label="Automations running" value={live.filter((a) => a.active).length} sub={`${waiting.length} need an integration`} href={can(actor, "admin.automations") ? "/os/admin/automations" : undefined} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Permission catalog health"
            subtitle="The database catalog compared against the list the application compiles against."
          />
          <div className="mt-3 space-y-2 text-[13px]">
            {missingInDb.length === 0 && missingInCode.length === 0 ? (
              <p className="flex items-center gap-2 text-os-green">
                <Badge tone="green">In sync</Badge>
                All {dbKeys.size} permissions match. Nothing can silently do nothing.
              </p>
            ) : (
              <>
                {missingInDb.length ? (
                  <p className="text-os-red">
                    <span className="font-semibold">{missingInDb.length} permission{missingInDb.length === 1 ? "" : "s"} the code uses are missing from the database:</span>{" "}
                    {missingInDb.join(", ")}. Re-run migration 0019.
                  </p>
                ) : null}
                {missingInCode.length ? (
                  <p className="text-os-amber">
                    <span className="font-semibold">{missingInCode.length} permission{missingInCode.length === 1 ? "" : "s"} exist in the database but not in the code:</span>{" "}
                    {missingInCode.join(", ")}. They can be granted but nothing checks them.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Automations" subtitle="What actually runs, and what is waiting on something." />
          <ul className="mt-3 space-y-2">
            {automationRows.slice(0, 8).map((automation) => (
              <li key={automation.key} className="flex items-start justify-between gap-3 text-[12.5px]">
                <span className="min-w-0">
                  <span className="block font-medium text-os-text">{automation.name}</span>
                  {!automation.implemented ? (
                    <span className="block text-[11.5px] leading-snug text-os-faint">Needs {automation.requires_integration}</span>
                  ) : automation.last_run_at ? (
                    <span className="block text-[11.5px] text-os-faint">Last ran {relativeTime(automation.last_run_at)} · {automation.run_count} runs</span>
                  ) : (
                    <span className="block text-[11.5px] text-os-faint">Has not run yet</span>
                  )}
                </span>
                <Badge tone={!automation.implemented ? "neutral" : automation.active ? "green" : "amber"}>
                  {!automation.implemented ? "Not built" : automation.active ? "On" : "Off"}
                </Badge>
              </li>
            ))}
          </ul>
          {can(actor, "admin.automations") ? (
            <Link href="/os/admin/automations" className="mt-3 inline-block text-[12.5px] font-medium text-os-gold hover:underline">
              All automations →
            </Link>
          ) : null}
        </Card>

        {auditRows.length ? (
          <Card padded={false} className="lg:col-span-2">
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader
                title="Recent changes"
                subtitle="From the append-only audit log"
                action={<Link href="/os/admin/audit" className="text-[12px] font-medium text-os-gold hover:underline">Full log</Link>}
              />
            </div>
            <ul>
              {auditRows.map((entry) => (
                <li key={entry.id} className="flex items-baseline justify-between gap-3 border-b border-os-line/60 px-4 py-2 last:border-0 sm:px-5">
                  <span className="min-w-0 text-[12.5px]">
                    <span className="font-medium text-os-text">{entry.actor_label}</span>
                    <span className="text-os-muted"> {entry.action}</span>
                    {entry.entity_label ? <span className="text-os-muted"> — {entry.entity_label}</span> : null}
                  </span>
                  <span className="shrink-0 text-[11px] text-os-faint">{relativeTime(entry.at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </>
  );
}
