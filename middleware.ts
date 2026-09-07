import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on every request so a signed-in
// visitor's session stays valid across Server Component renders (which can
// only read cookies, not write them — see src/lib/supabase/server.ts). A
// no-op whenever Supabase isn't configured yet, so the site keeps working
// exactly as before until real env vars are added.
//
// The OS shares this project by default, so this is normally one session for
// the whole app. It only splits if the OS has been pointed at a separate
// Supabase project — see src/lib/os/supabase/env.ts. Website behaviour is
// unchanged either way.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // The OS shares the website's Supabase project by default, so this usually
  // refreshes one session for every path. If the OS has been pointed at a
  // project of its own, /os needs THAT project's session refreshed instead —
  // Supabase names its cookie after the project reference, so the two sit
  // side by side in one browser without ever colliding.
  const isOs = request.nextUrl.pathname === "/os" || request.nextUrl.pathname.startsWith("/os/");
  const osUrl = process.env.NEXT_PUBLIC_OS_SUPABASE_URL;
  const osAnonKey = process.env.NEXT_PUBLIC_OS_SUPABASE_ANON_KEY;
  const useOsProject = isOs && Boolean(osUrl && osAnonKey);

  const url = useOsProject ? osUrl : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = useOsProject ? osAnonKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touching the session is what actually triggers the refresh.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and image optimization — no session needed there.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|photos|brand|videos).*)",
  ],
};
