import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { overview, breakdown, employeeUtilization, resourceUtilization, clientInsights, supplierPerformance, periodPresets } from "@/lib/os/analytics";
import { todayInCairo } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Stat, Badge, Table, Th, Td, EmptyState } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

// ---------------------------------------------------------------------------
// ANALYTICS
// ---------------------------------------------------------------------------
// Derived at read time from the operational tables — there is no reporting copy
// to drift, and no nightly job that can quietly stop running and leave the
// dashboard showing last week.
//
// Financial columns are a separate permission from the page itself, so
// Operations can see that Photoshoots are growing without seeing what they
// earn. Where a number is withheld, the layout says so rather than showing a
// blank.
// ---------------------------------------------------------------------------

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "analytics.view")) return <NoAccess what="analytics" permission="analytics.view" />;

  const params = await searchParams;
  const periodKey = (Array.isArray(params.period) ? params.period[0] : params.period) ?? "month";
  const presets = periodPresets(todayInCairo());
  const period = presets[periodKey] ?? presets.month;

  const showMoney = can(actor, "analytics.financial") || can(actor, "trips.financials");

  const [stats, byService, bySource, byMonth, byLocation, crew, resources, clients, suppliers] = await Promise.all([
    overview(actor, period),
    breakdown(actor, period, "trip_type"),
    breakdown(actor, period, "source"),
    breakdown(actor, presets.year, "month"),
    breakdown(actor, period, "location"),
    employeeUtilization(actor, period),
    resourceUtilization(actor, period),
    clientInsights(actor, period),
    supplierPerformance(actor, period),
  ]);

  const overloaded = crew.filter((c) => c.flag === "overloaded");
  const underused = crew.filter((c) => c.flag === "underused");
  const maxMonth = Math.max(1, ...byMonth.map((m) => (showMoney ? m.revenue ?? 0 : m.trips)));

  return (
    <>
      <PageHeader
        eyebrow="Business intelligence"
        title="Analytics"
        description="Where the money comes from, where it goes, and who is carrying too much."
        actions={
          can(actor, "analytics.export") ? (
            <a href={`/api/os/export/trips?range=${periodKey === "month" ? "month" : "past"}`} className="rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text hover:bg-black/[0.03]">
              <Icon.Download size={15} />Export
            </a>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap gap-1">
        {Object.entries(presets).map(([key, value]) => (
          <Link
            key={key}
            href={`/os/analytics?period=${key}`}
            className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${
              periodKey === key ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
            }`}
          >
            {value.label}
          </Link>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Trips" value={stats.trips} sub={`${stats.guests} guests`} />
        {showMoney ? (
          <>
            <Stat label="Revenue" value={formatMoney(stats.revenue, stats.currency, { compact: true })} sub={`Average ${formatMoney(stats.averageBookingValue, stats.currency)}`} />
            <Stat label="Profit" value={formatMoney(stats.profit, stats.currency, { compact: true })} tone={(stats.marginPct ?? 0) < 25 ? "amber" : "green"} sub={`${stats.marginPct}% margin`} />
          </>
        ) : (
          <>
            <Stat label="Completed" value={stats.completed} />
            <Stat label="At risk" value={stats.atRisk + stats.critical} tone={stats.critical ? "red" : stats.atRisk ? "amber" : undefined} />
          </>
        )}
        <Stat label="Cancellation rate" value={`${stats.cancellationRate}%`} tone={stats.cancellationRate > 10 ? "amber" : undefined} sub={`${stats.cancelled} cancelled`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BreakdownCard
          title="By service"
          subtitle={showMoney ? "Which services earn, not just which sell" : "Where the volume is"}
          rows={byService}
          showMoney={showMoney}
          currency={stats.currency}
        />
        <BreakdownCard
          title="By booking source"
          subtitle={showMoney ? "Which channels bring the highest-value clients" : "Where bookings come from"}
          rows={bySource}
          showMoney={showMoney}
          currency={stats.currency}
        />
      </div>

      <Card className="mt-5">
        <CardHeader title="The last twelve months" subtitle={showMoney ? "Revenue by month" : "Trips by month"} />
        <div className="mt-4 flex items-end gap-1.5" style={{ height: 140 }}>
          {byMonth.map((month) => {
            const value = showMoney ? month.revenue ?? 0 : month.trips;
            return (
              <div key={month.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="os-nums text-[10px] text-os-faint">
                  {showMoney ? formatMoney(value, stats.currency, { compact: true }) : value}
                </span>
                <div
                  className="w-full rounded-t bg-os-gold/70 transition hover:bg-os-gold"
                  style={{ height: `${Math.max(3, (value / maxMonth) * 100)}%` }}
                  title={`${month.label}: ${showMoney ? formatMoney(value, stats.currency) : `${value} trips`}`}
                />
                <span className="text-[10px] text-os-faint">{month.key.slice(5)}</span>
              </div>
            );
          })}
          {byMonth.length === 0 ? <p className="w-full text-center text-[13px] text-os-muted">Nothing in this period.</p> : null}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="Crew workload"
              subtitle={
                overloaded.length
                  ? `${overloaded.length} carrying noticeably more than the rest`
                  : "Work is spread evenly"
              }
            />
          </div>
          <Table className="rounded-none border-0">
            <thead><tr><Th>Person</Th><Th>Assignments</Th><Th>Utilisation</Th><Th>Rating</Th></tr></thead>
            <tbody>
              {crew.slice(0, 14).map((row) => (
                <tr key={row.id}>
                  <Td>
                    <Link href={`/os/team/${row.id}`} className="block">
                      <span className="block text-[12.5px] font-medium text-os-text">{row.name}</span>
                      <span className="block text-[11px] text-os-faint">{row.subtitle}</span>
                    </Link>
                  </Td>
                  <Td className="os-nums">{row.bookings}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.07]">
                        <span
                          className={`block h-full rounded-full ${row.flag === "overloaded" ? "bg-os-amber" : "bg-os-green"}`}
                          style={{ width: `${row.utilizationPct}%` }}
                        />
                      </span>
                      <span className="os-nums text-[11.5px] text-os-muted">{row.utilizationPct}%</span>
                      {row.flag === "overloaded" ? <Badge tone="amber">Loaded</Badge> : null}
                      {row.flag === "underused" ? <Badge tone="neutral">Free</Badge> : null}
                    </span>
                  </Td>
                  <Td className="os-nums">{row.rating ? `${row.rating}/5` : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {overloaded.length || underused.length ? (
            <p className="border-t border-os-line px-4 py-2.5 text-[11.5px] leading-relaxed text-os-muted sm:px-5">
              {overloaded.length ? `${overloaded.map((c) => c.name.split(" ")[0]).join(", ")} ${overloaded.length === 1 ? "is" : "are"} carrying the load. ` : ""}
              {underused.length ? `${underused.slice(0, 3).map((c) => c.name.split(" ")[0]).join(", ")} could take more.` : ""}
            </p>
          ) : null}
        </Card>

        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader title="Resource utilisation" subtitle="What is working hard, and what is sitting still" />
          </div>
          <Table className="rounded-none border-0">
            <thead><tr><Th>Resource</Th><Th>Bookings</Th><Th>Use</Th><Th>Status</Th></tr></thead>
            <tbody>
              {resources.slice(0, 14).map((row) => (
                <tr key={row.id}>
                  <Td>
                    <Link href={`/os/resources/${row.id}`} className="block">
                      <span className="block text-[12.5px] font-medium text-os-text">{row.name}</span>
                      <span className="block text-[11px] capitalize text-os-faint">{row.subtitle}</span>
                    </Link>
                  </Td>
                  <Td className="os-nums">{row.bookings}</Td>
                  <Td className="os-nums text-os-muted">{row.utilizationPct}%</Td>
                  <Td>
                    {row.flag === "underused" ? <Badge tone="neutral">Idle</Badge>
                      : row.flag === "overloaded" ? <Badge tone="amber">Heavy</Badge>
                      : <Badge tone="green">Normal</Badge>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      {clients ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader title="Where clients come from" subtitle={`${clients.repeatRate}% of clients in this period travelled more than once`} />
            </div>
            <ul>
              {clients.nationalities.map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-3 border-b border-os-line/60 px-4 py-2 last:border-0 sm:px-5">
                  <span className="text-[12.5px] text-os-text">{row.label}</span>
                  <span className="os-nums text-[12.5px] text-os-muted">{row.count}</span>
                </li>
              ))}
              {clients.nationalities.length === 0 ? <li className="px-4 py-4 text-[12.5px] text-os-muted">No client data in this period.</li> : null}
            </ul>
          </Card>

          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader title="Suppliers" subtitle="Spend against incidents caused" />
            </div>
            <Table className="rounded-none border-0">
              <thead><tr><Th>Supplier</Th><Th>Trips</Th><Th>Incidents</Th>{showMoney ? <Th align="right">Spend</Th> : null}</tr></thead>
              <tbody>
                {suppliers.slice(0, 10).map((row) => (
                  <tr key={row.id}>
                    <Td>
                      <Link href={`/os/suppliers/${row.id}`} className="text-[12.5px] font-medium text-os-text">{row.name}</Link>
                    </Td>
                    <Td className="os-nums">{row.trips}</Td>
                    <Td>{row.incidents ? <Badge tone="amber">{row.incidents}</Badge> : <span className="text-os-faint">0</span>}</Td>
                    {showMoney ? <Td align="right" className="os-nums">{formatMoney(row.spend ?? 0, stats.currency)}</Td> : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      ) : null}

      {byLocation.length ? (
        <div className="mt-5">
          <BreakdownCard title="By destination" subtitle="Where the work actually happens" rows={byLocation} showMoney={showMoney} currency={stats.currency} />
        </div>
      ) : null}
    </>
  );
}

function BreakdownCard({
  title, subtitle, rows, showMoney, currency,
}: {
  title: string;
  subtitle: string;
  rows: { key: string; label: string; trips: number; guests: number; revenue: number | null; profit: number | null; marginPct: number | null }[];
  showMoney: boolean;
  currency: string;
}) {
  const max = Math.max(1, ...rows.map((r) => (showMoney ? r.revenue ?? 0 : r.trips)));
  return (
    <Card padded={false}>
      <div className="border-b border-os-line px-4 py-3 sm:px-5">
        <CardHeader title={title} subtitle={subtitle} />
      </div>
      {rows.length ? (
        <ul>
          {rows.map((row) => {
            const value = showMoney ? row.revenue ?? 0 : row.trips;
            return (
              <li key={row.key} className="border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium text-os-text">{row.label}</span>
                  <span className="os-nums text-[12.5px]">
                    {showMoney ? (
                      <>
                        <span className="font-medium text-os-text">{formatMoney(row.revenue, currency)}</span>
                        <span className={`ml-2 ${(row.marginPct ?? 0) < 25 ? "text-os-amber" : "text-os-green"}`}>{row.marginPct}%</span>
                      </>
                    ) : (
                      <span className="font-medium text-os-text">{row.trips} trips</span>
                    )}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                    <span className="block h-full rounded-full bg-os-gold" style={{ width: `${(value / max) * 100}%` }} />
                  </span>
                  <span className="os-nums shrink-0 text-[11px] text-os-faint">{row.trips} · {row.guests} guests</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-4 py-6 sm:px-5">
          <EmptyState title="Nothing in this period" description="Widen the date range." icon={<Icon.Chart size={22} />} />
        </div>
      )}
    </Card>
  );
}
