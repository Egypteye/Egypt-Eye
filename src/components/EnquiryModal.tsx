"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTr } from "@/i18n/LocaleProvider";

type ItemType = "tour" | "experience" | "photoshoot" | "signatureExperience";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-sand px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">{label}</span>
      {children}
    </label>
  );
}

/**
 * One "2 adults, 1 child" string out of the two counts the form collects.
 *
 * The enquiry API and the reservations email have always taken a single
 * `travelers` value, and they still do — splitting the control in the UI did
 * not need a second shape flowing through the route and the template. Zero
 * children is left out entirely rather than written as "0 children", which
 * reads as a correction nobody made.
 */
function travelersSummary(adults: FormDataEntryValue | null, children: FormDataEntryValue | null): string {
  const a = Math.max(1, Number(adults) || 1);
  const c = Math.max(0, Number(children) || 0);
  const adultPart = `${a} ${a === 1 ? "adult" : "adults"}`;
  if (c === 0) return adultPart;
  return `${adultPart}, ${c} ${c === 1 ? "child" : "children"}`;
}

/**
 * Folds the ticked options into the free-text message.
 *
 * The message is capped at 2000 characters by the API, and the guest's own
 * words are the part worth keeping, so the options go first and the message
 * follows — a truncation then loses the end of a sentence rather than the
 * preferences the team needs to quote.
 */
function withOptions(message: FormDataEntryValue | null, picked: string[]): string {
  const typed = typeof message === "string" ? message.trim() : "";
  if (picked.length === 0) return typed;
  const header = `Interested in: ${picked.join(", ")}`;
  return typed ? `${header}\n\n${typed}` : header;
}

export function EnquiryModal({
  itemType,
  itemTitle,
  itemSlug,
  options,
  onClose,
}: {
  itemType: ItemType;
  itemTitle: string;
  itemSlug: string;
  /** Product-specific things a guest can tick. Absent on most products. */
  options?: string[];
  onClose: () => void;
}) {
  const tr = useTr();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const ITEM_LABELS: Record<ItemType, string> = {
    tour: tr("Tour"),
    experience: tr("Experience"),
    photoshoot: tr("Photoshoot"),
    signatureExperience: tr("Signature Experience"),
  };

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
      travelers: travelersSummary(form.get("adults"), form.get("children")),
      hotel: form.get("hotel"),
      pickupLocation: form.get("pickupLocation"),
      preferredTime: form.get("preferredTime"),
      // The ticked options ride in the message rather than in a field of
      // their own: they are free text the team reads, the API and the email
      // already carry a message, and a new field would have needed a shape
      // agreed in three more places to say the same sentence.
      message: withOptions(form.get("message"), picked),
    };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || tr("Something went wrong. Please try again."));
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : tr("Something went wrong. Please try again."));
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
              {tr("Enquire About This {item}").replace("{item}", ITEM_LABELS[itemType])}
            </p>
            <p id="enquiry-modal-title" className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
              {itemTitle}
            </p>
          </div>
          <button
            type="button"
            aria-label={tr("Close")}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft/85 transition hover:bg-sand-dim hover:text-ink"
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
            <p className="font-display text-lg font-semibold text-ink">{tr("Enquiry sent")}</p>
            <p className="text-sm text-ink-soft">{tr("Thanks — our reservations team has everything they need and will get back to you shortly.")}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark">{tr("Close")}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
              <label>{tr("Company")}<input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <Field label={tr("Full Name")} htmlFor="enq-name">
              <input id="enq-name" name="name" type="text" required maxLength={200} className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={tr("Email")} htmlFor="enq-email">
                <input id="enq-email" name="email" type="email" required maxLength={200} className={inputClass} />
              </Field>
              <Field label={tr("WhatsApp / Phone")} htmlFor="enq-phone">
                <input id="enq-phone" name="phone" type="tel" required maxLength={60} className={inputClass} />
              </Field>
            </div>

            <Field label={tr("Nationality")} htmlFor="enq-nationality">
              <input id="enq-nationality" name="nationality" type="text" required maxLength={100} className={inputClass} />
            </Field>

            {/* Adults and children are counted separately rather than as one
                "Travelers" number. Several products price a child differently
                from an adult, so a single headcount made the reservations team
                write back to ask — and the customer could not state the thing
                the policy actually turns on. The two are still sent as the one
                `travelers` string the API and the email already understand. */}
            <div className="grid grid-cols-2 gap-3">
              <Field label={tr("Adults")} htmlFor="enq-adults">
                <input
                  id="enq-adults"
                  name="adults"
                  type="number"
                  min={1}
                  max={50}
                  defaultValue={2}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label={tr("Children (under 12)")} htmlFor="enq-children">
                <input
                  id="enq-children"
                  name="children"
                  type="number"
                  min={0}
                  max={50}
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={flexibleDates ? tr("Around this date") : tr("Start Date")} htmlFor="enq-start">
                <input
                  id="enq-start"
                  name="startDate"
                  type="date"
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={inputClass}
                />
              </Field>
              <Field label={tr("End Date")} htmlFor="enq-end">
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
            <label className="-mt-2 flex items-center gap-2 text-xs text-ink-soft/85">
              <input
                type="checkbox"
                checked={flexibleDates}
                onChange={(e) => setFlexibleDates(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-black/20 accent-gold-dark"
              />{tr("My travel dates are flexible")}</label>

            <div className="grid grid-cols-2 gap-3">
              <Field label={tr("Hotel (for pickup)")} htmlFor="enq-hotel">
                <input id="enq-hotel" name="hotel" type="text" maxLength={200} placeholder={tr("Optional")} className={inputClass} />
              </Field>
              <Field label={tr("Preferred Time")} htmlFor="enq-time">
                <input id="enq-time" name="preferredTime" type="text" maxLength={100} placeholder={tr("e.g. Morning")} className={inputClass} />
              </Field>
            </div>
            <Field label={tr("Pickup / Drop-off Location")} htmlFor="enq-pickup">
              <input
                id="enq-pickup"
                name="pickupLocation"
                type="text"
                maxLength={300}
                placeholder={tr("Optional — hotel address or area, if different from above")}
                className={inputClass}
              />
            </Field>

            {/* Product-specific questions. Rendered only when the product
                carries them, so every other enquiry form is unchanged. */}
            {options && options.length > 0 && (
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">
                  {tr("I'm interested in")}
                </legend>
                <div className="mt-2 flex flex-col gap-2">
                  {options.map((option) => {
                    const on = picked.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-ink-soft"
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            setPicked((prev) =>
                              on ? prev.filter((p) => p !== option) : [...prev, option]
                            )
                          }
                          className="h-4 w-4 rounded border-black/20 accent-gold-dark"
                        />
                        {tr(option)}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <Field label={tr("Additional Questions or Requests")} htmlFor="enq-message">
              <textarea
                id="enq-message"
                name="message"
                rows={3}
                maxLength={2000}
                placeholder={tr("Anything else we should know?")}
                className={`${inputClass} resize-none`}
              />
            </Field>

            {status === "error" && <p className="text-sm text-terracotta">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
            >
              {status === "submitting" ? tr("Sending…") : tr("Send Enquiry")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
