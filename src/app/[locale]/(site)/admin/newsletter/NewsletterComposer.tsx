"use client";

import { useActionState } from "react";
import { sendNewsletterBroadcast, type BroadcastResult } from "./actions";

const initialState: BroadcastResult | null = null;

async function action(_prev: BroadcastResult | null, formData: FormData) {
  return sendNewsletterBroadcast(formData);
}

export function NewsletterComposer({ recipientCount }: { recipientCount: number }) {
  const [result, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
        Subject
        <input
          name="subject"
          required
          placeholder="This month in Egypt"
          className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
        Message
        <textarea
          name="body"
          required
          rows={8}
          placeholder={"Write your update here. Leave a blank line between paragraphs."}
          className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
        />
      </label>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-ink-soft/50">Sends to {recipientCount} verified, subscribed address{recipientCount === 1 ? "" : "es"}.</p>
        <button
          type="submit"
          disabled={pending || recipientCount === 0}
          className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send Newsletter"}
        </button>
      </div>
      {result && (
        <p className="text-sm font-medium text-nile">
          Sent to {result.sent} subscriber{result.sent === 1 ? "" : "s"}
          {result.skipped > 0 ? ` (${result.skipped} already sent this exact broadcast)` : ""}
          {result.failed > 0 ? ` — ${result.failed} failed, check RESEND_API_KEY / logs.` : "."}
        </p>
      )}
    </form>
  );
}
