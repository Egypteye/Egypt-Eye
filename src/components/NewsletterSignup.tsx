"use client";

import { useState, type FormEvent } from "react";

export function NewsletterSignup({
  variant = "section",
  source = "newsletter",
}: {
  variant?: "section" | "compact";
  source?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = ((form.get("email") as string) ?? "").trim();
    const firstName = ((form.get("firstName") as string) ?? "").trim();
    const company = ((form.get("company") as string) ?? "").trim();

    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName: firstName || undefined, source, company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div id="newsletter" className={variant === "compact" ? "text-sm text-ink-soft/70" : "text-center text-cream/90"}>
        <p className="font-semibold">Almost there — check your inbox</p>
        <p className="mt-1 text-sm opacity-80">Confirm your email and we&rsquo;ll send your unique 4% off code right away.</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form id="newsletter" onSubmit={handleSubmit} className="relative flex flex-col gap-2 sm:flex-row">
        <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="sr-only" htmlFor="newsletter-email-compact">
          Email address
        </label>
        <input
          id="newsletter-email-compact"
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="min-w-0 flex-1 rounded-full border border-black/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="shrink-0 whitespace-nowrap rounded-full bg-gold-dark px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Get My 4% Off"}
        </button>
        {status === "error" && <p className="text-xs text-terracotta sm:basis-full">{errorMessage}</p>}
      </form>
    );
  }

  return (
    <div id="newsletter" className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center sm:px-12 sm:py-16">
      <div className="bg-hieroglyph-pattern absolute inset-0 opacity-[0.06]" aria-hidden="true" />
      <div className="relative mx-auto max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-light">Egypt Eye Newsletter</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-cream sm:text-4xl">
          Get 4% Off Your Egypt Journey
        </h2>
        <p className="mt-4 text-[15px] text-cream/70">
          Join the Egypt Eye newsletter and receive travel inspiration, new experiences and your exclusive 4%
          discount.
        </p>

        <form onSubmit={handleSubmit} className="relative mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
            <label>
              Company
              <input type="text" name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="sr-only" htmlFor="newsletter-firstname">
            First name (optional)
          </label>
          <input
            id="newsletter-firstname"
            name="firstName"
            type="text"
            placeholder="First name (optional)"
            className="min-w-0 flex-1 rounded-full border border-cream/20 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/50 outline-none focus:border-gold"
          />
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="min-w-0 flex-1 rounded-full border border-cream/20 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/50 outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="shrink-0 whitespace-nowrap rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Get My 4% Off"}
          </button>
        </form>
        {status === "error" && <p className="mt-3 text-sm text-terracotta">{errorMessage}</p>}
        <p className="mt-4 text-xs text-cream/50">
          We&rsquo;ll send a confirmation email first. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
