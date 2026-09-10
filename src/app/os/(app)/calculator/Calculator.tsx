"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, Field, inputClass, selectClass, buttonClass, Notice } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { Spinner } from "@/components/os/action";

type Item = { id: string; key: string; name: string; category: string; unitLabel: string };
type Tier = { key: string; label: string; markupPct: number; minMarginPct: number; description: string | null };

type Line = { priceItemId: string; qty: number };

type Quote = {
  lines: {
    priceItemId: string; label: string; category: string; unitLabel: string; qty: number;
    unitCost: number; unitSell: number; cost: number; sell: number; currency: string;
    rateWindow: string | null; missing: boolean;
  }[];
  costTotal: number; sellTotal: number; marginAmount: number; marginPct: number; markupPct: number;
  belowFloor: boolean; warnings: string[];
};

export function Calculator({
  items, tiers, today, showMargins,
}: {
  items: Item[];
  tiers: Tier[];
  today: string;
  showMargins: boolean;
}) {
  const [tripDate, setTripDate] = useState(today);
  const [tier, setTier] = useState(tiers[0]?.key ?? "standard");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [sellOverride, setSellOverride] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, setPending] = useState(false);

  const guests = adults + children;
  const byCategory = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [items]);

  // Recalculate whenever anything that affects the price changes. The maths
  // runs on the server so the rate resolution is the same code the trip cost
  // lines use — a calculator with its own copy of the pricing rules is a
  // calculator that eventually disagrees with the invoice.
  useEffect(() => {
    if (!lines.length) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPending(true);
      try {
        const response = await fetch("/api/os/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines, tripDate, tier, sellOverride: sellOverride ? Number(sellOverride) : null }),
        });
        if (!response.ok) throw new Error("calculate failed");
        const body = (await response.json()) as Quote;
        if (!cancelled) setQuote(body);
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setPending(false);
      }
    }, 220);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [lines, tripDate, tier, sellOverride]);

  function addItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const perPerson = item.unitLabel.includes("person");
    setLines((prev) =>
      prev.some((l) => l.priceItemId === id)
        ? prev
        : [...prev, { priceItemId: id, qty: perPerson ? Math.max(1, guests) : 1 }],
    );
  }

  // With nothing selected there is nothing to price, whatever the last
  // response happened to be — derived rather than cleared in the effect.
  const currentQuote = lines.length ? quote : null;
  const activeTier = tiers.find((t) => t.key === tier);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="The trip" subtitle="Date and tier decide which rates apply." />
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Trip date" required>
            <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Tier">
            <select value={tier} onChange={(e) => setTier(e.target.value)} className={selectClass}>
              {tiers.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Adults"><input type="number" min="0" value={adults} onChange={(e) => setAdults(Number(e.target.value) || 0)} className={inputClass} /></Field>
          <Field label="Children"><input type="number" min="0" value={children} onChange={(e) => setChildren(Number(e.target.value) || 0)} className={inputClass} /></Field>
        </div>
        {activeTier?.description ? (
          <p className="mt-2 text-[12px] text-os-muted">{activeTier.description}</p>
        ) : null}
      </Card>

      <Card>
        <CardHeader title="What is included" subtitle="Add what the trip actually needs. Per-person items default to the party size." />
        <div className="mt-3 space-y-3">
          {Array.from(byCategory.entries()).map(([category, categoryItems]) => (
            <div key={category}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{category.replace(/_/g, " ")}</p>
              <div className="flex flex-wrap gap-1.5">
                {categoryItems.map((item) => {
                  const added = lines.some((l) => l.priceItemId === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => added ? setLines((prev) => prev.filter((l) => l.priceItemId !== item.id)) : addItem(item.id)}
                      className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition ${
                        added ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
                      }`}
                    >
                      {added ? "✓ " : "+ "}{item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {lines.length ? (
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="The quote"
              subtitle={`Rates effective on ${tripDate}`}
              action={pending ? <Spinner /> : null}
            />
          </div>

          <ul>
            {(currentQuote?.lines ?? []).map((line) => (
              <li key={line.priceItemId} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-os-text">{line.label}</p>
                  <p className="text-[11.5px] text-os-faint">
                    {line.unitLabel}
                    {line.rateWindow ? ` · ${line.rateWindow}` : ""}
                    {line.missing ? <span className="text-os-red"> · no rate on file for this date</span> : null}
                  </p>
                </div>
                <input
                  type="number" min="0" step="1" value={line.qty}
                  onChange={(e) => {
                    const qty = Number(e.target.value) || 0;
                    setLines((prev) => prev.map((l) => l.priceItemId === line.priceItemId ? { ...l, qty } : l));
                  }}
                  className="w-16 shrink-0 rounded-lg border border-os-line-strong px-2 py-1 text-right text-[12.5px]"
                  aria-label={`Quantity for ${line.label}`}
                />
                <div className="w-24 shrink-0 text-right">
                  {showMargins ? (
                    <p className="os-nums text-[11.5px] text-os-faint">cost {line.cost.toFixed(2)}</p>
                  ) : null}
                  <p className="os-nums text-[13px] font-medium text-os-text">{line.sell.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setLines((prev) => prev.filter((l) => l.priceItemId !== line.priceItemId))}
                  className="shrink-0 text-os-faint hover:text-os-red"
                  aria-label={`Remove ${line.label}`}
                >
                  <Icon.Close size={14} />
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-os-line px-4 py-3.5 sm:px-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Override the selling price" hint="If the client agreed a different number.">
                <input
                  type="number" min="0" step="0.01" value={sellOverride}
                  onChange={(e) => setSellOverride(e.target.value)}
                  placeholder={currentQuote ? currentQuote.sellTotal.toFixed(2) : "0.00"}
                  className={inputClass}
                />
              </Field>
              <div className="flex flex-col justify-end">
                {showMargins ? (
                  <>
                    <Row label="Cost" value={currentQuote?.costTotal ?? 0} />
                    <Row label="Sell" value={currentQuote?.sellTotal ?? 0} strong />
                    <Row label="Profit" value={currentQuote?.marginAmount ?? 0} strong tone={currentQuote?.belowFloor ? "amber" : "green"} />
                    <div className="mt-1 flex items-baseline justify-between text-[13px]">
                      <span className="text-os-muted">Margin</span>
                      <span className={`os-nums font-semibold ${currentQuote?.belowFloor ? "text-os-amber" : "text-os-green"}`}>
                        {currentQuote?.marginPct ?? 0}%
                        {activeTier ? <span className="ml-1.5 text-[11px] font-normal text-os-faint">floor {activeTier.minMarginPct}%</span> : null}
                      </span>
                    </div>
                  </>
                ) : (
                  <Row label="Selling price" value={currentQuote?.sellTotal ?? 0} strong />
                )}
              </div>
            </div>

            {currentQuote?.warnings.length ? (
              <div className="mt-3 space-y-2">
                {currentQuote.warnings.map((warning, i) => (
                  <Notice key={i} tone={warning.includes("no rate") ? "red" : "amber"} title={warning} />
                ))}
              </div>
            ) : null}

            {currentQuote && !currentQuote.warnings.length && showMargins ? (
              <p className="mt-3 text-[12px] text-os-muted">
                {guests} guest{guests === 1 ? "" : "s"} · {(currentQuote.sellTotal / Math.max(1, guests)).toFixed(2)} per person ·{" "}
                {currentQuote.markupPct}% markup on cost.
              </p>
            ) : null}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="py-6 text-center text-[13px] text-os-muted">
            Add what the trip includes above and the quote builds itself.
          </p>
        </Card>
      )}

      {lines.length ? (
        <div className="flex flex-wrap gap-2">
          <Link href="/os/trips/new" className={buttonClass.gold}>Create the trip</Link>
          <button onClick={() => { setLines([]); setSellOverride(""); }} className={buttonClass.ghost}>Start again</button>
          <span className="self-center text-[12px] text-os-faint">
            Nothing here is saved. Creating the trip is what makes it real.
          </span>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: number; strong?: boolean; tone?: "green" | "amber" }) {
  return (
    <div className="flex items-baseline justify-between text-[13px]">
      <span className="text-os-muted">{label}</span>
      <span className={`os-nums ${strong ? "font-semibold" : ""} ${tone === "amber" ? "text-os-amber" : tone === "green" ? "text-os-green" : "text-os-text"}`}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}
