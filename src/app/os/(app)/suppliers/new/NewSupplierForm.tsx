"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupplier } from "@/lib/os/actions/directory";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

// Categories are what the trip cost form and the supplier picker filter on, so
// they are a fixed vocabulary rather than free text — free text here means
// "catering", "Catering" and "food" all becoming different things.
const CATEGORIES = [
  "tickets", "permits", "hotel", "catering", "activity", "cruise", "dining",
  "transport", "venue", "equipment", "guide", "other",
];

export function NewSupplierForm({ currencies, canSetRating }: { currencies: string[]; canSetRating: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", legalName: "", contactName: "", phone: "", whatsapp: "", email: "", website: "",
    country: "Egypt", city: "", paymentTerms: "", currency: currencies[0] ?? "EGP",
    contractReference: "", contractExpiresOn: "", rating: "", notes: "",
  });
  const [categories, setCategories] = useState<string[]>([]);

  const action = useAction(createSupplier, {
    onSuccess: (result) => { if (result.data?.id) router.push(`/os/suppliers/${result.data.id}`); },
    refresh: false,
  });

  function toggleCategory(key: string) {
    setCategories((current) => (current.includes(key) ? current.filter((c) => c !== key) : [...current, key]));
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Supplier name" required hint="What the team calls them.">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Horizon Permits & Tickets" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Legal name" hint="Only if it differs, and only if it matters for invoices.">
            <input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <Field label="Main contact"><input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputClass} /></Field>
        <Field label="Phone" hint="With country code.">
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+20 100 000 0000" />
        </Field>
        <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} /></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></Field>
        <Field label="Website"><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="https://" /></Field>
        <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="Giza" /></Field>
        <Field label="Country"><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} /></Field>

        <div className="sm:col-span-2">
          <Field label="What they supply" hint="Drives which suppliers are offered when a cost line is added.">
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`rounded-full px-2.5 py-1 text-[12px] capitalize transition ${
                    categories.includes(c) ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Payment terms" hint="Exactly as agreed. Finance reads this, not a memory of a phone call.">
          <input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} className={inputClass} placeholder="Net 7, cash on collection for same-day" />
        </Field>
        <Field label="They invoice in">
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={selectClass}>
            {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Contract reference"><input value={form.contractReference} onChange={(e) => setForm({ ...form, contractReference: e.target.value })} className={inputClass} /></Field>
        <Field label="Contract expires" hint="Suppliers approaching expiry are flagged on the supplier list.">
          <input type="date" value={form.contractExpiresOn} onChange={(e) => setForm({ ...form, contractExpiresOn: e.target.value })} className={inputClass} />
        </Field>

        {canSetRating ? (
          <Field label="Relationship rating" hint="Out of 5, and a judgement. Incidents and late arrivals are counted separately and cannot be edited.">
            <input inputMode="decimal" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={inputClass} placeholder="4.5" />
          </Field>
        ) : null}

        <div className="sm:col-span-2">
          <Field label="Notes" hint="Lead times, quirks, who actually answers the phone.">
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            name: form.name,
            legalName: form.legalName || null,
            contactName: form.contactName || null,
            phone: form.phone || null,
            whatsapp: form.whatsapp || null,
            email: form.email || null,
            website: form.website || null,
            country: form.country || null,
            city: form.city || null,
            categories,
            paymentTerms: form.paymentTerms || null,
            currency: form.currency,
            contractReference: form.contractReference || null,
            contractExpiresOn: form.contractExpiresOn || null,
            rating: canSetRating && form.rating.trim() ? Number(form.rating) : null,
            notes: form.notes || null,
          })}
          disabled={!form.name.trim() || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Register supplier
        </button>
        <Link href="/os/suppliers" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
