import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string | null;
  role: "customer" | "admin";
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
    .select("first_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    firstName: (profile?.first_name as string | null) ?? null,
    role: (profile?.role as "customer" | "admin") ?? "customer",
  };
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return user;
}
