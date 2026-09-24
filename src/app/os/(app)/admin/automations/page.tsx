import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, Notice } from "@/components/os/ui";
import { AutomationToggle } from "./AutomationToggle";

export const dynamic = "force-dynamic";
export const metadata = { title: "Automations" };

// ---------------------------------------------------------------------------
// AUTOMATIONS
// ---------------------------------------------------------------------------
// The honest half of the product. Rules marked "not built" are designed and
// registered but need an integration that is not configured — they are shown
// greyed with the exact reason, and attempting to switch one on is refused
// with an explanation rather than flipping a toggle that does nothing.
//
// Everything else on this page genuinely runs.
// ---------------------------------------------------------------------------

export default async function AutomationsPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.automations")) return <NoAccess what="automations" permission="admin.automations" />;

  const db = osdb();
  const org = await getOrg();

  const [{ data: automations }, { data: runs }] = await Promise.all([
    db.from("os_automations")
      .select("id, key, name, description, trigger_event, active, implemented, requires_integration, last_run_at, run_count")
      .eq("org_id", org.id).order("implemented", { ascending: false }).order("key"),
    db.from("os_automation_runs").select("automation_id, status, detail, at").order("at", { ascending: false }).limit(30),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (automations ?? []) as any[];
  const runRows = (runs ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const live = rows.filter((a) => a.implemented);
  const pending = rows.filter((a) => !a.implemented);
  const lastSweep = runRows.find((r) => r.automation_id && rows.find((a) => a.id === r.automation_id && a.key === "readiness_sweep_24h"));

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Automations"
        description="What the system does on its own, and what it is waiting on before it can."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Running" value={live.filter((a) => a.active).length} sub={`${live.length} built`} />
        <Stat label="Waiting on an integration" value={pending.length} />
        <Stat label="Runs recorded" value={rows.reduce((s, a) => s + Number(a.run_count ?? 0), 0)} />
        <Stat label="Last readiness sweep" value={lastSweep ? relativeTime(lastSweep.at) : "Never"} tone={lastSweep ? undefined : "amber"} />
      </div>

      {!lastSweep ? (
        <div className="mb-5">
          <Notice tone="amber" title="The scheduled sweep has never run">
            The hourly work — re-checking readiness inside the 24-hour horizon, chasing missing media, escalating stalled
            approvals — runs when a scheduler calls <code className="rounded bg-black/10 px-1">/api/os/cron</code> with the
            CRON_SECRET. On Vercel that is a cron entry in vercel.json. Until then everything else still works; only the
            time-based rules are idle.
          </Notice>
        </div>
      ) : null}

      <div className="space-y-3">
        {live.map((automation) => {
          const recent = runRows.filter((r) => r.automation_id === automation.id).slice(0, 1)[0];
          return (
            <Card key={automation.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[14px] font-semibold text-os-text">{automation.name}</p>
                    <Badge tone="green">Built</Badge>
                    <code className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10.5px] text-os-muted">{automation.trigger_event}</code>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-os-muted">{automation.description}</p>
                  <p className="mt-1 text-[11.5px] text-os-faint">
                    {automation.run_count ? `${automation.run_count} runs · last ${relativeTime(automation.last_run_at)}` : "Has not run yet"}
                    {recent?.detail ? ` · ${recent.detail}` : ""}
                  </p>
                </div>
                <AutomationToggle automationId={automation.id} active={automation.active} implemented />
              </div>
            </Card>
          );
        })}

        {pending.length ? (
          <>
            <h2 className="mt-6 text-[15px] font-semibold text-os-text">Designed, not yet running</h2>
            <p className="-mt-1 mb-1 text-[12.5px] text-os-muted">
              These are registered and specified. Each needs a service configured before it can do anything, and the OS will
              not pretend otherwise by giving you a switch that does nothing.
            </p>
            {pending.map((automation) => (
              <Card key={automation.id} className="border-dashed opacity-90">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[14px] font-semibold text-os-text">{automation.name}</p>
                      <Badge tone="neutral">Not built</Badge>
                      <code className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10.5px] text-os-muted">{automation.trigger_event}</code>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-os-muted">{automation.description}</p>
                    <p className="mt-1 text-[11.5px] font-medium text-os-amber">Needs: {automation.requires_integration}</p>
                  </div>
                  <AutomationToggle automationId={automation.id} active={false} implemented={false} />
                </div>
              </Card>
            ))}
          </>
        ) : null}
      </div>

      <Card className="mt-6">
        <CardHeader title="How automations fire" />
        <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-os-muted">
          <li>
            <span className="font-medium text-os-text">On a mutation.</span> Creating a trip generates its checklist and opens
            its channel in the same request. Assigning someone notifies them and posts to the trip channel. These cannot fail
            silently — they run inside the action that caused them.
          </li>
          <li>
            <span className="font-medium text-os-text">On a schedule.</span> The hourly sweep does the time-based work. Every
            run is written to os_automation_runs, so &ldquo;did the 24-hour check actually run last night&rdquo; has an answer
            rather than an assumption.
          </li>
        </ul>
      </Card>
    </>
  );
}
