"use server";

import { headers } from "next/headers";
import { osdb, getOrg, osConfigured } from "../db";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

// ---------------------------------------------------------------------------
// SIGN-IN VISIBILITY
// ---------------------------------------------------------------------------
// Supabase Auth owns credentials and sessions, and it does not give the
// business an operational answer to "who signed in, from what, and when".
// These two actions write that answer into os_login_events, which is what the
// "Last seen" column under Admin -> Users and access reads.
//
// Neither action is permission-gated, because neither one can be: the only
// people who call them are (a) somebody who has just authenticated and (b)
// somebody about to sign out. What protects the table instead:
//
//   * The user identity is resolved SERVER-SIDE from the session cookie via
//     getUser(), which re-validates the JWT against the auth server. Nothing
//     the caller sends is trusted — there is no parameter carrying an
//     identity, so there is nothing to forge.
//   * A caller with no valid session writes nothing at all.
//   * Repeat calls inside a short window are collapsed, so a signed-in user
//     cannot turn a page refresh loop into an unbounded write.
//   * os_login_events is append-only even for the service-role key (see
//     migration 0018), so a recorded sign-in cannot later be erased.
// ---------------------------------------------------------------------------

/** Two events from the same account this close together are the same event. */
const DEDUPE_WINDOW_MS = 60_000;

type LoginKind = "sign_in" | "sign_out" | "sign_out_all" | "denied";

/**
 * Called by the sign-in form once Supabase Auth has accepted the credentials.
 *
 * Records `sign_in` for a member of staff, and `denied` when the credentials
 * were valid but the account is not linked to an active staff record — the
 * second is the more interesting of the two, because it is what a customer
 * account probing /os looks like.
 */
export async function recordSignIn(): Promise<void> {
  await writeLoginEvent(null);
}

/**
 * Called by the sign-out buttons BEFORE the session is destroyed, while the
 * cookie can still prove who is leaving.
 */
export async function recordSignOut(scope: "local" | "global"): Promise<void> {
  await writeLoginEvent(scope === "global" ? "sign_out_all" : "sign_out");
}

async function writeLoginEvent(kind: LoginKind | null): Promise<void> {
  if (!supabaseConfigured || !osConfigured) return;

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    const org = await getOrg();
    const db = osdb();

    const { data: employee } = await db
      .from("os_employees")
      .select("id, status")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .is("archived_at", null)
      .maybeSingle();

    const staff = employee && employee.status !== "left";
    const resolved: LoginKind = kind ?? (staff ? "sign_in" : "denied");

    const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
    const { data: recent } = await db
      .from("os_login_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("kind", resolved)
      .gte("at", since)
      .limit(1);
    if (recent?.length) return;

    let ip: string | null = null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      userAgent = h.get("user-agent");
    } catch {
      // No request context. The account and the timestamp still tell the story.
    }

    await db.from("os_login_events").insert({
      employee_id: employee?.id ?? null,
      user_id: user.id,
      email: user.email ?? null,
      kind: resolved,
      ip,
      user_agent: userAgent,
    });
  } catch {
    // Sign-in visibility is never a reason somebody cannot get to work. If
    // this write fails the person is still signed in; the column simply has
    // nothing to show.
  }
}
