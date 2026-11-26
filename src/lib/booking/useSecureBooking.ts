"use client";

import { useState } from "react";

/**
 * THE BOOKING FORM'S BEHAVIOUR, WITH NO MARKUP IN IT.
 *
 * =========================================================================
 * WHY THIS EXISTS
 * =========================================================================
 * Two brands now take a deposit, each in its own chrome: Egypt Eye in
 * Tailwind utilities, Flying Dresses in the `fd-` classes of its brand.css,
 * which is the whole reason the hand-off existed for as long as it did.
 *
 * The obvious way to get a second one is to copy the form and restyle it.
 * That would give this codebase two implementations of the one sequence that
 * decides whether a customer is sent to PayPal, sent a payment link, or told
 * a human will come back, and the second copy would drift the first time a
 * field or a branch changed on one side only.
 *
 * So the behaviour lives here, once, and the brands own nothing but their
 * markup. What a presentational component gets is state, a submit, and a
 * verdict. It cannot change what the submit does, because it cannot see it.
 *
 * NOTHING HERE DECIDES MONEY. It posts to /api/bookings and reports what came
 * back. The deposit percentage, the price and whether a product is bookable
 * at all are productRail()'s answers, resolved on the server before this
 * component is ever rendered. CLAUDE.md section 5.
 */

export type SecureBookingResult =
  | { kind: "payLink"; reference: string; paymentLink: string; amountUsd: number }
  | { kind: "payDeposit"; reference: string; approvalUrl: string }
  | { kind: "awaitingTeam"; reference: string; notice?: string };

export type SecureBookingFields = {
  startsAt: string;
  slotLabel: string;
  people: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes: string;
};

const EMPTY: SecureBookingFields = {
  startsAt: "",
  slotLabel: "",
  people: 1,
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  notes: "",
};

export function useSecureBooking({
  productType,
  productSlug,
}: {
  productType: "photoshoot" | "experience";
  productSlug: string;
}) {
  const [form, setForm] = useState<SecureBookingFields>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * The phone authority's verdict, held so this gate can refuse an unusable
   * number instead of quietly sending none. A rejected number reaches the
   * parent as the empty string, so without this a booking could be taken with
   * no way to ring the guest about it, which is the one thing that field
   * exists to prevent.
   */
  const [phoneProblem, setPhoneProblem] = useState<string | null>(null);
  const [result, setResult] = useState<SecureBookingResult | null>(null);

  const set = <K extends keyof SecureBookingFields>(key: K, value: SecureBookingFields[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // An empty phone is fine: it is offered, not demanded.
  const ready =
    form.startsAt.trim() !== "" &&
    form.guestName.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail.trim()) &&
    !phoneProblem;

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

  return { form, set, submitting, error, phoneProblem, setPhoneProblem, result, ready, submit };
}
