"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// NEAR-REAL-TIME, HONESTLY
// ---------------------------------------------------------------------------
// When operations assigns a photographer, the manager's board and the
// photographer's phone should show it without anybody pressing refresh.
//
// This does that by polling one very small endpoint — /api/os/pulse returns
// five timestamps, nothing else — and calling router.refresh() only when a
// timestamp has actually moved. The page re-renders on the server with the
// viewer's own permissions intact, which a websocket pushing row data would
// not do without duplicating the whole permission layer on the client.
//
// It is not a live socket, and the product does not claim to be one. Polling
// pauses when the tab is hidden and resumes (with an immediate check) when it
// comes back, so a phone in a pocket costs nothing.
// ---------------------------------------------------------------------------

export function LiveRefresh({ intervalMs = 25_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const cursor = useRef<string | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function check() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/os/pulse", { cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as { cursor: string };
        if (cancelled) return;
        if (cursor.current && body.cursor !== cursor.current) {
          cursor.current = body.cursor;
          setStale(true);
          router.refresh();
          window.setTimeout(() => setStale(false), 1400);
        } else {
          cursor.current = body.cursor;
        }
      } catch {
        // Offline or the endpoint is unreachable. Silence is correct here:
        // the page still shows the last good data, and there is nothing the
        // person looking at it can do about a failed background poll.
      }
    }

    function schedule() {
      timer = window.setInterval(check, intervalMs);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        void check();
        if (!timer) schedule();
      } else if (timer) {
        window.clearInterval(timer);
        timer = undefined;
      }
    }

    void check();
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);

  if (!stale) return null;
  return (
    <div className="os-no-print pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-os-ink px-3 py-1.5 text-[11.5px] font-medium text-white shadow-lg lg:bottom-6">
      <span className="os-live-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-os-gold align-middle" />
      Updated
    </div>
  );
}
