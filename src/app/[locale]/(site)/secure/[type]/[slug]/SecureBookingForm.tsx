"use client";

import { useState } from "react";
import type { PaymentMode } from "@/lib/booking/wording";

// The form. Four questions, which is the whole point of this path existing.
//
// Everything it renders after submitting is governed by one rule from
// docs/booking-deposits.md: the word "confirmed" never appears. The customer
// has made a request and, where deposits are live, had money held. Neither is
// a confirmation, and a person has not looked at it yet.

type Props = {
  productType: "photoshoot" | "experience";
  productSlug: string;
  productTitle: string;
  depositLabel: string;
  /** How the deposit is taken — see the same prop on SecureDateButton. */
  paymentMode: PaymentMode;
};

type Result =
  | { kind: "payLink"; reference: string; paymentLink: string; amountUsd: number }
  | { kind: "payDeposit"; reference: string; approvalUrl: string }
  | { kind: "awaitingTeam"; reference: string; notice?: string };

export function SecureBookingForm({
  productType,
  productSlug,
  productTitle,
  depositLabel,
  paymentMode,
}: Props) {
  const [form, setForm] = useState({
    startsAt: "",
    slotLabel: "",
    people: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const ready =
    form.startsAt.trim() !== "" &&
    form.guestName.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail.trim());

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType, productSlug, ...form }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Something went wrong. Please try again, or message us on WhatsApp.");
        return;
      }
      if (data.next === "payLink" && data.deposit?.paymentLink) {
        setResult({
          kind: "payLink",
          reference: data.reference,
          paymentLink: data.deposit.paymentLink,
          amountUsd: data.deposit.amountUsd,
        });
        return;
      }
      if (data.next === "payDeposit" && data.deposit?.approvalUrl) {
        setResult({ kind: "payDeposit", reference: data.reference, approvalUrl: data.deposit.approvalUrl });
      } else {
        setResult({ kind: "awaitingTeam", reference: data.reference, notice: data.notice });
      }
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mt-8 rounded-2xl border border-gold/30 bg-sand/40 p-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          {result.kind === "payDeposit" ? "One step left" : "Your request is with our team"}
        </h2>

        {result.kind === "payDeposit" ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Your request is saved as <strong className="text-ink">{result.reference}</strong>. To hold your date,
              approve the {depositLabel} deposit. It is a hold — nothing is charged until our team confirms your
              date.
            </p>
            <a
              href={result.approvalUrl}
              className="mt-5 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              Hold my date with {depositLabel}
            </a>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {(result.kind === "awaitingTeam" && result.notice) ||
                `We have your request for ${productTitle}, saved as ${result.reference}. Nothing has been charged.`}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              A member of our team is checking the date now and will come back to you{" "}
              <strong className="text-ink">with your confirmation</strong>, or with the nearest dates we can offer.
            </p>
          </>
        )}

        <p className="mt-4 text-xs text-ink-soft">
          We have emailed you a copy. Quote {result.reference} if you reply.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your date" required>
          <input
            type="date"
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Time of day" hint="Sunrise, morning, sunset — if you have a preference.">
          <input
            type="text"
            value={form.slotLabel}
            onChange={(e) => set("slotLabel", e.target.value)}
            maxLength={120}
            className={inputClass}
          />
        </Field>
        <Field label="How many people" required>
          <input
            type="number"
            min={1}
            max={20}
            value={form.people}
            onChange={(e) => set("people", Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className={inputClass}
          />
        </Field>
        <Field label="Your name" required>
          <input
            type="text"
            value={form.guestName}
            onChange={(e) => set("guestName", e.target.value)}
            required
            maxLength={200}
            className={inputClass}
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            value={form.guestEmail}
            onChange={(e) => set("guestEmail", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Phone or WhatsApp" hint="So we can reach you quickly if the date needs a conversation.">
          <input
            type="tel"
            value={form.guestPhone}
            onChange={(e) => set("guestPhone", e.target.value)}
            maxLength={40}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Anything we should know">
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          maxLength={2000}
          className={inputClass}
        />
      </Field>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!ready || submitting}
        className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {submitting ? "Sending…" : "Continue"}
      </button>

      {/* Restated at the button, because this is the moment of commitment and
          it is the last thing read before pressing it. */}
      <p className="text-xs leading-relaxed text-ink-soft">
        {paymentMode === "none"
          ? "Pressing this does not charge you. It sends your request to our team."
          : `Pressing this does not charge you. The next step takes you to PayPal for the ${depositLabel} deposit.`}
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/20";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-gold-dark"> *</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
