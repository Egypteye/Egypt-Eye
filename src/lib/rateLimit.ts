import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

// A real, database-backed rate limiter (not an in-memory counter, which
// wouldn't survive across serverless invocations) — records a hit and
// counts how many exist in the trailing window for this key. Fails OPEN
// (allows the request) if Supabase isn't configured or the check itself
// errors, so a rate-limiter outage never takes the whole site down —
// but every write endpoint that calls this still has its own real
// validation/authorization behind it regardless.
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
    const { count } = await supabase
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("bucket_key", bucketKey)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= max) return { allowed: false, remaining: 0 };

    await supabase.from("rate_limit_hits").insert({ bucket_key: bucketKey });
    return { allowed: true, remaining: max - (count ?? 0) - 1 };
  } catch (err) {
    console.error("rate limit check failed (failing open):", err);
    return { allowed: true, remaining: max };
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
