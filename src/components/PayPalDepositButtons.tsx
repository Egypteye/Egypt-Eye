"use client";

import { useEffect, useRef, useState } from "react";

// PayPal's buttons, inside the booking dialog.
//
// Inline rather than a redirect because that is what makes the payment
// instant: the customer never loses the page, the dialog knows the moment the
// payment lands, and the booking they were halfway through is still there if
// they change their mind. A redirect to PayPal and back is a page load, a
// return URL, and a customer who may never arrive.
//
// The SDK is loaded on demand — when this component mounts inside an open
// dialog — and never on page load. Nobody browsing photoshoots should be
// paying for PayPal's script, and the overwhelming majority of visitors never
// open this.
//
// The order is NOT created here. It was created server-side when the booking
// was saved, with the amount read from the product and the reference in
// `custom_id`, so `createOrder` has nothing to decide: it hands back an id it
// was given. Approval likewise reports to our server, which asks PayPal what
// actually happened. This component never decides that a payment succeeded.

type Props = {
  orderId: string;
  clientId: string;
  reference: string;
  amountUsd: number;
  /** Called once the server has confirmed what PayPal reported. */
  onSettled: (result: { state: string; message: string; pending?: boolean }) => void;
  /** A link to PayPal, used when the SDK cannot load at all. */
  fallbackUrl?: string;
};

type PayPalButtonsApi = {
  Buttons: (config: Record<string, unknown>) => {
    render: (target: HTMLElement) => Promise<void>;
    close?: () => void;
  };
};

declare global {
  interface Window {
    paypal?: PayPalButtonsApi;
  }
}

const SDK_ID = "paypal-sdk";

/**
 * Loads the SDK once per page.
 *
 * Resolved from the existing tag when one is present, because React in strict
 * mode mounts twice and two copies of the PayPal SDK on one page is a broken
 * page rather than a slow one.
 */
function loadSdk(clientId: string, intentCurrency: string): Promise<PayPalButtonsApi> {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }
    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    const onReady = () => (window.paypal ? resolve(window.paypal) : reject(new Error("sdk loaded without paypal")));
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("sdk failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SDK_ID;
    // `components=buttons` keeps the payload to what is used. The intent is
    // not passed: the order already carries it, set server-side, and a
    // mismatch between the two is a confusing failure at approval time.
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(intentCurrency)}&components=buttons&disable-funding=credit`;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", () => reject(new Error("sdk failed")), { once: true });
    document.head.appendChild(script);
  });
}

export function PayPalDepositButtons({
  orderId,
  clientId,
  reference,
  amountUsd,
  onSettled,
  fallbackUrl,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "working" | "failed">("loading");
  const [error, setError] = useState<string | null>(null);
  // Held in a ref so the SDK's callbacks always see the current callback
  // without the buttons having to be torn down and re-rendered every time a
  // parent re-renders — re-rendering them mid-payment would lose the payment.
  // Written in an effect rather than during render: a ref assignment during
  // render is not guaranteed to have happened by the time anything reads it.
  const settled = useRef(onSettled);
  useEffect(() => {
    settled.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    let cancelled = false;
    let instance: ReturnType<PayPalButtonsApi["Buttons"]> | null = null;

    loadSdk(clientId, "USD")
      .then((paypal) => {
        if (cancelled || !container.current) return;
        instance = paypal.Buttons({
          style: { layout: "vertical", shape: "pill", color: "gold", label: "paypal", height: 48 },

          // Nothing is decided here. The order was created server-side against
          // the saved booking; this hands back its id.
          createOrder: () => orderId,

          onApprove: async () => {
            setStatus("working");
            setError(null);
            try {
              const response = await fetch("/api/bookings/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // The server learns nothing from this that it did not issue.
                // It re-asks PayPal for the amount, the reference and the
                // status, and compares them against the reservation.
                body: JSON.stringify({ reference, orderId }),
              });
              const data = await response.json();
              if (!response.ok) {
                setStatus("ready");
                setError(data?.error ?? "We could not complete that payment. Please message us on WhatsApp.");
                return;
              }
              settled.current({
                state: data.state ?? "held",
                message: data.message ?? "Thank you — we have your deposit.",
                pending: Boolean(data.pending),
              });
            } catch {
              setStatus("ready");
              // The money may well have moved. Saying "it failed" would be a
              // guess, and the wrong one to make: it sends a customer to pay
              // twice. The reference is what makes this recoverable.
              setError(
                `We lost the connection while finishing your payment. Please do not pay again — message us quoting ${reference} and we will check it.`
              );
            }
          },

          onCancel: () => {
            setStatus("ready");
            setError(null);
          },

          onError: (err: unknown) => {
            console.error("paypal buttons error:", err);
            setStatus("ready");
            setError("PayPal could not complete that. Please try again, or message us on WhatsApp.");
          },
        });
        instance
          .render(container.current)
          .then(() => !cancelled && setStatus("ready"))
          .catch(() => !cancelled && setStatus("failed"));
      })
      .catch(() => !cancelled && setStatus("failed"));

    return () => {
      cancelled = true;
      try {
        instance?.close?.();
      } catch {
        // Closing a already-torn-down instance throws; nothing to do about it.
      }
    };
  }, [clientId, orderId, reference]);

  return (
    <div>
      {status === "failed" ? (
        // The SDK can be blocked by an extension, a corporate network or an
        // offline moment. The booking is already saved either way, so this
        // offers the way through rather than a dead end.
        <div className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-sm leading-relaxed text-ink-soft">
          <p className="font-semibold text-ink">PayPal could not load here</p>
          <p className="mt-1.5">
            Your booking is saved as <strong className="font-mono text-ink">{reference}</strong> — nothing is lost.
          </p>
          {fallbackUrl && (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block w-full rounded-full bg-gold px-6 py-3 text-center text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              Open PayPal to pay ${amountUsd}
            </a>
          )}
        </div>
      ) : (
        <>
          {status === "loading" && (
            <p className="py-6 text-center text-sm text-ink-soft">Loading PayPal…</p>
          )}
          <div ref={container} className={status === "loading" ? "hidden" : ""} />
          {status === "working" && (
            <p aria-live="polite" className="mt-3 text-center text-sm font-semibold text-ink">
              Finishing your payment — please do not close this.
            </p>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
