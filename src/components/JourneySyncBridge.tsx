"use client";

import { useEffect } from "react";
import { syncLocalJourneyToAccount } from "@/lib/journeySync";

const SYNCED_KEY_PREFIX = "egypt-eye:journey-synced:";

// Mounted once in the site layout. Runs the guest→account journey merge at
// most once per signed-in user per browser (tracked in localStorage, not
// state, so it survives navigation) rather than on every render.
export function JourneySyncBridge({ userId }: { userId: string | null }) {
  useEffect(() => {
    if (!userId) return;
    const key = `${SYNCED_KEY_PREFIX}${userId}`;
    if (typeof window === "undefined" || window.localStorage.getItem(key)) return;

    syncLocalJourneyToAccount(userId)
      .then(() => window.localStorage.setItem(key, "1"))
      .catch(() => {
        // Leave unset — will simply retry on the next page load.
      });
  }, [userId]);

  return null;
}
