import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { RETIRED_STORY_SLUGS } from "@/content/retiredStories";
import { DEFAULT_LOCALE, LOCALE_CODES } from "@/i18n/locales";
// The single authority for "is this request for the other brand?". Kept in
// its own import-free file so a check script can run it over real hostnames
// — see the incident note at the top of that file.
import {
  FLYING_DRESSES_HOST,
  hostname,
  isFlyingDressesHost,
} from "@/lib/brand/flyingDressesHost";

// Hardcoded rather than derived from NEXT_PUBLIC_SITE_URL: this decides
// whether to issue a redirect, and a misconfigured env var would otherwise
// turn that into a loop.
const CANONICAL_HOST = "egypteyetravel.com";

// ---------------------------------------------------------------------------
// FLYING DRESSES EGYPT — a second brand, on a second domain, in this one app.
//
// Its pages live at /flying-dresses/* (src/app/flying-dresses) under their own
// root layout. Every internal link uses that prefix, so the site works
// identically on any host and stays statically prerendered — see the note in
// src/app/flying-dresses/_lib/seo.ts for why the prefix is kept rather than
// stripped at render time.
//
// What this proxy adds is the SHORT form on the brand's own domain:
// flyingdressesegypt.com/wardrobe reaches the wardrobe, which is what someone
// typing or sharing a URL will write. It is a rewrite, not a redirect, so
// there is no extra round trip.
// ---------------------------------------------------------------------------
const FLYING_DRESSES_BASE = "/flying-dresses";

/**
 * THE ALLOW-LIST. Everything the Flying Dresses domain may serve that is not
 * inside its own page tree.
 *
 * =========================================================================
 * THIS IS AN ALLOW-LIST BECAUSE A DENY-LIST WAS WRONG
 * =========================================================================
 * It used to exempt `/api/`, `/auth/` and `/studio` wholesale, on the
 * reasoning that route handlers should reach their real handler. That is
 * correct for one site and dangerous for two.
 *
 * This repository builds ONE application. If a second Vercel project is
 * created from it to serve flyingdressesegypt.com, that deployment contains
 * the entire Egypt Eye app — all 34 API routes, the embedded Sanity Studio,
 * the admin pages, the account pages and the PayPal capture and webhook
 * endpoints. A separate Vercel project does NOT isolate any of that, because
 * the isolation people assume they are buying is of the DEPLOYMENT, and what
 * actually matters is which URLs the HOSTNAME answers.
 *
 * So the brand's domain answers its own pages, its own enquiry endpoint, and
 * static assets. Everything else is 404 — including /studio, /admin,
 * /account, /api/migrate, /api/bookings/*, /api/webhooks/paypal and the
 * purge routes. Those are guarded by their own secrets and by Sanity's login
 * as well, but a URL that should not exist on this domain should not answer
 * on this domain, secret or no secret. Defence in depth, and one less domain
 * to think about when a credential is next rotated.
 *
 * Deliberately NOT allowed, and why each one matters:
 *   /studio         a second Studio URL for the same dataset
 *   /auth/*         Egypt Eye's Supabase auth callback
 *   /api/* (others) booking, payment capture, webhooks, CMS writes, admin
 */
function isFlyingDressesAllowed(pathname: string): boolean {
  return (
    // Its own two form endpoints, and nothing else under /api. Each one is
    // listed individually on purpose: a prefix match like
    // `startsWith("/api/flying-dresses")` would silently admit every future
    // route that happens to begin with those words, which is how an
    // allow-list becomes a deny-list without anybody deciding to change it.
    pathname === "/api/flying-dresses-enquiry" ||
    pathname === "/api/flying-dresses-collaborate" ||
    // ---------------------------------------------------------------------
    // NO BOOKING ROUTE ANSWERS HERE, BECAUSE NOTHING HERE CALLS ONE.
    //
    // Three of them were briefly listed: /api/bookings, /api/bookings/rail
    // and /api/bookings/paypal/capture, which is what the Egypt Eye booking
    // dialog needs when it runs on this brand's own pages. That dialog is not
    // mounted here — it is built from Tailwind utilities this brand's layout
    // does not load, and the deposit button hands off to the Egypt Eye
    // checkout instead, which is written up in BookingRail.tsx.
    //
    // So they come back out. An allow-list entry for a feature that is not
    // shipped is the same quiet widening this function's own note warns
    // about, one step slower: nothing calls them, nothing notices them, and
    // the next person reads them as a decision somebody made on purpose. When
    // the dialog can be presented in this brand's chrome, the three lines
    // return in that change, where they can be reasoned about together.
    //
    // Two will stay out even then, and they are worth naming because they
    // look like omissions:
    //
    //   /api/bookings/reconcile — the cron sweep that captures stragglers. It
    //   belongs to one deployment, runs on a schedule with CRON_SECRET, and a
    //   second domain answering it is a second thing that can double-settle.
    //
    //   /api/webhooks/paypal — PayPal delivers to the URLs registered on the
    //   app, and the handler finds the booking by ORDER ID in Supabase, not
    //   by which deployment created it. Both projects share one Supabase, so
    //   an order started here would be settled by the webhook already
    //   registered on the Egypt Eye domain. A second endpoint needs a second
    //   registration and a second PAYPAL_WEBHOOK_ID, and buys nothing.
    // ---------------------------------------------------------------------
    // Framework and static assets, which carry no authority.
    pathname.startsWith("/_next") ||
    pathname.startsWith("/photos/") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/videos/") ||
    pathname === "/favicon.ico"
  );
}

/**
 * Everything the Flying Dresses domain does.
 *
 * Returns a response and does NOT fall through to the Egypt Eye handling
 * below: no retired-story 410s (those are the journal's URLs, on the other
 * domain), no locale rewrite (this brand is English-only and has no [locale]
 * segment), and no Supabase session refresh (it has no accounts to keep
 * signed in, and touching the session on every request would cost a round
 * trip for nothing).
 */
function flyingDressesProxy(request: NextRequest): NextResponse {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // One canonical host for this brand too, for the same reason Egypt Eye has
  // one: a site answering on both www and apex is two sites as far as a
  // search engine is concerned.
  //
  // Only the real www domain is redirected. The *.vercel.app and *.localhost
  // review hosts have no www form, and bouncing one of those to a domain whose
  // DNS is not pointed yet would make a working deployment look broken — which
  // is how the owner would first meet this code.
  if (hostname(host) === `www.${FLYING_DRESSES_HOST}`) {
    const url = request.nextUrl.clone();
    url.host = FLYING_DRESSES_HOST;
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  // robots.txt and sitemap.xml are per-brand: the Egypt Eye ones at
  // app/robots.ts and app/sitemap.xml advertise the travel domain's sitemap
  // and would be wrong here. A metadata route cannot vary by host because it
  // is generated at build time, so each brand has its own route handler and
  // this maps the domain-root URL onto it.
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    const url = request.nextUrl.clone();
    url.pathname = `${FLYING_DRESSES_BASE}${pathname}`;
    return NextResponse.rewrite(url, { request });
  }

  // Already addressing the real tree. This is the form every internal link
  // uses, so it is the common case.
  if (pathname === FLYING_DRESSES_BASE || pathname.startsWith(`${FLYING_DRESSES_BASE}/`)) {
    return NextResponse.next({ request });
  }

  if (isFlyingDressesAllowed(pathname)) {
    return NextResponse.next({ request });
  }

  // Anything else addressed at an Egypt Eye route on this domain is refused
  // outright rather than rewritten, so /studio and /api/bookings/paypal are a
  // 404 here and not a working endpoint on a second hostname.
  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/") || pathname.startsWith("/studio")) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }

  // A file extension that is not one of the asset folders above is not a page
  // either — let it 404 as itself rather than rewriting it into the tree.
  if (/\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next({ request });
  }

  // The short form: / -> /flying-dresses, /wardrobe -> /flying-dresses/wardrobe.
  // An unknown path lands on this brand's own not-found page.
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? FLYING_DRESSES_BASE : `${FLYING_DRESSES_BASE}${pathname}`;
  return NextResponse.rewrite(url, { request });
}

// Refreshes the Supabase auth session cookie on every request so a signed-in
// visitor's session stays valid across Server Component renders (which can
// only read cookies, not write them — see src/lib/supabase/server.ts). A
// no-op whenever Supabase isn't configured yet, so the site keeps working
// exactly as before until real env vars are added.
export async function proxy(request: NextRequest) {
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

  // The second brand is handled entirely on its own and never falls through.
  if (isFlyingDressesHost(host)) {
    return flyingDressesProxy(request);
  }

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

  // Locale routing. Every page lives under app/[locale], but English keeps
  // the bare URLs the site has always had — /tours, not /en/tours — so no
  // existing link, bookmark or indexed URL breaks. A rewrite (not a redirect)
  // maps those onto the English segment while the address bar stays as it was.
  //
  // No Accept-Language auto-redirect on purpose: English is the stated
  // default, and redirecting visitors by browser language hides the other
  // languages from crawlers and surprises anyone who deliberately typed the
  // English URL. The switcher is the way in.
  const { pathname } = request.nextUrl;
  const hasLocalePrefix = LOCALE_CODES.some(
    (code) => pathname === `/${code}` || pathname.startsWith(`/${code}/`)
  );

  let response: NextResponse;
  if (!hasLocalePrefix && !isLocaleExempt(pathname)) {
    const url = request.nextUrl.clone();
    // "/" must become "/en", never "/en/" — a trailing slash is normalised
    // with a 308 that would bounce straight back out of the rewrite.
    url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
    response = NextResponse.rewrite(url, { request });
  } else {
    response = NextResponse.next({ request });
  }

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

// Paths that must never be rewritten into a locale: API and auth route
// handlers, the CMS, and the files that have to stay at the domain root for
// crawlers and browsers to find them.
function isLocaleExempt(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/_next") ||
    // Flying Dresses Egypt is a separate brand with its own root layout and
    // no [locale] segment, so /flying-dresses/x must never become
    // /en/flying-dresses/x — which would 404. It stays reachable on this
    // domain for review before DNS is pointed, and app/robots.ts disallows it
    // so the travel domain never indexes the second brand's pages.
    pathname === "/flying-dresses" ||
    pathname.startsWith("/flying-dresses/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

export const config = {
  matcher: [
    // Skip static assets and image optimization — no session needed there.
    // The public asset folders are matched WITH their trailing slash on
    // purpose: a bare "photos" also excludes /photoshoots, which silently
    // dropped that page out of the locale rewrite.
    // robots.txt and sitemap.xml ARE matched, unlike the other static files:
    // this deployment answers on two domains that need two different copies
    // of each, and a metadata route is generated at build time and cannot
    // vary by host. isLocaleExempt() still returns them untouched on the
    // Egypt Eye domain, so their behaviour there is unchanged.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|photos/|brand/|videos/).*)",
  ],
};
