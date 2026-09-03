import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { resourceUtilization, periodPresets } from "@/lib/os/analytics";
import { todayInCairo, formatDate } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resources" };

// Vehicles, dresses and equipment. People are not duplicated here — an
// employee is already schedulable through the team directory, and both are
// booked through the same assignment table, which is what lets one conflict
// engine cover "this photographer is double-booked" and "this dress is".
const KINDS = [
  { key: "vehicle", label: "Vehicles", icon: "Truck" as const },
  { key: "dress", label: "Dresses", icon: "Star" as const },
  { key: "equipment", label: "Equipment", icon: "Camera" as const },
];

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "resources.view")) return <NoAccess what="resources" permission="resources.view" />;

  const params = await searchParams;
  const kind = (Array.isArray(params.kind) ? params.kind[0] : params.kind) ?? "";

  const db = osdb();
  const org = await getOrg();
  const today = todayInCairo();

  let query = db
    .from("os_resources")
    .select("id, kind, code, name, description, status, condition, capacity, model, plate, color, size, home_base, current_location, cost_rate_amount, cost_rate_currency, insurance_expires_on, license_expires_on, notes")
    .eq("org_id", org.id).is("archived_at", null).order("kind").order("code");
  if (kind) query = query.eq("kind", kind);

  const [{ data: resources }, utilization, { data: blocked }] = await Promise.all([
    query,
    resourceUtilization(actor, periodPresets(today).month),
    db.from("os_unavailability").select("resource_id, reason, ends_at, note").not("resource_id", "is", null).gte("ends_at", `${today}T00:00:00Z`),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (resources ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const utilById = new Map(utilization.map((u) => [u.id, u]));
  const blockedById = new Map((blocked ?? []).map((b) => [b.resource_id as string, b]));

  const showCosts = can(actor, "resources.costs");
  const outOfService = rows.filter((r) => ["maintenance", "cleaning"].includes(r.status)).length;
  const needsAttention = rows.filter((r) => ["needs_repair", "damaged"].includes(r.condition)).length;

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Resources"
        description="Everything the operation books that is not a person. Availability here is real — a van in the workshop cannot be assigned to tomorrow's trip."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="In service" value={rows.filter((r) => r.status === "available" || r.status === "in_use").length} sub={`${rows.length} total`} />
        <Stat label="Out of service" value={outOfService} tone={outOfService ? "amber" : undefined} sub={outOfService ? "Workshop or cleaner" : "Everything available"} />
        <Stat label="Needs repair" value={needsAttention} tone={needsAttention ? "red" : undefined} />
        <Stat label="Never used this month" value={utilization.filter((u) => u.bookings === 0).length} sub="Candidates to retire or sell" />
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        <Link href="/os/resources" className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${!kind ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"}`}>
          Everything
        </Link>
        {KINDS.map((k) => (
          <Link key={k.key} href={`/os/resources?kind=${k.key}`} className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${kind === k.key ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"}`}>
            {k.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No resources yet" description="Register the vehicles, dresses and equipment the operation depends on." icon={<Icon.Truck size={26} />} />
      ) : (
        <div className="space-y-6">
          {KINDS.filter((k) => !kind || k.key === kind).map((group) => {
            const groupRows = rows.filter((r) => r.kind === group.key);
            if (!groupRows.length) return null;
            const Glyph = Icon[group.icon];
            return (
              <section key={group.key}>
                <h2 className="mb-2.5 flex items-center gap-2 text-[15px] font-semibold text-os-text">
                  <span className="text-os-muted"><Glyph size={17} /></span>{group.label}
                  <span className="text-[12px] font-normal text-os-faint">{groupRows.length}</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {groupRows.map((resource) => {
                    const util = utilById.get(resource.id);
                    const block = blockedById.get(resource.id);
                    const unavailable = ["maintenance", "cleaning", "retired"].includes(resource.status) || Boolean(block);
                    return (
                      <Link
                        key={resource.id}
                        href={`/os/resources/${resource.id}`}
                        className={`block rounded-xl border p-3.5 transition hover:shadow-sm ${unavailable ? "border-os-amber/30 bg-os-amber-soft/30" : "border-os-line bg-os-card hover:border-os-line-strong"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="os-nums text-[11px] font-semibold text-os-faint">{resource.code}</p>
                            <p className="truncate text-[14px] font-semibold text-os-text">{resource.name}</p>
                          </div>
                          <Badge tone={unavailable ? "amber" : resource.status === "available" ? "green" : "neutral"}>
                            {String(resource.status).replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <p className="mt-1 text-[12px] text-os-muted">
                          {[
                            resource.model,
                            resource.plate,
                            resource.capacity ? `${resource.capacity} seats` : null,
                            resource.color,
                            resource.size,
                          ].filter(Boolean).join(" · ")}
                        </p>

                        {block ? (
                          <p className="mt-1.5 text-[11.5px] leading-snug text-os-amber">
                            {(block.note as string) ?? `Unavailable (${String(block.reason).replace(/_/g, " ")})`} until {formatDate(String(block.ends_at).slice(0, 10))}
                          </p>
                        ) : null}

                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11.5px] text-os-faint">
                          <span>{util?.bookings ?? 0} bookings this month</span>
                          {resource.condition !== "good" && resource.condition !== "excellent" ? (
                            <Badge tone="red">{String(resource.condition).replace(/_/g, " ")}</Badge>
                          ) : null}
                          {showCosts && resource.cost_rate_amount ? (
                            <span className="os-nums ml-auto font-medium text-os-text">
                              {formatMoney(Number(resource.cost_rate_amount), resource.cost_rate_currency)}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {can(actor, "resources.view") && rows.some((r) => r.insurance_expires_on || r.license_expires_on) ? (
        <Card className="mt-6">
          <CardHeader title="Documents expiring" subtitle="Insurance and licences that need renewing" />
          <ul className="mt-2.5 space-y-1.5 text-[13px]">
            {rows.filter((r) => r.insurance_expires_on || r.license_expires_on).map((r) => (
              <li key={r.id} className="flex items-baseline justify-between gap-3">
                <span className="text-os-text">{r.name}</span>
                <span className="os-nums text-os-muted">
                  {r.insurance_expires_on ? `insurance ${formatDate(r.insurance_expires_on)}` : ""}
                  {r.license_expires_on ? ` · licence ${formatDate(r.license_expires_on)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <p className="mt-6 text-[12px] text-os-faint">
        Adding and editing resources needs the resources permission.{" "}
        {can(actor, "resources.create") ? "Use the Admin centre to register new ones." : ""}
      </p>
      {can(actor, "resources.create") ? (
        <Link href="/os/admin" className={`mt-2 ${buttonClass.secondary}`}>Admin centre</Link>
      ) : null}
    </>
  );
}
