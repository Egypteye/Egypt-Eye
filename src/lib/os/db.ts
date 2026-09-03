import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

// ---------------------------------------------------------------------------
// The ONLY database handle Egypt Eye OS uses.
// ---------------------------------------------------------------------------
// Every `os_` table has Row Level Security enabled with no policies, and the
// anon/authenticated grants revoked — the browser cannot read or write a
// single OS row. This service-role client is what actually reaches them, and
// it is deliberately confined to this module tree.
//
// The rule that makes that safe: NOTHING in src/lib/os/* runs a query without
// first resolving the acting employee (getActor) and checking a permission
// (requirePermission / can), and no OS query is ever built from a client
// component. `server-only` makes an accidental client import a build error
// rather than a leaked key.
//
// See supabase/migrations/0018_egypt_eye_os_core.sql, section 23, for why the
// permission matrix lives in TypeScript rather than in RLS policies.
// ---------------------------------------------------------------------------

let cached: SupabaseClient | null = null;

export function osdb(): SupabaseClient {
  if (!supabaseAdminConfigured) {
    throw new OsNotConfiguredError();
  }
  if (cached) return cached;
  cached = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "public" },
  });
  return cached;
}

export const osConfigured = supabaseAdminConfigured;

/** The OS cannot run without Supabase credentials. Pages catch this and render setup guidance. */
export class OsNotConfiguredError extends Error {
  constructor() {
    super("Egypt Eye OS is not connected to a database yet.");
    this.name = "OsNotConfiguredError";
  }
}

/** The actor is signed in but not allowed to do this. Never leaks what exists. */
export class OsForbiddenError extends Error {
  readonly permission?: string;
  constructor(message: string, permission?: string) {
    super(message);
    this.name = "OsForbiddenError";
    this.permission = permission;
  }
}

/** A rule of the business said no. The message is written to be shown to a human. */
export class OsRuleError extends Error {
  readonly detail?: string;
  constructor(message: string, detail?: string) {
    super(message);
    this.name = "OsRuleError";
    this.detail = detail;
  }
}

// The single Egypt Eye organization. Multi-tenancy is in the schema (every
// table carries org_id) but there is no tenant switcher in the UI yet, so the
// app pins itself to the active org once per request.
let orgCache: { id: string; name: string; baseCurrency: string; timezone: string } | null = null;

export async function getOrg() {
  if (orgCache) return orgCache;
  const { data, error } = await osdb()
    .from("os_orgs")
    .select("id, name, base_currency, timezone")
    .eq("key", "egypt-eye")
    .single();
  if (error || !data) {
    throw new OsRuleError(
      "The Egypt Eye organization row is missing.",
      "Run supabase/migrations/0019_egypt_eye_os_config.sql — it creates the organization, roles and permission catalog the OS needs in order to start.",
    );
  }
  orgCache = {
    id: data.id as string,
    name: data.name as string,
    baseCurrency: (data.base_currency as string) ?? "USD",
    timezone: (data.timezone as string) ?? "Africa/Cairo",
  };
  return orgCache;
}

/** Turns any thrown error into something safe and useful to show an employee. */
export function friendlyError(error: unknown): { title: string; detail?: string } {
  if (error instanceof OsNotConfiguredError) {
    return {
      title: "Egypt Eye OS is not connected to a database yet",
      detail:
        "Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY, then run the migrations in supabase/migrations/.",
    };
  }
  if (error instanceof OsForbiddenError) {
    return { title: "You do not have access to this", detail: error.message };
  }
  if (error instanceof OsRuleError) {
    return { title: error.message, detail: error.detail };
  }
  // Postgres surfaced through PostgREST. Translate the ones an employee can
  // actually act on; never show them a raw constraint name.
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("os_assign_no_double_book_employee")) {
    return {
      title: "That person is already confirmed on an overlapping trip",
      detail: "Release them from the other trip first, or assign someone else.",
    };
  }
  if (message.includes("os_assign_no_double_book_resource")) {
    return {
      title: "That vehicle, dress or item is already confirmed on an overlapping trip",
      detail: "Release it from the other trip first, or choose a different one.",
    };
  }
  return {
    title: "Something went wrong",
    detail: "The action was not saved. Try again, and tell an administrator if it keeps happening.",
  };
}
