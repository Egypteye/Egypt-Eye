"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCompany } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

const KINDS = [
  { key: "travel_agency", label: "Travel agency" },
  { key: "tour_operator", label: "Tour operator" },
  { key: "dmc", label: "DMC" },
  { key: "ota", label: "Online travel agent" },
  { key: "hotel", label: "Hotel" },
  { key: "cruise_line", label: "Cruise line" },
  { key: "corporate", label: "Corporate" },
  { key: "wedding_planner", label: "Wedding planner" },
  { key: "photographer_studio", label: "Photography studio" },
  { key: "media", label: "Media or production" },
  { key: "government", label: "Government" },
  { key: "other", label: "Other" },
];

export function NewPartnerForm({
  owners, units, currencies, canSetTerms,
}: {
  owners: { id: string; name: string }[];
  units: { id: string; name: string }[];
  currencies: string[];
  canSetTerms: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", legalName: "", kind: "travel_agency", status: "prospect", tier: "standard",
    website: "", email: "", phone: "", country: "", city: "",
    currency: currencies[0] ?? "USD", ownerEmployeeId: "", unitId: "", source: "", notes: "",
    defaultCommissionPct: "", defaultPaymentTerms: "",
  });

  const action = useAction(createCompany, {
    onSuccess: (result) => { if (result.data?.id) router.push(`/os/partnerships/${result.data.id}`); },
    refresh: false,
  });

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Partner name" required hint="What the team calls them.">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Blue Nile Collective" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Legal name" hint="Only if it differs, and only if it matters for the contract.">
            <input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <Field label="What kind of partner" required hint="Decides which pipeline stages and terms make sense.">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass}>
            {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </Field>
        <Field label="Relationship stage">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
            <option value="prospect">Prospect — no business yet</option>
            <option value="active">Active</option>
            <option value="dormant">Dormant</option>
          </select>
        </Field>

        <Field label="Tier" hint="Preferred and strategic partners get different terms and different attention.">
          <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={selectClass}>
            <option value="standard">Standard</option>
            <option value="preferred">Preferred</option>
            <option value="strategic">Strategic</option>
          </select>
        </Field>
        <Field label="Owned by" hint="Who is responsible for this relationship. Scope 'own' means exactly this.">
          <select value={form.ownerEmployeeId} onChange={(e) => setForm({ ...form, ownerEmployeeId: e.target.value })} className={selectClass}>
            <option value="">Me</option>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </Field>

        <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></Field>
        <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></Field>
        <Field label="Website"><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="https://" /></Field>
        <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} /></Field>
        <Field label="Country"><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} /></Field>
        <Field label="They invoice in">
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={selectClass}>
            {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Business unit">
          <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className={selectClass}>
            <option value="">Company-wide</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <Field label="How we met them" hint="Trade show, referral, inbound. Feeds partner attribution.">
          <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass} />
        </Field>

        {canSetTerms ? (
          <>
            <Field
              label="Default commission"
              hint="A starting point only. What actually prices a booking is the effective-dated term on the agreement."
            >
              <input inputMode="decimal" value={form.defaultCommissionPct} onChange={(e) => setForm({ ...form, defaultCommissionPct: e.target.value })} className={inputClass} placeholder="15" />
            </Field>
            <Field label="Payment terms">
              <input value={form.defaultPaymentTerms} onChange={(e) => setForm({ ...form, defaultPaymentTerms: e.target.value })} className={inputClass} placeholder="Net 30" />
            </Field>
          </>
        ) : null}

        <div className="sm:col-span-2">
          <Field label="Notes" hint="Their markets, their seasons, who actually answers.">
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            name: form.name,
            legalName: form.legalName || null,
            kind: form.kind,
            status: form.status,
            tier: form.tier,
            website: form.website || null,
            email: form.email || null,
            phone: form.phone || null,
            country: form.country || null,
            city: form.city || null,
            currency: form.currency,
            ownerEmployeeId: form.ownerEmployeeId || null,
            unitId: form.unitId || null,
            source: form.source || null,
            notes: form.notes || null,
            defaultCommissionPct: canSetTerms && form.defaultCommissionPct.trim() ? Number(form.defaultCommissionPct) : null,
            defaultPaymentTerms: canSetTerms ? form.defaultPaymentTerms || null : null,
          })}
          disabled={!form.name.trim() || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Register partner
        </button>
        <Link href="/os/partnerships" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
