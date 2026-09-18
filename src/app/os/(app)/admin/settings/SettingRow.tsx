"use client";

import { useState } from "react";
import { updateSetting } from "@/lib/os/actions/admin";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { inputClass, buttonClass } from "@/components/os/ui";

export function SettingRow({
  settingKey, value, description, updatedBy, updatedAt,
}: {
  settingKey: string;
  value: string;
  description: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const action = useAction(updateSetting, { onSuccess: () => setEditing(false) });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <code className="text-[12px] font-medium text-os-text">{settingKey}</code>
          {description ? <p className="mt-0.5 text-[12px] leading-relaxed text-os-muted">{description}</p> : null}
          {updatedBy || updatedAt ? (
            <p className="mt-0.5 text-[11px] text-os-faint">
              {updatedBy ? `Last changed by ${updatedBy}` : "Default"}{updatedAt ? ` · ${updatedAt}` : ""}
            </p>
          ) : null}
        </div>
        {!editing ? (
          <div className="flex shrink-0 items-center gap-2">
            <code className="os-nums rounded bg-black/[0.05] px-2 py-1 text-[12px] text-os-text">{value}</code>
            <button onClick={() => setEditing(true)} className="text-[12px] font-medium text-os-gold hover:underline">Change</button>
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-2.5">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} className={`${inputClass} os-nums`} />
          <p className="mt-1 text-[11px] text-os-faint">
            JSON. Numbers need no quotes; text does. Objects like <code>{"{\"green\":90,\"yellow\":60}"}</code> keep their shape.
          </p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => action.run(settingKey, draft)} disabled={action.pending} className={buttonClass.primary}>
              {action.pending ? <Spinner /> : null}Save
            </button>
            <button onClick={() => { setEditing(false); setDraft(value); }} className={buttonClass.ghost}>Cancel</button>
          </div>
          <ActionFeedback result={action.result} onDismiss={action.clear} />
        </div>
      ) : null}
    </div>
  );
}
