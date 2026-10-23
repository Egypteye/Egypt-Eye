/**
 * WHICH BRAND IS THIS REQUEST FOR?
 *
 * This repository builds ONE Next.js application that contains two brands:
 * Egypt Eye Travel at egypteyetravel.com, and Flying Dresses Egypt at
 * flyingdressesegypt.com under src/app/flying-dresses.
 *
 * Every request has to be assigned to one of them, and this file is the single
 * authority for that decision. src/proxy.ts imports it and acts on the answer:
 * `true` means the request is handled entirely by the Flying Dresses branch,
 * which rewrites the brand's short URLs and refuses every Egypt Eye route —
 * /studio, /auth/*, and all of the API including booking and PayPal capture.
 *
 * It lives here, apart from the proxy, for the reason in CLAUDE.md §6: the
 * proxy pulls in @supabase/ssr and next/server, so logic left inside it cannot
 * be loaded by a check script and therefore cannot be tested. This file has no
 * imports at all, so scripts/check-flying-dresses.mts runs the real function
 * over the real hostnames — including the ones that caused the incident below.
 *
 * =========================================================================
 * THE INCIDENT THIS FILE EXISTS BECAUSE OF
 * =========================================================================
 * The first version of this matched the custom domain and nothing else. That
 * looked complete and was not, because a Vercel project answers on three more
 * hostnames that it generates itself:
 *
 *     flying-dresses-egypt.vercel.app                       (the project)
 *     flying-dresses-egypt-git-<branch>-<team>.vercel.app   (the branch)
 *     flying-dresses-egypt-<hash>-<team>.vercel.app         (one deployment)
 *
 * None of them matched, so the Flying Dresses deployment answered all three
 * with EGYPT EYE: the whole travel site, with the Studio, the admin pages and
 * every API route live. The refusals that were supposed to stop that sit
 * *inside* the branch this function guards, so on an unmatched hostname they
 * never ran at all.
 *
 * The second brand's own project was therefore a second public copy of the
 * first brand's application — precisely what the isolation work was for,
 * defeated by an address nobody had thought to check. It surfaced only because
 * the owner opened the deployment and saw the wrong site.
 *
 * The lesson is in the shape of the function now: a hostname that is NOT
 * recognised falls through to the other brand, so being too narrow here is a
 * security failure and not merely a broken link.
 */

/** The brand's own domain. Matched exactly: apex and www, nothing else. */
export const FLYING_DRESSES_HOST = "flyingdressesegypt.com";

/**
 * The Vercel project that serves this brand, as its hostnames spell it.
 *
 * All three generated forms begin with the project name, so this is matched as
 * a prefix — the branch and deployment forms append a suffix that changes on
 * every push, and an exact list would go stale immediately.
 *
 * Egypt Eye's own aliases begin with `egypt-eye`, so they cannot match this.
 * That holds even for `egypt-eye-git-flying-dresses-production-...`, the alias
 * Egypt Eye's project would produce if it ever built this brand's branch: it
 * contains the words but starts with the other project, and the check script
 * asserts that exact hostname is rejected.
 */
export const FLYING_DRESSES_VERCEL_PROJECT = "flying-dresses-egypt";

/** Strips the port and lowercases, so `Host:` header casing cannot matter. */
export function hostname(host: string): string {
  return (host.split(":")[0] ?? "").toLowerCase();
}

export function isFlyingDressesHost(host: string): boolean {
  const name = hostname(host);

  if (name === FLYING_DRESSES_HOST || name === `www.${FLYING_DRESSES_HOST}`) {
    return true;
  }

  // This brand's Vercel project, on any hostname Vercel gives it. The
  // .vercel.app suffix is required as well as the prefix, so that a custom
  // domain can never be captured by a name that merely starts the same way —
  // `flying-dresses-egypt.example.com` is somebody else's and is not matched.
  if (
    name.endsWith(".vercel.app") &&
    (name === `${FLYING_DRESSES_VERCEL_PROJECT}.vercel.app` ||
      name.startsWith(`${FLYING_DRESSES_VERCEL_PROJECT}-`))
  ) {
    return true;
  }

  // flyingdressesegypt.localhost. Browsers and most systems resolve any
  // *.localhost name to the loopback address, so this brand can be reviewed on
  // its own host during development without touching /etc/hosts. Add the name
  // to allowedDevOrigins in next.config.ts when using it with next dev.
  return name.endsWith(".localhost") && name.startsWith("flyingdressesegypt.");
}
