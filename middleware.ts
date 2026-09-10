import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { RETIRED_STORY_SLUGS } from "@/content/retiredStories";

// Hardcoded rather than derived from NEXT_PUBLIC_SITE_URL: this decides
// whether to issue a redirect, and a misconfigured env var would otherwise
// turn that into a loop.
const CANONICAL_HOST = "egypteyetravel.com";

// Refreshes the Supabase auth session cookie on every request so a signed-in
// visitor's session stays valid across Server Component renders (which can
// only read cookies, not write them — see src/lib/supabase/server.ts). A
// no-op whenever Supabase isn't configured yet, so the site keeps working
// exactly as before until real env vars are added.
export async function middleware(request: NextRequest) {
  // Retired stories answer 410 Gone rather than falling through to the
  // catch-all 404. Both stop serving the page; only 410 tells Google the
  // removal was deliberate, which clears it from the index in weeks instead
  // of the months of re-crawling a 404 buys. Handled here because a Server
  // Component can call notFound() but cannot set an arbitrary status code.
  // One canonical host. A site reachable on both www and apex serves every
  // page twice as far as Google is concerned, and splits whatever authority
  // it earns between them. Only the www form of the production domain is
  // redirected — preview and local hosts are left alone so they keep working.
  const host = request.headers.get("host") ?? "";
  if (host === `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const retired = retiredStorySlug(request.nextUrl.pathname);
  if (retired) {
    return new NextResponse(GONE_BODY, {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const response = NextResponse.next({ request });

  // Vercel gives every deployment its own *.vercel.app hostname, and those
  // serve the identical site. Indexed, they become a duplicate of the whole
  // domain that can outrank it. A header is the right tool: it applies to
  // every response including XML and JSON, and needs no per-page change.
  if (host.endsWith(".vercel.app")) {
    response.headers.set("x-robots-tag", "noindex, nofollow");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

// Matches /stories/<slug>, with or without a trailing slash, and nothing
// deeper — so a future /stories/<slug>/something is unaffected.
function retiredStorySlug(pathname: string): string | null {
  const match = /^\/stories\/([^/]+)\/?$/.exec(pathname);
  const slug = match?.[1] ? decodeURIComponent(match[1]) : null;
  return slug && RETIRED_STORY_SLUGS.has(slug) ? slug : null;
}

// A 410 still reaches real people who followed an old link, so it says what
// happened and points them somewhere useful rather than showing a bare
// status code.
const GONE_BODY = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>This article has been retired — Egypt Eye Travel</title>
<style>
 body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
   background:#fffdf8;color:#1c231d;
   font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.6}
 main{max-width:34rem;text-align:center}
 h1{font-size:1.6rem;margin:0 0 12px}
 p{margin:0 0 24px;color:#4a5c4f}
 a{display:inline-block;margin:0 6px;padding:12px 22px;border-radius:999px;
   background:#c9a227;color:#1c231d;text-decoration:none;font-weight:600}
 a.alt{background:transparent;border:1px solid rgba(0,0,0,.15);color:#4a5c4f}
</style></head>
<body><main>
<h1>This article has been retired</h1>
<p>We&rsquo;ve narrowed the journal to writing about Egypt, and this piece didn&rsquo;t belong there any more.</p>
<a href="/stories">Read the journal</a><a class="alt" href="/tours">Browse tours</a>
</main></body></html>`;

export const config = {
  matcher: [
    // Skip static assets and image optimization — no session needed there.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|photos|brand|videos).*)",
  ],
};
