"use client";

import type { PaymentMode } from "@/lib/booking/wording";
import { PhoneField } from "@/components/PhoneField";
import { useSecureBooking } from "@/lib/booking/useSecureBooking";
import { resultCopy } from "@/lib/booking/secureResultCopy";

// The form. Four questions, which is the whole point of this path existing.
//
// THIS FILE IS NOW MARKUP ONLY, and that is the change worth understanding.
//
// Flying Dresses Egypt takes deposits on its own domain, in its own chrome —
// brand.css, no Tailwind — so these utility classes would render it unstyled.
// The tempting fix is to copy this file and restyle it, which would leave two
// implementations of the sequence that decides whether a customer is sent to
// PayPal, sent a payment link, or told a human will come back.
//
// So the behaviour moved to lib/booking/useSecureBooking.ts and the sentences
// to lib/booking/secureResultCopy.ts. What is left here is a brand's opinion
// about borders and type. The Flying Dresses component beside it holds a
// different opinion about the same two authorities.
//
// The rule from docs/booking-deposits.md still governs the copy, and is now
// enforced where the copy lives: the word "confirmed" never appears as a
// claim. The customer has made a request and, where deposits are live, had
// money held. Neither is a confirmation, and a person has not looked at it
// yet.

type Props = {
  productType: "photoshoot" | "experience";
  productSlug: string;
  productTitle: string;
  /** The share taken online, shown so the page and the popup agree. */
  depositPercent: number;
  /** How the deposit is taken — see the same prop on SecureDateButton. */
  paymentMode: PaymentMode;
};

export function SecureBookingForm({
  productType,
  productSlug,
  productTitle,
  depositPercent,
  paymentMode,
}: Props) {
  const { form, set, submitting, error, setPhoneProblem, result, ready, submit } = useSecureBooking({
    productType,
    productSlug,
  });

  if (result) {
    const copy = resultCopy(result, { productTitle, depositPercent });

    return (
      <div className="mt-8 rounded-2xl border border-gold/30 bg-sand/40 p-6">
        <h2 className="font-display text-2xl font-semibold text-ink">{copy.heading}</h2>
        {copy.body.map((paragraph) => (
          <p key={paragraph} className="mt-3 text-sm leading-relaxed text-ink-soft">
            {paragraph}
          </p>
        ))}
        {copy.action && (
          <a
            href={copy.action.href}
            className="mt-5 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
          >
            {copy.action.label}
          </a>
        )}
        <p className="mt-4 text-xs text-ink-soft">{copy.footnote}</p>
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
          <PhoneField
            errorClassName="text-sm font-semibold text-terracotta"
            id="secure-phone"
            value={form.guestPhone}
            onChange={(next, problem) => {
              set("guestPhone", next);
              setPhoneProblem(problem);
            }}
            inputLabel="Phone number"
            selectClassName={inputClass}
            inputClassName={inputClass}
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
          : `Pressing this does not charge you. The next step takes you to PayPal for the ${depositPercent}% deposit.`}
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
