"use client";

import { useState, type FormEvent } from "react";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "Blog / Website", "Other"];
const COLLAB_TYPES = [
  "Sponsored Trip",
  "Content Partnership",
  "Paid Campaign",
  "Press Trip / Media Coverage",
  "Ambassador Program",
  "Other",
];

type SocialRow = { platform: string; handle: string; followers: string };

function inputClass(extra = "") {
  return `rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold ${extra}`;
}

type Status = "idle" | "sending" | "sent" | "error";

export function CollaborateForm() {
  const [socials, setSocials] = useState<SocialRow[]>([{ platform: "Instagram", handle: "", followers: "" }]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateSocial(index: number, field: keyof SocialRow, value: string) {
    setSocials((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addSocialRow() {
    setSocials((prev) => [...prev, { platform: "Instagram", handle: "", followers: "" }]);
  }

  function removeSocialRow(index: number) {
    setSocials((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);
    if ((form.get("company") as string)?.trim()) {
      setStatus("sent");
      return;
    }

    const validSocials = socials.filter((s) => s.handle.trim());
    if (validSocials.length === 0) {
      setErrorMessage("Please add at least one social media account.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/collaborate-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          socialAccounts: validSocials,
          engagementRate: form.get("engagementRate"),
          audienceCountries: form.get("audienceCountries"),
          travelDates: form.get("travelDates"),
          portfolioUrl: form.get("portfolioUrl"),
          collaborationType: form.get("collaborationType"),
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
          Thanks for reaching out — our team reviews every application and will follow up if it&rsquo;s a fit.
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
          Portfolio / previous work
          <input type="url" name="portfolioUrl" placeholder="https://" className={inputClass()} />
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-ink-soft">Social media accounts *</p>
        <div className="flex flex-col gap-3">
          {socials.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
              <select
                value={row.platform}
                onChange={(e) => updateSocial(i, "platform", e.target.value)}
                className={inputClass()}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                placeholder="@handle"
                value={row.handle}
                onChange={(e) => updateSocial(i, "handle", e.target.value)}
                className={inputClass()}
              />
              <input
                placeholder="Followers"
                value={row.followers}
                onChange={(e) => updateSocial(i, "followers", e.target.value)}
                className={inputClass()}
              />
              <button
                type="button"
                onClick={() => removeSocialRow(i)}
                disabled={socials.length === 1}
                aria-label="Remove this account"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft/50 transition hover:bg-sand-dim hover:text-terracotta disabled:opacity-30"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSocialRow}
          className="mt-2 text-xs font-semibold text-gold-dark hover:underline"
        >
          + Add another account
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Average engagement rate
          <input name="engagementRate" placeholder="e.g. 4-6%" className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Audience countries
          <input name="audienceCountries" placeholder="e.g. USA, UK, Germany" className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Preferred travel dates
          <input name="travelDates" placeholder="e.g. Flexible, or March 2027" className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Collaboration type *
          <select name="collaborationType" required defaultValue="" className={inputClass()}>
            <option value="" disabled>
              Select a type
            </option>
            {COLLAB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft sm:col-span-2">
          Tell us about your content and what you have in mind
          <textarea name="message" rows={4} className={inputClass()} />
        </label>
      </div>

      {errorMessage && <p className="mt-4 text-sm font-medium text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 w-full rounded-full bg-ink py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit Application"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-center text-xs text-terracotta">
          Something went wrong sending your application. Please message us directly on WhatsApp instead.
        </p>
      )}
    </form>
  );
}
