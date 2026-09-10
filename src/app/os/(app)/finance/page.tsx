import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { overview, periodPresets } from "@/lib/os/analytics";
import { todayInCairo, formatDate } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Stat, Table, Th, Td, EmptyState, Notice } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance" };

// What has been earned, what has been spent, and what has not been collected.
// This is a ledger of what happened, not a payment gateway — collection
// happens in the tools Egypt Eye already uses, and pretending otherwise would
// be building a button that cannot work.
export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "finance.view")) return <NoAccess what="finance" permission="finance.view" />;

  const params = await searchParams;
  const periodKey = (Array.isArray(params.period) ? params.period[0] : params.period) ?? "month";
  const presets = periodPresets(todayInCairo());
  const period = presets[periodKey] ?? presets.month;

  const db = osdb();
  const org = await getOrg();

  const [stats, { data: trips }, { data: payments }, { data: costs }] = await Promise.all([
    overview(actor, period),
    db.from("os_trips")
      .select("id, ref, title, trip_date, status, currency, sell_amount, paid_amount, estimated_cost_amount, actual_cost_amount, os_clients ( full_name )")
      .eq("org_id", org.id).is("archived_at", null).neq("status", "cancelled")
      .gte("trip_date", period.from).lte("trip_date", period.to)
      .order("trip_date", { ascending: false }).limit(200),
    db.from("os_payments")
      .select("id, direction, method, amount, currency, base_amount, status, reference, paid_on, os_trips ( ref )")
      .eq("org_id", org.id).gte("paid_on", period.from).lte("paid_on", period.to)
      .order("paid_on", { ascending: false }).limit(80),
    db.from("os_trip_cost_lines")
      .select("category, base_amount, kind")
      .eq("org_id", org.id).eq("kind", "actual")
      .gte("incurred_on", period.from).lte("incurred_on", period.to),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const tripRows = (trips ?? []) as any[];
  const paymentRows = (payments ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const outstanding = tripRows
    .map((t) => ({ ...t, due: Number(t.sell_amount ?? 0) - Number(t.paid_amount ?? 0) }))
    .filter((t) => t.due > 0.5)
    .sort((a, b) => b.due - a.due);
  const totalOutstanding = outstanding.reduce((s, t) => s + t.due, 0);

  const spendByCategory = new Map<string, number>();
  for (const cost of costs ?? []) {
    const key = cost.category as string;
    spendByCategory.set(key, (spendByCategory.get(key) ?? 0) + Number(cost.base_amount ?? 0));
  }
  const spendRows = Array.from(spendByCategory, ([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  const totalSpend = spendRows.reduce((s, r) => s + r.amount, 0);

  const thin = tripRows
    .map((t) => {
      const sell = Number(t.sell_amount ?? 0);
      const cost = Number(t.actual_cost_amount ?? 0) || Number(t.estimated_cost_amount ?? 0);
      return { ...t, sell, cost, marginPct: sell ? Math.round(((sell - cost) / sell) * 1000) / 10 : 0 };
    })
    .filter((t) => t.sell > 0 && t.marginPct < 22)
    .sort((a, b) => a.marginPct - b.marginPct);

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Money"
        description={`${period.label}. Everything normalised to ${org.baseCurrency} at the rate in force on the day it happened.`}
      />

      <div className="mb-4 flex flex-wrap gap-1">
        {Object.entries(presets).map(([key, value]) => (
          <Link
            key={key}
            href={`/os/finance?period=${key}`}
            className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${
              periodKey === key ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
            }`}
          >
            {value.label}
          </Link>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue booked" value={formatMoney(stats.revenue, stats.currency)} sub={`${stats.trips} trips`} />
        <Stat label="Cost" value={formatMoney(stats.cost, stats.currency)} />
        <Stat label="Profit" value={formatMoney(stats.profit, stats.currency)} tone={(stats.marginPct ?? 0) < 25 ? "amber" : "green"} sub={`${stats.marginPct}% margin`} />
        <Stat label="Outstanding" value={formatMoney(totalOutstanding, org.baseCurrency)} tone={totalOutstanding > 0 ? "amber" : undefined} sub={`${outstanding.length} trips`} />
      </div>

      {thin.length ? (
        <div className="mb-5">
          <Notice tone="amber" title={`${thin.length} trip${thin.length === 1 ? "" : "s"} below the 22% standard margin floor`}>
            {thin.slice(0, 4).map((t) => `${t.ref} (${t.marginPct}%)`).join(", ")}
            {thin.length > 4 ? ` and ${thin.length - 4} more` : ""}.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader
                title="Outstanding balances"
                subtitle={outstanding.length ? "Money booked and not yet collected" : "Everything is paid"}
                action={<span className="os-nums text-[14px] font-semibold text-os-amber">{formatMoney(totalOutstanding, org.baseCurrency)}</span>}
              />
            </div>
            {outstanding.length ? (
              <Table className="rounded-none border-0">
                <thead><tr><Th>Trip</Th><Th>Client</Th><Th>Date</Th><Th align="right">Value</Th><Th align="right">Paid</Th><Th align="right">Due</Th></tr></thead>
                <tbody>
                  {outstanding.slice(0, 30).map((trip) => (
                    <tr key={trip.id}>
                      <Td>
                        <Link href={`/os/trips/${trip.ref}/costs`} className="os-nums text-[12.5px] font-medium text-os-gold hover:underline">{trip.ref}</Link>
                      </Td>
                      <Td className="text-[12.5px] text-os-muted">{trip.os_clients?.full_name ?? "—"}</Td>
                      <Td className="os-nums text-[12px] text-os-muted">{formatDate(trip.trip_date)}</Td>
                      <Td align="right" className="os-nums">{formatMoney(Number(trip.sell_amount), trip.currency)}</Td>
                      <Td align="right" className="os-nums text-os-muted">{formatMoney(Number(trip.paid_amount), trip.currency)}</Td>
                      <Td align="right" className="os-nums font-semibold text-os-amber">{formatMoney(trip.due, trip.currency)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="px-4 py-6 sm:px-5">
                <EmptyState title="Nothing outstanding" description="Every trip in this period has been paid in full." icon={<Icon.Check size={22} />} />
              </div>
            )}
          </Card>

          {paymentRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="Payments received" subtitle="Recorded here; collected in the tools that do collection" />
              </div>
              <Table className="rounded-none border-0">
                <thead><tr><Th>Date</Th><Th>Trip</Th><Th>Method</Th><Th>Reference</Th><Th align="right">Amount</Th></tr></thead>
                <tbody>
                  {paymentRows.map((payment) => (
                    <tr key={payment.id}>
                      <Td className="os-nums text-[12px]">{formatDate(payment.paid_on)}</Td>
                      <Td>
                        {payment.os_trips?.ref ? (
                          <Link href={`/os/trips/${payment.os_trips.ref}/costs`} className="os-nums text-[12px] font-medium text-os-gold hover:underline">{payment.os_trips.ref}</Link>
                        ) : <span className="text-os-faint">—</span>}
                      </Td>
                      <Td className="text-[12px] capitalize text-os-muted">{String(payment.method).replace(/_/g, " ")}</Td>
                      <Td className="text-[12px] text-os-muted">{payment.reference ?? "—"}</Td>
                      <Td align="right" className="os-nums font-medium">{formatMoney(Number(payment.amount), payment.currency)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3">
              <CardHeader
                title="Where the money went"
                subtitle="Actual costs recorded in this period"
                action={<span className="os-nums text-[13px] font-semibold text-os-text">{formatMoney(totalSpend, org.baseCurrency)}</span>}
              />
            </div>
            {spendRows.length ? (
              <ul>
                {spendRows.map((row) => (
                  <li key={row.category} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12.5px] capitalize text-os-text">{row.category.replace(/_/g, " ")}</span>
                      <span className="os-nums text-[12.5px] font-medium text-os-text">{formatMoney(row.amount, org.baseCurrency)}</span>
                    </div>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                      <span className="block h-full rounded-full bg-os-ink/60" style={{ width: `${(row.amount / Math.max(1, totalSpend)) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-[12.5px] text-os-muted">
                No actual costs recorded in this period. Estimates do not count here — only what was really spent.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader title="What this is, and is not" />
            <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
              This is a ledger of what happened, not a payment processor. Egypt Eye collects through the tools it already uses;
              the OS records the result so &ldquo;what is outstanding&rdquo; has an answer without anyone opening three systems.
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
              Every figure is normalised to {org.baseCurrency} using the exchange rate on file for the day it happened. Those
              rates are inserted and never updated, so last quarter&apos;s profit does not move when the pound does.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
