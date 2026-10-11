import type { NextRequest } from "next/server";

// Split out of rateLimit.ts, which must stay "server-only" because it
// reaches for the service-role Supabase client. This half is pure header
// parsing, so keeping it separate is what lets scripts/check-security.mts
// assert the precedence order below instead of taking it on trust.

// Best-effort caller identifier for anonymous (non-authenticated) rate
// limiting. Rate-limit buckets only — nothing here gates access, decides a
// price, or lands in an audit trail, and it must stay that way: everything
// below is a hint from a header, and a hint is not an identity.
//
// The order these headers are read in is a security decision, not a
// preference.
//
// x-vercel-forwarded-for comes first. Vercel's request-headers
// documentation describes it as the same value as x-forwarded-for except
// that it survives a proxy placed on top of Vercel — which is precisely the
// case where x-forwarded-for stops being worth anything.
//
// x-forwarded-for comes next, and we take the LAST entry rather than the
// first. This is the part that changed. Vercel documents that it overwrites
// an inbound x-forwarded-for rather than appending to it, "to prevent IP
// spoofing", so on this deployment the header holds one address and first
// and last are the same value: today's behaviour is unchanged. But reading
// the first entry is only safe because of that platform promise, which is
// written down nowhere in this repository. Put Cloudflare in front of this
// site, or move it to a plain Node server, and the first entry becomes
// whatever the caller typed into a header — at which point every per-IP
// limit on this site (16 endpoints, including booking submission and
// discount-code validation) can be switched off by varying one string per
// request. The last entry is the one appended by the proxy we are actually
// behind. Where that is wrong it groups callers together and limits too
// harshly, which is a bug someone reports; a limiter a header can disable
// is not a limiter, and nobody reports it.
//
// None of the above is a claim that this was exploitable as deployed. It
// is a claim that it was only not exploitable by accident.
export function getClientIp(request: NextRequest): string {
  const platform = firstAddress(request.headers.get("x-vercel-forwarded-for"));
  if (platform) return platform;

  const proxied = lastAddress(request.headers.get("x-forwarded-for"));
  if (proxied) return proxied;

  return firstAddress(request.headers.get("x-real-ip")) ?? "unknown";
}

// Pulls one address out of a comma-separated header, from whichever end,
// and length-caps it. The cap matters: bucket_key is a text column, and
// without it a caller could make every one of their requests insert a few
// kilobytes by sending a long header.
const MAX_ADDRESS = 64;

function pick(header: string | null, fromEnd: boolean): string | null {
  if (!header) return null;
  const parts = header
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (parts.length === 0) return null;
  const chosen = fromEnd ? parts[parts.length - 1] : parts[0];
  return chosen.slice(0, MAX_ADDRESS);
}

function firstAddress(header: string | null): string | null {
  return pick(header, false);
}

function lastAddress(header: string | null): string | null {
  return pick(header, true);
}
