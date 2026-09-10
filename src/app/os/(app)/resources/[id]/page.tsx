import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { listTrips } from "@/lib/os/trips";
import { todayInCairo, formatDate, formatTime, relativeTime } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await osdb().from("os_resources").select("name").eq("id", id).maybeSingle();
  return { title: (data?.name as string) ?? "Resource" };
}

export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "resources.view")) return <NoAccess what="resources" permission="resources.view" />;

  const db = osdb();
  const org = await getOrg();
  const today = todayInCairo();

  const { data: resource } = await db.from("os_resources").select("*").eq("id", id).eq("org_id", org.id).maybeSingle();
  if (!resource) notFound();

  const [trips, { data: maintenance }, { data: unavailability }, { data: utilization }] = await Promise.all([
    listTrips(actor, { resourceId: id, from: today, limit: 30 }),
    db.from("os_resource_maintenance").select("id, kind, title, due_on, completed_on, cost_amount, cost_currency, notes").eq("resource_id", id).order("due_on", { ascending: false }),
    db.from("os_unavailability").select("id, reason, starts_at, ends_at, note").eq("resource_id", id).gte("ends_at", `${today}T00:00:00Z`).order("starts_at"),
    db.from("os_v_resource_utilization").select("bookings_30d, bookings_upcoming, last_booked_until").eq("resource_id", id).maybeSingle(),
  ]);

  const showCosts = can(actor, "resources.costs");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const attributes = (resource.attributes ?? {}) as Record<string, any>;
  const util = utilization as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <>
      <div className="mb-4">
        <Link href="/os/resources" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          <Icon.ArrowLeft size={14} />Resources
        </Link>
      </div>

      <PageHeader
        eyebrow={`${String(resource.kind).replace(/_/g, " ")} · ${resource.code}`}
        title={resource.name as string}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{(resource.description as string) ?? ""}</span>
            <Badge tone={resource.status === "available" ? "green" : "amber"}>{String(resource.status).replace(/_/g, " ")}</Badge>
            <Badge tone={["needs_repair", "damaged"].includes(resource.condition as string) ? "red" : "neutral"}>
              {String(resource.condition).replace(/_/g, " ")}
            </Badge>
          </span>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Bookings, 30 days" value={Number(util?.bookings_30d ?? 0)} />
        <Stat label="Upcoming" value={Number(util?.bookings_upcoming ?? 0)} sub={trips[0] ? `Next ${formatDate(trips[0].tripDate)}` : "Nothing booked"} />
        <Stat label="Condition" value={String(resource.condition).replace(/_/g, " ")} tone={["needs_repair", "damaged"].includes(resource.condition as string) ? "red" : undefined} />
        {showCosts ? (
          <Stat
            label="Cost per booking"
            value={resource.cost_rate_amount ? formatMoney(Number(resource.cost_rate_amount), resource.cost_rate_currency as string) : "—"}
            sub={String(resource.cost_rate_unit ?? "").replace(/_/g, " ")}
          />
        ) : (
          <Stat label="Based at" value={(resource.home_base as string) ?? "—"} />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader title="Upcoming bookings" />
            </div>
            {trips.length ? (
              <ul>
                {trips.map((trip) => (
                  <li key={trip.id} className="border-b border-os-line/60 last:border-0">
                    <Link href={`/os/trips/${trip.ref}`} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-black/[0.02] sm:px-5">
                      <span className="w-20 shrink-0">
                        <span className="block text-[12.5px] font-semibold text-os-text">{formatDate(trip.tripDate)}</span>
                        <span className="os-nums block text-[11.5px] text-os-faint">{formatTime(trip.startTime)}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-os-text">{trip.title}</span>
                        <span className="block truncate text-[11.5px] text-os-faint">{trip.ref} · {trip.clientName ?? "No client"}</span>
                      </span>
                      <Icon.ChevronRight size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 sm:px-5">
                <EmptyState title="Not booked on anything" description="This resource is free for the whole period ahead." icon={<Icon.Calendar size={22} />} />
              </div>
            )}
          </Card>

          {maintenance?.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="Maintenance history" subtitle="What has been done, and what is due" />
              </div>
              <ul>
                {maintenance.map((row) => (
                  <li key={row.id as string} className="flex items-start justify-between gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-os-text">{row.title as string}</p>
                      <p className="text-[11.5px] text-os-faint">
                        <span className="capitalize">{String(row.kind).replace(/_/g, " ")}</span>
                        {row.due_on ? ` · due ${formatDate(row.due_on as string)}` : ""}
                        {row.completed_on ? ` · done ${formatDate(row.completed_on as string)}` : " · outstanding"}
                      </p>
                    </div>
                    {showCosts && row.cost_amount ? (
                      <span className="os-nums shrink-0 text-[12.5px] text-os-text">
                        {formatMoney(Number(row.cost_amount), row.cost_currency as string)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Detail" />
            <dl className="mt-3 space-y-2.5 text-[13px]">
              {resource.model ? <Line label="Model" value={resource.model as string} /> : null}
              {resource.plate ? <Line label="Plate" value={resource.plate as string} /> : null}
              {resource.year ? <Line label="Year" value={String(resource.year)} /> : null}
              {resource.capacity ? <Line label="Capacity" value={`${resource.capacity} people`} /> : null}
              {resource.color ? <Line label="Colour" value={resource.color as string} /> : null}
              {resource.size ? <Line label="Size" value={resource.size as string} /> : null}
              {resource.serial_number ? <Line label="Serial" value={resource.serial_number as string} /> : null}
              {resource.home_base ? <Line label="Home base" value={resource.home_base as string} /> : null}
              {resource.current_location ? <Line label="Currently at" value={resource.current_location as string} /> : null}
              {resource.insurance_expires_on ? <Line label="Insurance expires" value={formatDate(resource.insurance_expires_on as string)} /> : null}
              {resource.license_expires_on ? <Line label="Licence expires" value={formatDate(resource.license_expires_on as string)} /> : null}
              {Object.entries(attributes).map(([key, value]) => (
                <Line key={key} label={key.replace(/_/g, " ")} value={typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)} />
              ))}
            </dl>
            {resource.notes ? (
              <p className="mt-3 rounded-lg bg-black/[0.03] px-3 py-2 text-[12.5px] leading-relaxed text-os-muted">{resource.notes as string}</p>
            ) : null}
          </Card>

          {unavailability?.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Blocked" subtitle="Cannot be assigned during these windows" />
              </div>
              <ul>
                {unavailability.map((row) => (
                  <li key={row.id as string} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <p className="text-[12.5px] font-medium capitalize text-os-text">{String(row.reason).replace(/_/g, " ")}</p>
                    <p className="os-nums text-[11.5px] text-os-faint">
                      {String(row.starts_at).slice(0, 10)} → {String(row.ends_at).slice(0, 10)} · {relativeTime(row.ends_at as string)}
                    </p>
                    {row.note ? <p className="text-[11.5px] text-os-muted">{row.note as string}</p> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 capitalize text-os-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-os-text">{value}</dd>
    </div>
  );
}
