import "server-only";
import { NextRequest } from "next/server";
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

// Best-effort client identifier for anonymous (non-authenticated) rate
// limiting — real IP when the platform provides one (Vercel sets
// x-forwarded-for), falling back to a shared bucket rather than throwing
// when it's genuinely unavailable (e.g. local dev).
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
