"use client";

import { useEffect, useState } from "react";
import { NewsletterSignup } from "./NewsletterSignup";

const DISMISSED_KEY = "egypt-eye-newsletter-popup-dismissed-at";
const SUBSCRIBED_KEY = "egypt-eye-newsletter-popup-subscribed";
const SHOW_AFTER_MS = 9000;
const RESHOW_AFTER_DAYS = 14;

// A site-wide popup offering the 4% newsletter discount — separate from,
// and does not touch, the existing inline <NewsletterSignup> section on
// the homepage. Reuses that same component (in "compact" form) inside a
// modal shell so it shares its exact, already-working submit logic
// (POSTs to /api/newsletter/subscribe) rather than duplicating it.
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY) === "1") return;
      const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? "0");
      const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (dismissedAt && daysSinceDismissed < RESHOW_AFTER_DAYS) return;
    } catch {
      // localStorage unavailable (private browsing, etc.) — just show it.
    }

    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  return (
    <div
      className="animate-fade-up fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-ink px-6 py-10 text-center shadow-2xl shadow-black/30 sm:px-10 sm:py-12">
        <div className="bg-hieroglyph-pattern absolute inset-0 opacity-[0.06]" aria-hidden="true" />
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-cream/50 transition hover:bg-cream/10 hover:text-cream"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-light">Egypt Eye Newsletter</p>
          <h2 id="newsletter-popup-title" className="mt-3 text-balance font-display text-2xl font-semibold text-cream sm:text-3xl">
            Get 4% Off Your Egypt Journey
          </h2>
          <p className="mt-3 text-sm text-cream/70">
            Join our newsletter for travel inspiration and new experiences — and get your exclusive 4% discount code
            by email.
          </p>
          <div
            className="mt-7"
            onSubmitCapture={() => {
              try {
                localStorage.setItem(SUBSCRIBED_KEY, "1");
              } catch {
                // ignore
              }
            }}
          >
            <NewsletterSignup variant="compact" source="popup" />
          </div>
          <p className="mt-4 text-xs text-cream/50">We&rsquo;ll send a confirmation email first. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  );
}
