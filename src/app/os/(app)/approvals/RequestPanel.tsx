"use client";

import { useState } from "react";
import { requestApproval } from "@/lib/os/actions/work";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

const KINDS = [
  { key: "extra_cost", label: "Unplanned cost" },
  { key: "discount", label: "Discount" },
  { key: "refund", label: "Refund" },
  { key: "free_service", label: "Complimentary service" },
  { key: "vip_upgrade", label: "VIP upgrade at our cost" },
  { key: "supplier_change", label: "Changing a confirmed supplier" },
  { key: "cancellation", label: "Cancelling a confirmed trip" },
  { key: "special_request", label: "Special request" },
  { key: "other", label: "Something else" },
];

export function RequestPanel() {
  const [form, setForm] = useState({ kind: "extra_cost", title: "", detail: "", amount: "", currency: "USD", tripRef: "" });
  const action = useAction(requestApproval, { onSuccess: () => setForm({ ...form, title: "", detail: "", amount: "", tripRef: "" }) });

  return (
    <div>
      <div className="space-y-3">
        <Field label="What kind">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass}>
            {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </Field>
        <Field label="In one line" required>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Supplier 4x4 for tomorrow's VIP shoot" />
        </Field>
        <Field label="Why, and what happens if we do not" required hint="The person deciding has only what you write here. Write it as if they know nothing about the trip.">
          <textarea rows={3} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className={inputClass} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Amount" hint="If it costs money.">
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Currency">
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={selectClass}>
              {["USD", "EGP", "EUR", "GBP", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Trip reference" hint="Optional, but it attaches the decision to the trip forever.">
          <input value={form.tripRef} onChange={(e) => setForm({ ...form, tripRef: e.target.value.toUpperCase() })} className={inputClass} placeholder="EE-10011" />
        </Field>
      </div>

      <button
        onClick={() => action.run({
          kind: form.kind, title: form.title, detail: form.detail,
          amount: form.amount ? Number(form.amount) : null,
          currency: form.currency, tripRef: form.tripRef || null,
        })}
        disabled={!form.title.trim() || !form.detail.trim() || action.pending}
        className={`mt-3 ${buttonClass.primary}`}
      >
        {action.pending ? <Spinner /> : null}Raise it
      </button>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
