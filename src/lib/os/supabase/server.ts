import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { osSupabaseEnv } from "./env";

/**
 * Server client for the OS project, authenticated as whoever owns the
 * request's OS session cookie.
 *
 * Supabase names its cookie after the project reference, so the OS session and
 * a website customer session sit side by side in the same browser without ever
 * colliding — somebody can be signed into both, or either, or neither.
 */
export async function osServerClient() {
  const env = osSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // A Server Component render cannot write cookies. Harmless: the
          // root middleware refreshes the OS session on /os requests, which
          // is where the write actually happens.
        }
      },
    },
  });
}
