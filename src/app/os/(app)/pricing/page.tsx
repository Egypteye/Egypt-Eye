import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { getTiers } from "@/lib/os/pricing";
import { todayInCairo, formatDate } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, Table, Th, Td, Notice } from "@/components/os/ui";
import { RateEditor } from "./RateEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Price book" };

// ---------------------------------------------------------------------------
// THE PRICE BOOK
// ---------------------------------------------------------------------------
// Every number the company sells, in one place, with the dates each was in
// force. Changing a price never edits a row: it closes the old window and
// opens a new one, so a trip costed in March keeps March's number forever and
// this year's report does not silently change when a supplier raises a rate.
// ---------------------------------------------------------------------------

export default async function PricingPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "pricing.view")) return <NoAccess what="the price book" permission="pricing.view" />;

  const db = osdb();
  const org = await getOrg();
  const today = todayInCairo();

  const [{ data: items }, { data: rates }, tiers, { data: fx }] = await Promise.all([
    db.from("os_price_items").select("id, key, name, category, unit_label, description, active").eq("org_id", org.id).order("sort_order"),
    db.from("os_rates").select("id, price_item_id, tier, cost_amount, sell_amount, currency, valid_from, valid_to, note").eq("org_id", org.id).order("valid_from", { ascending: false }),
    getTiers(),
    db.from("os_fx_rates").select("base_currency, quote_currency, rate, as_of").order("as_of", { ascending: false }).limit(12),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const itemRows = (items ?? []) as any[];
  const rateRows = (rates ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const ratesByItem = new Map<string, typeof rateRows>();
  for (const rate of rateRows) {
    const list = ratesByItem.get(rate.price_item_id) ?? [];
    list.push(rate);
    ratesByItem.set(rate.price_item_id, list);
  }

  const isCurrent = (rate: { valid_from: string; valid_to: string | null }) =>
    rate.valid_from <= today && (!rate.valid_to || rate.valid_to >= today);

  const withoutCurrentRate = itemRows.filter((item) => !(ratesByItem.get(item.id) ?? []).some(isCurrent));
  const categories = Array.from(new Set(itemRows.map((i) => i.category as string))).sort();
  const canEdit = can(actor, "pricing.edit");

  return (
    <>
      <PageHeader
        eyebrow="Commercial"
        title="Price book"
        description="Every rate, effective-dated. Nothing here is ever overwritten — a new price opens a new window and history keeps its own."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Priced items" value={itemRows.length} />
        <Stat label="Rate rows" value={rateRows.length} sub="Including superseded history" />
        <Stat label="Missing a current rate" value={withoutCurrentRate.length} tone={withoutCurrentRate.length ? "amber" : undefined} />
        <Stat label="Tiers" value={tiers.length} sub={tiers.map((t) => `${t.label} +${t.markupPct}%`).join(" · ")} />
      </div>

      {withoutCurrentRate.length ? (
        <div className="mb-5">
          <Notice tone="amber" title={`${withoutCurrentRate.length} item${withoutCurrentRate.length === 1 ? " has" : "s have"} no rate in force today`}>
            {withoutCurrentRate.map((i) => i.name).join(", ")}. The calculator will refuse to price these rather than guess.
          </Notice>
        </div>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Card key={tier.key}>
            <p className="text-[13px] font-semibold text-os-text">{tier.label}</p>
            <p className="os-nums mt-1 text-[19px] font-semibold text-os-text">+{tier.markupPct}%</p>
            <p className="text-[11.5px] text-os-muted">Margin floor {tier.minMarginPct}%</p>
            {tier.description ? <p className="mt-1.5 text-[11.5px] leading-snug text-os-faint">{tier.description}</p> : null}
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const group = itemRows.filter((i) => i.category === category);
          return (
            <section key={category}>
              <h2 className="mb-2.5 text-[15px] font-semibold capitalize text-os-text">{category.replace(/_/g, " ")}</h2>
              <Table>
                <thead>
                  <tr>
                    <Th>Item</Th><Th>Unit</Th><Th>Tier</Th>
                    <Th align="right">Cost</Th><Th align="right">Sell</Th>
                    <Th>In force</Th>
                    {canEdit ? <Th /> : null}
                  </tr>
                </thead>
                <tbody>
                  {group.map((item) => {
                    const itemRates = ratesByItem.get(item.id) ?? [];
                    const current = itemRates.filter(isCurrent);
                    const historic = itemRates.filter((r) => !isCurrent(r));
                    return [
                      ...(current.length ? current : [null]).map((rate, i) => (
                        <tr key={`${item.id}-current-${i}`} className="transition hover:bg-black/[0.02]">
                          {i === 0 ? (
                            <Td className="align-top">
                              <span className="block text-[13px] font-medium text-os-text">{item.name}</span>
                              {item.description ? <span className="block text-[11px] text-os-faint">{item.description}</span> : null}
                            </Td>
                          ) : <Td />}
                          <Td className="text-[12px] text-os-muted">{item.unit_label}</Td>
                          <Td>{rate ? <Badge tone={rate.tier === "any" ? "neutral" : "gold"}>{rate.tier}</Badge> : null}</Td>
                          <Td align="right" className="os-nums">{rate ? formatMoney(Number(rate.cost_amount), rate.currency) : <span className="text-os-red">no rate</span>}</Td>
                          <Td align="right" className="os-nums">{rate?.sell_amount ? formatMoney(Number(rate.sell_amount), rate.currency) : <span className="text-os-faint">from markup</span>}</Td>
                          <Td className="os-nums text-[11.5px] text-os-muted">
                            {rate ? `${formatDate(rate.valid_from)} → ${rate.valid_to ? formatDate(rate.valid_to) : "ongoing"}` : "—"}
                          </Td>
                          {canEdit && i === 0 ? (
                            <Td align="right" className="align-top">
                              <RateEditor
                                priceItemId={item.id}
                                itemName={item.name}
                                currentCost={rate ? Number(rate.cost_amount) : 0}
                                currentSell={rate?.sell_amount ? Number(rate.sell_amount) : null}
                                currency={rate?.currency ?? "USD"}
                                today={today}
                                tiers={tiers.map((t) => ({ key: t.key, label: t.label }))}
                              />
                            </Td>
                          ) : canEdit ? <Td /> : null}
                        </tr>
                      )),
                      ...historic.slice(0, 3).map((rate) => (
                        <tr key={rate.id} className="opacity-55">
                          <Td />
                          <Td />
                          <Td><Badge tone="neutral">{rate.tier}</Badge></Td>
                          <Td align="right" className="os-nums">{formatMoney(Number(rate.cost_amount), rate.currency)}</Td>
                          <Td align="right" className="os-nums">{rate.sell_amount ? formatMoney(Number(rate.sell_amount), rate.currency) : "—"}</Td>
                          <Td className="os-nums text-[11.5px] text-os-faint">
                            {formatDate(rate.valid_from)} → {rate.valid_to ? formatDate(rate.valid_to) : "ongoing"}
                            {rate.note ? ` · ${rate.note}` : ""}
                          </Td>
                          {canEdit ? <Td /> : null}
                        </tr>
                      )),
                    ];
                  })}
                </tbody>
              </Table>
            </section>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader title="Exchange rates on file" subtitle="Dated, never updated. A trip costed at one rate keeps it forever." />
        <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {(fx ?? []).map((rate, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className="text-os-muted">{rate.base_currency} → {rate.quote_currency}</span>
              <span className="os-nums">
                <span className="font-medium text-os-text">{Number(rate.rate).toFixed(4)}</span>
                <span className="ml-2 text-os-faint">{formatDate(rate.as_of as string)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-os-faint">
          The OS refuses to record a cost in a currency it has no dated rate for, rather than assuming 1.0. A guessed exchange
          rate silently corrupts every report that touches the trip.
        </p>
      </Card>
    </>
  );
}
