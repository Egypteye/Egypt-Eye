"use client";

import { useState, useTransition } from "react";
import { runReconciliation, testPayPalConnection, type PayPalTestResult } from "./actions";
import { runPaymentSelfTest, type SelfTestResult } from "./selftest";

export function TestButton() {
  const [result, setResult] = useState<PayPalTestResult | null>(null);
  const [sweep, setSweep] = useState<{ summary: string; problems: string[] } | null>(null);
  const [selfTest, setSelfTest] = useState<SelfTestResult | null>(null);
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

      {/* The guarantees, exercised against the real database. Separate from
          the connection test because it proves something different: not that
          PayPal answers, but that two processes racing to record one payment
          cannot both win. */}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setSelfTest(null);
            setSelfTest(await runPaymentSelfTest());
          })
        }
        className="ml-3 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-gold/60 hover:bg-sand/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Working…" : "Test the safety guarantees"}
      </button>

      {selfTest && (
        <div className="mt-5 space-y-3">
          {selfTest.checks.map((check) => (
            <div
              key={check.label}
              className={`rounded-xl border p-4 ${
                check.ok ? "border-emerald-300 bg-emerald-50" : "border-terracotta/40 bg-terracotta/10"
              }`}
            >
              <p className="text-sm font-semibold text-ink">
                {check.ok ? "✓" : "✗"} {check.label}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{check.detail}</p>
            </div>
          ))}
          <p className="text-sm font-semibold text-ink">
            {selfTest.ok
              ? "Every guarantee held. Nothing was sent to PayPal and no email went out."
              : "Something did not hold. Do not take real payments until the red items are understood."}
          </p>
        </div>
      )}

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
