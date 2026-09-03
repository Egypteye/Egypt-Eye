"use client";

import { toggleAutomation } from "@/lib/os/actions/admin";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";

export function AutomationToggle({
  automationId, active, implemented,
}: {
  automationId: string;
  active: boolean;
  implemented: boolean;
}) {
  const action = useAction(toggleAutomation);

  return (
    <div className="shrink-0">
      <button
        onClick={() => action.run(automationId, !active)}
        disabled={action.pending}
        title={implemented ? (active ? "Turn off" : "Turn on") : "This automation is not built yet"}
        className={`relative h-6 w-11 rounded-full transition ${
          active ? "bg-os-green" : implemented ? "bg-black/[0.15]" : "bg-black/[0.08]"
        } ${!implemented ? "cursor-not-allowed" : ""} disabled:opacity-60`}
        aria-pressed={active}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
      {action.pending ? <span className="ml-2 inline-block align-middle"><Spinner size={12} /></span> : null}
      <div className="mt-1 w-[220px]">
        <ActionFeedback result={action.result?.ok ? null : action.result} onDismiss={action.clear} />
      </div>
    </div>
  );
}
