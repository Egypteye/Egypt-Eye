// ---------------------------------------------------------------------------
// WHICH SUPABASE PROJECT THE OS TALKS TO
// ---------------------------------------------------------------------------
// By DEFAULT the OS shares the website's Supabase project. That is deliberate,
// and it is the whole reason the OS can be an operating system rather than a
// parallel universe: a trip can point at the reservation that created it, an
// OS client can be the same person as a website profile, and a concierge
// request can become a lead — with real foreign keys and real joins, resolved
// in one query. Postgres cannot join across two Supabase projects, so the
// alternative is syncing copies between databases, which means stale data, a
// new thing to break, and two versions of the same customer.
//
// The trade is a shared blast radius, and it is managed rather than ignored:
//
//   * Every OS table is prefixed `os_`, has RLS on with no client policy, and
//     has anon/authenticated revoked. The website's browser key can read
//     nothing there, and the OS migrations touch no website table.
//   * Nothing in src/lib/os/* writes to a website table. Reading them is the
//     point; writing them is not, and there is no code that does.
//   * The real protection is operational: daily backups and point-in-time
//     recovery on the database, and running migrations deliberately. See the
//     README.
//
// SEPARATE PROJECT MODE. Setting NEXT_PUBLIC_OS_SUPABASE_URL (plus its anon
// and service-role keys) points the OS at a different project instead. That
// buys hard isolation and costs the linking above — no joins to reservations,
// profiles or concierge requests. Only choose it if the OS does not need
// website data.
// ---------------------------------------------------------------------------

const osUrl = process.env.NEXT_PUBLIC_OS_SUPABASE_URL;
const osAnonKey = process.env.NEXT_PUBLIC_OS_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const siteAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the OS has been pointed at a project of its own. */
export const osUsesOwnProject = Boolean(osUrl && osAnonKey);

const url = osUrl ?? siteUrl;
const anonKey = osAnonKey ?? siteAnonKey;

/** The service-role key for whichever project the OS is using. */
export function osServiceRoleKey(): string | undefined {
  return osUsesOwnProject
    ? process.env.OS_SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/** Whether the OS can reach a database at all. Pages check this and render setup guidance. */
export const osSupabaseConfigured = Boolean(url && anonKey);

export const osSupabaseAdminConfigured = Boolean(osSupabaseConfigured && osServiceRoleKey());

/** The project the OS talks to, or a thrown error naming exactly what is missing. */
export function osSupabaseEnv(): { url: string; anonKey: string } {
  if (!url || !anonKey) {
    throw new Error(
      "Egypt Eye OS has no database to talk to. It shares the website's Supabase " +
        "project by default, so add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY. To run the OS on a separate project " +
        "instead, set NEXT_PUBLIC_OS_SUPABASE_URL and NEXT_PUBLIC_OS_SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}
