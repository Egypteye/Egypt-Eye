"use client";

import { useEffect, useState, useTransition } from "react";
import { confirmBooking, declineBooking, markBookingChecking } from "../bookingActions";

// The deposit decision, for the one booking on screen.
//
// Confirm is the only control on this site that charges a customer, so it says
// what it will do before it does it, and it reports exactly what happened
// afterwards — including when the charge failed and nothing moved.

type Props = {
  reservationId: string;
  reference: string;
  status: string;
  depositAmount: number | null;
  depositStatus: string;
  heldAt: string | null;
};

const DEPOSIT_LABEL: Record<string, string> = {
  not_required: "No deposit",
  awaiting: "Awaiting payment",
  authorized: "Held, not charged",
  captured: "Charged",
  voided: "Released",
  refunded: "Refunded",
  failed: "Needs attention",
};

export function DepositPanel({
  reservationId,
  reference,
  status,
  depositAmount,
  depositStatus,
  heldAt,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [reason, setReason] = useState("");

  // How long the hold has been sitting is what decides how urgent this is. It
  // is read after mount rather than during render: the clock is impure, and
  // computing it on the server would bake in the time the page was rendered
  // and disagree with the browser on hydration.
  const [heldHours, setHeldHours] = useState<number | null>(null);
  useEffect(() => {
    if (!heldAt) return;
    const tick = () => setHeldHours(Math.floor((Date.now() - new Date(heldAt).getTime()) / 3_600_000));
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, [heldAt]);

  const decided = status === "confirmed" || status === "declined" || status === "cancelled";
  const willCharge = depositStatus === "authorized" && depositAmount !== null;

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => setResult(await action()));
  }

  return (
    <section className="rounded-2xl border border-gold/30 bg-sand/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Deposit booking</h2>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink-soft">
          {depositAmount !== null ? `$${depositAmount} · ` : ""}
          {DEPOSIT_LABEL[depositStatus] ?? depositStatus}
        </span>
      </div>

      {heldHours !== null && !decided && (
        <p className={`mt-2 text-sm ${heldHours >= 48 ? "font-semibold text-terracotta" : "text-ink-soft"}`}>
          Held {heldHours} hour{heldHours === 1 ? "" : "s"} ago.
          {heldHours >= 48 && " The customer was promised an answer within 48 hours."}
        </p>
      )}

      {decided ? (
        <p className="mt-3 text-sm text-ink-soft">
          This booking is <strong className="text-ink">{status}</strong>. Nothing further to decide here.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {willCharge
              ? `Confirming charges the $${depositAmount} hold and tells the customer their date is confirmed. Declining releases the hold and offers them other dates.`
              : "No deposit is held on this booking, so confirming charges nothing."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => confirmBooking(reservationId))}
              className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-50"
            >
              {pending ? "Working…" : willCharge ? `Confirm and charge $${depositAmount}` : "Confirm"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => declineBooking(reservationId, reason))}
              className="rounded-full border border-terracotta/40 px-5 py-2.5 text-xs font-semibold text-terracotta transition hover:bg-terracotta/10 disabled:opacity-50"
            >
              Cannot do this date
            </button>
            {status !== "checking" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => markBookingChecking(reservationId))}
                className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-semibold text-ink-soft transition hover:text-ink disabled:opacity-50"
              >
                I&apos;m checking this
              </button>
            )}
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-semibold text-ink-soft">
              If you cannot do the date, a line for the customer (optional)
            </span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              placeholder="Our photographer is already booked that morning."
              className="mt-1 w-full rounded-lg border border-black/10 bg-cream px-3 py-2 text-sm"
            />
          </label>
        </>
      )}

      {result && (
        <p
          role="status"
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            result.ok ? "bg-nile/10 text-nile" : "bg-terracotta/10 text-terracotta"
          }`}
        >
          {result.message}
        </p>
      )}

      <p className="mt-3 text-xs text-ink-soft">
        {reference} · the customer is only ever told their date is confirmed from here.
      </p>
    </section>
  );
}
