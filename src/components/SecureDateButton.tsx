"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaymentMode } from "@/lib/booking/wording";

// "Request your date" — the fast path, opened as a dialog from the product page.
//
// Named "request" rather than "secure" on purpose, and it is the most
// important decision in this component. A deposit here does not secure
// anything: a person still has to check availability, and until they do, the
// date is not the customer's. A button that says "secure" sells a certainty
// the business cannot deliver, and the customer only discovers that after
// paying — which is exactly when it costs the most trust.
//
// What "secure" was really doing was removing the fear of losing the date.
// The refund guarantee does that job honestly: pay a deposit, and if we cannot
// confirm your date you get all of it back. That is a promise Egypt Eye can
// keep every time.
//
// A dialog rather than a page jump because the whole point is speed: someone
// who already knows what they want should not lose the page they are reading
// in order to hold a date. The booking that comes out of it is identical to
// the one the /secure page produces; this is a different front door, not a
// different system.
//
// What it must not do is make the commitment feel smaller than it is. The
// deposit figure and the cancellation terms are in the dialog itself, above
// the button, because a non-refundable term is only fair — and only
// enforceable — if it was put in front of the customer before they paid, not
// linked from a policy page they never opened.
//
// PayPal redirects the browser back to a real URL, so approval always leaves
// this dialog for /secure/return. That is why the full page still exists.

type Props = {
  productType: "photoshoot" | "experience";
  productSlug: string;
  productTitle: string;
  depositLabel: string;
  /**
   * How the deposit is taken: "link" (a PayPal payment link), "hold" (the
   * API, holding funds) or "none" (no deposit at all). A boolean here was the
   * original bug — it could not tell "no deposit" from "pay by link", so a
   * configured link rendered as "deposits are not switched on".
   */
  paymentMode: PaymentMode;
  /** The site's real cancellation summary — never written here. */
  cancellationSummary: string;
  cancellationHref: string;
  className?: string;
  /** Overrides the default, which names the deposit so the price is on the button. */
  label?: string;
};

type Stage =
  | { kind: "form" }
  | { kind: "payLink"; reference: string; paymentLink: string; amountUsd: number }
  | { kind: "payDeposit"; reference: string; approvalUrl: string }
  | { kind: "awaitingTeam"; reference: string; notice?: string };

export function SecureDateButton({
  productType,
  productSlug,
  productTitle,
  depositLabel,
  paymentMode,
  cancellationSummary,
  cancellationHref,
  className,
  label,
}: Props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>({ kind: "form" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    startsAt: "",
    slotLabel: "",
    people: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  // Naming the amount on the button is the payment signal: a customer sees
  // what they are about to pay before they open anything. "Checkout" and
  // "Book now" were rejected for the opposite reason to the old "Secure your
  // date" — all three announce a completed booking, and this one is not
  // complete until a person has confirmed it.
  const buttonLabel =
    label ?? (paymentMode === "none" ? "Request your date" : `Book with a ${depositLabel} deposit`);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
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
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

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
        // The booking is already saved, so the customer can pay now, pay from
        // the email later, or not pay at all — and in every case Egypt Eye has
        // the request rather than nothing.
        setStage({
          kind: "payLink",
          reference: data.reference,
          paymentLink: data.deposit.paymentLink,
          amountUsd: data.deposit.amountUsd,
        });
        return;
      }
      if (data.next === "payDeposit" && data.deposit?.approvalUrl) {
        // Straight on to the payment — the fewer screens between deciding and
        // paying, the better, which is the entire reason this is a dialog.
        window.location.href = data.deposit.approvalUrl;
        setStage({ kind: "payDeposit", reference: data.reference, approvalUrl: data.deposit.approvalUrl });
        return;
      }
      setStage({ kind: "awaitingTeam", reference: data.reference, notice: data.notice });
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)} className={className}>
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="secure-date-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="secure-date-title" className="font-display text-xl font-semibold text-ink">
                {stage.kind === "awaitingTeam"
                  ? "Your request is with our team"
                  : stage.kind === "payLink"
                    ? "One step left"
                    : "Book your date"}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-mr-1 -mt-1 rounded-full p-2 text-ink-soft transition hover:bg-black/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            {stage.kind === "payLink" ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm leading-relaxed text-ink-soft">
                  Your request is saved as{" "}
                  <strong className="font-mono text-ink">{stage.reference}</strong>. To secure{" "}
                  {new Date(form.startsAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  , pay the deposit now.
                </p>

                <a
                  href={stage.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-full bg-gold px-6 py-3.5 text-center text-sm font-semibold text-ink transition hover:bg-gold-light"
                >
                  Pay ${stage.amountUsd} deposit with PayPal
                </a>

                {/* The reference is how a payment gets matched to a booking.
                    PayPal will not tell us which booking paid, so the customer
                    has to carry it across — and it has to be easy to copy. */}
                <div className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-sm text-ink-soft">
                  <p>
                    <strong className="text-ink">Please add this reference in the PayPal note:</strong>
                  </p>
                  <p className="mt-2 select-all rounded-lg bg-cream px-3 py-2 text-center font-mono text-base font-semibold text-ink">
                    {stage.reference}
                  </p>
                  <p className="mt-2 text-xs">
                    It is how we match your payment to your booking. We have emailed you this link and reference
                    too, so you can pay later if you prefer.
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-ink-soft">
                  Once we have your deposit, our team confirms your date — usually within 48 hours. Your deposit is
                  credited toward your final price, and if we cannot confirm the date we refund it in full.
                </p>
              </div>
            ) : stage.kind === "awaitingTeam" ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                <p>
                  {stage.notice ??
                    `We have your request for ${productTitle}, saved as ${stage.reference}. Nothing has been charged.`}
                </p>
                <p>
                  A member of our team is checking the date now and will come back to you{" "}
                  <strong className="text-ink">within 48 hours</strong>.
                </p>
                <p className="text-xs">We have emailed you a copy. Quote {stage.reference} if you reply.</p>
              </div>
            ) : stage.kind === "payDeposit" ? (
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-soft">
                <p>Taking you to PayPal to hold your date…</p>
                <a href={stage.approvalUrl} className="font-semibold text-gold-dark underline">
                  Continue to PayPal
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-4">
                <p className="text-sm leading-relaxed text-ink-soft">{productTitle}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold text-ink">Date *</span>
                    <input
                      ref={firstFieldRef}
                      type="date"
                      required
                      value={form.startsAt}
                      onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink">Time of day</span>
                    <input
                      type="text"
                      placeholder="Sunrise, morning…"
                      value={form.slotLabel}
                      onChange={(e) => setForm((f) => ({ ...f, slotLabel: e.target.value }))}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink">People *</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.people}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, people: Math.max(1, Math.min(20, Number(e.target.value) || 1)) }))
                      }
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink">Your name *</span>
                    <input
                      type="text"
                      required
                      value={form.guestName}
                      onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                      className={input}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-ink">Email *</span>
                    <input
                      type="email"
                      required
                      value={form.guestEmail}
                      onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
                      className={input}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-ink">Phone or WhatsApp</span>
                    <input
                      type="tel"
                      value={form.guestPhone}
                      onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))}
                      className={input}
                    />
                  </label>
                </div>

                {/* The commitment, stated before the button rather than after
                    it. This block is the reason the dialog is allowed to be
                    this short everywhere else. */}
                <div className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-sm leading-relaxed text-ink-soft">
                  {paymentMode !== "none" ? (
                    <>
                      <p className="font-semibold text-ink">
                        {depositLabel} deposit starts your booking
                      </p>
                      <p className="mt-1.5">
                        <strong className="text-ink">Paying does not confirm your date.</strong> A member of our
                        team checks availability and confirms it personally, usually within 48 hours. If we cannot
                        confirm the date you asked for, we refund your deposit in full — or move it to a date that
                        works.
                      </p>
                      <p className="mt-1.5">Your deposit is credited toward your final price.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-ink">Nothing will be charged here</p>
                      <p className="mt-1.5">
                        Online deposits are not switched on yet. Send your request and our team will come back to
                        you within 48 hours.
                      </p>
                    </>
                  )}
                  <p className="mt-2.5 border-t border-black/10 pt-2.5 text-xs">
                    <strong className="text-ink">If you cancel:</strong> {cancellationSummary}{" "}
                    <a href={cancellationHref} target="_blank" rel="noreferrer" className="font-semibold text-gold-dark underline">
                      Read the full policy
                    </a>
                  </p>
                </div>

                {error && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!ready || submitting}
                  className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Continue"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const input =
  "mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/20";
