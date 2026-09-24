import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord } from "@/lib/os/trips";
import { osdb } from "@/lib/os/db";
import { formatDateTime, relativeTime } from "@/lib/os/dates";
import { Card, CardHeader, Badge, EmptyState } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// The trip's whole story, and — for anyone who can read the audit log — the
// exact field-level record underneath it. Two views of the same events,
// because "who changed the date" and "what was it before" are different
// questions asked by different people.
export default async function TripActivityPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;

  const trip = await getTripRecord(actor, ref.toUpperCase());
  if (!trip) notFound();

  const db = osdb();
  const [activity, statusHistory, audit] = await Promise.all([
    db.from("os_activity")
      .select("id, verb, summary, meta, at, os_employees ( full_name )")
      .eq("trip_id", trip.id).order("at", { ascending: false }).limit(100),
    db.from("os_trip_status_history")
      .select("id, from_status, to_status, note, readiness_score, at, os_employees ( full_name )")
      .eq("trip_id", trip.id).order("at", { ascending: false }),
    can(actor, "admin.audit")
      ? db.from("os_audit_log")
          .select("id, action, actor_label, before, after, changed_fields, at, ip")
          .eq("entity_id", trip.id).order("at", { ascending: false }).limit(60)
      : Promise.resolve({ data: null }),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const events = (activity.data ?? []) as any[];
  const statuses = (statusHistory.data ?? []) as any[];
  const auditRows = (audit.data ?? []) as any[] | null;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card padded={false}>
        <div className="border-b border-os-line px-4 py-3 sm:px-5">
          <CardHeader title="History" subtitle="Everything that happened to this trip, newest first" />
        </div>
        {events.length ? (
          <ol className="px-4 py-3 sm:px-5">
            {events.map((event, index) => (
              <li key={event.id} className="relative flex gap-3.5 pb-4 last:pb-0">
                {index < events.length - 1 ? <span className="absolute left-[6px] top-4 h-full w-px bg-os-line" aria-hidden /> : null}
                <span className="relative mt-1.5 h-[13px] w-[13px] shrink-0 rounded-full border-2 border-os-line-strong bg-white" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-os-text">{event.summary}</p>
                  <p className="mt-0.5 text-[11.5px] text-os-faint" title={formatDateTime(event.at)}>
                    {event.os_employees?.full_name ?? "System"} · {relativeTime(event.at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="px-4 py-6 sm:px-5">
            <EmptyState title="Nothing recorded yet" description="Every change to this trip from now on appears here." icon={<Icon.Clock size={22} />} />
          </div>
        )}
      </Card>

      <div className="space-y-5">
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3">
            <CardHeader title="Status changes" subtitle="With the readiness score at the moment of each move" />
          </div>
          <ul>
            {statuses.map((row) => (
              <li key={row.id} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                <p className="text-[12.5px] text-os-text">
                  {row.from_status ? (
                    <>
                      <span className="capitalize">{String(row.from_status).replace(/_/g, " ")}</span>
                      <span className="mx-1.5 text-os-faint">→</span>
                    </>
                  ) : null}
                  <span className="font-semibold capitalize">{String(row.to_status).replace(/_/g, " ")}</span>
                  {row.readiness_score !== null ? (
                    <span className="os-nums ml-2 text-[11.5px] text-os-faint">{row.readiness_score}% ready</span>
                  ) : null}
                </p>
                {row.note ? (
                  <p className={`mt-0.5 text-[11.5px] leading-snug ${String(row.note).startsWith("FORCED") ? "text-os-red" : "text-os-muted"}`}>
                    {row.note}
                  </p>
                ) : null}
                <p className="text-[11px] text-os-faint">{row.os_employees?.full_name ?? "System"} · {relativeTime(row.at)}</p>
              </li>
            ))}
            {!statuses.length ? <li className="px-4 py-4 text-[12.5px] text-os-muted">No status changes recorded.</li> : null}
          </ul>
        </Card>

        {auditRows ? (
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3">
              <CardHeader
                title="Audit record"
                subtitle="Exact before and after values. Append-only."
                action={<Badge tone="ink">Restricted</Badge>}
              />
            </div>
            <ul className="os-scroll max-h-[520px] overflow-y-auto">
              {auditRows.map((row) => (
                <li key={row.id} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                  <p className="text-[12px] font-medium text-os-text">{row.action}</p>
                  <p className="text-[11px] text-os-faint">
                    {row.actor_label} · {relativeTime(row.at)}{row.ip ? ` · ${row.ip}` : ""}
                  </p>
                  {row.changed_fields?.length ? (
                    <p className="mt-1 text-[11.5px] text-os-muted">
                      {row.changed_fields.map((field: string) => (
                        <span key={field} className="mr-2">
                          <span className="font-medium">{field.replace(/_/g, " ")}</span>
                          : {formatValue(row.before?.[field])} → {formatValue(row.after?.[field])}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </li>
              ))}
              {!auditRows.length ? <li className="px-4 py-4 text-[12.5px] text-os-muted">No audit entries for this trip.</li> : null}
            </ul>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 60);
  return String(value).slice(0, 60);
}
