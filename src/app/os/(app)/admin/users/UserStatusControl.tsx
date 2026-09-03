"use client";

import { useState } from "react";
import { setEmployeeStatus } from "@/lib/os/actions/admin";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { inputClass, selectClass, buttonClass } from "@/components/os/ui";

export function UserStatusControl({ employeeId, name, status }: { employeeId: string; name: string; status: string }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState(status);
  const [reason, setReason] = useState("");
  const action = useAction(setEmployeeStatus, { onSuccess: () => setOpen(false) });

  if (!open) {
    return <button onClick={() => setOpen(true)} className="text-[12px] font-medium text-os-gold hover:underline">Change</button>;
  }

  const needsReason = ["suspended", "left"].includes(next);

  return (
    <div className="w-[230px] rounded-lg border border-os-line bg-white p-3 text-left shadow-lg">
      <p className="text-[12.5px] font-semibold text-os-text">{name}</p>
      <select value={next} onChange={(e) => setNext(e.target.value)} className={`mt-2 ${selectClass} py-1.5 text-[12.5px]`}>
        <option value="active">Active</option>
        <option value="on_leave">On leave</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
        <option value="left">Left the company</option>
      </select>
      {needsReason ? (
        <input
          value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (required)"
          className={`mt-2 ${inputClass} py-1.5 text-[12.5px]`}
        />
      ) : null}
      <p className="mt-1.5 text-[11px] leading-snug text-os-faint">
        Their trips, decisions and audit entries stay exactly where they are.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => action.run(employeeId, next, reason)}
          disabled={action.pending || (needsReason && !reason.trim())}
          className={`${buttonClass.primary} px-2.5 py-1.5 text-[12px]`}
        >
          {action.pending ? <Spinner size={12} /> : null}Save
        </button>
        <button onClick={() => setOpen(false)} className={`${buttonClass.ghost} px-2 py-1.5 text-[12px]`}>Cancel</button>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
