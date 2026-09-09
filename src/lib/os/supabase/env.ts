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

// WHY THESE ARE FUNCTIONS AND NOT CONSTANTS
//
// They used to be module-level `const`s, computed once when the module was
// first imported. That is wrong on Vercel, and it cost real debugging time.
// A variable marked Sensitive/Secret there is decrypted for the RUNTIME only
// — it is deliberately absent during the build. Anything that reads it while
// the module graph is being evaluated for the build sees `undefined`, and the
// OS then reports "not connected to a database yet" on a deployment whose
// runtime environment has the key sitting right there.
//
// Reading `process.env` inside a function, per request, removes the question
// entirely. NEXT_PUBLIC_* values are still inlined at build time by Next.js,
// which is fine — those are public by definition and available to the build.

type OsEnv = {
  ownProject: boolean;
  url: string | undefined;
  anonKey: string | undefined;
  serviceRoleKey: string | undefined;
};

function readEnv(): OsEnv {
  const osUrl = process.env.NEXT_PUBLIC_OS_SUPABASE_URL;
  const osAnonKey = process.env.NEXT_PUBLIC_OS_SUPABASE_ANON_KEY;
  const ownProject = Boolean(osUrl && osAnonKey);

  // A key pasted into a dashboard field arrives with a stray tab or newline
  // often enough to be worth handling. Whitespace is never part of a key, and
  // an untrimmed one fails as an authentication error far from its cause.
  const serviceRoleKey = (
    ownProject ? process.env.OS_SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim() || undefined;

  return {
    ownProject,
    url: (osUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim() || undefined,
    anonKey: (osAnonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim() || undefined,
    serviceRoleKey,
  };
}

/** True when the OS has been pointed at a project of its own. */
export function osUsesOwnProject(): boolean {
  return readEnv().ownProject;
}

/** The service-role key for whichever project the OS is using. */
export function osServiceRoleKey(): string | undefined {
  return readEnv().serviceRoleKey;
}

/** Whether the OS can reach a database at all. Pages check this and render setup guidance. */
export function osSupabaseConfigured(): boolean {
  const { url, anonKey } = readEnv();
  return Boolean(url && anonKey);
}

export function osSupabaseAdminConfigured(): boolean {
  const { url, anonKey, serviceRoleKey } = readEnv();
  return Boolean(url && anonKey && serviceRoleKey);
}

/**
 * Which variables this deployment can actually see — names and booleans only,
 * never a value, because the setup page that renders this is served before
 * anyone has signed in. It exists so "it is not connected" can say WHICH of
 * the three is missing instead of listing all of them and leaving you to
 * guess, which is exactly the loop it was written to end.
 */
export function osEnvReport(): { name: string; present: boolean }[] {
  const { ownProject, url, anonKey, serviceRoleKey } = readEnv();
  return ownProject
    ? [
        { name: "NEXT_PUBLIC_OS_SUPABASE_URL", present: Boolean(url) },
        { name: "NEXT_PUBLIC_OS_SUPABASE_ANON_KEY", present: Boolean(anonKey) },
        { name: "OS_SUPABASE_SERVICE_ROLE_KEY", present: Boolean(serviceRoleKey) },
      ]
    : [
        { name: "NEXT_PUBLIC_SUPABASE_URL", present: Boolean(url) },
        { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", present: Boolean(anonKey) },
        { name: "SUPABASE_SERVICE_ROLE_KEY", present: Boolean(serviceRoleKey) },
      ];
}

/** The project the OS talks to, or a thrown error naming exactly what is missing. */
export function osSupabaseEnv(): { url: string; anonKey: string } {
  const { url, anonKey } = readEnv();
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
