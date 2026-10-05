import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { reconcilePayments } from "@/lib/booking/reconcile";

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
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (secret && header === `Bearer ${secret}`) return true;
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
  return NextResponse.json({ ok: true, ...report });
}

// Vercel's scheduler issues a GET.
export async function GET(request: NextRequest) {
  return POST(request);
}
