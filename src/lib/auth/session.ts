import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { isOsRole, isUserRole, type OsRole, type UserRole } from "./roles";

// The role predicates themselves live in ./roles, which imports nothing, so
// that scripts/check-os.mts can assert them without a request or a database.
export * from "./roles";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string | null;
  avatarUrl: string | null;
  role: UserRole;
};

// Server-side only. Uses supabase.auth.getUser() (not getSession()) because
// it re-validates the JWT against Supabase's auth server instead of just
// trusting whatever the cookie says — the right call anywhere this result
// gates access to real data.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!supabaseConfigured) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    firstName: (profile?.first_name as string | null) ?? null,
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
    // A role the code does not recognise reads as "customer" rather than
    // being trusted through. If a future migration adds a role and this list
    // is not updated, the failure is a locked door, not an open one.
    role: isUserRole(profile?.role) ? profile.role : "customer",
  };
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return user;
}

// Scoped staff access for the reservations desk: full admins pass too, but
// so does the narrower "reservations" role, which can only reach
// /admin/reservations and /admin/hotel-rate-requests (every other /admin/*
// page still calls requireAdmin() directly and rejects this role).
export async function requireReservationsStaff(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "reservations")) {
    throw new Error("Not authorized");
  }
  return user;
}

// ---------------------------------------------------------------------------
// Egypt Eye OS (/os) — the shared workspace for the three teams that pass a
// booking between them.
// ---------------------------------------------------------------------------

export function isOsStaff(user: CurrentUser | null): user is CurrentUser & { role: OsRole } {
  return user !== null && isOsRole(user.role);
}

/**
 * The server-side gate on every OS read and write.
 *
 * Deliberately an allow-list of roles rather than a check for "not a
 * customer": a role nobody has thought about yet — or a profile row with a
 * typo in it — is refused instead of waved through. Note that `customer` is
 * absent, so the thousands of accounts belonging to actual travellers can
 * never reach a guest's phone number or what a booking was sold for.
 *
 * Every OS page calls this, and so does every OS server action. The page
 * check alone would not be enough: a server action is a POST endpoint that
 * anyone can call directly, whatever the page that normally renders its form
 * decided to draw.
 */
export async function requireOsStaff(): Promise<CurrentUser & { role: OsRole }> {
  const user = await getCurrentUser();
  if (!isOsStaff(user)) {
    throw new Error("Not authorized");
  }
  return user;
}
