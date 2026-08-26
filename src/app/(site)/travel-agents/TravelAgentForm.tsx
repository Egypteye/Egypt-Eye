"use client";

import { useState, type FormEvent } from "react";

const SERVICE_OPTIONS = [
  "Inbound Tour Operator",
  "Outbound Travel Agency",
  "DMC",
  "OTA / Online Marketplace",
  "Corporate Travel",
  "Other",
];

const BOOKING_RANGES = ["1–10 travelers/year", "11–50 travelers/year", "51–200 travelers/year", "200+ travelers/year"];

function inputClass(extra = "") {
  return `rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold ${extra}`;
}

type Status = "idle" | "sending" | "sent" | "error";

export function TravelAgentForm() {
  const [services, setServices] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleService(value: string) {
    setServices((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);
    if ((form.get("company") as string)?.trim()) {
      setStatus("sent");
      return;
    }

    if (services.length === 0) {
      setErrorMessage("Please select at least one service you offer.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/travel-agent-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.get("companyName"),
          contactName: form.get("contactName"),
          email: form.get("email"),
          phone: form.get("phone"),
          website: form.get("website"),
          country: form.get("country"),
          services,
          estimatedBookings: form.get("estimatedBookings"),
          message: form.get("message"),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-gold/15 bg-cream p-10 text-center shadow-xl shadow-black/5">
        <p className="font-display text-2xl font-semibold text-ink">Application received</p>
        <p className="mt-3 text-sm text-ink-soft/70">
          Thanks for applying to the Egypt Eye Travel Agent Program. A specialist will review your application and
          reach out to schedule a quick video call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-10">
      <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Company / Agency name *
          <input name="companyName" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Contact person *
          <input name="contactName" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Email *
          <input type="email" name="email" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          WhatsApp / Phone *
          <input type="tel" name="phone" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Website
          <input type="url" name="website" placeholder="https://" className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Country *
          <input name="country" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft sm:col-span-2">
          Services you offer *
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => toggleService(option)}
                className={`rounded-full px-3.5 py-2 text-left text-xs font-medium transition ${
                  services.includes(option) ? "bg-gold text-ink" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft sm:col-span-2">
          Estimated Egypt bookings per year *
          <select name="estimatedBookings" required defaultValue="" className={inputClass()}>
            <option value="" disabled>
              Select a range
            </option>
            {BOOKING_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft sm:col-span-2">
          Anything else we should know?
          <textarea
            name="message"
            rows={3}
            placeholder="Your target markets, client types, or specific destinations you focus on."
            className={inputClass()}
          />
        </label>
      </div>

      {errorMessage && <p className="mt-4 text-sm font-medium text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 w-full rounded-full bg-ink py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Apply to Partner With Us"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-center text-xs text-terracotta">
          Something went wrong sending your application. Please message us directly on WhatsApp instead.
        </p>
      )}
    </form>
  );
}
