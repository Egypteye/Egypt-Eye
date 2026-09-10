"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/os/action-types";
import { Icon } from "./icons";

// ---------------------------------------------------------------------------
// RUNNING A SERVER ACTION FROM A CLIENT COMPONENT
// ---------------------------------------------------------------------------
// One hook, used by every interactive control in the OS, so that pending
// state, error handling and the refresh after a successful write behave the
// same everywhere.
//
// The error surface matters as much as the happy path. Server actions here
// return a structured result rather than throwing, and what comes back is
// written to be read by a coordinator at 05:30 — "That person is already
// confirmed on an overlapping trip", not "500". The `blockers` list carries
// the specific things standing in the way, which is what turns a refusal into
// something actionable.
// ---------------------------------------------------------------------------

export function useAction<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<ActionResult<T>>,
  options: { onSuccess?: (result: Extract<ActionResult<T>, { ok: true }>) => void; refresh?: boolean } = {},
) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<T> | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(
    async (...args: Args) => {
      setRunning(true);
      setResult(null);
      try {
        const outcome = await fn(...args);
        setResult(outcome);
        if (outcome.ok) {
          options.onSuccess?.(outcome);
          if (options.refresh !== false) startTransition(() => router.refresh());
        }
        return outcome;
      } catch {
        const failure: ActionResult<T> = {
          ok: false,
          error: "The action could not be completed",
          detail: "Check your connection and try again. Nothing was saved.",
        };
        setResult(failure);
        return failure;
      } finally {
        setRunning(false);
      }
    },
    // `options` is intentionally not a dependency: callers pass an object
    // literal, and depending on it would rebuild `run` on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, router],
  );

  return { run, pending: running || pending, result, clear: () => setResult(null) };
}

export function ActionFeedback({ result, onDismiss }: { result: ActionResult<unknown> | null; onDismiss?: () => void }) {
  if (!result) return null;

  if (result.ok) {
    if (!result.message) return null;
    return (
      <div className="mt-2 flex items-start gap-2 rounded-lg border border-os-green/25 bg-os-green-soft px-3 py-2 text-[12.5px] text-os-green">
        <span className="mt-0.5 shrink-0"><Icon.Check size={15} /></span>
        <span className="flex-1">{result.message}</span>
        {onDismiss ? (
          <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss">
            <Icon.Close size={14} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-os-red/25 bg-os-red-soft px-3 py-2 text-[12.5px] text-os-red">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0"><Icon.Alert size={15} /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{result.error}</p>
          {result.detail ? <p className="mt-0.5 leading-relaxed opacity-90">{result.detail}</p> : null}
          {result.blockers?.length ? (
            <ul className="mt-1.5 space-y-1">
              {result.blockers.map((b, i) => (
                <li key={i} className="leading-snug">
                  <span className="font-medium">{b.label}</span>
                  {b.detail ? <span className="opacity-90"> — {b.detail}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {onDismiss ? (
          <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss">
            <Icon.Close size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
