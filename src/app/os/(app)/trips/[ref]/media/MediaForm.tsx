"use client";

import { useState } from "react";
import { addMediaLink } from "@/lib/os/actions/records";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

const KINDS = [
  { key: "raw_photos", label: "Raw photos" },
  { key: "edited_photos", label: "Edited photos" },
  { key: "videos", label: "Videos" },
  { key: "client_delivery", label: "Client delivery" },
  { key: "behind_the_scenes", label: "Behind the scenes" },
  { key: "social_content", label: "Social content" },
  { key: "other", label: "Other" },
];

export function MediaForm({ tripRef }: { tripRef: string }) {
  const [form, setForm] = useState({ kind: "raw_photos", title: "", url: "", visibility: "internal", itemCount: "" });
  const action = useAction(addMediaLink, { onSuccess: () => setForm({ ...form, title: "", url: "", itemCount: "" }) });

  return (
    <div>
      <div className="space-y-3">
        <Field label="What is in the folder">
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value, visibility: e.target.value === "client_delivery" ? "client" : form.visibility })}
            className={selectClass}
          >
            {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </Field>
        <Field label="Link" required hint="Must be https. Paste the folder's share link.">
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} placeholder="https://drive.google.com/drive/folders/…" />
        </Field>
        <Field label="Title" hint="Optional — one is generated from the trip and kind.">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Who may see it">
            <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className={selectClass}>
              <option value="internal">Internal only</option>
              <option value="client">Shareable with the client</option>
              <option value="public">Public</option>
            </select>
          </Field>
          <Field label="File count" hint="Optional.">
            <input type="number" min="0" value={form.itemCount} onChange={(e) => setForm({ ...form, itemCount: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <button
        onClick={() => action.run({
          tripRef, kind: form.kind, title: form.title, url: form.url,
          visibility: form.visibility, itemCount: form.itemCount ? Number(form.itemCount) : null,
        })}
        disabled={!form.url.trim() || action.pending}
        className={`mt-3 ${buttonClass.primary}`}
      >
        {action.pending ? <Spinner /> : null}Add link
      </button>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
