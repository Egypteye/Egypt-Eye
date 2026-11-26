"use client";

import { PhoneField } from "@/components/PhoneField";
import { useSecureBooking } from "@/lib/booking/useSecureBooking";
import { resultCopy } from "@/lib/booking/secureResultCopy";
import type { PaymentMode } from "@/lib/booking/wording";
import { urgentCall, whatsappHref } from "@/content/flyingDresses";

/**
 * THE DEPOSIT FORM, IN THIS BRAND'S CHROME.
 *
 * =========================================================================
 * WHAT IS SHARED AND WHAT IS NOT
 * =========================================================================
 * Everything that decides anything is shared with Egypt Eye's form:
 *
 *   lib/booking/useSecureBooking.ts   the state, the gate, the POST, the
 *                                     reading of what came back
 *   lib/booking/secureResultCopy.ts   every sentence the customer reads
 *                                     afterwards, and which result gets a
 *                                     link on it
 *
 * What is not shared is this file: `fd-` classes instead of Tailwind
 * utilities, because Flying Dresses loads brand.css and no Tailwind at all.
 * That is the entire reason two components exist. If this file ever grows a
 * second opinion about what a booking means, the split has failed and the
 * opinion belongs upstream in one of the two modules above.
 *
 * `productRail()` is not consulted here either. Price, deposit share and
 * whether the product can be booked at all are resolved on the server before
 * this renders, and arrive as props. CLAUDE.md section 5: one authority, no
 * second answer.
 *
 * =========================================================================
 * THE WAY OUT, WHICH THIS BRAND ALREADY HAS A HOUSE STYLE FOR
 * =========================================================================
 * The enquiry form offers WhatsApp and a plain-text phone number when the
 * POST fails, on the reasoning that somebody whose form just failed has least
 * patience for a second route that might also fail. A checkout deserves that
 * more, not less: this is the screen where a visitor was ready to pay.
 *
 * The Field helper below mirrors the one in EnquiryForm rather than importing
 * it, because that one is local to that file. Extracting a shared one across
 * the three Flying Dresses forms is worth doing and is not this change.
 */

type Props = {
  productType: "photoshoot" | "experience";
  productSlug: string;
  productTitle: string;
  /** The share taken online, so this page and the result screen agree. */
  depositPercent: number;
  /** How the deposit is taken — see lib/booking/wording.ts. */
  paymentMode: PaymentMode;
};

export function SecureBookingFields({
  productType,
  productSlug,
  productTitle,
  depositPercent,
  paymentMode,
}: Props) {
  const { form, set, submitting, error, phoneProblem, setPhoneProblem, result, ready, submit } =
    useSecureBooking({ productType, productSlug });

  if (result) {
    const copy = resultCopy(result, { productTitle, depositPercent });
    return (
      <div className="fd-form-status" role="status">
        <p className="fd-display fd-h4" style={{ margin: "0 0 0.5rem" }}>
          {copy.heading}
        </p>
        {copy.body.map((paragraph) => (
          <p key={paragraph} style={{ margin: "0 0 0.75rem" }}>
            {paragraph}
          </p>
        ))}
        {copy.action ? (
          <a className="fd-btn" href={copy.action.href}>
            {copy.action.label}
          </a>
        ) : null}
        <p className="fd-muted" style={{ margin: "0.75rem 0 0", fontSize: "var(--fd-step--1)" }}>
          {copy.footnote}
        </p>
      </div>
    );
  }

  return (
    // The top margin is the form's own: fd-form is a bare grid, so without it
    // the first label sat flush against whatever the page put above it.
    <form className="fd-form" style={{ marginTop: "2rem" }} onSubmit={submit} noValidate>
      {error ? (
        <div className="fd-form-status" data-tone="error" role="alert" tabIndex={-1}>
          <p style={{ margin: "0 0 0.75rem" }}>{error}</p>
          <a
            className="fd-btn fd-btn-ghost"
            href={whatsappHref(
              `Hello, I would like to book ${productTitle}. The form on your site would not send.`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send it on WhatsApp instead
            <span className="fd-sr"> (opens in a new tab)</span>
          </a>
          <p style={{ margin: "0.75rem 0 0" }}>
            Or call us on{" "}
            <a href={`tel:${urgentCall.fallback.tel}`} className="fd-link">
              {urgentCall.fallback.display}
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="fd-form fd-form-2">
        <Field id="fd-secure-date" label="Your date" required>
          <input
            id="fd-secure-date"
            name="startsAt"
            type="date"
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
            required
          />
        </Field>

        <Field
          id="fd-secure-slot"
          label="Time of day"
          hint="Sunrise, morning, sunset, if you have a preference."
        >
          <input
            id="fd-secure-slot"
            name="slotLabel"
            type="text"
            maxLength={120}
            value={form.slotLabel}
            onChange={(e) => set("slotLabel", e.target.value)}
          />
        </Field>

        <Field id="fd-secure-people" label="How many people" required>
          <input
            id="fd-secure-people"
            name="people"
            type="number"
            min={1}
            max={20}
            value={form.people}
            onChange={(e) => set("people", Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
          />
        </Field>

        <Field id="fd-secure-name" label="Your name" required>
          <input
            id="fd-secure-name"
            name="guestName"
            autoComplete="name"
            maxLength={200}
            value={form.guestName}
            onChange={(e) => set("guestName", e.target.value)}
            required
          />
        </Field>

        <Field id="fd-secure-email" label="Email" required>
          <input
            id="fd-secure-email"
            name="guestEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.guestEmail}
            onChange={(e) => set("guestEmail", e.target.value)}
            required
          />
        </Field>

        <Field
          id="fd-secure-phone"
          label="Phone or WhatsApp"
          error={phoneProblem ?? undefined}
          hint="So we can reach you quickly if the date needs a conversation."
        >
          <PhoneField
            id="fd-secure-phone"
            showInlineError={false}
            value={form.guestPhone}
            onChange={(next, problem) => {
              set("guestPhone", next);
              setPhoneProblem(problem);
            }}
            inputLabel="Phone number"
          />
        </Field>

        <Field id="fd-secure-notes" label="Anything we should know" full>
          <textarea
            id="fd-secure-notes"
            name="notes"
            rows={3}
            maxLength={2000}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </div>

      <div className="fd-actions">
        <button className="fd-btn" type="submit" disabled={!ready || submitting}>
          {submitting ? "Sending…" : "Continue"}
        </button>
      </div>

      {/* Restated at the button, because this is the moment of commitment and
          it is the last thing read before pressing it. */}
      <p className="fd-hint" style={{ marginTop: "0.75rem" }}>
        {paymentMode === "none"
          ? "Pressing this does not charge you. It sends your request to our team."
          : `Pressing this does not charge you. The next step takes you to PayPal for the ${depositPercent}% deposit.`}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required = false,
  full = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    // alignContent: start, because .fd-field is a grid and a two-column row is
    // as tall as its tallest cell. Email sits beside the phone field, which
    // carries a hint, so without this the email input stretched to roughly
    // twice the height of every other input on the page.
    <div
      className={`fd-field${full ? " fd-field-full" : ""}`}
      style={{ alignContent: "start" }}
    >
      <label htmlFor={id}>
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true">*</span>
            <span className="fd-sr"> (required)</span>
          </>
        ) : null}
      </label>
      {children}
      {hint ? <p className="fd-hint">{hint}</p> : null}
      {error ? (
        <p className="fd-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
