"use client";

import { useState } from "react";
import { createQuoteForDeal, sendQuote, requestQuoteDiscount, decideQuote } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Card, CardHeader, Badge, Field, inputClass, selectClass, buttonClass, Notice, EmptyState } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

// ---------------------------------------------------------------------------
// QUOTING FROM A DEAL
// ---------------------------------------------------------------------------
// The browser picks items and quantities. It never sends a price — the server
// resolves every rate from the price book at the TRAVEL date and computes the
// totals itself, so a tampered payload cannot produce a cheaper quote and a
// stale page cannot produce a stale one.
//
// The discount rule is shown here and enforced there. Both read the same
// quoteSendability(), so the disabled button and the refusal agree; the
// button was never the boundary.
// ---------------------------------------------------------------------------

type PriceItem = { id: string; name: string; category: string; unitLabel: string };

type Quote = {
  id: string;
  ref: string;
  title: string | null;
  status: string;
  tier: string;
  tripDate: string | null;
  currency: string;
  sellTotal: number;
  costTotal: number | null;
  marginPct: number | null;
  listTotal: number | null;
  discountPct: number | null;
  validUntil: string | null;
  sentAt: string | null;
  lines: { label: string; category: string; qty: number; unitSell: number; sell: number; rateWindow: string | null }[];
  commission: { pct: number | null; amount: number | null; describes: string; agreementRef: string } | null;
  sendable: boolean;
  sendReason: string | null;
  approvalRef: string | null;
  approvalStatus: string | null;
};

export function QuotePanel({
  dealId,
  dealRef,
  quotes,
  priceItems,
  tiers,
  defaultTripDate,
  defaultGuests,
  threshold,
  can,
}: {
  dealId: string;
  dealRef: string;
  quotes: Quote[];
  priceItems: PriceItem[];
  tiers: { key: string; label: string }[];
  defaultTripDate: string;
  defaultGuests: number;
  threshold: number;
  can: { build: boolean; send: boolean; discount: boolean; margins: boolean };
}) {
  const [building, setBuilding] = useState(false);
  const [lines, setLines] = useState<{ priceItemId: string; qty: string }[]>([{ priceItemId: "", qty: "1" }]);
  const [form, setForm] = useState({
    title: "",
    tier: tiers[0]?.key ?? "standard",
    tripDate: defaultTripDate,
    guestsAdults: String(defaultGuests || 2),
    guestsChildren: "0",
    sellOverride: "",
    validUntil: "",
    notes: "",
  });
  const [discountReason, setDiscountReason] = useState<Record<string, string>>({});
  const [openReason, setOpenReason] = useState<string | null>(null);

  const create = useAction(createQuoteForDeal, { onSuccess: () => { setBuilding(false); setLines([{ priceItemId: "", qty: "1" }]); } });
  const send = useAction(sendQuote);
  const askDiscount = useAction(requestQuoteDiscount, { onSuccess: () => setOpenReason(null) });
  const decide = useAction(decideQuote);

  const usableLines = lines.filter((l) => l.priceItemId && Number(l.qty) > 0);
  const byCategory = priceItems.reduce<Record<string, PriceItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <Card padded={false}>
      <div className="border-b border-os-line px-4 py-3 sm:px-5">
        <CardHeader
          title="Quotes"
          subtitle="Priced from the price book at the rates in force on the travel date — not today's."
          action={
            can.build && !building ? (
              <button onClick={() => setBuilding(true)} className={buttonClass.secondary}>
                <Icon.Plus size={14} />Build one
              </button>
            ) : null
          }
        />
      </div>

      {building ? (
        <div className="border-b border-os-line bg-os-card p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Travel date" required hint="Rates are resolved against this, not against today.">
              <input type="date" value={form.tripDate} onChange={(e) => setForm({ ...form, tripDate: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Tier">
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={selectClass}>
                {tiers.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Adults">
                <input inputMode="numeric" value={form.guestsAdults} onChange={(e) => setForm({ ...form, guestsAdults: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Children">
                <input inputMode="numeric" value={form.guestsChildren} onChange={(e) => setForm({ ...form, guestsChildren: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </div>

          <p className="mt-4 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">What is included</p>
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex gap-2">
                <select
                  value={line.priceItemId}
                  onChange={(e) => setLines(lines.map((l, i) => (i === index ? { ...l, priceItemId: e.target.value } : l)))}
                  className={`${selectClass} flex-1`}
                >
                  <option value="">Choose an item from the price book</option>
                  {Object.entries(byCategory).map(([category, items]) => (
                    <optgroup key={category} label={category.replace(/_/g, " ")}>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}{item.unitLabel ? ` (${item.unitLabel})` : ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <input
                  inputMode="decimal"
                  value={line.qty}
                  onChange={(e) => setLines(lines.map((l, i) => (i === index ? { ...l, qty: e.target.value } : l)))}
                  className={`${inputClass} w-20`}
                  aria-label="Quantity"
                />
                <button
                  onClick={() => setLines(lines.length > 1 ? lines.filter((_, i) => i !== index) : lines)}
                  className="shrink-0 rounded-lg px-2 text-os-faint transition hover:text-os-red"
                  aria-label="Remove line"
                >
                  <Icon.Close size={15} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setLines([...lines, { priceItemId: "", qty: "1" }])}
              className="text-[12.5px] font-medium text-os-gold hover:underline"
            >
              Add another line
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="Title">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Standard package" />
            </Field>
            <Field
              label="Price the client pays"
              hint={`Leave blank to use the price book total. ${threshold}% or more below it needs an approval before sending.`}
            >
              <input inputMode="decimal" value={form.sellOverride} onChange={(e) => setForm({ ...form, sellOverride: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Valid until">
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className={inputClass} />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => create.run({
                dealId,
                title: form.title || null,
                tier: form.tier,
                tripDate: form.tripDate,
                guestsAdults: Number(form.guestsAdults) || 1,
                guestsChildren: Number(form.guestsChildren) || 0,
                lines: usableLines.map((l) => ({ priceItemId: l.priceItemId, qty: Number(l.qty) })),
                sellOverride: form.sellOverride.trim() ? Number(form.sellOverride) : null,
                validUntil: form.validUntil || null,
                notes: form.notes || null,
              })}
              disabled={!usableLines.length || !form.tripDate || create.pending}
              className={buttonClass.gold}
            >
              {create.pending ? <Spinner /> : null}Price it
            </button>
            <button onClick={() => setBuilding(false)} className={buttonClass.ghost}>Cancel</button>
          </div>
          <ActionFeedback result={create.result} onDismiss={create.clear} />
        </div>
      ) : null}

      {quotes.length ? (
        <ul>
          {quotes.map((quote) => (
            <li key={quote.id} className="border-b border-os-line/60 p-4 last:border-0 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="min-w-0">
                  <span className="os-nums text-[13px] font-semibold text-os-text">{quote.ref}</span>
                  {quote.title ? <span className="ml-1.5 text-[12.5px] text-os-muted">{quote.title}</span> : null}
                </span>
                <Badge tone={quote.status === "accepted" ? "green" : quote.status === "declined" ? "red" : quote.status === "sent" ? "blue" : "neutral"}>
                  {quote.status}
                </Badge>
              </div>

              <p className="os-nums mt-1 text-[15px] font-semibold text-os-text">
                {quote.currency} {quote.sellTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {quote.discountPct ? (
                  <span className="ml-2 text-[11.5px] font-medium text-os-amber">
                    {quote.discountPct}% below the price book
                    {quote.listTotal ? ` (${quote.currency} ${quote.listTotal.toLocaleString()})` : ""}
                  </span>
                ) : null}
              </p>
              <p className="os-nums text-[11.5px] text-os-faint">
                {quote.tier} · travelling {quote.tripDate ?? "—"}
                {quote.marginPct != null ? ` · ${quote.marginPct}% margin` : ""}
                {quote.validUntil ? ` · valid to ${quote.validUntil}` : ""}
              </p>

              {quote.lines.length ? (
                <ul className="mt-2.5 space-y-1">
                  {quote.lines.map((line, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3 text-[12px]">
                      <span className="min-w-0 text-os-muted">
                        {line.qty} × {line.label}
                        {line.rateWindow ? (
                          <span className="block text-[10.5px] text-os-faint">from the rate {line.rateWindow}</span>
                        ) : null}
                      </span>
                      <span className="os-nums shrink-0 text-os-text">{line.sell.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {quote.commission ? (
                <p className="mt-2.5 rounded-lg bg-black/[0.03] px-3 py-2 text-[11.5px] leading-relaxed text-os-muted">
                  Under {quote.commission.agreementRef}: {quote.commission.describes}
                  {quote.commission.amount != null
                    ? ` — ${quote.currency} ${quote.commission.amount.toFixed(2)} to the partner, at the rate in force on ${quote.tripDate}.`
                    : "."}
                </p>
              ) : null}

              {quote.status === "draft" && !quote.sendable && quote.sendReason ? (
                <div className="mt-3">
                  <Notice tone="amber" title="This cannot be sent yet">{quote.sendReason}</Notice>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {can.send && quote.status === "draft" && quote.sendable ? (
                  <button onClick={() => send.run(quote.id)} disabled={send.pending} className={buttonClass.gold}>
                    {send.pending ? <Spinner /> : null}Mark it sent
                  </button>
                ) : null}
                {can.discount && quote.status === "draft" && !quote.sendable && quote.approvalStatus !== "pending" ? (
                  <button onClick={() => setOpenReason(openReason === quote.id ? null : quote.id)} className={buttonClass.secondary}>
                    Ask for approval
                  </button>
                ) : null}
                {can.send && quote.status === "sent" ? (
                  <>
                    <button onClick={() => decide.run(quote.id, "accepted", "")} disabled={decide.pending} className={buttonClass.gold}>
                      They accepted
                    </button>
                    <button onClick={() => decide.run(quote.id, "declined", "")} disabled={decide.pending} className={buttonClass.secondary}>
                      They declined
                    </button>
                  </>
                ) : null}
              </div>

              {openReason === quote.id ? (
                <div className="mt-3 rounded-lg border border-os-line bg-os-card p-3">
                  <Field label="Why this discount is worth giving" required hint="The person deciding has only what you write here.">
                    <textarea
                      rows={2}
                      value={discountReason[quote.id] ?? ""}
                      onChange={(e) => setDiscountReason({ ...discountReason, [quote.id]: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => askDiscount.run(quote.id, discountReason[quote.id] ?? "")}
                      disabled={!(discountReason[quote.id] ?? "").trim() || askDiscount.pending}
                      className={buttonClass.primary}
                    >
                      {askDiscount.pending ? <Spinner /> : null}Raise it
                    </button>
                    <button onClick={() => setOpenReason(null)} className={buttonClass.ghost}>Cancel</button>
                  </div>
                  <ActionFeedback result={askDiscount.result} onDismiss={askDiscount.clear} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : !building ? (
        <div className="p-4">
          <EmptyState
            title="Nothing quoted yet"
            description={`${dealRef} cannot leave the quoting stage until a priced proposal exists. Building one prices it from the price book at the travel date.`}
            icon={<Icon.Calculator size={24} />}
            action={can.build ? <button onClick={() => setBuilding(true)} className={buttonClass.gold}>Build a quote</button> : undefined}
          />
        </div>
      ) : null}

      <ActionFeedback result={send.result} onDismiss={send.clear} />
      <ActionFeedback result={decide.result} onDismiss={decide.clear} />
    </Card>
  );
}
