"use client";

import { createBrowserClient } from "@supabase/ssr";
import { osSupabaseEnv } from "./env";

/**
 * Browser client for the OS project.
 *
 * Only ever holds the anon key. It is used for one thing — signing in, out and
 * resetting a password — because every `os_` table has RLS on with no policy
 * and the anon role revoked, so this client can read and write exactly
 * nothing. All OS data goes through server code holding the service-role key.
 *
 * Kept apart from the server client on purpose: importing `next/headers` from
 * a module a client component touches drags a server-only API into the browser
 * bundle and fails the build.
 */
export function osBrowserClient() {
  const env = osSupabaseEnv();
  return createBrowserClient(env.url, env.anonKey);
}
