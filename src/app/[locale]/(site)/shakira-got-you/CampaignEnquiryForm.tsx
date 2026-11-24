"use client";

import { useEffect, useId, useState } from "react";
import { PhoneField } from "@/components/PhoneField";
import { trackEvent } from "@/lib/analytics/track";
import {
  PACKAGES,
  PARTY_DATE,
  campaignDate,
  packageDateRange,
} from "@/content/shakiraCampaign";

// The campaign enquiry form.
//
// It sends a package ID, not a package name. The route looks the rest up from
// the same config this component renders, so the team's email can never carry
// an itinerary or a date range that was typed by a browser.
//
// There is no price anywhere in here and no "book now". The success state says
// so in as many words: an enquiry starts a conversation. The last thing this
// campaign needs is a traveller who believes a villa seat is held.

type Props = { initialPackageId?: string };

export function CampaignEnquiryForm({ initialPackageId }: Props) {
  const ids = useId();
  const [packageId, setPackageId] = useState(initialPackageId ?? PACKAGES[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ packageName: string } | null>(null);
  const [started, setStarted] = useState(false);

  // The deep link from a package card. Hash-driven rather than a route, so
  // choosing a package never costs a page load on a mobile connection.
  useEffect(() => {
    function fromHash() {
      const match = /^#enquire-(.+)$/.exec(window.location.hash);
      if (!match) return;
      const found = PACKAGES.find((p) => p.id === match[1]);
      if (found) setPackageId(found.id);
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  /** Fires once, the first time somebody actually engages with the form. */
  function noteStart() {
    if (started) return;
    setStarted(true);
    trackEvent("campaign_enquiry_start", { campaign: "shakira-got-you", package_id: packageId });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/campaign-enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          packageId,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          travellers: form.get("travellers"),
          notes: form.get("notes"),
          company: form.get("company"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      const chosen = PACKAGES.find((p) => p.id === packageId);
      // No form field is ever passed to analytics — only which package.
      trackEvent("campaign_enquiry_submit", {
        campaign: "shakira-got-you",
        package_id: packageId,
      });
      setSent({ packageName: chosen?.name ?? "your experience" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-3xl border border-gold/30 bg-gold/5 p-8 text-center"
      >
        <p className="font-display text-xl font-semibold text-ink">Your enquiry is with us</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          We have your interest in <strong className="text-ink">{sent.packageName}</strong>. A real
          person will come back to you with availability and what it costs.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-ink-soft/80">
          Nothing is booked and no place is held yet. An enquiry is the start of the conversation,
          not a confirmation.
        </p>
      </div>
    );
  }

  const label = "block text-sm font-semibold text-ink";
  const field =
    "mt-1.5 w-full rounded-xl border border-black/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20";

  return (
    <form onSubmit={submit} onFocus={noteStart} className="space-y-6">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <fieldset>
        <legend className={label}>Which experience?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={packageId === p.id}
              onClick={() => {
                setPackageId(p.id);
                noteStart();
                trackEvent("campaign_package_select", {
                  campaign: "shakira-got-you",
                  package_id: p.id,
                });
              }}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                packageId === p.id
                  ? "border-gold/50 bg-gold/10"
                  : "border-black/10 bg-cream hover:border-gold/30"
              }`}
            >
              <span className="block text-sm font-semibold text-ink">
                {p.number} — {p.name}
              </span>
              <span className="mt-0.5 block text-xs text-ink-soft">
                {p.durationDays} day{p.durationDays === 1 ? "" : "s"} · {packageDateRange(p)} 2026
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-soft/80">
          Every one of them ends at the villa party on {campaignDate(PARTY_DATE)}.
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${ids}-name`}>
            Full name
          </label>
          <input id={`${ids}-name`} name="name" required autoComplete="name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-email`}>
            Email
          </label>
          <input
            id={`${ids}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${ids}-phone`}>
            WhatsApp number
          </label>
          {/* Uncontrolled, as everywhere else on the site: it renders a
              hidden input named "phone" carrying the composed E.164 value,
              which FormData reads below. */}
          <PhoneField
            id={`${ids}-phone`}
            errorClassName="text-sm font-semibold text-terracotta"
            selectClassName={field}
            inputClassName={field}
          />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-travellers`}>
            How many travelling?
          </label>
          <input
            id={`${ids}-travellers`}
            name="travellers"
            required
            placeholder="2 adults"
            className={field}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor={`${ids}-notes`}>
          Anything else? <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <textarea id={`${ids}-notes`} name="notes" rows={4} className={field} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-6 py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send my enquiry"}
      </button>

      <p className="text-center text-xs leading-relaxed text-ink-soft/80">
        No payment is taken here and no place is held. We reply with availability and a price.
      </p>
    </form>
  );
}
