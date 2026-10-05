"use client";

import { useState, useTransition } from "react";
import { testPayPalConnection, type PayPalTestResult } from "./actions";

export function TestButton() {
  const [result, setResult] = useState<PayPalTestResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setResult(null);
            setResult(await testPayPalConnection());
          })
        }
        className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Testing…" : "Test the PayPal connection"}
      </button>

      {result && (
        <div className="mt-5 space-y-3">
          {result.steps.map((step) => (
            <div
              key={step.label}
              className={`rounded-xl border p-4 ${
                step.ok ? "border-emerald-300 bg-emerald-50" : "border-terracotta/40 bg-terracotta/10"
              }`}
            >
              <p className="text-sm font-semibold text-ink">
                {step.ok ? "✓" : "✗"} {step.label}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{step.detail}</p>
            </div>
          ))}
          <p className="text-sm font-semibold text-ink">
            {result.ok
              ? "Everything PayPal needs is working. The test order was never approved, so no money moved."
              : "Fix the red items above before taking any real payment."}
          </p>
        </div>
      )}
    </div>
  );
}
