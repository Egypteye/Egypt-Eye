import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime, formatDateTime } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState } from "@/components/os/ui";
import { IncidentForm } from "./IncidentForm";
import { IncidentActions } from "./IncidentActions";
import { Icon } from "@/components/os/icons";
import { SavedViews } from "@/components/os/SavedViews";

export const dynamic = "force-dynamic";
export const metadata = { title: "Incidents" };

// What went wrong, who owns it, and what was actually done. The resolution
// field is required to close one, because an incident closed with no
// resolution teaches the company nothing and the same thing happens again.
export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "incidents.view")) return <NoAccess what="incidents" permission="incidents.view" />;

  const params = await searchParams;
  const one = (key: string) => ((Array.isArray(params[key]) ? params[key]![0] : params[key]) ?? "") as string;
  const statusFilter = one("status").split(",").map((v) => v.trim()).filter(Boolean);
  const severityFilter = one("severity").split(",").map((v) => v.trim()).filter(Boolean);

  const db = osdb();
  const org = await getOrg();

  const [{ data: incidents }, { data: employees }, { data: suppliers }] = await Promise.all([
    db.from("os_incidents")
      .select(
        "id, ref, title, description, severity, category, status, client_impact, occurred_at, resolved_at, actions_taken, resolution, cost_amount, cost_currency, " +
        "reporter:os_employees!os_incidents_reported_by_fkey ( full_name ), " +
        "owner:os_employees!os_incidents_owner_employee_id_fkey ( full_name ), " +
        "subject:os_employees!os_incidents_subject_employee_id_fkey ( full_name ), " +
        "os_suppliers ( name ), os_resources ( name ), os_trips ( ref, title )",
      )
      .eq("org_id", org.id).order("occurred_at", { ascending: false }).limit(100),
    can(actor, "incidents.create") ? db.from("os_employees").select("id, full_name").eq("org_id", org.id).is("archived_at", null).order("full_name") : Promise.resolve({ data: [] }),
    can(actor, "incidents.create") ? db.from("os_suppliers").select("id, name").eq("org_id", org.id).is("archived_at", null).order("name") : Promise.resolve({ data: [] }),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let rows = (incidents ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (statusFilter.length) rows = rows.filter((i) => statusFilter.includes(i.status));
  if (severityFilter.length) rows = rows.filter((i) => severityFilter.includes(i.severity));
  const open = rows.filter((i) => ["open", "investigating"].includes(i.status));
  const closed = rows.filter((i) => ["resolved", "closed"].includes(i.status));
  const critical = open.filter((i) => i.severity === "critical" || i.severity === "high");
  const cost = rows.reduce((s, i) => s + Number(i.cost_amount ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Incidents"
        description="Every problem, who owned it, and what was done. This is where the company learns rather than repeats."
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <SavedViews resource="incidents" employeeId={actor.employeeId} />
        {statusFilter.length || severityFilter.length ? (
          <Link href="/os/incidents" className="rounded-full border border-os-gold bg-os-gold-soft px-2.5 py-1 text-[12px] font-medium text-[#7a6415]">
            {[...statusFilter, ...severityFilter].join(", ")} only ✕
          </Link>
        ) : null}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open" value={open.length} tone={open.length ? "amber" : undefined} />
        <Stat label="High or critical" value={critical.length} tone={critical.length ? "red" : undefined} />
        <Stat label="Resolved" value={closed.length} />
        <Stat label="Cost of incidents" value={formatMoney(cost, actor.baseCurrency)} sub="Recorded on file" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader title="Open" subtitle={open.length ? "Someone has to own each of these" : "Nothing outstanding"} />
            </div>
            {open.length ? (
              <ul>
                {open.map((incident) => (
                  <li key={incident.id} className="border-b border-os-line/60 px-4 py-3.5 last:border-0 sm:px-5">
                    <IncidentBody incident={incident} />
                    {can(actor, "incidents.edit") ? (
                      <div className="mt-3">
                        <IncidentActions
                          incidentId={incident.id}
                          status={incident.status}
                          employees={(employees ?? []).map((e) => ({ id: e.id as string, name: e.full_name as string }))}
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 sm:px-5">
                <EmptyState title="No open incidents" description="Nothing is currently going wrong that anybody has logged." icon={<Icon.Check size={24} />} />
              </div>
            )}
          </Card>

          {closed.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="Resolved" subtitle="What was done about it, for the next person who hits the same thing" />
              </div>
              <ul>
                {closed.map((incident) => (
                  <li key={incident.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                    <IncidentBody incident={incident} compact />
                    {incident.resolution ? (
                      <p className="mt-1.5 rounded-lg bg-os-green-soft px-3 py-2 text-[12.5px] leading-relaxed text-os-green">
                        {incident.resolution}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          {can(actor, "incidents.create") ? (
            <Card>
              <CardHeader title="Report something" subtitle="From the field or the office. Reporting early is always cheaper than reporting late." />
              <div className="mt-3">
                <IncidentForm
                  employees={(employees ?? []).map((e) => ({ id: e.id as string, name: e.full_name as string }))}
                  suppliers={(suppliers ?? []).map((s) => ({ id: s.id as string, name: s.name as string }))}
                />
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function IncidentBody({ incident, compact }: { incident: any; compact?: boolean }) {
  const subject = incident.subject?.full_name ?? incident.os_suppliers?.name ?? incident.os_resources?.name;
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="os-nums text-[11.5px] font-semibold text-os-faint">{incident.ref}</span>
        <Badge tone={incident.severity === "critical" || incident.severity === "high" ? "red" : incident.severity === "medium" ? "amber" : "neutral"}>
          {incident.severity}
        </Badge>
        <Badge tone="neutral">{String(incident.category).replace(/_/g, " ")}</Badge>
        {incident.client_impact !== "none" ? <Badge tone="amber">Client impact: {incident.client_impact}</Badge> : null}
        {incident.status === "investigating" ? <Badge tone="blue">Investigating</Badge> : null}
      </div>

      <p className="mt-1 text-[14px] font-semibold leading-snug text-os-text">{incident.title}</p>
      {!compact && incident.description ? (
        <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-os-muted">{incident.description}</p>
      ) : null}
      {!compact && incident.actions_taken ? (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-os-text">
          <span className="font-medium">Done so far: </span>{incident.actions_taken}
        </p>
      ) : null}

      <p className="mt-1.5 text-[11.5px] text-os-faint">
        {incident.reporter?.full_name ?? "Someone"} reported it {relativeTime(incident.occurred_at)}
        {incident.owner?.full_name ? ` · owned by ${incident.owner.full_name}` : " · nobody owns it yet"}
        {subject ? ` · about ${subject}` : ""}
        {incident.os_trips?.ref ? (
          <> · <Link href={`/os/trips/${incident.os_trips.ref}`} className="font-medium text-os-gold hover:underline">{incident.os_trips.ref}</Link></>
        ) : null}
        {incident.cost_amount ? ` · cost ${formatMoney(Number(incident.cost_amount), incident.cost_currency ?? "USD")}` : ""}
        {incident.resolved_at ? ` · resolved ${formatDateTime(incident.resolved_at)}` : ""}
      </p>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
