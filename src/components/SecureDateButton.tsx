"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PaymentMode } from "@/lib/booking/wording";
import type { BookingExtra } from "@/content/types";
import { extrasTotal, formatUsd, normaliseExtras } from "@/lib/booking/extras";
import { quoteDeposit, type QuotableProduct } from "@/lib/booking/quote";
import { DEFAULT_DIAL_ISO, DIAL_CODES, flagFor } from "@/lib/booking/countryCodes";
import { composePhone } from "@/lib/booking/phone";
import { lockModals } from "@/lib/ui/modalLock";
import { PayPalDepositButtons } from "./PayPalDepositButtons";

// "Instant Booking" — the fast path, opened as a dialog from the product page.
//
// What is instant here is the booking, not the confirmation, and the whole
// design turns on keeping those two apart. A customer can arrive, pick a date
// and a time, add a camel ride, pay the deposit and be finished, without an
// account, without an email address and without waiting for anyone to reply
// first. That is a real "complete it directly" flow and the label says so. The
// date becoming final is the one remaining step a person does, and the dialog
// states that plainly above the pay button rather than hiding it afterwards.
//
// Two things it must never do. It must not claim the date is confirmed because
// PayPal reported a payment — that is the rule the whole deposit system exists
// to hold, see lib/booking/states.ts. And it must not put the cancellation
// terms after the money: a non-refundable sum is only fair, and under the CRA
// only enforceable, if the customer saw it before they paid.
//
// It is two steps rather than one screen because of what it now has to ask
// for: a date, a time, a headcount, five optional extras, a name, a country
// code and a phone number. All of it at once is a wall, and a wall on a phone
// is an abandoned booking. Step one is the session, step two is who you are —
// and the footer carries the running total across both, so the number never
// moves out of sight while the extras are being chosen.

type Props = {
  productType: "photoshoot" | "experience";
  productSlug: string;
  productTitle: string;
  depositLabel: string;
  /**
   * What happens to the money: "paid" (it moves when the customer pays),
   * "hold" (it is authorized and moves only when a person confirms) or "none"
   * (no deposit at all). A boolean here was the original bug — it could not
   * tell "no deposit" from "pay by link", so a configured link rendered as
   * "deposits are not switched on".
   */
  paymentMode: PaymentMode;
  /** The site's real cancellation summary — never written here. */
  cancellationSummary: string;
  cancellationHref: string;
  /** Start times offered as a dropdown. Empty asks for a time in words. */
  timeSlots?: readonly string[];
  /** Priced extras. Settled with the balance, never charged by the deposit link. */
  extras?: readonly BookingExtra[];
  /** True when the deposit scales with the headcount, so the label says so. */
  perPerson?: boolean;
  /**
   * Everything the deposit calculation needs, so the dialog can show a live
   * total as the headcount and the extras change.
   *
   * It runs the SAME function the server runs — lib/booking/quote.ts is pure
   * and has no server-only import, deliberately. Nothing here is trusted: the
   * server recomputes from the product and its own copy of the rules, and its
   * answer is what gets charged. Sharing the function is what stops the figure
   * on the screen and the figure on the invoice coming from different places,
   * which has already happened once.
   */
  quotable?: QuotableProduct;
  productKind?: string;
  className?: string;
  /** Overrides the default label. */
  label?: string;
};

const OTHER_TIME = "__other__";

type Stage =
  | { kind: "form" }
  | { kind: "payLink"; reference: string; paymentLink: string; amountUsd: number; emailed: boolean }
  // The PayPal API rail: an order already created against the saved booking,
  // paid for with the buttons without leaving this dialog.
  | {
      kind: "payPal";
      reference: string;
      orderId: string;
      clientId: string;
      amountUsd: number;
      /** How the deposit was reached, line by line. */
      lines?: { label: string; unitCents: number; quantity: number; amountCents: number }[];
      moneyMode: PaymentMode;
      /** True against PayPal's sandbox, where no real money moves. */
      sandbox: boolean;
      approvalUrl?: string;
      emailed: boolean;
    }
  // What the customer sees once the money side is done. Never a confirmation:
  // the message comes from stateCopy on the server, which cannot say a date is
  // confirmed unless a person has said so.
  | { kind: "settled"; reference: string; message: string; pending: boolean; emailed: boolean }
  | { kind: "payDeposit"; reference: string; approvalUrl: string }
  | { kind: "awaitingTeam"; reference: string; notice?: string; emailed: boolean };

export function SecureDateButton({
  productType,
  productSlug,
  productTitle,
  depositLabel,
  paymentMode,
  cancellationSummary,
  cancellationHref,
  timeSlots,
  extras,
  perPerson,
  quotable,
  productKind,
  className,
  label,
}: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [stage, setStage] = useState<Stage>({ kind: "form" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => (timeSlots ?? []).filter((slot) => slot.trim() !== ""), [timeSlots]);
  // Normalised here as well as on the server: an extra with no price must not
  // be offered at all, and the browser is where it would be offered.
  const available = useMemo(() => normaliseExtras(extras), [extras]);

  const [form, setForm] = useState({
    startsAt: "",
    timeChoice: "",
    otherTime: "",
    people: 1,
    guestName: "",
    guestEmail: "",
    dialIso: DEFAULT_DIAL_ISO,
    phoneNational: "",
  });
  const [chosen, setChosen] = useState<string[]>([]);

  // Naming the amount is the payment signal, but the label itself leads on
  // what the customer gets to do: finish it now. The deposit figure sits
  // directly under the button on the product page and again in the dialog
  // before anything is paid, so nothing about the cost is hidden by it.
  const buttonLabel = label ?? (paymentMode === "none" ? "Request your date" : "Instant Booking");

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const nameFieldRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Returning focus to the button that opened it is the part everyone
    // forgets, and it is the difference between usable and unusable on a
    // keyboard or a screen reader.
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // A dialog that leaves the page scrolling behind it feels broken on phones.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Stops the newsletter popup opening over a half-finished booking, and
    // moves the floating WhatsApp bubble out from under the pay button. See
    // lib/ui/modalLock.ts — both were found by driving this in a browser.
    const release = lockModals();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      release();
    };
  }, [open, close]);

  // Focus follows the step, so a customer who taps Continue lands in the next
  // field instead of at the top of a sheet they have to scroll again.
  useEffect(() => {
    if (!open || stage.kind !== "form") return;
    const target = step === 1 ? firstFieldRef.current : nameFieldRef.current;
    target?.focus({ preventScroll: true });
  }, [open, step, stage.kind]);

  const selected = useMemo(
    () => available.filter((extra) => chosen.includes(extra.label)),
    [available, chosen]
  );
  const extrasSum = extrasTotal(selected);

  // What this selection will actually cost, by the same rules the server will
  // apply. Shown, never sent: the request carries a headcount and labels.
  const liveQuote = useMemo(() => {
    if (!quotable) return null;
    const result = quoteDeposit(quotable, productKind ?? productType, {
      people: form.people,
      extraLabels: chosen,
    });
    return result.ok ? result.quote : null;
  }, [quotable, productKind, productType, form.people, chosen]);

  // The dialog's own figure, which moves with the headcount. Falls back to the
  // page's label for a product with no rules to compute from.
  const liveDepositLabel = liveQuote ? money(liveQuote.totalCents) : depositLabel;

  const timeReady = slots.length === 0 || (form.timeChoice !== "" && (form.timeChoice !== OTHER_TIME || form.otherTime.trim() !== ""));
  const stepOneReady = form.startsAt.trim() !== "" && timeReady;

  const phone = composePhone(form.dialIso, form.phoneNational);
  const emailGiven = form.guestEmail.trim() !== "";
  const emailValid = !emailGiven || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail.trim());
  const stepTwoReady = form.guestName.trim() !== "" && phone.ok && emailValid;

  const slotLabel =
    slots.length === 0
      ? form.otherTime.trim()
      : form.timeChoice === OTHER_TIME
        ? form.otherTime.trim()
        : form.timeChoice;

  function toggleExtra(labelText: string) {
    setChosen((current) =>
      current.includes(labelText) ? current.filter((item) => item !== labelText) : [...current, labelText]
    );
  }

  function setPeople(next: number) {
    setForm((f) => ({ ...f, people: Math.max(1, Math.min(20, next)) }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (step === 1) {
      if (stepOneReady) setStep(2);
      return;
    }
    if (!stepTwoReady || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType,
          productSlug,
          startsAt: form.startsAt,
          slotLabel,
          people: form.people,
          guestName: form.guestName,
          // Sent only when given. Booking as a guest with no email is a
          // supported outcome, not a missing field.
          guestEmail: emailGiven ? form.guestEmail : undefined,
          // The code and the number travel separately so the server composes
          // the number itself rather than parsing whatever the browser built.
          dialIso: form.dialIso,
          phoneNational: form.phoneNational,
          // Labels only. The prices come from the product on the server — a
          // total that arrived in this body would be a price the customer set.
          extras: chosen,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Something went wrong. Please try again, or message us on WhatsApp.");
        return;
      }
      if (data.next === "payLink" && data.deposit?.paymentLink) {
        // The booking is already saved, so the customer can pay now, pay from
        // the email later, or not pay at all — and in every case Egypt Eye has
        // the request rather than nothing.
        setStage({
          kind: "payLink",
          reference: data.reference,
          paymentLink: data.deposit.paymentLink,
          amountUsd: data.deposit.amountUsd,
          emailed: Boolean(data.emailed),
        });
        return;
      }
      if (data.next === "payPal" && data.deposit?.orderId && data.deposit?.clientId) {
        // Straight to the buttons, in this dialog. The order already exists
        // server-side with the amount and the reference on it.
        setStage({
          kind: "payPal",
          reference: data.reference,
          orderId: data.deposit.orderId,
          clientId: data.deposit.clientId,
          amountUsd: data.deposit.amountUsd,
          lines: data.deposit.lines,
          moneyMode: data.deposit.moneyMode ?? "paid",
          sandbox: Boolean(data.deposit.sandbox),
          approvalUrl: data.deposit.approvalUrl || undefined,
          emailed: Boolean(data.emailed),
        });
        return;
      }
      if (data.next === "payDeposit" && data.deposit?.approvalUrl) {
        window.location.href = data.deposit.approvalUrl;
        setStage({ kind: "payDeposit", reference: data.reference, approvalUrl: data.deposit.approvalUrl });
        return;
      }
      setStage({
        kind: "awaitingTeam",
        reference: data.reference,
        notice: data.notice,
        emailed: Boolean(data.emailed),
      });
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    stage.kind === "awaitingTeam"
      ? "Your request is with our team"
      : stage.kind === "settled"
        ? "Thank you — we have your deposit"
        : stage.kind === "payPal" || stage.kind === "payLink"
          ? "One step left — pay your deposit"
          : step === 1
            ? "Instant Booking"
            : "Where we reach you";

  return (
    <>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)} className={className}>
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="secure-date-title"
            // A column with its own scrolling middle, so the header and the
            // running total stay put while the extras list scrolls under them.
            // 100dvh rather than vh: on iOS Safari the toolbar makes vh lie,
            // and the footer button is the thing that ends up off-screen.
            className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-cream shadow-xl sm:max-h-[88dvh] sm:rounded-3xl"
          >
            {/* The grab handle reads as a sheet on a phone, which tells people
                it can be dismissed without needing to find the ✕. */}
            <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" />

            <header className="shrink-0 px-6 pb-4 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 id="secure-date-title" className="font-display text-xl font-semibold leading-tight text-ink">
                    {title}
                  </h2>
                  <p className="mt-1 truncate text-xs text-ink-soft">{productTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-ink-soft transition hover:bg-black/5 hover:text-ink"
                >
                  ✕
                </button>
              </div>

              {stage.kind === "form" && (
                // Two segments rather than "Step 1 of 2" in words: it shows
                // how much is left at a glance, which is the question someone
                // halfway through a form on a phone is actually asking.
                <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-1 flex-1 rounded-full bg-gold" />
                  <span className={`h-1 flex-1 rounded-full ${step === 2 ? "bg-gold" : "bg-ink/10"}`} />
                </div>
              )}
            </header>

            {stage.kind === "payPal" ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Your booking is saved as <strong className="font-mono text-ink">{stage.reference}</strong> for{" "}
                    {new Date(form.startsAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {slotLabel ? `, ${slotLabel}` : ""}.
                  </p>

                  {/* A sandbox payment moves no money. Someone who completes
                      one and believes they have paid for their date is the
                      worst outcome this whole system can produce, so it is
                      said in the loudest place available rather than left to
                      a server log nobody reads. It renders only against the
                      sandbox, so a live site never shows it. */}
                  {stage.sandbox && (
                    <div className="rounded-2xl border-2 border-terracotta bg-terracotta/10 p-4 text-sm leading-relaxed">
                      <p className="font-semibold text-terracotta">TEST MODE — this is not a real payment</p>
                      <p className="mt-1.5 text-ink-soft">
                        This site is connected to PayPal&rsquo;s sandbox. Completing this takes no money and
                        books nothing. If you are a customer and you can see this, please message us instead.
                      </p>
                    </div>
                  )}

                  {/* The terms again, immediately above the buttons. They were
                      shown before Continue too — this is the screen where the
                      money actually moves, and that is the one that has to
                      carry them. */}
                  <div className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-sm leading-relaxed text-ink-soft">
                    <p className="font-semibold text-ink">
                      {stage.moneyMode === "hold"
                        ? `${depositLabel} held, not charged`
                        : `${depositLabel} deposit`}
                    </p>
                    <p className="mt-1.5">
                      <strong className="text-ink">Paying does not confirm your date.</strong> A member of our team
                      checks availability and comes back to you personally.{" "}
                      {stage.moneyMode === "hold"
                        ? "Nothing is taken until they confirm it, and if we cannot do the date the hold is released."
                        : "If we cannot confirm the date you asked for, we refund it in full."}
                    </p>
                  </div>

                  {/* How the figure was reached. A deposit that scales with
                      the headcount and the extras has to show its working, or
                      it reads as a number somebody picked. */}
                  {stage.lines && stage.lines.length > 1 && (
                    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 text-sm text-ink-soft">
                      <ul className="space-y-1">
                        {stage.lines.map((line) => (
                          <li key={line.label} className="flex justify-between gap-4">
                            <span>
                              {line.quantity > 1
                                ? `${line.label} — ${money(line.unitCents)} × ${line.quantity}`
                                : line.label}
                            </span>
                            <span className="tabular-nums">{money(line.amountCents)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 flex justify-between gap-4 border-t border-black/10 pt-2 font-semibold text-ink">
                        <span>Deposit now</span>
                        <span className="tabular-nums">{money(stage.amountUsd * 100)}</span>
                      </p>
                    </div>
                  )}

                  <PayPalDepositButtons
                    orderId={stage.orderId}
                    clientId={stage.clientId}
                    reference={stage.reference}
                    amountUsd={stage.amountUsd}
                    fallbackUrl={stage.approvalUrl}
                    onSettled={(result) =>
                      setStage({
                        kind: "settled",
                        reference: stage.reference,
                        message: result.message,
                        pending: Boolean(result.pending),
                        emailed: stage.emailed,
                      })
                    }
                  />

                  {selected.length > 0 && (
                    <p className="text-xs leading-relaxed text-ink-soft">
                      Your {formatUsd(extrasSum)} of extras is on the booking and settled with the balance — the
                      payment above is the {depositLabel} deposit only.
                    </p>
                  )}
                </div>
              </div>
            ) : stage.kind === "settled" ? (
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 text-sm leading-relaxed text-ink-soft">
                {/* Whatever the server said, which can never be a confirmation
                    of the date — stateCopy only says "confirmed" for a booking
                    a person has confirmed. */}
                <p>{stage.message}</p>
                <p className="select-all rounded-lg bg-sand/40 px-3 py-2 text-center font-mono text-base font-semibold text-ink">
                  {stage.reference}
                </p>
                <p className="text-xs">
                  {stage.emailed
                    ? `We have emailed you a copy. Quote ${stage.reference} if you reply.`
                    : "You booked without an email address, so please keep this reference — quote it when we speak."}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-2 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
                >
                  Done
                </button>
              </div>
            ) : stage.kind === "payLink" ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Your booking is saved as <strong className="font-mono text-ink">{stage.reference}</strong> for{" "}
                    {new Date(form.startsAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {slotLabel ? `, ${slotLabel}` : ""}.
                  </p>

                  <a
                    href={stage.paymentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full rounded-full bg-gold px-6 py-4 text-center text-base font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light"
                  >
                    Pay ${stage.amountUsd} deposit with PayPal
                  </a>

                  {/* The reference is how a payment gets matched to a booking.
                      PayPal will not tell us which booking paid, so the
                      customer has to carry it across — and with email now
                      optional, this box may be the only copy they ever get. */}
                  <div className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-sm text-ink-soft">
                    <p>
                      <strong className="text-ink">Please add this reference in the PayPal note:</strong>
                    </p>
                    <p className="mt-2 select-all rounded-lg bg-cream px-3 py-2 text-center font-mono text-base font-semibold text-ink">
                      {stage.reference}
                    </p>
                    <p className="mt-2 text-xs">
                      It is how we match your payment to your booking.{" "}
                      {stage.emailed
                        ? "We have emailed you this link and reference too, so you can pay later if you prefer."
                        : "You booked without an email address, so please screenshot this screen — it is the only copy of your reference."}
                    </p>
                  </div>

                  {selected.length > 0 && (
                    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 text-sm text-ink-soft">
                      <p className="font-semibold text-ink">Your extras</p>
                      <ul className="mt-2 space-y-1">
                        {selected.map((extra) => (
                          <li key={extra.label} className="flex justify-between gap-4">
                            <span>{extra.label}</span>
                            <span className="tabular-nums">{formatUsd(extra.priceUsd)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 border-t border-black/10 pt-2 text-xs">
                        {formatUsd(extrasSum)} of extras is added to your final price and settled with the
                        balance — the deposit link above does not include it.
                      </p>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed text-ink-soft">
                    Once we have your deposit, a member of our team checks the date and comes back to you with
                    your confirmation. Your deposit is credited toward your final price, and if we cannot confirm
                    the date we refund it in full.
                  </p>
                </div>
              </div>
            ) : stage.kind === "awaitingTeam" ? (
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 text-sm leading-relaxed text-ink-soft">
                <p>
                  {stage.notice ??
                    `We have your request for ${productTitle}, saved as ${stage.reference}. Nothing has been charged.`}
                </p>
                <p>A member of our team is checking the date now and will come back to you personally.</p>
                <p className="select-all rounded-lg bg-sand/40 px-3 py-2 text-center font-mono text-base font-semibold text-ink">
                  {stage.reference}
                </p>
                <p className="text-xs">
                  {stage.emailed
                    ? `We have emailed you a copy. Quote ${stage.reference} if you reply.`
                    : "You booked without an email address, so please keep this reference — quote it when we speak."}
                </p>
              </div>
            ) : stage.kind === "payDeposit" ? (
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 text-sm leading-relaxed text-ink-soft">
                <p>Taking you to PayPal to hold your date…</p>
                <a href={stage.approvalUrl} className="font-semibold text-gold-dark underline">
                  Continue to PayPal
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
                  {step === 1 ? (
                    <div className="space-y-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className={labelText}>Date</span>
                          <input
                            ref={firstFieldRef}
                            type="date"
                            required
                            value={form.startsAt}
                            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                            className={input}
                          />
                        </label>

                        {slots.length > 0 ? (
                          <label className="block">
                            <span className={labelText}>Time</span>
                            <select
                              value={form.timeChoice}
                              onChange={(e) => setForm((f) => ({ ...f, timeChoice: e.target.value }))}
                              className={input}
                            >
                              <option value="">Choose a time</option>
                              {slots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                              <option value={OTHER_TIME}>Request another time</option>
                            </select>
                          </label>
                        ) : (
                          <label className="block">
                            <span className={labelText}>Time of day</span>
                            <input
                              type="text"
                              placeholder="Sunrise, morning…"
                              value={form.otherTime}
                              onChange={(e) => setForm((f) => ({ ...f, otherTime: e.target.value }))}
                              className={input}
                            />
                          </label>
                        )}
                      </div>

                      {slots.length > 0 && form.timeChoice === OTHER_TIME && (
                        <label className="block">
                          <span className={labelText}>What time would suit you?</span>
                          <input
                            type="text"
                            placeholder="e.g. sunrise, or around 4pm"
                            value={form.otherTime}
                            onChange={(e) => setForm((f) => ({ ...f, otherTime: e.target.value }))}
                            className={input}
                          />
                          <span className="mt-1.5 block text-xs text-ink-soft">
                            We will tell you what is possible for that date before anything is final.
                          </span>
                        </label>
                      )}

                      {/* A stepper rather than a number input: on a phone it is
                          two taps instead of a keyboard, and it cannot produce
                          the empty or non-numeric states a text field can. */}
                      <div>
                        <span className={labelText}>People</span>
                        <div className="mt-1 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPeople(form.people - 1)}
                            disabled={form.people <= 1}
                            aria-label="One fewer person"
                            className={stepper}
                          >
                            −
                          </button>
                          <output
                            aria-live="polite"
                            className="min-w-[4.5rem] text-center font-display text-lg font-semibold tabular-nums text-ink"
                          >
                            {form.people}
                          </output>
                          <button
                            type="button"
                            onClick={() => setPeople(form.people + 1)}
                            disabled={form.people >= 20}
                            aria-label="One more person"
                            className={stepper}
                          >
                            +
                          </button>
                          <span className="ml-1 text-xs text-ink-soft">
                            {form.people >= 20
                              ? "For a larger group, message us"
                              : perPerson
                                ? `${depositLabel} deposit each`
                                : "in the session"}
                          </span>
                        </div>
                      </div>

                      {liveQuote && liveQuote.lines.length > 1 && (
                        <div className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-sm text-ink-soft">
                          <ul className="space-y-1">
                            {liveQuote.lines.map((line) => (
                              <li key={line.label} className="flex justify-between gap-4">
                                <span>
                                  {line.quantity > 1
                                    ? `${line.label} — ${money(line.unitCents)} × ${line.quantity}`
                                    : line.label}
                                </span>
                                <span className="tabular-nums">{money(line.amountCents)}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 flex justify-between gap-4 border-t border-black/10 pt-2 font-semibold text-ink">
                            <span>Deposit now</span>
                            <span className="tabular-nums">{money(liveQuote.totalCents)}</span>
                          </p>
                        </div>
                      )}

                      {available.length > 0 && (
                        <fieldset>
                          <legend className={labelText}>Add extras (optional)</legend>
                          <div className="mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white/60">
                            {available.map((extra, index) => {
                              const on = chosen.includes(extra.label);
                              return (
                                <label
                                  key={extra.label}
                                  className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-sand/40 ${
                                    index > 0 ? "border-t border-black/5" : ""
                                  } ${on ? "bg-sand/50" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={() => toggleExtra(extra.label)}
                                    className="h-5 w-5 shrink-0 rounded border-black/20 text-gold-dark accent-gold-dark focus:ring-gold/30"
                                  />
                                  <span className="min-w-0 flex-1 text-sm text-ink">{extra.label}</span>
                                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                                    {formatUsd(extra.priceUsd)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                            Extras are added to your final price and settled with the balance. Anything that
                            changes the deposit is shown in the total below.
                          </p>
                        </fieldset>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block">
                        <span className={labelText}>Your name</span>
                        <input
                          ref={nameFieldRef}
                          type="text"
                          required
                          autoComplete="name"
                          value={form.guestName}
                          onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                          className={input}
                        />
                      </label>

                      {/* The country code is required, not inferred. Egypt Eye
                          takes bookings from inside Egypt and from everywhere
                          else, and a bare 010… is undialable from abroad while
                          a bare 1012… could be two different countries. With
                          email optional this is often the only way back. */}
                      <div>
                        <span className={labelText}>Phone or WhatsApp</span>
                        <div className="mt-1 flex gap-2">
                          <select
                            aria-label="Country code"
                            value={form.dialIso}
                            onChange={(e) => setForm((f) => ({ ...f, dialIso: e.target.value }))}
                            className={`${field} mt-0 w-[7.25rem] shrink-0`}
                          >
                            {DIAL_CODES.map((code) => (
                              <option key={code.iso} value={code.iso}>
                                {flagFor(code.iso)} {code.dial}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel-national"
                            required
                            placeholder="10 1234 5678"
                            value={form.phoneNational}
                            onChange={(e) => setForm((f) => ({ ...f, phoneNational: e.target.value }))}
                            className={`${field} mt-0 w-full min-w-0 flex-1`}
                          />
                        </div>
                        <span className="mt-1.5 block text-xs text-ink-soft">
                          {form.phoneNational.trim() !== "" && !phone.ok
                            ? phone.message
                            : "We confirm your date on this number, so please include the country code."}
                        </span>
                      </div>

                      <label className="block">
                        <span className={labelText}>
                          Email <span className="font-normal normal-case tracking-normal text-ink-soft">— optional</span>
                        </span>
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="For your written copy"
                          value={form.guestEmail}
                          onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
                          className={input}
                        />
                        <span className="mt-1.5 block text-xs text-ink-soft">
                          {emailGiven && !emailValid
                            ? "That email address does not look right."
                            : "Leave it empty to book as a guest — no account, no sign-up. We will reach you on the number above."}
                        </span>
                      </label>

                      {/* The commitment, stated before the button rather than
                          after it. A non-refundable term is only fair — and
                          only enforceable — if the customer saw it before they
                          paid, not linked from a policy page they never
                          opened. */}
                      <div className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-sm leading-relaxed text-ink-soft">
                        {paymentMode !== "none" ? (
                          <>
                            <p className="font-semibold text-ink">What happens when you pay</p>
                            <p className="mt-1.5">
                              Your {liveDepositLabel} deposit holds this date while we check it.{" "}
                              <strong className="text-ink">Paying does not confirm your date</strong> — a member
                              of our team checks availability and comes back to you personally.{" "}
                              {/* "Refunded" is only true where the money moved. Under a
                                  hold nothing is charged, so the honest word is
                                  released — and a refund promise the business keeps a
                                  different way is still a promise read the wrong way. */}
                              {paymentMode === "hold"
                                ? "Nothing is taken until they confirm it, and if we cannot do the date the hold is released and you are not charged at all."
                                : "If we cannot confirm the date you asked for, we refund your deposit in full, or move it to a date that works."}
                            </p>
                            <p className="mt-1.5">Your deposit is credited toward your final price.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-ink">Nothing will be charged here</p>
                            <p className="mt-1.5">
                              Online deposits are not switched on yet. Send your request and our team will come
                              back to you personally.
                            </p>
                          </>
                        )}
                        <p className="mt-2.5 border-t border-black/10 pt-2.5 text-xs">
                          <strong className="text-ink">If you cancel:</strong> {cancellationSummary}{" "}
                          <a
                            href={cancellationHref}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-gold-dark underline"
                          >
                            Read the full policy
                          </a>
                        </p>
                      </div>

                      {error && (
                        <p
                          role="alert"
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        >
                          {error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* The running total lives in a pinned footer so it stays
                    visible while the extras list is being scrolled. It shows
                    two figures deliberately: what is taken now and what is
                    not. One blended "total" beside a pay button that charges a
                    different number is the thing a customer screenshots. */}
                {/* A div, not a <footer>: inside a role="dialog" a <footer>
                    element is still exposed as a contentinfo landmark, so the
                    page would announce two "footers" to a screen reader — the
                    site's real one and this. Caught by driving the dialog in a
                    browser rather than by reading the markup. */}
                <div className="shrink-0 border-t border-black/10 bg-cream/95 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      {paymentMode === "none" ? (
                        <p className="text-sm font-semibold text-ink">No payment now</p>
                      ) : (
                        <p className="text-sm text-ink-soft">
                          Pay now{" "}
                          <strong className="font-display text-base text-ink tabular-nums">
                            {liveDepositLabel}
                          </strong>
                        </p>
                      )}
                      {extrasSum > 0 && (
                        <p className="mt-0.5 text-xs text-ink-soft">
                          + {formatUsd(extrasSum)} extras, with the balance
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={step === 1 ? !stepOneReady : !stepTwoReady || submitting}
                      className="shrink-0 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      {step === 1
                        ? "Continue"
                        : submitting
                          ? "Booking…"
                          : paymentMode === "none"
                            ? "Send my request"
                            : `Book and pay ${liveDepositLabel}`}
                    </button>
                  </div>
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-2 text-xs font-semibold text-ink-soft underline transition hover:text-ink"
                    >
                      ← Back to date and extras
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Cents to a readable figure, matching lib/booking/quote.ts exactly. */
function money(cents: number): string {
  const whole = Math.trunc(cents / 100);
  const part = Math.abs(Math.round(cents) % 100);
  return part === 0 ? `$${whole}` : `$${whole}.${String(part).padStart(2, "0")}`;
}

const labelText = "text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft";

const field =
  "mt-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/20";

const input = `${field} w-full`;

const stepper =
  "flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-semibold text-ink transition hover:border-gold/60 hover:bg-sand/40 disabled:cursor-not-allowed disabled:opacity-40";
