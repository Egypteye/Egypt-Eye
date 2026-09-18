"use client";

import { setTaskStatus } from "@/lib/os/actions/work";
import { useAction, Spinner } from "@/components/os/action";
import { Icon } from "@/components/os/icons";

// The checkbox that closes a task. One click, optimistic-feeling because the
// page refreshes itself, and it never silently fails — a refusal (someone
// else's task) surfaces as a tooltip rather than a dead click.
export function TaskToggle({ taskId, status }: { taskId: string; status: string }) {
  const action = useAction(setTaskStatus);
  const done = status === "done";
  const blocked = status === "blocked";

  return (
    <button
      onClick={() => action.run(taskId, done ? "todo" : "done")}
      disabled={action.pending}
      title={
        action.result && !action.result.ok
          ? action.result.error
          : done ? "Mark as not done" : "Mark as done"
      }
      aria-label={done ? "Mark as not done" : "Mark as done"}
      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition ${
        done
          ? "border-os-green bg-os-green text-white"
          : blocked
            ? "border-os-amber bg-os-amber-soft text-os-amber"
            : "border-os-line-strong bg-white text-transparent hover:border-os-green"
      } ${action.result && !action.result.ok ? "border-os-red" : ""}`}
    >
      {action.pending ? <Spinner size={11} /> : blocked && !done ? <Icon.Alert size={11} /> : <Icon.Check size={12} />}
    </button>
  );
}
