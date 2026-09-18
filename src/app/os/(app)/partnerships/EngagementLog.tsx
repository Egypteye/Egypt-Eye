"use client";

import { useState } from "react";
import { logEngagement } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Card, CardHeader, Field, inputClass, selectClass, buttonClass, EmptyState } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

// ---------------------------------------------------------------------------
// THE CONTACT HISTORY, AND HOW TO ADD TO IT
// ---------------------------------------------------------------------------
// This is deliberately NOT a message thread. Egypt Eye answers people on
// Instagram, WhatsApp and email, and those tools do it better than anything
// built here would. What this records is that a conversation happened — who,
// when, on what channel, what came of it — which is what a colleague picking
// the relationship up on Monday actually needs.
//
// A follow-up creates a real task on the same list as everything else that
// person owes, rather than a promise buried in a note.
// ---------------------------------------------------------------------------

type Engagement = {
  id: string;
  kind: string;
  direction: string;
  channel: string | null;
  subject: string | null;
  summary: string;
  outcome: string | null;
  happened_at: string;
  duration_minutes: number | null;
  participants: string | null;
  os_employees: { full_name: string } | null;
};

const KINDS = [
  { key: "call", label: "Call" },
  { key: "meeting", label: "Meeting" },
  { key: "email", label: "Email" },
  { key: "message", label: "Message" },
  { key: "site_visit", label: "Site visit" },
  { key: "proposal_sent", label: "Proposal sent" },
  { key: "note", label: "Note" },
];

const OUTCOMES = [
  { key: "", label: "Not recorded" },
  { key: "positive", label: "Went well" },
  { key: "neutral", label: "Neutral" },
  { key: "negative", label: "Went badly" },
  { key: "no_answer", label: "No answer" },
  { key: "rescheduled", label: "Rescheduled" },
];

export function EngagementLog({
  title = "Contact history",
  engagements,
  target,
  canLog,
}: {
  title?: string;
  engagements: Engagement[];
  target: { leadId?: string | null; dealId?: string | null; clientId?: string | null; companyId?: string | null; tripId?: string | null };
  canLog: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    kind: "call",
    direction: "outbound" as "inbound" | "outbound" | "internal",
    channel: "",
    subject: "",
    summary: "",
    outcome: "",
    durationMinutes: "",
    participants: "",
    followUpTitle: "",
    followUpDue: "",
  });

  const action = useAction(logEngagement, {
    onSuccess: () => {
      setOpen(false);
      setForm({ ...form, subject: "", summary: "", outcome: "", durationMinutes: "", followUpTitle: "", followUpDue: "" });
    },
  });

  return (
    <Card padded={false}>
      <div className="border-b border-os-line px-4 py-3 sm:px-5">
        <CardHeader
          title={title}
          subtitle="Not an inbox — the record that a conversation happened, and what came of it."
          action={
            canLog ? (
              <button onClick={() => setOpen((v) => !v)} className={buttonClass.secondary}>
                <Icon.Plus size={14} />Log contact
              </button>
            ) : null
          }
        />
      </div>

      {open ? (
        <div className="border-b border-os-line bg-os-card p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="What happened">
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass}>
                {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
              </select>
            </Field>
            <Field label="Direction">
              <select
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value as typeof form.direction })}
                className={selectClass}
              >
                <option value="outbound">We contacted them</option>
                <option value="inbound">They contacted us</option>
                <option value="internal">Internal</option>
              </select>
            </Field>
            <Field label="Channel" hint="WhatsApp, phone, in person.">
              <input value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className={inputClass} />
            </Field>

            <div className="sm:col-span-3">
              <Field label="Subject">
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="Season planning" />
              </Field>
            </div>
            <div className="sm:col-span-3">
              <Field label="What came of it" required hint="Write it for the colleague who picks this relationship up next Monday.">
                <textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputClass} />
              </Field>
            </div>

            <Field label="Outcome">
              <select value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} className={selectClass}>
                {OUTCOMES.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Minutes">
              <input inputMode="numeric" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Who else was there">
              <input value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} className={inputClass} />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Follow-up" hint="Creates a real task on your list, not a promise in a note.">
                <input value={form.followUpTitle} onChange={(e) => setForm({ ...form, followUpTitle: e.target.value })} className={inputClass} placeholder="Send the revised ladder" />
              </Field>
            </div>
            <Field label="Due">
              <input type="date" value={form.followUpDue} onChange={(e) => setForm({ ...form, followUpDue: e.target.value })} className={inputClass} />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => action.run({
                kind: form.kind,
                direction: form.direction,
                channel: form.channel || null,
                leadId: target.leadId ?? null,
                dealId: target.dealId ?? null,
                clientId: target.clientId ?? null,
                companyId: target.companyId ?? null,
                tripId: target.tripId ?? null,
                subject: form.subject || null,
                summary: form.summary,
                outcome: form.outcome || null,
                durationMinutes: form.durationMinutes.trim() ? Number(form.durationMinutes) : null,
                participants: form.participants || null,
                followUp: form.followUpTitle.trim() && form.followUpDue
                  ? { title: form.followUpTitle, dueOn: form.followUpDue }
                  : null,
              })}
              disabled={!form.summary.trim() || action.pending}
              className={buttonClass.gold}
            >
              {action.pending ? <Spinner /> : null}Log it
            </button>
            <button onClick={() => setOpen(false)} className={buttonClass.ghost}>Cancel</button>
          </div>
          <ActionFeedback result={action.result} onDismiss={action.clear} />
        </div>
      ) : null}

      {engagements.length ? (
        <ul>
          {engagements.map((e) => (
            <li key={e.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-os-text">
                  {KINDS.find((k) => k.key === e.kind)?.label ?? e.kind}
                  {e.channel ? <span className="font-normal text-os-muted"> · {e.channel}</span> : null}
                  {e.direction === "inbound" ? <span className="font-normal text-os-muted"> · they contacted us</span> : null}
                </span>
                <span className="os-nums shrink-0 text-[11px] text-os-faint">
                  {new Date(e.happened_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {e.duration_minutes ? ` · ${e.duration_minutes}m` : ""}
                </span>
              </div>
              {e.subject ? <p className="mt-0.5 text-[12.5px] font-medium text-os-text">{e.subject}</p> : null}
              <p className="mt-0.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-os-muted">{e.summary}</p>
              <p className="mt-1 text-[11px] text-os-faint">
                {e.os_employees?.full_name ?? "Someone"}
                {e.participants ? ` · with ${e.participants}` : ""}
                {e.outcome ? ` · ${OUTCOMES.find((o) => o.key === e.outcome)?.label ?? e.outcome}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4">
          <EmptyState
            title="Nothing logged yet"
            description="A relationship with no recorded contact is one nobody else can pick up."
            icon={<Icon.Chat size={24} />}
          />
        </div>
      )}
    </Card>
  );
}
