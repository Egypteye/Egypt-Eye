"use client";

import { useState, useTransition } from "react";
import { runReconciliation, testPayPalConnection, type PayPalTestResult } from "./actions";

export function TestButton() {
  const [result, setResult] = useState<PayPalTestResult | null>(null);
  const [sweep, setSweep] = useState<{ summary: string; problems: string[] } | null>(null);
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

      {/* The sweep. Separate from the connection test because it does
          something: it captures payments PayPal took that nobody told us
          about, and sends the emails for them. */}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setSweep(null);
            setSweep(await runReconciliation());
          })
        }
        className="ml-3 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-gold/60 hover:bg-sand/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Working…" : "Check for missed payments"}
      </button>

      {sweep && (
        <div className="mt-5 rounded-xl border border-black/10 bg-cream p-4">
          <p className="text-sm font-semibold text-ink">{sweep.summary}</p>
          {sweep.problems.map((problem) => (
            <p key={problem} className="mt-2 text-sm text-terracotta">
              {problem}
            </p>
          ))}
        </div>
      )}

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
