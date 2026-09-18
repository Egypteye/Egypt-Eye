"use client";

import { useState } from "react";
import { changeRate } from "@/lib/os/actions/records";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { inputClass, selectClass, buttonClass } from "@/components/os/ui";

// Changing a price. The wording is deliberate — "new price from" rather than
// "edit price" — because that is what actually happens: a new dated row, with
// the old one closed the day before.
export function RateEditor({
  priceItemId, itemName, currentCost, currentSell, currency, today, tiers,
}: {
  priceItemId: string;
  itemName: string;
  currentCost: number;
  currentSell: number | null;
  currency: string;
  today: string;
  tiers: { key: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tier: "any", cost: String(currentCost || ""), sell: currentSell ? String(currentSell) : "",
    currency, effectiveFrom: today, note: "",
  });
  const action = useAction(changeRate, { onSuccess: () => setOpen(false) });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[12px] font-medium text-os-gold hover:underline">
        New price
      </button>
    );
  }

  return (
    <div className="w-[260px] rounded-lg border border-os-line bg-white p-3 text-left shadow-lg">
      <p className="text-[12.5px] font-semibold text-os-text">New price for {itemName}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-os-muted">
        The current rate closes the day before this date. Trips already costed keep their number.
      </p>

      <div className="mt-2.5 space-y-2">
        <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={`${selectClass} py-1.5 text-[12.5px]`}>
          <option value="any">All tiers</option>
          {tiers.map((t) => <option key={t.key} value={t.key}>{t.label} only</option>)}
        </select>
        <input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Cost" className={`${inputClass} py-1.5 text-[12.5px]`} />
        <input type="number" min="0" step="0.01" value={form.sell} onChange={(e) => setForm({ ...form, sell: e.target.value })} placeholder="Sell (blank = use tier markup)" className={`${inputClass} py-1.5 text-[12.5px]`} />
        <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={`${selectClass} py-1.5 text-[12.5px]`}>
          {["USD", "EGP", "EUR", "GBP", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className={`${inputClass} py-1.5 text-[12.5px]`} />
        <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Why (e.g. supplier raised it)" className={`${inputClass} py-1.5 text-[12.5px]`} />
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          onClick={() => action.run({
            priceItemId, tier: form.tier, cost: Number(form.cost) || 0,
            sell: form.sell ? Number(form.sell) : null, currency: form.currency,
            effectiveFrom: form.effectiveFrom, note: form.note || undefined,
          })}
          disabled={!form.cost || action.pending}
          className={`${buttonClass.primary} px-2.5 py-1.5 text-[12px]`}
        >
          {action.pending ? <Spinner size={12} /> : null}Save
        </button>
        <button onClick={() => setOpen(false)} className={`${buttonClass.ghost} px-2 py-1.5 text-[12px]`}>Cancel</button>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
