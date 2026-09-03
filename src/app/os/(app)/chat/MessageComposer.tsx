"use client";

import { useState } from "react";
import { postMessage } from "@/lib/os/actions/work";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Icon } from "@/components/os/icons";

export function MessageComposer({ channelId }: { channelId: string }) {
  const [body, setBody] = useState("");
  const action = useAction(postMessage, { onSuccess: () => setBody("") });

  function send() {
    if (!body.trim()) return;
    void action.run(channelId, body);
  }

  return (
    <div>
      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, shift+enter is a newline — what everyone expects
            // from a chat box, and what nobody expects from a form textarea.
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          rows={2}
          placeholder="Write a message. Enter sends, shift+enter for a new line."
          className="flex-1 resize-none rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13.5px] focus:border-os-gold focus:outline-none focus:ring-2 focus:ring-os-gold/25"
        />
        <button
          onClick={send}
          disabled={!body.trim() || action.pending}
          className="shrink-0 rounded-lg bg-os-ink px-3 py-2.5 text-white transition hover:bg-os-ink-2 disabled:opacity-50"
          aria-label="Send"
        >
          {action.pending ? <Spinner /> : <Icon.ChevronRight size={16} />}
        </button>
      </div>
      <ActionFeedback result={action.result?.ok ? null : action.result} onDismiss={action.clear} />
    </div>
  );
}
