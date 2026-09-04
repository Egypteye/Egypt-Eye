import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on every request so a signed-in
// visitor's session stays valid across Server Component renders (which can
// only read cookies, not write them — see src/lib/supabase/server.ts). A
// no-op whenever Supabase isn't configured yet, so the site keeps working
// exactly as before until real env vars are added.
//
// There are two Supabase projects here: the public website's, and Egypt Eye
// OS's. Which one gets refreshed depends on the path — see below. Website
// behaviour is byte-for-byte unchanged; /os simply refreshes a different
// project's session than it used to.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Egypt Eye OS runs on its own Supabase project with its own users, so a
  // request under /os needs THAT project's session refreshed, not the
  // website's. The two are refreshed independently and never on the same
  // request: a staff member on /os has no website session to keep alive, and
  // a customer on /tours has no OS session. Supabase names its cookie after
  // the project reference, so the two never collide even in one browser.
  const isOs = request.nextUrl.pathname === "/os" || request.nextUrl.pathname.startsWith("/os/");

  const url = isOs ? process.env.NEXT_PUBLIC_OS_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = isOs ? process.env.NEXT_PUBLIC_OS_SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
