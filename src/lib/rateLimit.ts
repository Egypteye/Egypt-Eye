import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

// A real, database-backed rate limiter (not an in-memory counter, which
// wouldn't survive across serverless invocations) — records a hit and
// counts how many exist in the trailing window for this key.
//
// IT STILL FAILS OPEN, DELIBERATELY. A limiter that fails closed takes
// every form on the site down the moment the database has a bad minute,
// and the thing it would be protecting is a contact form, not a vault.
// Every endpoint behind this call has its own real validation and
// authorization regardless.
//
// WHAT CHANGED, AND WHY IT MATTERS MORE THAN IT LOOKS
//
// It used to fail open SILENTLY, and it was doing exactly that in
// production. On 11 October 2026 I sent thirteen wrong secrets from one
// address at an endpoint limited to eight per fifteen minutes. All
// thirteen came back 401. None came back 429. The limiter was not
// counting, and nothing anywhere said so.
//
// The reason is two unchecked error fields below. supabase-js does not
// throw when a query fails — it resolves with `{ data, error }`. So the
// try/catch around this never fired, `count` came back undefined,
// `(count ?? 0) >= max` was false for ever, and the insert's failure was
// discarded. Seventeen endpoints had a rate limiter that returned
// `allowed: true` unconditionally, and the only way to notice was to sit
// down and try to get blocked.
//
// So both errors are now read, and a failure is logged with the message
// the database actually gave. The underlying cause is a deployment
// question — most likely migration 0002 never ran against this project,
// which rateLimiterHealth() below is there to answer out loud.
//
// The general lesson is the one worth keeping: fail-open is a reasonable
// choice and silence is not. Any check that decides to allow something
// after an error has to say that it did.
export async function checkRateLimit({
  bucket,
  key,
  max,
  windowSeconds,
}: {
  bucket: string;
  key: string;
  max: number;
  windowSeconds: number;
}): Promise<{ allowed: boolean; remaining: number }> {
  if (!supabaseAdminConfigured) return { allowed: true, remaining: max };

  const bucketKey = `${bucket}:${key}`;
  const supabase = createAdminSupabaseClient();
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  try {
    const { count, error: countError } = await supabase
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("bucket_key", bucketKey)
      .gte("created_at", windowStart);

    // This is the line whose absence made the limiter a no-op. Without it,
    // an error leaves `count` undefined and every caller is waved through.
    if (countError) {
      console.error(
        `RATE LIMITER BROKEN (failing open, bucket "${bucket}"): counting hits failed: ${countError.message}. ` +
          `Every rate limit on this site is currently inoperative. Check /admin/paypal.`,
      );
      return { allowed: true, remaining: max };
    }

    if ((count ?? 0) >= max) return { allowed: false, remaining: 0 };

    const { error: insertError } = await supabase.from("rate_limit_hits").insert({ bucket_key: bucketKey });
    if (insertError) {
      console.error(
        `RATE LIMITER BROKEN (failing open, bucket "${bucket}"): recording the hit failed: ${insertError.message}. ` +
          `Counts cannot accumulate, so nothing will ever be limited. Check /admin/paypal.`,
      );
      return { allowed: true, remaining: max };
    }

    return { allowed: true, remaining: max - (count ?? 0) - 1 };
  } catch (err) {
    console.error("rate limit check threw (failing open):", err);
    return { allowed: true, remaining: max };
  }
}

// Answers "is the rate limiter actually working?" with a real round trip
// rather than an opinion, for the diagnostics panel on /admin/paypal.
//
// It exists because the failure above was invisible for the life of this
// site. The person running it has no terminal and no access to the
// function logs, so a console.error — even a loud one — is not a channel
// that reaches them. A row on a page they already visit is.
//
// Writes one row into its own throwaway bucket and reads it back, so a
// pass means the table exists, the service-role client can write it, and
// counting works. Never throws.
export async function rateLimiterHealth(): Promise<{ working: boolean; detail: string }> {
  if (!supabaseAdminConfigured) {
    return { working: false, detail: "Supabase isn't configured on this deployment, so nothing is rate limited." };
  }

  const probeKey = `healthcheck:${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const supabase = createAdminSupabaseClient();

  try {
    const { error: insertError } = await supabase.from("rate_limit_hits").insert({ bucket_key: probeKey });
    if (insertError) {
      return {
        working: false,
        detail:
          `Cannot write to rate_limit_hits: ${insertError.message}. ` +
          `Nothing on this site is rate limited. If this says the table does not exist, ` +
          `migration 0002_rate_limits.sql has not been run against this project.`,
      };
    }

    const { count, error: countError } = await supabase
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("bucket_key", probeKey);
    if (countError) {
      return { working: false, detail: `Can write but cannot count rate_limit_hits: ${countError.message}.` };
    }
    if ((count ?? 0) < 1) {
      return { working: false, detail: "Wrote a row to rate_limit_hits and then could not read it back." };
    }

    // Tidy up after the probe. A leftover row is harmless — its bucket is
    // unique and nothing will ever match it — so a failure here is not
    // worth reporting as a limiter fault.
    await supabase.from("rate_limit_hits").delete().eq("bucket_key", probeKey);

    return { working: true, detail: "Wrote a hit and counted it back. Rate limiting is live." };
  } catch (err) {
    return { working: false, detail: `Rate limiter health check threw: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// getClientIp lives in security/clientIp.ts so the check script can reach
// it; re-exported here because sixteen routes already import it from this
// module and the header-precedence rules are rate-limiting concerns.
export { getClientIp } from "./security/clientIp";

// Deletes rate-limit rows older than the longest window any caller uses.
//
// cleanup_rate_limit_hits() has existed since migration 0002 and had no
// caller: its comment says "no cron in this stack yet", which was true when
// it was written and stopped being true when the nightly payment sweep
// arrived. So the sweep calls it now. The cost of leaving it uncalled was
// storage rather than speed — the (bucket_key, created_at) index keeps the
// window count fast however many rows accumulate — but a table that only
// ever grows on a site that will run for years is still a bill nobody chose.
//
// Failure is logged and swallowed. Tidying up old rows is not worth failing
// a payment reconciliation run over.
export async function pruneRateLimitHits(): Promise<{ pruned: boolean }> {
  if (!supabaseAdminConfigured) return { pruned: false };
  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.rpc("cleanup_rate_limit_hits");
    if (error) {
      console.error("rate limit cleanup failed:", error.message);
      return { pruned: false };
    }
    return { pruned: true };
  } catch (err) {
    console.error("rate limit cleanup threw:", err);
    return { pruned: false };
  }
}
