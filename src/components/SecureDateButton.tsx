"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// "Secure your date" — the fast path, opened as a dialog from the product page.
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
  /** Whether a deposit can actually be taken right now. */
  canTakeDeposit: boolean;
  /** The site's real cancellation summary — never written here. */
  cancellationSummary: string;
  cancellationHref: string;
  className?: string;
  label?: string;
};

type Stage =
  | { kind: "form" }
  | { kind: "payDeposit"; reference: string; approvalUrl: string }
  | { kind: "awaitingTeam"; reference: string; notice?: string };

export function SecureDateButton({
  productType,
  productSlug,
  productTitle,
  depositLabel,
  canTakeDeposit,
  cancellationSummary,
  cancellationHref,
  className,
  label = "Secure your date",
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
        {label}
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
                {stage.kind === "awaitingTeam" ? "Your request is with our team" : "Secure your date"}
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

            {stage.kind === "awaitingTeam" ? (
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
                  {canTakeDeposit ? (
                    <>
                      <p className="font-semibold text-ink">
                        {depositLabel} deposit — held, not charged
                      </p>
                      <p className="mt-1.5">
                        This is not an instant booking. Our team confirms your date personally, usually within 48
                        hours. We only take the deposit once it is confirmed — if we cannot confirm it, the hold is
                        released and you are not charged.
                      </p>
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
                  {submitting
                    ? "Sending…"
                    : canTakeDeposit
                      ? `Hold my date — ${depositLabel}`
                      : "Send my request"}
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
