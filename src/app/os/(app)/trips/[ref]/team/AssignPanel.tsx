"use client";

import { useState } from "react";
import { assignToTrip } from "@/lib/os/actions/assignments";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Icon } from "@/components/os/icons";

// The ranked candidate list.
//
// The override flow is the part worth reading. A soft conflict does not block
// the button; it turns it into a box that demands a reason. The reason is
// stored on the assignment, written to the audit log, and raised as an
// approval for the operations manager. Nobody forces a conflict quietly, and
// nobody is prevented from doing it when the operation genuinely needs it.

type Candidate = {
  id: string;
  name: string;
  subtitle: string;
  available: boolean;
  reasons: string[];
  meta: string[];
  conflicts: { severity: string; title: string; detail: string }[];
};

type Slot = { key: string; label: string; kind: "crew" | "resource" };

export function AssignPanel({
  tripRef, slots, candidates, resourceCandidates, collapsed,
}: {
  tripRef: string;
  slots: Slot[];
  candidates: Candidate[];
  resourceCandidates: Candidate[];
  collapsed?: boolean;
}) {
  const [slotKey, setSlotKey] = useState(slots[0]?.key ?? "");
  const [expanded, setExpanded] = useState(!collapsed);
  const [overrideFor, setOverrideFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const action = useAction(assignToTrip, { onSuccess: () => { setOverrideFor(null); setReason(""); } });

  const slot = slots.find((s) => s.key === slotKey) ?? slots[0];
  const list = slot?.kind === "resource" ? resourceCandidates : candidates;

  async function assign(candidateId: string, withReason?: string) {
    const outcome = await action.run({
      tripRef,
      roleKey: slot.key,
      employeeId: slot.kind === "crew" ? candidateId : null,
      resourceId: slot.kind === "resource" ? candidateId : null,
      overrideReason: withReason ?? null,
    });
    // A refusal that carries blockers is the soft-conflict case: open the
    // reason box rather than just showing an error the user cannot act on.
    if (!outcome.ok && outcome.blockers?.length) setOverrideFor(candidateId);
  }

  if (!slot) return null;

  return (
    <div className="rounded-xl border border-os-line bg-os-card">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left sm:px-5"
      >
        <span>
          <span className="block text-[14px] font-semibold text-os-text">Assign a {slot.label.toLowerCase()}</span>
          <span className="block text-[12px] text-os-muted">
            {list.length
              ? `${list.filter((c) => c.available).length} available of ${list.length}, best match first`
              : "Choose a role to see candidates"}
          </span>
        </span>
        <span className="text-os-muted">{expanded ? <Icon.ChevronDown size={16} /> : <Icon.ChevronRight size={16} />}</span>
      </button>

      {expanded ? (
        <div className="border-t border-os-line px-4 py-3 sm:px-5">
          {slots.length > 1 ? (
            <div className="mb-3 flex flex-wrap gap-1">
              {slots.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSlotKey(s.key)}
                  className={`rounded-md px-2 py-1 text-[12px] transition ${
                    s.key === slotKey ? "bg-os-ink text-white" : "border border-os-line bg-white text-os-muted hover:text-os-text"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}

          {list.length === 0 ? (
            <p className="py-3 text-[13px] text-os-muted">
              Nobody in the company holds the {slot.label.toLowerCase()} role
              {slot.kind === "resource" ? ", or no resource of this kind exists" : ""}. Add one under{" "}
              {slot.kind === "resource" ? "Resources" : "Team"}.
            </p>
          ) : (
            <ul className="space-y-2">
              {list.map((candidate) => {
                const hard = candidate.conflicts.filter((c) => c.severity === "hard");
                const soft = candidate.conflicts.filter((c) => c.severity === "soft");
                const warn = candidate.conflicts.filter((c) => c.severity === "warning");
                return (
                  <li
                    key={candidate.id}
                    className={`rounded-lg border p-3 ${candidate.available ? "border-os-line" : "border-os-red/25 bg-os-red-soft/40"}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-os-text">{candidate.name}</p>
                        {candidate.subtitle ? <p className="text-[11.5px] text-os-muted">{candidate.subtitle}</p> : null}
                        {candidate.meta.length ? (
                          <p className="mt-0.5 text-[11.5px] text-os-faint">{candidate.meta.join(" · ")}</p>
                        ) : null}
                      </div>

                      {candidate.available ? (
                        <button
                          onClick={() => assign(candidate.id)}
                          disabled={action.pending}
                          className="shrink-0 rounded-lg bg-os-ink px-2.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-os-ink-2 disabled:opacity-50"
                        >
                          {action.pending ? <Spinner size={12} /> : "Assign"}
                        </button>
                      ) : (
                        <span className="shrink-0 rounded-md bg-os-red-soft px-2 py-1 text-[11px] font-semibold text-os-red">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {hard.length || soft.length || warn.length ? (
                      <ul className="mt-2 space-y-1">
                        {[...hard, ...soft, ...warn].map((conflict, i) => (
                          <li
                            key={i}
                            className={`text-[11.5px] leading-snug ${
                              conflict.severity === "hard" ? "text-os-red" : conflict.severity === "soft" ? "text-os-amber" : "text-os-muted"
                            }`}
                          >
                            <span className="font-medium">{conflict.title}</span> — {conflict.detail}
                          </li>
                        ))}
                      </ul>
                    ) : candidate.reasons.length ? (
                      <p className="mt-1.5 text-[11.5px] text-os-muted">{candidate.reasons.slice(0, 3).join(" · ")}</p>
                    ) : null}

                    {overrideFor === candidate.id ? (
                      <div className="mt-2.5 rounded-lg border border-os-amber/30 bg-os-amber-soft p-2.5">
                        <p className="text-[12px] font-semibold text-os-amber">Assign anyway?</p>
                        <p className="mt-0.5 text-[11.5px] leading-snug text-os-amber/90">
                          This creates a real scheduling conflict. Your reason goes on the assignment, into the audit log, and
                          to the operations manager as an approval.
                        </p>
                        <input
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Why this is the right call"
                          className="mt-2 w-full rounded-lg border border-os-amber/40 bg-white px-2 py-1.5 text-[12.5px] focus:border-os-gold focus:outline-none"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            disabled={!reason.trim() || action.pending}
                            onClick={() => assign(candidate.id, reason.trim())}
                            className="rounded-lg bg-os-amber px-2.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                          >
                            Assign with this reason
                          </button>
                          <button
                            onClick={() => { setOverrideFor(null); setReason(""); action.clear(); }}
                            className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-os-muted"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          <ActionFeedback result={action.result?.ok ? action.result : null} onDismiss={action.clear} />
          {action.result && !action.result.ok && !action.result.blockers?.length ? (
            <ActionFeedback result={action.result} onDismiss={action.clear} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
