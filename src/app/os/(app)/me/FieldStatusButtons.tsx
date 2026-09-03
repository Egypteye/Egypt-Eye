"use client";

import { useState } from "react";
import { reportFieldStatus } from "@/lib/os/actions/assignments";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";

// Big targets, one word each, in the order the day actually happens. This is
// pressed with a thumb, outdoors, sometimes while holding equipment.
const STEPS = [
  { key: "on_my_way", label: "On my way" },
  { key: "arrived", label: "Arrived" },
  { key: "started", label: "Started" },
  { key: "completed", label: "Completed" },
] as const;

export function FieldStatusButtons({ tripRef }: { tripRef: string }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const action = useAction(reportFieldStatus);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {STEPS.map((step) => (
          <button
            key={step.key}
            onClick={() => { setChosen(step.key); void action.run(tripRef, step.key); }}
            disabled={action.pending}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-[13.5px] font-semibold transition disabled:opacity-60 ${
              chosen === step.key
                ? "border-os-ink bg-os-ink text-white"
                : "border-os-line-strong bg-white text-os-text hover:bg-black/[0.03]"
            }`}
          >
            {action.pending && chosen === step.key ? <Spinner /> : null}
            {step.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => { setChosen("issue"); void action.run(tripRef, "issue"); }}
        disabled={action.pending}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-os-red/30 bg-os-red-soft px-3 py-3 text-[13.5px] font-semibold text-os-red transition hover:bg-os-red/10 disabled:opacity-60"
      >
        {action.pending && chosen === "issue" ? <Spinner /> : null}
        I have a problem
      </button>
      <p className="mt-1.5 text-[11px] leading-snug text-os-muted">
        Reporting a problem alerts operations immediately and puts a line in the trip channel.
      </p>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
