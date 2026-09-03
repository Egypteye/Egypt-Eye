"use client";

import { setAssignmentStatus } from "@/lib/os/actions/assignments";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Badge } from "@/components/os/ui";

// One person or thing on the trip, and the two moves that matter: confirm
// (which makes the database enforce the booking against anyone else) and
// release.
export function AssignmentRow({
  tripRef, assignment, canAssign,
}: {
  tripRef: string;
  assignment: {
    id: string; roleKey: string; status: string; name: string; subtitle: string | null;
    fieldStatus: string | null; fieldStatusAt: string | null; overrideReason: string | null; assignedAt: string;
  };
  canAssign: boolean;
}) {
  const action = useAction(setAssignmentStatus);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">
            {assignment.roleKey.replace(/_/g, " ")}
          </p>
          <p className="text-[13.5px] font-semibold text-os-text">{assignment.name}</p>
          {assignment.subtitle ? <p className="text-[11.5px] text-os-muted">{assignment.subtitle}</p> : null}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone={assignment.status === "confirmed" ? "green" : assignment.status === "proposed" ? "neutral" : "gold"}>
              {assignment.status}
            </Badge>
            {assignment.fieldStatus ? (
              <Badge tone={assignment.fieldStatus === "issue" ? "red" : "blue"}>
                {assignment.fieldStatus.replace(/_/g, " ")} {assignment.fieldStatusAt ? `· ${assignment.fieldStatusAt}` : ""}
              </Badge>
            ) : null}
            {assignment.overrideReason ? <Badge tone="amber">Conflict overridden</Badge> : null}
          </div>
          {assignment.overrideReason ? (
            <p className="mt-1 text-[11.5px] leading-snug text-os-amber">{assignment.overrideReason}</p>
          ) : null}
        </div>

        {canAssign ? (
          <div className="flex shrink-0 gap-1.5">
            {assignment.status !== "confirmed" ? (
              <button
                onClick={() => action.run(assignment.id, "confirmed", tripRef)}
                disabled={action.pending}
                className="rounded-lg border border-os-green/30 bg-os-green-soft px-2 py-1 text-[12px] font-semibold text-os-green disabled:opacity-50"
                title="Confirming locks this slot: the database will refuse any overlapping confirmed booking."
              >
                {action.pending ? <Spinner size={11} /> : "Confirm"}
              </button>
            ) : null}
            <button
              onClick={() => action.run(assignment.id, "released", tripRef)}
              disabled={action.pending}
              className="rounded-lg px-2 py-1 text-[12px] font-medium text-os-muted transition hover:text-os-red disabled:opacity-50"
            >
              Release
            </button>
          </div>
        ) : null}
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
