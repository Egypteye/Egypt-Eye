"use client";

import { useState, type FormEvent } from "react";

const PROMOTION_METHODS = [
  "Blog / Website",
  "YouTube",
  "Instagram / TikTok",
  "Email Newsletter",
  "Facebook Group / Community",
  "Coupon / Deals Site",
  "Other",
];

const AUDIENCE_SIZES = ["Under 1,000", "1,000–10,000", "10,000–50,000", "50,000–200,000", "200,000+"];

function inputClass(extra = "") {
  return `rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold ${extra}`;
}

type Status = "idle" | "sending" | "sent" | "error";

export function AffiliateForm() {
  const [methods, setMethods] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleMethod(value: string) {
    setMethods((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);
    if ((form.get("company") as string)?.trim()) {
      setStatus("sent");
      return;
    }

    if (methods.length === 0) {
      setErrorMessage("Please select at least one way you plan to promote Egypt Eye.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/affiliate-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          websiteOrPlatform: form.get("websiteOrPlatform"),
          audienceSize: form.get("audienceSize"),
          promotionMethods: methods,
          payoutMethod: form.get("payoutMethod"),
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
          Thanks for applying to the Egypt Eye Affiliate Program. Our team reviews every application and will follow
          up by email with your referral code and rate once approved.
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
          Full name *
          <input name="fullName" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Email *
          <input type="email" name="email" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          WhatsApp / Phone
          <input type="tel" name="phone" className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Website, blog, or main platform *
          <input name="websiteOrPlatform" placeholder="https:// or @handle" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Audience size
          <select name="audienceSize" defaultValue="" className={inputClass()}>
            <option value="">Prefer not to say</option>
            {AUDIENCE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Preferred payout method
          <select name="payoutMethod" defaultValue="" className={inputClass()}>
            <option value="">Not sure yet</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-ink-soft">How will you promote Egypt Eye? *</p>
        <div className="flex flex-wrap gap-2">
          {PROMOTION_METHODS.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => toggleMethod(option)}
              className={`rounded-full px-3.5 py-2 text-left text-xs font-medium transition ${
                methods.includes(option) ? "bg-gold text-ink" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-6 flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
        Anything else we should know?
        <textarea
          name="message"
          rows={3}
          placeholder="Past affiliate results, your audience, or how you'd plan to feature Egypt Eye."
          className={inputClass()}
        />
      </label>

      {errorMessage && <p className="mt-4 text-sm font-medium text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 w-full rounded-full bg-ink py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Apply to Become an Affiliate"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-center text-xs text-terracotta">
          Something went wrong sending your application. Please message us directly on WhatsApp instead.
        </p>
      )}
    </form>
  );
}
