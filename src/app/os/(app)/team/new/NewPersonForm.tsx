"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEmployee } from "@/lib/os/actions/directory";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

// Skills are the vocabulary the assignment engine ranks candidates on, so they
// are picked from a list. A skill typed as free text would rank nobody.
const SKILLS = [
  "photography", "videography", "editing", "drone", "guiding", "egyptology",
  "driving", "coordination", "scheduling", "logistics", "client_care", "sales",
  "quoting", "accounting", "reporting", "hr", "styling", "dress_handling",
  "crisis_management", "supplier_relations", "leadership",
];

const LANGUAGES = ["Arabic", "English", "French", "German", "Italian", "Spanish", "Russian", "Chinese", "Japanese"];

const EMPLOYMENT = [
  { key: "staff", label: "Staff", hint: "On the payroll." },
  { key: "freelance", label: "Freelance", hint: "Booked per trip." },
  { key: "contractor", label: "Contractor", hint: "Under an agreement." },
  { key: "partner", label: "Partner", hint: "Works alongside us." },
  { key: "intern", label: "Intern", hint: "Learning, supervised." },
];

export function NewPersonForm({
  units, currencies, canSetRate,
}: {
  units: { id: string; name: string }[];
  currencies: string[];
  canSetRate: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "", displayName: "", email: "", phone: "", whatsapp: "",
    jobTitle: "", department: "", employmentType: "staff", primaryUnitId: "",
    homeCity: "", canDrive: false, dayRateAmount: "", dayRateCurrency: currencies[0] ?? "USD",
    hiredOn: "", emergencyContact: "", notes: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["Arabic", "English"]);

  const action = useAction(createEmployee, {
    onSuccess: (result) => { if (result.data?.id) router.push(`/os/team/${result.data.id}`); },
    refresh: false,
  });

  const toggle = (list: string[], set: (v: string[]) => void, key: string) =>
    set(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full name" required>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="Known as" hint="What the crew calls them. Defaults to the first name.">
          <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Engagement">
          <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className={selectClass}>
            {EMPLOYMENT.map((t) => <option key={t.key} value={t.key}>{t.label} — {t.hint}</option>)}
          </select>
        </Field>

        <Field label="Job title"><input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={inputClass} placeholder="Photographer" /></Field>
        <Field label="Department"><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} placeholder="Creative" /></Field>

        <Field label="Email" hint="Used later to link a sign-in. It does not create one.">
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Phone" hint="With country code. This is what a coordinator calls at 05:30.">
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+20 100 000 0000" />
        </Field>
        <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} /></Field>
        <Field label="Emergency contact"><input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className={inputClass} /></Field>

        <Field label="Primary business unit">
          <select value={form.primaryUnitId} onChange={(e) => setForm({ ...form, primaryUnitId: e.target.value })} className={selectClass}>
            <option value="">Not set</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <Field label="Starts the day in" hint="Used when the assignment engine weighs travel time.">
          <input value={form.homeCity} onChange={(e) => setForm({ ...form, homeCity: e.target.value })} className={inputClass} placeholder="Cairo" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Skills" hint="What they can actually do. The assignment engine ranks candidates on this and explains why.">
            <div className="mt-1 flex flex-wrap gap-1.5">
              {SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(skills, setSkills, s)}
                  className={`rounded-full px-2.5 py-1 text-[12px] transition ${
                    skills.includes(s) ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Languages" hint="Matched against what the client speaks.">
            <div className="mt-1 flex flex-wrap gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggle(languages, setLanguages, l)}
                  className={`rounded-full px-2.5 py-1 text-[12px] transition ${
                    languages.includes(l) ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Can drive">
          <label className="flex items-center gap-2 pt-2 text-[13px] text-os-text">
            <input type="checkbox" checked={form.canDrive} onChange={(e) => setForm({ ...form, canDrive: e.target.checked })} className="accent-os-gold" />
            May be assigned as a driver
          </label>
        </Field>
        <Field label="Started on"><input type="date" value={form.hiredOn} onChange={(e) => setForm({ ...form, hiredOn: e.target.value })} className={inputClass} /></Field>

        {canSetRate ? (
          <>
            <Field label="Day rate" hint="What a day of their time costs. The trip snapshots it at assignment; changing it later never rewrites history.">
              <input inputMode="decimal" value={form.dayRateAmount} onChange={(e) => setForm({ ...form, dayRateAmount: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Rate currency">
              <select value={form.dayRateCurrency} onChange={(e) => setForm({ ...form, dayRateCurrency: e.target.value })} className={selectClass}>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </>
        ) : null}

        <div className="sm:col-span-2">
          <Field label="Notes" hint="What a coordinator staffing a trip needs to know.">
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            fullName: form.fullName,
            displayName: form.displayName || null,
            email: form.email || null,
            phone: form.phone || null,
            whatsapp: form.whatsapp || null,
            jobTitle: form.jobTitle || null,
            department: form.department || null,
            employmentType: form.employmentType,
            primaryUnitId: form.primaryUnitId || null,
            skills,
            languages,
            homeCity: form.homeCity || null,
            canDrive: form.canDrive,
            dayRateAmount: canSetRate && form.dayRateAmount.trim() ? Number(form.dayRateAmount) : null,
            dayRateCurrency: canSetRate ? form.dayRateCurrency : null,
            hiredOn: form.hiredOn || null,
            emergencyContact: form.emergencyContact || null,
            notes: form.notes || null,
          })}
          disabled={!form.fullName.trim() || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Add to the team
        </button>
        <Link href="/os/team" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
