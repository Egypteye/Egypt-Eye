"use client";

import { useState } from "react";
import { setTripPrice } from "@/lib/os/actions/records";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

export function PriceForm({ tripRef, current, currency }: { tripRef: string; current: number; currency: string }) {
  const [amount, setAmount] = useState(String(current || ""));
  const [ccy, setCcy] = useState(currency);
  const action = useAction(setTripPrice);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field label="Selling price" required>
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Currency">
          <select value={ccy} onChange={(e) => setCcy(e.target.value)} className={selectClass}>
            {["USD", "EUR", "GBP", "EGP", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <button
        onClick={() => action.run(tripRef, Number(amount) || 0, ccy)}
        disabled={action.pending}
        className={`mt-3 ${buttonClass.primary}`}
      >
        {action.pending ? <Spinner /> : null}Save price
      </button>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
