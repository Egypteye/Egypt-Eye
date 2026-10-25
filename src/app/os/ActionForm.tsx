"use client";

import { useState, useTransition } from "react";

export type ActionResult = { ok: true; ref?: string } | { ok: false; error: string };

/**
 * A form that submits to a server action and says what happened.
 *
 * The one piece of client-side plumbing in the OS. It exists because the
 * actions return `{ ok: false, error }` rather than throwing — a refused save
 * is usually a thing the person typed, and it belongs next to the field they
 * typed it in, not on an error page.
 *
 * The button is disabled while the action is in flight. On a hotel's wifi at
 * 6am a double-tap is likely, and for addBookingDay it would otherwise mean
 * two attempts at the same insert.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  submittingLabel,
  savedLabel = "Saved",
  disabled,
  className = "",
  confirm,
  onSuccess,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel: string;
  submittingLabel?: string;
  savedLabel?: string;
  disabled?: boolean;
  className?: string;
  confirm?: string;
  /** Runs after a successful save — used to navigate to a new booking. */
  onSuccess?: (result: { ok: true; ref?: string }) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirm && !window.confirm(confirm)) return;

    const formData = new FormData(event.currentTarget);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await action(formData);
      // A redirecting action never returns, so reaching here with a result
      // means the save finished in place.
      if (result?.ok) {
        setSaved(true);
        onSuccess?.(result);
      } else {
        setError(result?.error ?? "That didn't save. Try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || disabled}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50"
        >
          {pending ? (submittingLabel ?? "Saving…") : submitLabel}
        </button>
        {saved && !pending ? <span className="text-xs font-semibold text-nile">{savedLabel}</span> : null}
        {error ? <span className="text-xs font-semibold text-terracotta">{error}</span> : null}
      </div>
    </form>
  );
}

/**
 * A button that runs an action with no form fields — cancel, remove, mark
 * complete.
 */
export function ActionButton({
  action,
  label,
  confirm,
  variant = "quiet",
}: {
  action: () => Promise<ActionResult>;
  label: string;
  confirm?: string;
  variant?: "quiet" | "danger";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setError(null);
          startTransition(async () => {
            const result = await action();
            if (!result?.ok) setError(result?.error ?? "That didn't work.");
          });
        }}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
          variant === "danger"
            ? "bg-terracotta/10 text-terracotta hover:bg-terracotta/20"
            : "bg-black/5 text-ink-soft hover:bg-black/10"
        }`}
      >
        {pending ? "Working…" : label}
      </button>
      {error ? <span className="text-xs font-semibold text-terracotta">{error}</span> : null}
    </span>
  );
}

/**
 * Copies a block of text to the clipboard.
 *
 * This is how a confirmed booking reaches the ground crew's WhatsApp group
 * today, and it is honest about being a copy: the OS cannot post into a
 * WhatsApp group without the WhatsApp Business Cloud API, which is a paid
 * Meta product with number registration and approved templates behind it, and
 * none of that is configured. A "Send to group" button would be a lie. The
 * message itself is composed server-side by whatsappMessage(), so if that API
 * is ever set up, only the transport changes.
 */
export function CopyButton({ text, label = "Copy for WhatsApp" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setState("copied");
            window.setTimeout(() => setState("idle"), 2500);
          } catch {
            // Clipboard access needs a secure context and can be refused.
            // Saying so beats a button that looks like it worked.
            setState("failed");
          }
        }}
        className="rounded-lg bg-nile px-3 py-1.5 text-xs font-semibold text-cream hover:bg-nile/90"
      >
        {state === "copied" ? "Copied" : label}
      </button>
      {state === "failed" ? (
        <span className="text-xs font-semibold text-terracotta">
          Couldn&rsquo;t reach the clipboard — select the text below and copy it.
        </span>
      ) : null}
    </span>
  );
}
