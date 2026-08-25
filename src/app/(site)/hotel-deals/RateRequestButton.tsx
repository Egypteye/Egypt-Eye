"use client";

import { useEffect, useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-sand px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft/60">{label}</span>
      {children}
    </label>
  );
}

export function RateRequestButton({
  hotelId,
  hotelName,
  className = "",
}: {
  hotelId: string;
  hotelName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light ${className}`}
      >
        Check Latest Rates
      </button>
      {open && <RateRequestModal hotelId={hotelId} hotelName={hotelName} onClose={() => setOpen(false)} />}
    </>
  );
}

function RateRequestModal({ hotelId, hotelName, onClose }: { hotelId: string; hotelName: string; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/hotel-rate-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          hotelName,
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="animate-fade-up max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-request-modal-title"
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-black/5 bg-cream/95 p-6 backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Check Latest Rates</p>
            <p id="rate-request-modal-title" className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
              {hotelName}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft/60 transition hover:bg-sand-dim hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
              <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="font-display text-lg font-semibold text-ink">Request sent</p>
            <p className="text-sm text-ink-soft/70">
              Our team will confirm the latest rates and availability for {hotelName} and get back to you by email.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            <p className="text-sm text-ink-soft/70">
              The rates shown are our current Egypt Eye deal rates, not live availability. Leave your email and
              we&rsquo;ll confirm the latest pricing and availability for your dates.
            </p>
            <Field label="Name" htmlFor="rate-name">
              <input id="rate-name" name="name" type="text" maxLength={200} className={inputClass} />
            </Field>
            <Field label="Email" htmlFor="rate-email">
              <input id="rate-email" name="email" type="email" required maxLength={200} className={inputClass} />
            </Field>
            <Field label="Your dates or any other details" htmlFor="rate-message">
              <textarea
                id="rate-message"
                name="message"
                rows={3}
                maxLength={2000}
                placeholder="e.g. Check-in and check-out dates, number of guests"
                className={`${inputClass} resize-none`}
              />
            </Field>

            {status === "error" && <p className="text-sm text-terracotta">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Request Latest Rates"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
