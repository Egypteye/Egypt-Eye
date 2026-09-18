"use client";

import { useState } from "react";
import { changeTripStatus } from "@/lib/os/actions/trips";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Icon } from "@/components/os/icons";

// Moving a trip through its lifecycle.
//
// The readiness gate is the interesting part: when the server refuses to mark
// a trip Ready, it comes back with the exact blockers, and this shows them
// rather than a generic failure. Someone who can approve gets an override
// button, and forcing it is recorded in the status history as FORCED with
// whatever reason they gave.
export function StatusControl({
  tripRef, current, statuses, canOverride,
}: {
  tripRef: string;
  current: string;
  statuses: { key: string; label: string; color: string; category: string }[];
  canOverride: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const action = useAction(changeTripStatus, { onSuccess: () => { setOpen(false); setPendingStatus(null); setNote(""); } });

  const status = statuses.find((s) => s.key === current);
  const blocked = action.result && !action.result.ok && (action.result.blockers?.length ?? 0) > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-os-line-strong bg-white px-2.5 py-2 text-[13px] font-medium text-os-text transition hover:bg-black/[0.03]"
      >
        <span className="h-2 w-2 rounded-full" style={{ background: status?.color ?? "#8d9791" }} />
        {status?.label ?? current}
        <Icon.ChevronDown size={14} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} role="presentation" />
          <div className="absolute right-0 z-40 mt-1.5 w-[290px] rounded-xl border border-os-line bg-white p-1.5 shadow-xl">
            <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Move this trip to</p>
            {statuses.map((s) => (
              <button
                key={s.key}
                disabled={s.key === current || action.pending}
                onClick={() => { setPendingStatus(s.key); void action.run(tripRef, s.key, { note: note.trim() || undefined }); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition disabled:opacity-40 ${
                  s.key === current ? "bg-black/[0.04] font-semibold" : "hover:bg-black/[0.04]"
                }`}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="flex-1">{s.label}</span>
                {action.pending && pendingStatus === s.key ? <Spinner size={12} /> : null}
                {s.key === current ? <Icon.Check size={14} /> : null}
              </button>
            ))}

            {blocked ? (
              <div className="mt-1 border-t border-os-line px-2 pb-1 pt-2">
                <p className="text-[12px] font-semibold text-os-red">{action.result && !action.result.ok ? action.result.error : ""}</p>
                <ul className="mt-1.5 space-y-1">
                  {action.result && !action.result.ok
                    ? action.result.blockers?.map((b, i) => (
                        <li key={i} className="text-[11.5px] leading-snug text-os-muted">
                          <span className="font-medium text-os-text">{b.label}</span> — {b.detail}
                        </li>
                      ))
                    : null}
                </ul>
                {canOverride ? (
                  <div className="mt-2.5">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Reason for overriding the gate"
                      className="w-full rounded-lg border border-os-line-strong px-2 py-1.5 text-[12.5px] focus:border-os-gold focus:outline-none"
                    />
                    <button
                      disabled={!note.trim() || action.pending}
                      onClick={() => pendingStatus && void action.run(tripRef, pendingStatus, { note: note.trim(), force: true })}
                      className="mt-1.5 w-full rounded-lg border border-os-red/30 bg-os-red-soft px-2 py-1.5 text-[12.5px] font-semibold text-os-red disabled:opacity-50"
                    >
                      Override and continue
                    </button>
                    <p className="mt-1 text-[10.5px] leading-snug text-os-faint">
                      Recorded in the trip history as forced, with your name and this reason.
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] leading-snug text-os-faint">
                    Clear the blockers, or ask a manager to override the gate.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <ActionFeedback result={action.result?.ok ? action.result : null} onDismiss={action.clear} />
    </div>
  );
}
