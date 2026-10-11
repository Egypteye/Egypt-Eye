import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// One place where this codebase compares a request against a shared secret.
//
// Deliberately NOT marked "server-only", following the same reasoning as
// paypalBody.ts and quoteSelfTest.ts: server-only puts a module out of
// reach of the offline check scripts, and a secret comparison that cannot
// be tested is not worth much. Nothing secret lives here — every caller
// passes its own process.env value in — and node:crypto does not resolve
// in a browser bundle, so a client component importing this still fails at
// build time rather than shipping.
//
// There were three hand-rolled versions of this before (CRON_SECRET in the
// reconcile sweep and the Pinterest sync, SANITY_REVALIDATE_SECRET in the
// revalidate hook, MIGRATE_SECRET in the five maintenance routes), each
// written as `provided === process.env.THING`. Collecting them means the
// next route that needs a shared secret inherits the right behaviour
// instead of copying the shortest thing that works.

// Compares a guess against a secret without leaking, through how long the
// comparison took, how much of the guess was correct.
//
// `===` on strings stops at the first byte that differs, so the time it
// takes is a (very noisy) measure of how many leading characters the guess
// got right. Across the public internet that signal is normally buried in
// jitter, and I am not claiming anyone was mining it — but the fix costs
// one hash, so the question does not need answering.
//
// Both sides are hashed before comparing rather than compared as raw bytes,
// because timingSafeEqual throws when the two buffers differ in length,
// and catching that throw would itself reveal whether the guess was the
// right length. SHA-256 digests are always 32 bytes, so the comparison
// reveals neither the secret's length nor its contents.
export function secretMatches(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!expected || !provided) return false;
  const guess = createHash("sha256").update(provided).digest();
  const truth = createHash("sha256").update(expected).digest();
  return timingSafeEqual(guess, truth);
}

// Pulls the token out of an `Authorization: Bearer <token>` header.
//
// Returns null rather than throwing on anything malformed, so a caller can
// treat "no token" and "unparseable token" the same way: as a refusal.
export function bearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer[ \t]+(\S.*)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

// True when the request carries this exact shared secret as a bearer token.
export function bearerMatches(request: NextRequest, expected: string | null | undefined): boolean {
  return secretMatches(bearerToken(request), expected);
}
