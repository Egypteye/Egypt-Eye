import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfigured } from "./env";

// Server Component / Route Handler client — authenticates as whichever user
// owns the request's session cookie (or nobody, for a guest). Still only the
// anon key + RLS, same security model as the browser client; this just runs
// server-side so Server Components can read a signed-in visitor's own data
// (profile, journeys, reservations, discount codes) directly.
export async function createServerSupabaseClient() {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase isn't configured yet — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see README)."
    );
  }
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
          // Called from a Server Component render (not a Route Handler or
          // Server Action) — cookies can't be written there. Harmless as
          // long as middleware.ts is also refreshing the session, which it is.
        }
      },
    },
  });
}
