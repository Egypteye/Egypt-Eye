"use client";

import { useState } from "react";
import { addCostLine } from "@/lib/os/actions/records";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

export function CostForm({
  tripRef, priceItems, suppliers, baseCurrency,
}: {
  tripRef: string;
  priceItems: { id: string; name: string; category: string; unitLabel: string }[];
  suppliers: { id: string; name: string }[];
  baseCurrency: string;
}) {
  const [form, setForm] = useState({
    kind: "actual" as "estimated" | "actual",
    priceItemId: "",
    label: "",
    category: "other",
    qty: "1",
    unitAmount: "",
    currency: baseCurrency,
    supplierId: "",
    notes: "",
  });
  const action = useAction(addCostLine, { onSuccess: () => setForm({ ...form, label: "", unitAmount: "", notes: "", priceItemId: "" }) });

  function pickItem(id: string) {
    const item = priceItems.find((p) => p.id === id);
    setForm({ ...form, priceItemId: id, label: item?.name ?? form.label, category: item?.category ?? form.category });
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kind">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "estimated" | "actual" })} className={selectClass}>
            <option value="estimated">Estimated</option>
            <option value="actual">Actual</option>
          </select>
        </Field>
        <Field label="From the price book" hint="Optional. Picking one fills in the label and category.">
          <select value={form.priceItemId} onChange={(e) => pickItem(e.target.value)} className={selectClass}>
            <option value="">Not from the price book</option>
            {priceItems.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="What was it" required>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputClass} placeholder="Supplier 4x4 transfer" />
          </Field>
        </div>
        <Field label="Quantity">
          <input type="number" min="0" step="0.5" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Unit amount" required>
          <input type="number" min="0" step="0.01" value={form.unitAmount} onChange={(e) => setForm({ ...form, unitAmount: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Currency" hint={`Converted to ${baseCurrency} using the rate on file for the day it was incurred.`}>
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={selectClass}>
            {["USD", "EGP", "EUR", "GBP", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Supplier">
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className={selectClass}>
            <option value="">None</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
      </div>

      <button
        onClick={() => action.run({
          tripRef,
          kind: form.kind,
          category: form.category,
          label: form.label,
          qty: Number(form.qty) || 1,
          unitAmount: Number(form.unitAmount) || 0,
          currency: form.currency,
          supplierId: form.supplierId || null,
          priceItemId: form.priceItemId || null,
          notes: form.notes || null,
        })}
        disabled={!form.label.trim() || !form.unitAmount || action.pending}
        className={`mt-3 ${buttonClass.primary}`}
      >
        {action.pending ? <Spinner /> : null}Record cost
      </button>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
