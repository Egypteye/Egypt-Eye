import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

// Attaches a signed-in customer's earlier guest reservations to their account.
//
// A reservation made while logged out is stored with customer_id null, and
// nothing ever filled it in. So someone who booked on Monday and created an
// account on Tuesday never saw that booking again: /account reads through the
// reservations_select_own policy (auth.uid() = customer_id), and a null
// customer_id matches nobody. The reserve form does invite guests to sign in
// first, but plenty won't.
//
// This reconciles the two, and the whole question is whether it can be abused.
// Matching on an email address means whoever proves control of that address
// gets the reservations sent to it, so the proof has to be real:
//
//   * email_confirmed_at must be set, which is the timestamp Supabase writes
//     when the verification link is clicked.
//
//     READ THIS BEFORE CHANGING THE AUTH SETTINGS. That timestamp is only
//     evidence of anything while "Confirm email" is ON in Supabase Auth. With
//     it switched off, Supabase auto-confirms at signup and stamps the field
//     with no proof at all — and this function would then hand a stranger's
//     booking to anyone who typed their address. There is no way to detect
//     that from here, so the guarantee lives in the project setting, not in
//     this code. If confirmations are ever disabled, delete the call in
//     account/page.tsx.
//   * the address comes from supabase.auth.getUser(), which re-validates the
//     JWT against Supabase rather than trusting the cookie.
//
// Only rows that belong to nobody are touched, so this can never move a
// reservation from one account to another.
export async function claimGuestReservations(): Promise<number> {
  if (!supabaseAdminConfigured) return 0;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !user.email_confirmed_at) return 0;

  // ILIKE gives case-insensitive matching, which is what email needs — but it
  // also treats % and _ as wildcards, and both are legal in the local part of
  // an address. Left unescaped, someone who verified "a_b@example.com" would
  // match axb@example.com and claim a stranger's booking. Backslash is
  // Postgres's default ILIKE escape character.
  const pattern = user.email.replace(/([\\%_])/g, "\\$1");

  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("reservations")
      .update({ customer_id: user.id })
      .is("customer_id", null)
      .ilike("guest_email", pattern)
      .select("id");

    if (error) {
      console.error("claiming guest reservations failed:", error);
      return 0;
    }
    return data?.length ?? 0;
  } catch (err) {
    // Never block the account page over this. The page is still correct
    // without it — it just shows one fewer reservation than it could.
    console.error("claiming guest reservations failed:", err);
    return 0;
  }
}
