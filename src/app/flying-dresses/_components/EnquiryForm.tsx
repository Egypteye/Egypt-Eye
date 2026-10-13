"use client";

import { useMemo, useState } from "react";
import {
  RENTAL_DELIVERY_LABELS,
  addOns,
  dresses,
  flyingDressEnquiry,
  mensOutfits,
  packages,
  rentalServices,
  whatsappHref,
} from "@/content/flyingDresses";

/**
 * The enquiry form.
 *
 * -------------------------------------------------------------------------
 * TWO WAYS OUT, AND BOTH ARE REAL
 * -------------------------------------------------------------------------
 * The form posts to /api/flying-dresses-enquiry, which emails the desk. The
 * WhatsApp button beside it opens a message pre-filled from whatever is
 * currently typed in. Neither is a decoration for the other: a visitor who
 * fills three fields and then decides they would rather chat gets those three
 * fields carried into the chat.
 *
 * The WhatsApp link is a real <a href>, built from component state. It works
 * with no network round-trip, and it is the stated fallback if the POST fails
 * — which it will on any deployment with no RESEND_API_KEY, so that path is
 * not hypothetical.
 *
 * -------------------------------------------------------------------------
 * VALIDATION
 * -------------------------------------------------------------------------
 * Name and email only. Everything else is optional, deliberately: each extra
 * required field on an enquiry form costs completions, and the business can
 * ask for a date in the reply. The server enforces the same two, so the
 * browser's copy is a convenience rather than the rule.
 *
 * Errors are rendered as text next to the field AND wired with
 * `aria-invalid` + `aria-describedby`, because a red border is invisible to a
 * screen reader and to a lot of colour-blind visitors. The summary at the top
 * is focused on failure so a keyboard visitor is told what happened instead of
 * being left where they were.
 *
 * -------------------------------------------------------------------------
 * WHAT IT DOES NOT DO
 * -------------------------------------------------------------------------
 * No card fields. No date-availability check. No total. No "booking
 * confirmed". The success message says the enquiry was sent and that nothing
 * is booked, which is the whole truth about what just happened.
 */

type Status = "idle" | "sending" | "sent" | "error";

export function EnquiryForm({
  initialPackage = "",
  initialService = "",
  initialDress = "",
  initialMens = "",
}: {
  initialPackage?: string;
  initialService?: string;
  initialDress?: string;
  initialMens?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pkg, setPkg] = useState(initialPackage);
  const [service, setService] = useState(initialService);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const [dress, setDress] = useState(initialDress);
  const [mens, setMens] = useState(initialMens);
  const [extras, setExtras] = useState<string[]>([]);
  const [hotel, setHotel] = useState("");
  const [delivery, setDelivery] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; form?: string }>({});

  /** Delivery only makes sense when something is being handed over. */
  const needsDelivery = service !== "";

  // The WhatsApp message, kept in sync with the form. Built through the same
  // encoder the buttons elsewhere on the site use, so there is one message
  // shape rather than one per entry point.
  const whatsappMessage = useMemo(() => {
    const chosenPackage = packages.find((p) => p.slug === pkg);
    const chosenService = rentalServices.find((s) => s.slug === service);
    return flyingDressEnquiry({
      subject: chosenService?.title ?? chosenPackage?.title ?? undefined,
      name,
      location: chosenPackage?.name,
      date,
      people,
      dress: dresses.find((d) => d.id === dress)?.name,
      mensOutfit: mensOutfits.find((m) => m.id === mens)?.name,
      extras: extras
        .map((id) => addOns.find((a) => a.id === id)?.label)
        .filter((label): label is string => Boolean(label)),
      hotel,
      delivery: delivery ? RENTAL_DELIVERY_LABELS[delivery as "hotel-delivery" | "collection"] : undefined,
      notes: message,
    });
  }, [pkg, service, name, date, people, dress, mens, extras, hotel, delivery, message]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please give us an email address we can reply to.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/flying-dresses-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          package: pkg,
          service,
          date,
          people,
          dress,
          mens,
          extras,
          hotel,
          delivery,
          message,
          company,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setErrors({ form: data.error || "We could not send that just now." });
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrors({
        form: "We could not reach the server. Please message us on WhatsApp instead.",
      });
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="fd-form-status" role="status">
        <p className="fd-display fd-h4" style={{ margin: "0 0 0.5rem" }}>
          Thank you — your enquiry is with us.
        </p>
        <p style={{ margin: "0 0 0.75rem" }}>
          We have emailed you a copy. We will come back to you about the date, and about the price
          where it is not published.
        </p>
        <p className="fd-muted" style={{ margin: 0, fontSize: "var(--fd-step--1)" }}>
          Nothing is booked yet and nothing has been charged. If you chose a dress we have noted it
          as your preference, and we will tell you before your shoot if it is not available on the
          day.
        </p>
      </div>
    );
  }

  return (
    <form className="fd-form" onSubmit={onSubmit} noValidate>
      {status === "error" && errors.form ? (
        <div className="fd-form-status" data-tone="error" role="alert" tabIndex={-1}>
          <p style={{ margin: "0 0 0.75rem" }}>{errors.form}</p>
          <a
            className="fd-btn fd-btn-ghost"
            href={whatsappHref(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send it on WhatsApp instead
            <span className="fd-sr"> (opens in a new tab)</span>
          </a>
        </div>
      ) : null}

      <div className="fd-form fd-form-2">
        <Field id="fd-name" label="Your name" error={errors.name} required>
          <input
            id="fd-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "fd-name-error" : undefined}
            required
          />
        </Field>

        <Field id="fd-email" label="Email" error={errors.email} required>
          <input
            id="fd-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "fd-email-error" : undefined}
            required
          />
        </Field>

        <Field id="fd-phone" label="Phone or WhatsApp" hint="Optional, but it is the fastest way to reach you.">
          <input
            id="fd-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field id="fd-people" label="How many people">
          <input
            id="fd-people"
            name="people"
            type="number"
            min={1}
            max={20}
            inputMode="numeric"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />
        </Field>

        <Field id="fd-package" label="Photoshoot location">
          <select id="fd-package" name="package" value={pkg} onChange={(e) => setPkg(e.target.value)}>
            <option value="">Not sure yet — advise me</option>
            {packages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} — ${p.priceUsd} per person
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="fd-service"
          label="Or hire without a shoot"
          hint="Dress, accessories or men's attire on their own. Priced on request."
        >
          <select
            id="fd-service"
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">No — I want a photoshoot</option>
            {rentalServices.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>

        <Field id="fd-date" label="Preferred date" hint="We will confirm whether it is free.">
          <input
            id="fd-date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field id="fd-dress" label="Dress" hint="A preference, not a reservation.">
          <select id="fd-dress" name="dress" value={dress} onChange={(e) => setDress(e.target.value)}>
            <option value="">No preference</option>
            {dresses.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="fd-mens" label="Men's attire" hint="Five traditional styles.">
          <select id="fd-mens" name="mens" value={mens} onChange={(e) => setMens(e.target.value)}>
            <option value="">None</option>
            {mensOutfits.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        {needsDelivery ? (
          <Field id="fd-delivery" label="Delivery or collection">
            <select
              id="fd-delivery"
              name="delivery"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
            >
              <option value="">Either is fine</option>
              <option value="hotel-delivery">{RENTAL_DELIVERY_LABELS["hotel-delivery"]}</option>
              <option value="collection">{RENTAL_DELIVERY_LABELS.collection}</option>
            </select>
          </Field>
        ) : null}

        <div className="fd-field fd-field-full">
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend
              style={{
                fontSize: "var(--fd-step--1)",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fd-ink-soft)",
                padding: 0,
                marginBottom: "0.6rem",
              }}
            >
              Anything to add
            </legend>
            <div className="fd-swatch-row">
              {addOns.map((addOn) => {
                const checked = extras.includes(addOn.id);
                return (
                  <label
                    key={addOn.id}
                    className="fd-swatch"
                    style={{ cursor: "pointer", textTransform: "none", letterSpacing: "0.02em" }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setExtras((current) =>
                          e.target.checked
                            ? [...current, addOn.id]
                            : current.filter((id) => id !== addOn.id)
                        )
                      }
                      // 1.5rem = 24px, WCAG 2.2 2.5.8 Target Size (Minimum). These were
                      // 1.1rem/17.6px and failed it.
                      style={{ width: "1.5rem", height: "1.5rem", minHeight: 0, flex: "none" }}
                    />
                    <span>
                      {addOn.label}
                      {" — "}
                      {addOn.priceUsd === null
                        ? "on request"
                        : `${addOn.fromPrice ? "from " : ""}$${addOn.priceUsd}`}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="fd-hint" style={{ marginTop: "0.6rem" }}>
              Nothing here is charged now. Anything marked &ldquo;from&rdquo; or &ldquo;on
              request&rdquo; is confirmed with you before you commit.
            </p>
          </fieldset>
        </div>

        <Field
          id="fd-hotel"
          label="Hotel or pickup area"
          hint="For door-to-door transport, or for delivering a dress."
          full
        >
          <input
            id="fd-hotel"
            name="hotel"
            autoComplete="off"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
          />
        </Field>

        <Field id="fd-message" label="Anything else" full>
          <textarea
            id="fd-message"
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>
      </div>

      {/* Off-screen rather than display:none — some bots fill positioned
          fields and skip hidden ones, which is the point of it. */}
      <div className="fd-honeypot" aria-hidden="true">
        <label htmlFor="fd-company">Company</label>
        <input
          id="fd-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="fd-actions">
        <button className="fd-btn" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        <a
          className="fd-btn fd-btn-ghost"
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Send on WhatsApp
          <span className="fd-sr"> (opens in a new tab)</span>
        </a>
      </div>

      <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)", margin: 0 }}>
        This form sends an enquiry. It does not book anything and it never asks for card details.
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
    <div className={`fd-field${full ? " fd-field-full" : ""}`}>
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
