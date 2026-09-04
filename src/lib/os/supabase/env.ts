// ---------------------------------------------------------------------------
// THE OS RUNS ON ITS OWN SUPABASE PROJECT
// ---------------------------------------------------------------------------
// Egypt Eye OS does NOT share the public website's database. It has its own
// Supabase project, its own auth, and its own users — which is what makes the
// isolation real rather than a matter of discipline:
//
//   * The OS physically cannot read a website table. It is not connected to
//     that database at all, so there is no query anybody could write, no
//     permission anybody could misconfigure, and no migration that could
//     reach across.
//   * Staff sign in with accounts that do not exist on the website. A member
//     of staff never appears in the customer book, and the website's
//     "create a profile on signup" trigger never fires for them.
//   * A leaked OS key exposes operational data and no customer accounts. A
//     leaked website key exposes no operational data. One blast radius each.
//
// THERE IS DELIBERATELY NO FALLBACK to the website's project. If these
// variables are missing the OS refuses to run and says so. Falling back would
// mean a single forgotten environment variable silently pointing the whole
// operating system at the customer database and creating its tables there —
// exactly the outcome the separation exists to prevent.
//
// This file is deliberately free of any Next.js import so that both the
// browser client and the server client can read it without dragging
// server-only APIs into a client bundle.
// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_OS_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_OS_SUPABASE_ANON_KEY;

/** Whether the OS has its own project configured. Pages check this and render setup guidance. */
export const osSupabaseConfigured = Boolean(url && anonKey);

export const osSupabaseAdminConfigured = Boolean(
  osSupabaseConfigured && process.env.OS_SUPABASE_SERVICE_ROLE_KEY,
);

/** The OS project's URL and anon key, or a thrown error naming what is missing. */
export function osSupabaseEnv(): { url: string; anonKey: string } {
  if (!url || !anonKey) {
    throw new Error(
      "Egypt Eye OS is not connected to its own Supabase project yet. Add " +
        "NEXT_PUBLIC_OS_SUPABASE_URL and NEXT_PUBLIC_OS_SUPABASE_ANON_KEY. These are " +
        "deliberately separate from the website's NEXT_PUBLIC_SUPABASE_* variables: " +
        "the OS runs on its own database and never falls back to the website's.",
    );
  }
  return { url, anonKey };
}
