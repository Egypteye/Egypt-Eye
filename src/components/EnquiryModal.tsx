"use client";

import { useEffect, useState, type FormEvent } from "react";

type ItemType = "tour" | "experience" | "photoshoot" | "signatureExperience";

const ITEM_LABELS: Record<ItemType, string> = {
  tour: "Tour",
  experience: "Experience",
  photoshoot: "Photoshoot",
  signatureExperience: "Signature Experience",
};

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

export function EnquiryModal({
  itemType,
  itemTitle,
  itemSlug,
  onClose,
}: {
  itemType: ItemType;
  itemTitle: string;
  itemSlug: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);

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
    if ((form.get("company") as string)?.trim()) {
      setStatus("success");
      return;
    }

    const payload = {
      itemType,
      itemSlug,
      itemTitle,
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      nationality: form.get("nationality"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      flexibleDates,
      travelers: form.get("travelers"),
      hotel: form.get("hotel"),
      pickupLocation: form.get("pickupLocation"),
      preferredTime: form.get("preferredTime"),
      message: form.get("message"),
    };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        aria-labelledby="enquiry-modal-title"
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-black/5 bg-cream/95 p-6 backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
              Enquire About This {ITEM_LABELS[itemType]}
            </p>
            <p id="enquiry-modal-title" className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
              {itemTitle}
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
            <p className="font-display text-lg font-semibold text-ink">Enquiry sent</p>
            <p className="text-sm text-ink-soft/70">
              Thanks — our reservations team has everything they need and will get back to you shortly.
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
            <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
              <label>
                Company
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <Field label="Full Name" htmlFor="enq-name">
              <input id="enq-name" name="name" type="text" required maxLength={200} className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" htmlFor="enq-email">
                <input id="enq-email" name="email" type="email" required maxLength={200} className={inputClass} />
              </Field>
              <Field label="WhatsApp / Phone" htmlFor="enq-phone">
                <input id="enq-phone" name="phone" type="tel" required maxLength={60} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nationality" htmlFor="enq-nationality">
                <input id="enq-nationality" name="nationality" type="text" required maxLength={100} className={inputClass} />
              </Field>
              <Field label="Travelers" htmlFor="enq-travelers">
                <input
                  id="enq-travelers"
                  name="travelers"
                  type="number"
                  min={1}
                  max={50}
                  defaultValue={2}
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={flexibleDates ? "Around this date" : "Start Date"} htmlFor="enq-start">
                <input
                  id="enq-start"
                  name="startDate"
                  type="date"
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={inputClass}
                />
              </Field>
              <Field label="End Date" htmlFor="enq-end">
                <input
                  id="enq-end"
                  name="endDate"
                  type="date"
                  disabled={flexibleDates}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={`${inputClass} disabled:opacity-40`}
                />
              </Field>
            </div>
            <label className="-mt-2 flex items-center gap-2 text-xs text-ink-soft/60">
              <input
                type="checkbox"
                checked={flexibleDates}
                onChange={(e) => setFlexibleDates(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-black/20 accent-gold-dark"
              />
              My travel dates are flexible
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Hotel (for pickup)" htmlFor="enq-hotel">
                <input id="enq-hotel" name="hotel" type="text" maxLength={200} placeholder="Optional" className={inputClass} />
              </Field>
              <Field label="Preferred Time" htmlFor="enq-time">
                <input id="enq-time" name="preferredTime" type="text" maxLength={100} placeholder="e.g. Morning" className={inputClass} />
              </Field>
            </div>
            <Field label="Pickup / Drop-off Location" htmlFor="enq-pickup">
              <input
                id="enq-pickup"
                name="pickupLocation"
                type="text"
                maxLength={300}
                placeholder="Optional — hotel address or area, if different from above"
                className={inputClass}
              />
            </Field>

            <Field label="Additional Questions or Requests" htmlFor="enq-message">
              <textarea
                id="enq-message"
                name="message"
                rows={3}
                maxLength={2000}
                placeholder="Anything else we should know?"
                className={`${inputClass} resize-none`}
              />
            </Field>

            {status === "error" && <p className="text-sm text-terracotta">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send Enquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
