"use client";

import { useId, useState } from "react";
import { SCENT_FAMILIES } from "@/lib/boutique/scentFamilies";

// "Come and smell them first."
//
// A request, and it says so twice — above the button and again after it is
// sent — because nobody has given us the shop's opening hours, so offering a
// time would be inventing one. The success state only appears after the
// server has confirmed the team's email actually went out; a route that
// cannot reach anybody returns an error rather than a thank-you.
//
// The customer picks an AREA, not an address. Giza is several workshops
// around the pyramids rather than one shop, and which one suits depends on
// what they want to see.

type Area = { slug: string; name: string; blurb: string };

export function ShopVisitForm({ areas }: { areas: Area[] }) {
  const ids = useId();
  const [area, setArea] = useState(areas[0]?.slug ?? "");
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ reference: string; areaName: string } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/shop-visit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          area,
          preferredDate: form.get("preferredDate"),
          preferredTime: form.get("preferredTime"),
          visitors: Number(form.get("visitors") ?? 1),
          interests,
          notes: form.get("notes"),
          company: form.get("company"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSent({ reference: json.reference, areaName: json.areaName });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-gold/25 bg-gold/5 p-8 text-center">
        <p className="font-display text-xl font-semibold text-ink">Your request is with us</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          We will come back to you with a time that works in {sent.areaName}. Quote{" "}
          <strong className="text-ink">{sent.reference}</strong> if you reply.
        </p>
        <p className="mt-4 text-xs text-ink-soft/80">
          Nothing is booked and no time is held yet — a person confirms that.
        </p>
      </div>
    );
  }

  const label = "block text-sm font-semibold text-ink";
  const field =
    "mt-1.5 w-full rounded-xl border border-black/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20";

  return (
    <form onSubmit={submit} className="space-y-6">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <fieldset>
        <legend className={label}>Which area suits your trip?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {areas.map((a) => (
            <button
              key={a.slug}
              type="button"
              onClick={() => setArea(a.slug)}
              aria-pressed={area === a.slug}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                area === a.slug
                  ? "border-gold/50 bg-gold/10"
                  : "border-black/10 bg-cream hover:border-gold/30"
              }`}
            >
              <span className="block text-sm font-semibold text-ink">{a.name}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{a.blurb}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>What would you like to try? (optional)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SCENT_FAMILIES.map((f) => {
            const on = interests.includes(f.label);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setInterests((prev) =>
                    prev.includes(f.label) ? prev.filter((x) => x !== f.label) : [...prev, f.label]
                  )
                }
                className={`rounded-full border px-3.5 py-2 text-sm transition ${
                  on ? "border-gold/60 bg-gold/15 text-ink" : "border-black/10 bg-cream text-ink-soft hover:border-gold/30"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${ids}-date`}>
            Which day are you free?
          </label>
          <input id={`${ids}-date`} name="preferredDate" type="date" className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-time`}>
            Any time that suits?
          </label>
          <input
            id={`${ids}-time`}
            name="preferredTime"
            type="text"
            maxLength={60}
            placeholder="Morning, afternoon, or flexible"
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-visitors`}>
            How many of you?
          </label>
          <select id={`${ids}-visitors`} name="visitors" defaultValue="2" className={field}>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-phone`}>
            Phone or WhatsApp (optional)
          </label>
          <input id={`${ids}-phone`} name="phone" type="tel" maxLength={40} className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-name`}>
            Your name <span aria-hidden className="text-gold-dark">*</span>
          </label>
          <input id={`${ids}-name`} name="name" type="text" required maxLength={120} className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-email`}>
            Email <span aria-hidden className="text-gold-dark">*</span>
          </label>
          <input id={`${ids}-email`} name="email" type="email" required maxLength={200} className={field} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor={`${ids}-notes`}>
          Anything else we should know? (optional)
        </label>
        <textarea id={`${ids}-notes`} name="notes" rows={3} maxLength={1500} className={field} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-semibold text-terracotta">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
        >
          {busy ? "Sending…" : "Request a visit"}
        </button>
        <p className="text-xs text-ink-soft/85">
          A request, not a booking. We confirm the time with you — nothing is charged.
        </p>
      </div>
    </form>
  );
}
