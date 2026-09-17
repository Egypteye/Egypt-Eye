"use client";

import { useActionState } from "react";
import { pinRemainingStories } from "./actions";

type Result = { pinned: number; remaining: number; errors: string[] } | null;

export function PinRemainingButton({ remainingCount }: { remainingCount: number }) {
  const [result, formAction, isPending] = useActionState<Result>(async () => {
    return pinRemainingStories();
  }, null);

  return (
    <form action={formAction} className="mt-5 border-t border-black/5 pt-5">
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Pinning…" : `Pin Remaining Stories (${Math.min(remainingCount, 25)} this click)`}
      </button>
      <p className="mt-2 text-xs text-ink-soft/50">
        Pins up to 25 at a time to stay well under Pinterest&rsquo;s rate limits — click again if {remainingCount} is
        more than that.
      </p>

      {result && (
        <div className="mt-3 text-sm">
          <p className="text-ink-soft/70">
            Pinned {result.pinned}. {result.remaining} still remaining.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-terracotta">
              {result.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
