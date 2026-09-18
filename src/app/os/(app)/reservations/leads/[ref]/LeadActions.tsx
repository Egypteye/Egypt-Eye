"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordFirstResponse, qualifyLead, closeLead, assignLead } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

// Every button here is backed by a server action that re-checks the
// permission. What the actor cannot do is not rendered — and would still be
// refused if it were.
export function LeadActions({
  leadId,
  leadRef,
  status,
  hasFirstResponse,
  suggestedTitle,
  pipeline,
  companies,
  owners,
  lostReasons,
  can,
}: {
  leadId: string;
  leadRef: string;
  status: string;
  hasFirstResponse: boolean;
  suggestedTitle: string;
  pipeline: "b2c" | "b2b";
  companies: { id: string; name: string }[];
  owners: { id: string; name: string }[];
  lostReasons: { key: string; label: string; controllable: boolean }[];
  can: { respond: boolean; qualify: boolean; close: boolean; assign: boolean };
}) {
  const router = useRouter();
  const [panel, setPanel] = useState<"none" | "qualify" | "close" | "assign">("none");
  const [form, setForm] = useState({
    title: suggestedTitle,
    value: "",
    closeOn: "",
    companyId: "",
    reasonKey: "",
    note: "",
    ownerId: "",
    closeStatus: "unqualified" as "unqualified" | "lost" | "duplicate",
  });

  const respond = useAction(recordFirstResponse);
  const qualify = useAction(qualifyLead, {
    onSuccess: (result) => { if (result.data?.dealRef) router.push(`/os/${pipeline === "b2c" ? "reservations" : "partnerships"}/deals/${result.data.dealRef}`); },
    refresh: false,
  });
  const close = useAction(closeLead, { onSuccess: () => setPanel("none") });
  const assign = useAction(assignLead, { onSuccess: () => setPanel("none") });

  const closed = ["converted", "lost", "unqualified", "duplicate"].includes(status);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {can.respond && !hasFirstResponse && !closed ? (
          <button onClick={() => respond.run(leadId)} disabled={respond.pending} className={buttonClass.primary}>
            {respond.pending ? <Spinner /> : null}I have replied
          </button>
        ) : null}
        {can.qualify && !closed ? (
          <button onClick={() => setPanel(panel === "qualify" ? "none" : "qualify")} className={buttonClass.gold}>
            Qualify and open a deal
          </button>
        ) : null}
        {can.close && !closed ? (
          <button onClick={() => setPanel(panel === "close" ? "none" : "close")} className={buttonClass.secondary}>
            Close it
          </button>
        ) : null}
        {can.assign && !closed ? (
          <button onClick={() => setPanel(panel === "assign" ? "none" : "assign")} className={buttonClass.ghost}>
            Reassign
          </button>
        ) : null}
      </div>

      <ActionFeedback result={respond.result} onDismiss={respond.clear} />

      {panel === "qualify" ? (
        <div className="mt-4 rounded-xl border border-os-line bg-os-card p-4">
          <p className="mb-3 text-[12.5px] leading-relaxed text-os-muted">
            Qualifying matches this person against the client book before creating anything. If they have travelled with
            us before, the deal opens against their existing record and their whole history comes with it.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Deal title" required>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label="Value" hint="Leave blank until it is quoted. A made-up number inflates the forecast.">
              <input inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Expected close">
              <input type="date" value={form.closeOn} onChange={(e) => setForm({ ...form, closeOn: e.target.value })} className={inputClass} />
            </Field>
            {pipeline === "b2b" || companies.length ? (
              <div className="sm:col-span-2">
                <Field label="Partner company" hint={pipeline === "b2b" ? "Required for a B2B deal." : "Only if they are booking through an agency."} required={pipeline === "b2b"}>
                  <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} className={selectClass}>
                    <option value="">None</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => qualify.run({
                leadId,
                title: form.title,
                valueAmount: form.value.trim() ? Number(form.value) : null,
                expectedCloseOn: form.closeOn || null,
                companyId: form.companyId || null,
              })}
              disabled={!form.title.trim() || qualify.pending}
              className={buttonClass.gold}
            >
              {qualify.pending ? <Spinner /> : null}Open the deal
            </button>
            <button onClick={() => setPanel("none")} className={buttonClass.ghost}>Cancel</button>
          </div>
          <ActionFeedback result={qualify.result} onDismiss={qualify.clear} />
        </div>
      ) : null}

      {panel === "close" ? (
        <div className="mt-4 rounded-xl border border-os-line bg-os-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Closing it as">
              <select
                value={form.closeStatus}
                onChange={(e) => setForm({ ...form, closeStatus: e.target.value as typeof form.closeStatus })}
                className={selectClass}
              >
                <option value="unqualified">Not a real opportunity</option>
                <option value="lost">Lost</option>
                <option value="duplicate">Duplicate of another enquiry</option>
              </select>
            </Field>
            <Field label="Reason" hint="The split between what we could have changed and what we could not is the whole value of this field.">
              <select value={form.reasonKey} onChange={(e) => setForm({ ...form, reasonKey: e.target.value })} className={selectClass}>
                <option value="">Not recorded</option>
                {lostReasons.map((r) => (
                  <option key={r.key} value={r.key}>{r.label}{r.controllable ? " (ours)" : ""}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="What happened" required hint="One sentence. Without it a closed enquiry is the same as a deleted one.">
                <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => close.run(leadId, form.closeStatus, form.reasonKey || null, form.note)}
              disabled={!form.note.trim() || close.pending}
              className={buttonClass.primary}
            >
              {close.pending ? <Spinner /> : null}Close {leadRef}
            </button>
            <button onClick={() => setPanel("none")} className={buttonClass.ghost}>Cancel</button>
          </div>
          <ActionFeedback result={close.result} onDismiss={close.clear} />
        </div>
      ) : null}

      {panel === "assign" ? (
        <div className="mt-4 rounded-xl border border-os-line bg-os-card p-4">
          <Field label="Hand it to">
            <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className={selectClass}>
              <option value="">Choose someone</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => assign.run(leadId, form.ownerId)}
              disabled={!form.ownerId || assign.pending}
              className={buttonClass.primary}
            >
              {assign.pending ? <Spinner /> : null}Reassign
            </button>
            <button onClick={() => setPanel("none")} className={buttonClass.ghost}>Cancel</button>
          </div>
          <ActionFeedback result={assign.result} onDismiss={assign.clear} />
        </div>
      ) : null}
    </div>
  );
}
