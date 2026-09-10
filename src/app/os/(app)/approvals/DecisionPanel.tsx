"use client";

import { useState } from "react";
import { decideApproval } from "@/lib/os/actions/work";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { inputClass } from "@/components/os/ui";

export function DecisionPanel({ approvalId, title }: { approvalId: string; title: string }) {
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"approved" | "rejected" | "changes_requested" | null>(null);
  const action = useAction(decideApproval);

  return (
    <div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={mode === "rejected" ? "Why not, and what should change" : "Add a note (required to reject)"}
        aria-label={`Decision note for ${title}`}
        className={inputClass}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={() => { setMode("approved"); void action.run(approvalId, "approved", note); }}
          disabled={action.pending}
          className="rounded-lg bg-os-green px-3 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {action.pending && mode === "approved" ? <Spinner size={12} /> : null} Approve
        </button>
        <button
          onClick={() => { setMode("rejected"); void action.run(approvalId, "rejected", note); }}
          disabled={action.pending}
          className="rounded-lg border border-os-red/30 bg-os-red-soft px-3 py-2 text-[13px] font-semibold text-os-red transition hover:bg-os-red/10 disabled:opacity-50"
        >
          {action.pending && mode === "rejected" ? <Spinner size={12} /> : null} Reject
        </button>
        <button
          onClick={() => { setMode("changes_requested"); void action.run(approvalId, "changes_requested", note); }}
          disabled={action.pending}
          className="rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text transition hover:bg-black/[0.03] disabled:opacity-50"
        >
          Ask for changes
        </button>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
