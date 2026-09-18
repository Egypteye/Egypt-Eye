"use client";

import { advanceContentJob } from "@/lib/os/actions/records";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { selectClass } from "@/components/os/ui";

// Moving a job down the pipeline. The Delivered step is the one that can be
// refused: without a verified client delivery link the server says no, and
// says exactly why.
export function StageControl({
  jobId, stage, stages,
}: {
  jobId: string;
  stage: string;
  stages: { key: string; label: string }[];
}) {
  const action = useAction(advanceContentJob);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <select
          value={stage}
          onChange={(e) => action.run(jobId, e.target.value)}
          disabled={action.pending}
          className={`${selectClass} py-1 text-[12px]`}
          aria-label="Move to stage"
        >
          {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        {action.pending ? <Spinner size={12} /> : null}
      </div>
      <ActionFeedback result={action.result?.ok ? null : action.result} onDismiss={action.clear} />
    </div>
  );
}
