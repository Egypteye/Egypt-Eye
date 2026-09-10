"use client";

import { checkIn, checkOut } from "@/lib/os/actions/work";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Icon } from "@/components/os/icons";
import { formatClock } from "@/lib/os/dates";

// Check in and out. Two buttons and a clock — attendance is not the product,
// it is one honest fact the operation needs, and a screen that treats it as
// more than that is a screen field staff learn to avoid.
export function AttendanceControl({
  checkedInAt, checkedOutAt, status,
}: { checkedInAt: string | null; checkedOutAt: string | null; status: string | null }) {
  const inAction = useAction(checkIn);
  const outAction = useAction(checkOut);

  if (checkedOutAt) {
    return (
      <div className="rounded-lg bg-os-green-soft px-3 py-2.5 text-[13px] text-os-green">
        <p className="font-semibold">Done for today</p>
        <p className="os-nums mt-0.5 text-[12px] opacity-90">
          {formatClock(checkedInAt)} → {formatClock(checkedOutAt)}
        </p>
      </div>
    );
  }

  if (checkedInAt) {
    return (
      <div>
        <div className="mb-2.5 flex items-center gap-2 text-[13px]">
          <span className="os-live-dot h-2 w-2 rounded-full bg-os-green" />
          <span className="font-medium text-os-text">Checked in at {formatClock(checkedInAt)}</span>
          {status === "late" ? <span className="rounded bg-os-amber-soft px-1.5 py-0.5 text-[11px] font-medium text-os-amber">late</span> : null}
        </div>
        <button
          onClick={() => outAction.run()}
          disabled={outAction.pending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-os-line-strong bg-white px-4 py-2.5 text-[13.5px] font-semibold text-os-text transition hover:bg-black/[0.03] disabled:opacity-60"
        >
          {outAction.pending ? <Spinner /> : <Icon.Logout size={16} />}
          Check out
        </button>
        <ActionFeedback result={outAction.result} onDismiss={outAction.clear} />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => inAction.run()}
        disabled={inAction.pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-os-ink px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-os-ink-2 disabled:opacity-60"
      >
        {inAction.pending ? <Spinner /> : <Icon.Check size={16} />}
        Check in
      </button>
      <ActionFeedback result={inAction.result} onDismiss={inAction.clear} />
    </div>
  );
}
