import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord, getTrip } from "@/lib/os/trips";
import { osdb, getOrg } from "@/lib/os/db";
import { formatMoney, marginPct } from "@/lib/os/money";
import { formatDate } from "@/lib/os/dates";
import { getPriceItems } from "@/lib/os/pricing";
import { Card, CardHeader, NoAccess, Table, Th, Td, Badge, Notice, EmptyState } from "@/components/os/ui";
import { CostForm } from "./CostForm";
import { PriceForm } from "./PriceForm";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// ESTIMATED VERSUS ACTUAL
// ---------------------------------------------------------------------------
// Two columns of the same shopping list, side by side, with the variance in
// between. That comparison is the thing that makes next quarter's estimates
// better than this quarter's, and it only works because every line stores the
// rate row it came from and the exchange rate used at the time — so nothing
// here silently changes when a price list is updated.
// ---------------------------------------------------------------------------

export default async function TripCostsPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;

  const canSeeMoney = can(actor, "trips.financials") || can(actor, "finance.view");
  if (!canSeeMoney) return <NoAccess what="this trip's money" permission="trips.financials" />;

  const upper = ref.toUpperCase();
  const [record, trip] = await Promise.all([getTripRecord(actor, upper), getTrip(actor, upper)]);
  if (!record || !trip) notFound();

  const db = osdb();
  const org = await getOrg();

  const [lines, payments, priceItems, suppliers] = await Promise.all([
    db.from("os_trip_cost_lines")
      .select("id, kind, category, label, qty, unit_amount, amount, currency, base_amount, incurred_on, payment_status, notes, os_suppliers ( name ), os_rates ( valid_from, valid_to )")
      .eq("trip_id", record.id).order("category"),
    db.from("os_payments")
      .select("id, direction, method, amount, currency, base_amount, status, reference, paid_on")
      .eq("trip_id", record.id).order("paid_on", { ascending: false }),
    can(actor, "finance.edit") ? getPriceItems() : Promise.resolve([]),
    can(actor, "finance.edit")
      ? db.from("os_suppliers").select("id, name").eq("org_id", org.id).eq("active", true).order("name")
      : Promise.resolve({ data: [] }),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const all = (lines.data ?? []) as any[];
  const paymentRows = (payments.data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const estimated = all.filter((l) => l.kind === "estimated");
  const actual = all.filter((l) => l.kind === "actual");

  const estimatedTotal = estimated.reduce((s, l) => s + Number(l.base_amount ?? 0), 0);
  const actualTotal = actual.reduce((s, l) => s + Number(l.base_amount ?? 0), 0);
  const sell = Number(record.sell_amount ?? 0);
  const paid = paymentRows.filter((p) => p.direction === "in" && p.status === "received").reduce((s, p) => s + Number(p.base_amount ?? 0), 0);
  const effectiveCost = actualTotal || estimatedTotal;
  const currency = (record.currency as string) ?? org.baseCurrency;

  // Compare category by category so the variance report says which line moved,
  // not just that the total did.
  const categories = Array.from(new Set(all.map((l) => l.category as string))).sort();
  const variance = categories.map((category) => {
    const est = estimated.filter((l) => l.category === category).reduce((s, l) => s + Number(l.base_amount ?? 0), 0);
    const act = actual.filter((l) => l.category === category).reduce((s, l) => s + Number(l.base_amount ?? 0), 0);
    return { category, estimated: est, actual: act, delta: act && est ? act - est : null };
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Money label="Selling price" value={formatMoney(sell, currency)} />
        <Money label="Estimated cost" value={formatMoney(estimatedTotal, org.baseCurrency)} />
        <Money label={actualTotal ? "Actual cost" : "Actual cost (none yet)"} value={formatMoney(actualTotal, org.baseCurrency)} />
        <Money
          label="Margin"
          value={`${formatMoney(sell - effectiveCost, currency)} · ${marginPct(sell, effectiveCost)}%`}
          tone={marginPct(sell, effectiveCost) < 22 ? "amber" : "green"}
        />
      </div>

      {sell > paid ? (
        <Notice tone="amber" title={`${formatMoney(sell - paid, currency)} still outstanding`}>
          {formatMoney(paid, currency)} received of {formatMoney(sell, currency)}.
        </Notice>
      ) : null}

      {actualTotal && estimatedTotal ? (
        <Card>
          <CardHeader
            title="Estimated versus actual"
            subtitle={
              actualTotal > estimatedTotal
                ? `This trip cost ${formatMoney(actualTotal - estimatedTotal, org.baseCurrency)} more than estimated.`
                : actualTotal < estimatedTotal
                  ? `This trip came in ${formatMoney(estimatedTotal - actualTotal, org.baseCurrency)} under estimate.`
                  : "Exactly on estimate."
            }
          />
          <div className="mt-3 space-y-1.5">
            {variance.filter((v) => v.delta !== null && Math.abs(v.delta) > 0.005).map((v) => (
              <div key={v.category} className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="capitalize text-os-muted">{v.category.replace(/_/g, " ")}</span>
                <span className="os-nums">
                  <span className="text-os-faint">{formatMoney(v.estimated, org.baseCurrency)}</span>
                  <span className="mx-1.5 text-os-faint">→</span>
                  <span className="font-medium text-os-text">{formatMoney(v.actual, org.baseCurrency)}</span>
                  <span className={`ml-2 ${(v.delta ?? 0) > 0 ? "text-os-red" : "text-os-green"}`}>
                    {(v.delta ?? 0) > 0 ? "+" : ""}{formatMoney(v.delta ?? 0, org.baseCurrency)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <CostTable title="Estimated" subtitle="What we planned to spend" lines={estimated} baseCurrency={org.baseCurrency} />
        <CostTable title="Actual" subtitle="What we really spent" lines={actual} baseCurrency={org.baseCurrency} />
      </div>

      {paymentRows.length ? (
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader title="Payments" subtitle={`${formatMoney(paid, org.baseCurrency)} received`} />
          </div>
          <Table className="rounded-none border-0">
            <thead>
              <tr><Th>Date</Th><Th>Method</Th><Th>Reference</Th><Th>Status</Th><Th align="right">Amount</Th></tr>
            </thead>
            <tbody>
              {paymentRows.map((p) => (
                <tr key={p.id}>
                  <Td className="os-nums">{formatDate(p.paid_on)}</Td>
                  <Td className="capitalize">{String(p.method).replace(/_/g, " ")}</Td>
                  <Td className="text-os-muted">{p.reference ?? "—"}</Td>
                  <Td><Badge tone={p.status === "received" ? "green" : "amber"}>{p.status}</Badge></Td>
                  <Td align="right" className="os-nums font-medium">{formatMoney(Number(p.amount), p.currency)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {can(actor, "finance.edit") || can(actor, "trips.financials") ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {can(actor, "trips.financials") ? (
            <Card>
              <CardHeader title="Selling price" subtitle="What the client is paying." />
              <div className="mt-3">
                <PriceForm tripRef={upper} current={sell} currency={currency} />
              </div>
            </Card>
          ) : null}
          {can(actor, "finance.edit") ? (
            <Card>
              <CardHeader title="Record a cost" subtitle="Estimated while planning, actual after the trip." />
              <div className="mt-3">
                <CostForm
                  tripRef={upper}
                  priceItems={priceItems.map((p) => ({ id: p.id, name: p.name, category: p.category, unitLabel: p.unitLabel }))}
                  suppliers={(suppliers.data ?? []).map((s) => ({ id: s.id as string, name: s.name as string }))}
                  baseCurrency={org.baseCurrency}
                />
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Money({ label, value, tone }: { label: string; value: string; tone?: "amber" | "green" }) {
  return (
    <div className="rounded-xl border border-os-line bg-os-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{label}</p>
      <p className={`os-nums mt-1 text-[19px] font-semibold ${tone === "amber" ? "text-os-amber" : tone === "green" ? "text-os-green" : "text-os-text"}`}>
        {value}
      </p>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CostTable({ title, subtitle, lines, baseCurrency }: { title: string; subtitle: string; lines: any[]; baseCurrency: string }) {
  const total = lines.reduce((s, l) => s + Number(l.base_amount ?? 0), 0);
  return (
    <Card padded={false}>
      <div className="border-b border-os-line px-4 py-3 sm:px-5">
        <CardHeader
          title={title}
          subtitle={subtitle}
          action={<span className="os-nums text-[14px] font-semibold text-os-text">{formatMoney(total, baseCurrency)}</span>}
        />
      </div>
      {lines.length ? (
        <ul>
          {lines.map((line) => (
            <li key={line.id} className="flex items-start justify-between gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-os-text">{line.label}</p>
                <p className="text-[11.5px] text-os-faint">
                  <span className="capitalize">{String(line.category).replace(/_/g, " ")}</span>
                  {Number(line.qty) !== 1 ? ` · ${line.qty} × ${formatMoney(Number(line.unit_amount), line.currency)}` : ""}
                  {line.os_suppliers?.name ? ` · ${line.os_suppliers.name}` : ""}
                  {line.incurred_on ? ` · ${formatDate(line.incurred_on)}` : ""}
                </p>
                {line.os_rates?.valid_from ? (
                  <p className="text-[10.5px] text-os-faint" title="The price-book rate this line resolved from, and the window it was valid for.">
                    rate {line.os_rates.valid_from} → {line.os_rates.valid_to ?? "ongoing"}
                  </p>
                ) : null}
              </div>
              <span className="os-nums shrink-0 text-[13px] font-medium text-os-text">{formatMoney(Number(line.amount), line.currency)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-6 sm:px-5">
          <EmptyState
            title={`No ${title.toLowerCase()} costs`}
            description={title === "Actual" ? "Record what was really spent after the trip runs — that is what makes the next estimate accurate." : "Add the lines this trip is expected to cost."}
            icon={<Icon.Money size={22} />}
          />
        </div>
      )}
    </Card>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
