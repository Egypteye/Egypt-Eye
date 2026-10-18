"use client";

import { useId, useState } from "react";
import { PayPalDepositButtons } from "@/components/PayPalDepositButtons";
import { personalisedItemAnchor, personalisedItemNotice } from "@/content/cancellationPolicy";
import { formatCents } from "@/lib/booking/quote";
import type { Spelling, SymbolKey } from "@/lib/hieroglyphs/signs";

// Buying a cartouche, rather than asking about one.
//
// It only ever renders for a piece that has a real price in the CMS. Every
// cartouche in the Boutique is "on request" today, which is the honest state
// of a commissioned piece, so in production this currently renders nothing
// and the enquiry form is the way through. The moment a price is entered in
// the Studio, this appears. That is deliberate: a buy button on a piece with
// no price would be a promise the business has not made.
//
// It sends a product slug, a name and contact details. It does NOT send a
// price, a total or a sign list — those are derived server-side in
// cartoucheOrder.ts, so there is nothing here for a tampered request to
// overstate.

export type OrderableChoice = {
  slug: string;
  name: string;
  unitCents: number;
};

type Stage =
  | { at: "form" }
  | { at: "paying"; orderId: string; clientId: string; reference: string; totalCents: number }
  | { at: "paid"; reference: string }
  | { at: "pending"; reference: string }
  | { at: "handoff"; notice: string };

export function CartoucheOrderPanel({
  choices,
  spelling,
  engravedName,
  symbols,
  onAskInstead,
}: {
  choices: OrderableChoice[];
  spelling: Spelling;
  engravedName: string;
  symbols: SymbolKey[];
  onAskInstead: () => void;
}) {
  const ids = useId();
  const [slug, setSlug] = useState(choices[0]?.slug ?? "");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<Stage>({ at: "form" });

  const chosen = choices.find((c) => c.slug === slug) ?? choices[0];
  if (!chosen) return null;

  const totalCents = chosen.unitCents * quantity;
  const nameOk = spelling.hasContent && spelling.fits && spelling.unsupported.length === 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/boutique/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productSlug: slug,
          name: engravedName,
          // Keys, not glyphs. The server looks up what each one means.
          symbols,
          quantity,
          fulfilment: "collect-in-egypt",
          customerName,
          customerEmail: email,
          customerPhone: phone,
          collectionNotes: notes,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      if (json.payment?.orderId && json.payment?.clientId) {
        setStage({
          at: "paying",
          orderId: json.payment.orderId,
          clientId: json.payment.clientId,
          reference: json.reference,
          totalCents: json.payment.totalCents,
        });
      } else {
        // No payment rail, or PayPal could not be opened. We have the order,
        // not the money, and this says exactly that.
        setStage({ at: "handoff", notice: json.notice || "We have your order and will be in touch." });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (stage.at === "paid") {
    return (
      <Done tone="good" title="Paid — thank you">
        <p>
          Your order is <strong>{stage.reference}</strong>. The receipt is on its way to {email || "your email"}.
        </p>
        <p>
          We confirm the spelling with you before anything is engraved, then arrange where to hand it over while
          you are in Egypt.
        </p>
      </Done>
    );
  }

  if (stage.at === "pending") {
    return (
      <Done tone="wait" title="PayPal has your payment">
        <p>
          Order <strong>{stage.reference}</strong>. PayPal has not credited it yet, which it sometimes takes a
          little while to do.
        </p>
        <p>Nothing more is needed from you. We will email you the moment it clears.</p>
      </Done>
    );
  }

  if (stage.at === "handoff") {
    return (
      <Done tone="wait" title="We have your order">
        <p>{stage.notice}</p>
      </Done>
    );
  }

  if (stage.at === "paying") {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
        <p className="font-display text-lg font-semibold text-ink">
          {formatCents(stage.totalCents)} — {chosen.name}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          For <strong className="text-ink">{engravedName}</strong>, order {stage.reference}. Nothing is engraved
          until we have confirmed the spelling with you.
        </p>
        <div className="mt-4">
          <PayPalDepositButtons
            orderId={stage.orderId}
            clientId={stage.clientId}
            reference={stage.reference}
            amountUsd={stage.totalCents / 100}
            // `pending` means PayPal has it but has not credited it. That is
            // not money in the account and must never be shown as though it
            // were, so it gets its own wording.
            onSettled={(result) =>
              setStage(
                result.pending
                  ? { at: "pending", reference: stage.reference }
                  : { at: "paid", reference: stage.reference }
              )
            }
            onDeadEnd={() =>
              setStage({
                at: "handoff",
                notice:
                  "That payment could not be completed, and the order is still open. Please message us and we " +
                  "will sort it out — nothing has been charged twice.",
              })
            }
          />
        </div>
        <button
          type="button"
          onClick={() => setStage({ at: "form" })}
          className="mt-3 text-sm text-ink-soft underline underline-offset-2 transition hover:text-ink"
        >
          Go back
        </button>
      </div>
    );
  }

  const label = "block text-sm font-semibold text-ink";
  const field =
    "mt-1.5 w-full rounded-xl border border-black/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/10 bg-cream p-5">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-ink">Order it now</h3>
        <p className="font-display text-xl font-semibold text-ink">{formatCents(totalCents)}</p>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Collected in Egypt — we arrange the handover with you. No shipping, no customs.
      </p>

      {choices.length > 1 && (
        <div className="mt-4">
          <label className={label} htmlFor={`${ids}-piece`}>
            Which piece?
          </label>
          <select id={`${ids}-piece`} value={slug} onChange={(e) => setSlug(e.target.value)} className={field}>
            {choices.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} — {formatCents(c.unitCents)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${ids}-name`}>
            Your name <span aria-hidden className="text-gold-dark">*</span>
          </label>
          <input id={`${ids}-name`} value={customerName} onChange={(e) => setCustomerName(e.target.value)} required maxLength={120} className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-email`}>
            Email <span aria-hidden className="text-gold-dark">*</span>
          </label>
          <input id={`${ids}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-phone`}>
            Phone or WhatsApp (optional)
          </label>
          <input id={`${ids}-phone`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${ids}-qty`}>
            How many?
          </label>
          <select id={`${ids}-qty`} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={field}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className={label} htmlFor={`${ids}-notes`}>
          When are you in Egypt, and where shall we meet you? (optional)
        </label>
        <textarea id={`${ids}-notes`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} className={field} />
      </div>

      {!nameOk && (
        <p className="mt-4 rounded-xl bg-sand-deep/60 px-4 py-3 text-sm leading-relaxed text-ink">
          {spelling.hasContent
            ? "That name does not fit a cartouche as it stands. Adjust it above, or ask us about it."
            : "Type the name you would like written, above."}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-semibold text-terracotta">
          {error}
        </p>
      )}

      <div className="mt-5 rounded-xl border border-sand-deep bg-sand/40 px-4 py-3">
        <p className="text-sm leading-relaxed text-ink">{personalisedItemNotice}</p>
        <a
          href={personalisedItemAnchor}
          className="mt-1 inline-block text-xs font-semibold text-ink-soft underline underline-offset-4 transition hover:text-ink"
        >
          Personalised items in our Cancellation Policy
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || !nameOk}
          className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "One moment…" : `Continue to payment — ${formatCents(totalCents)}`}
        </button>
        <button
          type="button"
          onClick={onAskInstead}
          className="text-sm font-semibold text-ink-soft underline underline-offset-4 transition hover:text-ink"
        >
          Ask about customisation instead
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft/85">
        We confirm the spelling with you before anything is engraved. A cartouche cannot be un-engraved, so we
        would rather ask twice than cut the wrong name once.
      </p>
    </form>
  );
}

function Done({ tone, title, children }: { tone: "good" | "wait"; title: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        tone === "good" ? "border-gold/30 bg-gold/5" : "border-black/10 bg-sand-deep/40"
      }`}
    >
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}
