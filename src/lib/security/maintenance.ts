import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { bearerToken, secretMatches } from "./secrets";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// The gate on the five maintenance routes: /api/migrate, /api/image-audit,
// /api/dedupe-testimonials, /api/purge-testimonials and
// /api/purge-redirected-stories.
//
// These are the most dangerous routes in the codebase. migrate holds a
// Sanity WRITE token and can overwrite documents and reset media across the
// whole CMS; the purge routes delete published content. All five were
// guarded by the same five lines, copied five times:
//
//     const secret = request.nextUrl.searchParams.get("secret");
//     if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) ...
//
// Three things were wrong with that, in descending order of how much they
// matter:
//
// 1. UNLIMITED GUESSES. Nothing counted failed attempts, so the secret
//    could be guessed at as fast as the network allows, forever. This
//    repository is public, so the route names and the parameter name are
//    not secret — only the value is. That makes the absence of a limiter
//    the whole of the defence resting on one string's entropy.
//
// 2. THE SECRET TRAVELS IN THE URL. Query strings are recorded in places
//    the request body is not: platform access logs, browser history, and
//    the Referer header of anything navigated to afterwards. A bearer
//    header is now accepted and is the documented way in.
//
// 3. `!==` LEAKS TIMING. See secretMatches.
//
// The query-string form is deliberately still accepted. The person who
// runs these routes operates this site from a browser and a hosting
// dashboard, with no terminal: removing it would not harden the site, it
// would end their ability to migrate the CMS at all. So it stays, rate
// limited and compared in constant time, while the header is what the
// comments now tell you to use. That is a smaller improvement than
// deleting it, and it is the one that does not break the site's owner.
const MAX_FAILURES = 8;
const FAILURE_WINDOW_SECONDS = 900;

export async function refuseUnlessMaintainer(request: NextRequest): Promise<NextResponse | null> {
  const expected = process.env.MIGRATE_SECRET;

  // The correct secret costs nothing. Only wrong and missing guesses spend
  // from the budget, so a staged migration — which is many sequential
  // calls to /api/migrate?only=... — never rate-limits its own operator.
  if (
    secretMatches(bearerToken(request), expected) ||
    secretMatches(request.nextUrl.searchParams.get("secret"), expected)
  ) {
    return null;
  }

  const { allowed } = await checkRateLimit({
    bucket: "maintenance-auth",
    key: getClientIp(request),
    max: MAX_FAILURES,
    windowSeconds: FAILURE_WINDOW_SECONDS,
  });

  // Same wording either way about *why* it failed. A refusal that
  // distinguishes "no secret configured" from "wrong secret" tells a
  // stranger whether this deployment has the feature switched on at all.
  return allowed
    ? refusal({ error: "Invalid or missing secret" }, 401)
    : refusal({ error: "Too many attempts. Try again later." }, 429);
}

function refusal(body: { error: string }, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: noTrace() });
}

// Applied to maintenance responses, successful ones included — the point is
// the URL that produced them, not the body.
//
// no-store keeps a response that was fetched with a secret in the URL out of
// any cache between here and the browser. no-referrer stops that URL being
// handed to a third party as a Referer if anything is ever navigated to from
// it. Neither undoes the leak into the platform's own access log, which is
// why the header is the better path and why the secret is worth rotating.
export function noTrace(): HeadersInit {
  return { "Cache-Control": "no-store, max-age=0", "Referrer-Policy": "no-referrer" };
}
