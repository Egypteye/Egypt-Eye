"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";

export type SessionUser = {
  id: string;
  firstName: string | null;
  avatarUrl: string | null;
};

// PRESENTATION ONLY — never an authorization signal.
//
// The shared site layout used to call getCurrentUser() (server-side, via
// cookies()), which opted every page nested under it out of static
// generation — the entire public site was re-rendered per request. The two
// things that actually needed a user there (the Navbar's account link and
// JourneySyncBridge) are both client components and both only need to know
// "is someone signed in, and what do we show them", so they read the session
// here instead and the layout stays static.
//
// What this deliberately does NOT do: decide what anyone is allowed to see
// or do. Every protected page still calls getCurrentUser()/requireAdmin()
// server-side, and the `role` field is intentionally not exposed here — a
// client-side value must never gate access. The profile read below is
// authorized by the same RLS policy a signed-in visitor already has for
// their own row (profiles_select_own), so it can't reach anyone else's data.
//
// Session refresh is unchanged: middleware.ts still refreshes the auth
// cookie on every request exactly as before.
export function useSessionUser(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null);
  // Tracks whose profile is already loaded, so the initial getSession() and
  // the listener's opening event don't both fetch the same row.
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;

    const supabase = createClient();
    let cancelled = false;

    async function load(userId: string | undefined) {
      if (!userId) {
        loadedIdRef.current = null;
        if (!cancelled) setUser(null);
        return;
      }
      if (loadedIdRef.current === userId) return;
      loadedIdRef.current = userId;

      // Show the signed-in state immediately; fill in name/avatar when the
      // profile row arrives, so the account link is never wrong while waiting.
      if (!cancelled) setUser({ id: userId, firstName: null, avatarUrl: null });

      const { data } = await supabase
        .from("profiles")
        .select("first_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled || loadedIdRef.current !== userId) return;
      setUser({
        id: userId,
        firstName: (data?.first_name as string | null) ?? null,
        avatarUrl: (data?.avatar_url as string | null) ?? null,
      });
    }

    // getSession() reads the existing cookie locally — no auth round-trip.
    void supabase.auth.getSession().then(({ data }) => load(data.session?.user.id));

    // Keeps the navbar honest across login, logout and token refresh.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user.id);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return user;
}
