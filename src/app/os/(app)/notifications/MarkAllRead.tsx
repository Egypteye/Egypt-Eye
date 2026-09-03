"use client";

import { markNotificationsRead } from "@/lib/os/actions/work";
import { useAction, Spinner } from "@/components/os/action";
import { buttonClass } from "@/components/os/ui";

export function MarkAllRead() {
  const action = useAction(markNotificationsRead);
  return (
    <button onClick={() => action.run()} disabled={action.pending} className={buttonClass.secondary}>
      {action.pending ? <Spinner /> : null}Mark all read
    </button>
  );
}
