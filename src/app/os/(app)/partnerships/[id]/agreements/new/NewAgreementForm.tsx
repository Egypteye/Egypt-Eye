"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAgreement, supersedeTerm, setAgreementStatus } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass, Notice } from "@/components/os/ui";

// Three deliberate steps, in this order: draft the agreement, put the numbers
// on it, then put it into force. They are separate because activating a
// contract is the moment the company becomes liable for what is in it, and
// that is a different act from typing it.
const KINDS = [
  { key: "commission", label: "Commission — they sell at our price, we pay a percentage" },
  { key: "net_rate", label: "Net rate — we quote net, they mark up" },
  { key: "volume", label: "Volume — commitment in exchange for terms" },
  { key: "exclusive", label: "Exclusive — a market closed to others" },
  { key: "referral", label: "Referral — a fee for sending people" },
  { key: "affiliate", label: "Affiliate" },
  { key: "mou", label: "Memorandum of understanding" },
  { key: "other", label: "Other" },
];

export function NewAgreementForm({
  companyId, companyName, tripTypes, defaultCommission, defaultCurrency, canActivate,
}: {
  companyId: string;
  companyName: string;
  tripTypes: { id: string; name: string }[];
  defaultCommission: number | null;
  defaultCurrency: string;
  canActivate: boolean;
}) {
  const router = useRouter();
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [agreementRef, setAgreementRef] = useState<string | null>(null);
  const [termAdded, setTermAdded] = useState(false);

  const [form, setForm] = useState({
    title: `${companyName} — trade agreement`,
    kind: "commission",
    startsOn: "",
    endsOn: "",
    autoRenew: false,
    noticeDays: "30",
    currency: defaultCurrency,
    minimumTripsPerYear: "",
    minimumRevenueAmount: "",
    notes: "",
  });

  const [term, setTerm] = useState({
    basis: "commission_pct",
    commissionPct: defaultCommission != null ? String(defaultCommission) : "",
    netAmount: "",
    tripTypeId: "",
    tier: "",
    minGuests: "",
    effectiveFrom: "",
    note: "",
  });

  const create = useAction(createAgreement, {
    onSuccess: (result) => {
      if (result.data) {
        setAgreementId(result.data.id);
        setAgreementRef(result.data.ref);
        setTerm((t) => ({ ...t, effectiveFrom: form.startsOn || t.effectiveFrom }));
      }
    },
    refresh: false,
  });
  const addTerm = useAction(supersedeTerm, { onSuccess: () => setTermAdded(true), refresh: false });
  const activate = useAction(setAgreementStatus, {
    onSuccess: () => router.push(`/os/partnerships/${companyId}`),
    refresh: false,
  });

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-os-text">1. Draft the agreement</h2>
        <p className="mb-3 text-[12.5px] text-os-muted">The shape of the deal. The numbers come next.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Title" required>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} disabled={Boolean(agreementId)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="What kind" required>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass} disabled={Boolean(agreementId)}>
                {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Starts" required hint="Terms are resolved by date, so this is what decides which booking it covers.">
            <input type="date" value={form.startsOn} onChange={(e) => setForm({ ...form, startsOn: e.target.value })} className={inputClass} disabled={Boolean(agreementId)} />
          </Field>
          <Field label="Ends" hint="Leave blank for open-ended. Ninety days before this date it appears as expiring.">
            <input type="date" value={form.endsOn} onChange={(e) => setForm({ ...form, endsOn: e.target.value })} className={inputClass} disabled={Boolean(agreementId)} />
          </Field>
          <Field label="Notice period, days">
            <input inputMode="numeric" value={form.noticeDays} onChange={(e) => setForm({ ...form, noticeDays: e.target.value })} className={inputClass} disabled={Boolean(agreementId)} />
          </Field>
          <Field label="Auto-renews">
            <label className="flex items-center gap-2 pt-2 text-[13px] text-os-text">
              <input type="checkbox" checked={form.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} className="accent-os-gold" disabled={Boolean(agreementId)} />
              Rolls over unless notice is given
            </label>
          </Field>
          <Field label="Minimum trips a year" hint="Only if they actually committed to one.">
            <input inputMode="numeric" value={form.minimumTripsPerYear} onChange={(e) => setForm({ ...form, minimumTripsPerYear: e.target.value })} className={inputClass} disabled={Boolean(agreementId)} />
          </Field>
          <Field label="Minimum revenue">
            <input inputMode="decimal" value={form.minimumRevenueAmount} onChange={(e) => setForm({ ...form, minimumRevenueAmount: e.target.value })} className={inputClass} disabled={Boolean(agreementId)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} disabled={Boolean(agreementId)} />
            </Field>
          </div>
        </div>
        {!agreementId ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => create.run({
                companyId,
                title: form.title,
                kind: form.kind,
                startsOn: form.startsOn || null,
                endsOn: form.endsOn || null,
                autoRenew: form.autoRenew,
                noticeDays: form.noticeDays.trim() ? Number(form.noticeDays) : null,
                currency: form.currency,
                minimumTripsPerYear: form.minimumTripsPerYear.trim() ? Number(form.minimumTripsPerYear) : null,
                minimumRevenueAmount: form.minimumRevenueAmount.trim() ? Number(form.minimumRevenueAmount) : null,
                notes: form.notes || null,
              })}
              disabled={!form.title.trim() || create.pending}
              className={buttonClass.gold}
            >
              {create.pending ? <Spinner /> : null}Draft it
            </button>
            <Link href={`/os/partnerships/${companyId}`} className={buttonClass.ghost}>Cancel</Link>
          </div>
        ) : (
          <p className="mt-3 text-[12.5px] text-os-green">Drafted as {agreementRef}.</p>
        )}
        <ActionFeedback result={create.result} onDismiss={create.clear} />
      </section>

      {agreementId ? (
        <section className="border-t border-os-line pt-6">
          <h2 className="mb-1 text-[14px] font-semibold text-os-text">2. The numbers</h2>
          <p className="mb-3 text-[12.5px] leading-relaxed text-os-muted">
            Effective-dated. When these change later, the old window is closed and a new row added — never overwritten —
            so a commission statement from last spring stays defensible in a year&apos;s time.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Basis" required>
              <select value={term.basis} onChange={(e) => setTerm({ ...term, basis: e.target.value })} className={selectClass}>
                <option value="commission_pct">Commission percentage</option>
                <option value="net_rate">Net rate per booking</option>
                <option value="markup_pct">Markup percentage</option>
                <option value="fixed_fee">Fixed fee</option>
                <option value="per_person">Per person</option>
              </select>
            </Field>
            {term.basis === "commission_pct" || term.basis === "markup_pct" ? (
              <Field label="Percentage" required>
                <input inputMode="decimal" value={term.commissionPct} onChange={(e) => setTerm({ ...term, commissionPct: e.target.value })} className={inputClass} />
              </Field>
            ) : (
              <Field label={`Amount (${form.currency})`} required>
                <input inputMode="decimal" value={term.netAmount} onChange={(e) => setTerm({ ...term, netAmount: e.target.value })} className={inputClass} />
              </Field>
            )}
            <Field label="Service" hint="Leave blank to cover everything. A term naming a service beats one that does not.">
              <select value={term.tripTypeId} onChange={(e) => setTerm({ ...term, tripTypeId: e.target.value })} className={selectClass}>
                <option value="">Every service</option>
                {tripTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Tier">
              <select value={term.tier} onChange={(e) => setTerm({ ...term, tier: e.target.value })} className={selectClass}>
                <option value="">Every tier</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
                <option value="vip">VIP</option>
              </select>
            </Field>
            <Field label="Minimum guests">
              <input inputMode="numeric" value={term.minGuests} onChange={(e) => setTerm({ ...term, minGuests: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Applies from" required>
              <input type="date" value={term.effectiveFrom} onChange={(e) => setTerm({ ...term, effectiveFrom: e.target.value })} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Why this rate" hint="Read by whoever renegotiates it next year.">
                <input value={term.note} onChange={(e) => setTerm({ ...term, note: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => addTerm.run({
                agreementId,
                basis: term.basis,
                commissionPct: ["commission_pct"].includes(term.basis) && term.commissionPct.trim() ? Number(term.commissionPct) : null,
                markupPct: term.basis === "markup_pct" && term.commissionPct.trim() ? Number(term.commissionPct) : null,
                netAmount: term.basis === "net_rate" && term.netAmount.trim() ? Number(term.netAmount) : null,
                fixedAmount: ["fixed_fee", "per_person"].includes(term.basis) && term.netAmount.trim() ? Number(term.netAmount) : null,
                currency: form.currency,
                tripTypeId: term.tripTypeId || null,
                tier: term.tier || null,
                minGuests: term.minGuests.trim() ? Number(term.minGuests) : null,
                effectiveFrom: term.effectiveFrom,
                note: term.note || null,
              })}
              disabled={!term.effectiveFrom || addTerm.pending}
              className={buttonClass.primary}
            >
              {addTerm.pending ? <Spinner /> : null}Add this term
            </button>
          </div>
          <ActionFeedback result={addTerm.result} onDismiss={addTerm.clear} />
        </section>
      ) : null}

      {agreementId && termAdded ? (
        <section className="border-t border-os-line pt-6">
          <h2 className="mb-1 text-[14px] font-semibold text-os-text">3. Put it into force</h2>
          {canActivate ? (
            <>
              <p className="mb-3 text-[12.5px] leading-relaxed text-os-muted">
                Activating is the moment its terms start pricing real bookings. It is a separate permission from drafting
                for that reason.
              </p>
              <button
                onClick={() => activate.run(agreementId, "active", "")}
                disabled={activate.pending}
                className={buttonClass.gold}
              >
                {activate.pending ? <Spinner /> : null}Activate {agreementRef}
              </button>
              <ActionFeedback result={activate.result} onDismiss={activate.clear} />
            </>
          ) : (
            <Notice tone="blue" title="Somebody else has to put this into force">
              You can draft an agreement and set its terms, but activating one needs the agreements permission. Ask a
              partnerships manager — {agreementRef} is saved and waiting.
            </Notice>
          )}
          <div className="mt-4">
            <Link href={`/os/partnerships/${companyId}`} className={buttonClass.secondary}>Back to the partner</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
