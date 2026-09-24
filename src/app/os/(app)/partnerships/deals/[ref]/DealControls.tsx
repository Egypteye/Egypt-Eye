"use client";

import { useState } from "react";
import { moveDealStage, closeDeal, updateDeal } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass, Notice } from "@/components/os/ui";

// A refusal here NAMES what is missing. The server returns the blockers as a
// structured list and ActionFeedback renders each one with what to go and do
// — a greyed-out button teaches nobody anything.
export function DealControls({
  dealId,
  dealRef,
  status,
  stageId,
  stages,
  lostReasons,
  can,
  currency,
  value,
}: {
  dealId: string;
  dealRef: string;
  status: string;
  stageId: string | null;
  stages: { id: string; key: string; label: string; category: string; description: string | null }[];
  lostReasons: { key: string; label: string; controllable: boolean }[];
  can: { move: boolean; close: boolean; edit: boolean; value: boolean };
  currency: string;
  value: number;
}) {
  const [panel, setPanel] = useState<"none" | "move" | "won" | "lost" | "next">("none");
  const [form, setForm] = useState({
    stageId: "",
    note: "",
    reasonKey: "",
    lostTo: "",
    value: String(value || ""),
    nextStep: "",
    nextStepDue: "",
  });

  const move = useAction(moveDealStage, { onSuccess: () => setPanel("none") });
  const close = useAction(closeDeal, { onSuccess: () => setPanel("none") });
  const update = useAction(updateDeal, { onSuccess: () => setPanel("none") });

  const openStages = stages.filter((s) => s.category !== "won" && s.category !== "lost" && s.id !== stageId);
  const closed = status !== "open";

  if (closed) {
    return (
      <Notice tone="blue" title={`This deal is ${status}`}>
        Its stage history, its value and the reason it closed are all kept. Reopening one is deliberately not a button —
        open a new deal so the second attempt has its own record.
      </Notice>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {can.move && openStages.length ? (
          <button onClick={() => setPanel(panel === "move" ? "none" : "move")} className={buttonClass.primary}>
            Move stage
          </button>
        ) : null}
        {can.close ? (
          <>
            <button onClick={() => setPanel(panel === "won" ? "none" : "won")} className={buttonClass.gold}>Mark won</button>
            <button onClick={() => setPanel(panel === "lost" ? "none" : "lost")} className={buttonClass.secondary}>Mark lost</button>
          </>
        ) : null}
        {can.edit ? (
          <button onClick={() => setPanel(panel === "next" ? "none" : "next")} className={buttonClass.ghost}>
            Set the next step
          </button>
        ) : null}
      </div>

      {panel === "move" ? (
        <Panel>
          <Field label="Move to" required>
            <select value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })} className={selectClass}>
              <option value="">Choose a stage</option>
              {openStages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          {form.stageId ? (
            <p className="mt-1.5 text-[11.5px] text-os-muted">
              {openStages.find((s) => s.id === form.stageId)?.description}
            </p>
          ) : null}
          <Field label="What moved it" hint="Optional, but it is what the stage history reads like in three months.">
            <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
          </Field>
          <Actions
            onRun={() => move.run(dealId, form.stageId, form.note)}
            disabled={!form.stageId || move.pending}
            pending={move.pending}
            label="Move"
            onCancel={() => setPanel("none")}
          />
          <ActionFeedback result={move.result} onDismiss={move.clear} />
        </Panel>
      ) : null}

      {panel === "won" ? (
        <Panel>
          <p className="mb-3 text-[12.5px] leading-relaxed text-os-muted">
            Marking this won raises a task for operations to create the trip. It does NOT create the trip itself — the
            operation decides what it takes on, and a booking that staffs itself is how a company ends up committed to a
            date nobody has crew for.
          </p>
          {can.value ? (
            <Field label={`Final value (${currency})`} required hint="The revenue report reads this. A guess here is a wrong number in the annual accounts.">
              <input inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputClass} />
            </Field>
          ) : null}
          <Field label="Anything worth recording">
            <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
          </Field>
          <Actions
            onRun={() => close.run({
              dealId,
              outcome: "won",
              note: form.note,
              valueAmount: can.value && form.value.trim() ? Number(form.value) : null,
            })}
            disabled={close.pending}
            pending={close.pending}
            label={`Mark ${dealRef} won`}
            onCancel={() => setPanel("none")}
          />
          <ActionFeedback result={close.result} onDismiss={close.clear} />
        </Panel>
      ) : null}

      {panel === "lost" ? (
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Reason" required hint="Whether we could have changed it is the whole value of this field.">
              <select value={form.reasonKey} onChange={(e) => setForm({ ...form, reasonKey: e.target.value })} className={selectClass}>
                <option value="">Choose one</option>
                {lostReasons.map((r) => (
                  <option key={r.key} value={r.key}>{r.label}{r.controllable ? " (ours)" : ""}</option>
                ))}
              </select>
            </Field>
            <Field label="Lost to" hint="Only if it is actually known. A guessed competitor is worse than a blank.">
              <input value={form.lostTo} onChange={(e) => setForm({ ...form, lostTo: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="What happened" required>
            <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
          </Field>
          <Actions
            onRun={() => close.run({ dealId, outcome: "lost", reasonKey: form.reasonKey, note: form.note, lostTo: form.lostTo || null })}
            disabled={!form.reasonKey || !form.note.trim() || close.pending}
            pending={close.pending}
            label={`Mark ${dealRef} lost`}
            onCancel={() => setPanel("none")}
          />
          <ActionFeedback result={close.result} onDismiss={close.clear} />
        </Panel>
      ) : null}

      {panel === "next" ? (
        <Panel>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Field label="Next step" required>
              <input value={form.nextStep} onChange={(e) => setForm({ ...form, nextStep: e.target.value })} className={inputClass} placeholder="Send the revised commission ladder" />
            </Field>
            <Field label="By">
              <input type="date" value={form.nextStepDue} onChange={(e) => setForm({ ...form, nextStepDue: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Actions
            onRun={() => update.run(dealId, { nextStep: form.nextStep, nextStepDueOn: form.nextStepDue || null })}
            disabled={!form.nextStep.trim() || update.pending}
            pending={update.pending}
            label="Save"
            onCancel={() => setPanel("none")}
          />
          <ActionFeedback result={update.result} onDismiss={update.clear} />
        </Panel>
      ) : null}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 space-y-3 rounded-xl border border-os-line bg-os-card p-4">{children}</div>;
}

function Actions({
  onRun, disabled, pending, label, onCancel,
}: { onRun: () => void; disabled: boolean; pending: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onRun} disabled={disabled} className={buttonClass.gold}>
        {pending ? <Spinner /> : null}{label}
      </button>
      <button onClick={onCancel} className={buttonClass.ghost}>Cancel</button>
    </div>
  );
}
