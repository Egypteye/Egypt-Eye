import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { reconcilePayments } from "@/lib/booking/reconcile";
import { pruneRateLimitHits } from "@/lib/rateLimit";
import { applyDataRetention } from "@/lib/privacy/retention";
import { deleteExpiredCommissionPhotos } from "@/lib/privacy/photoRetention";
import { bearerMatches } from "@/lib/security/secrets";

// Runs the payment sweep.
//
// Two callers, both authenticated, because this reads and writes payment state
// and talks to PayPal: Vercel's scheduler with CRON_SECRET, and an admin
// pressing the button on /admin/paypal. There is no unauthenticated path —
// an open endpoint that captures payments is an open endpoint that can be used
// to hammer PayPal's rate limit until real captures start failing.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorised(request: NextRequest): Promise<boolean> {
  if (bearerMatches(request, process.env.CRON_SECRET)) return true;
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (!(await authorised(request))) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const report = await reconcilePayments();
  if (report.problems.length > 0) {
    console.error("payment reconciliation found problems:", report.problems.join(" | "));
  }

  // Piggy-backing the rate-limit tidy-up on the one job that already runs
  // every night, rather than adding a second cron entry and a second
  // secret for a single DELETE. It runs after the sweep, and cannot fail
  // it: pruneRateLimitHits swallows its own errors.
  const { pruned } = await pruneRateLimitHits();

  // And the retention sweep, for the same reason: one nightly job, one
  // secret. It enforces the periods the privacy policy states in writing —
  // contact details gone 12 months after the last contact, unconfirmed
  // newsletter sign-ups gone after 30 days. It swallows its own errors, so
  // it cannot fail the payment reconciliation it runs after.
  const retention = await applyDataRetention();

  // Photographs live in storage, not in a table, so they need their own
  // sweep. Same nightly job, same swallow-your-own-errors rule.
  const photos = await deleteExpiredCommissionPhotos();

  return NextResponse.json({
    ok: true,
    ...report,
    rateLimitHitsPruned: pruned,
    retention: retention.report ?? { ok: retention.ok },
    commissionPhotos: photos,
  });
}

// Vercel's scheduler issues a GET.
export async function GET(request: NextRequest) {
  return POST(request);
}
