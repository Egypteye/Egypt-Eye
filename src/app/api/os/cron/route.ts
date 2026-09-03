import { NextResponse } from "next/server";
import { runSweep } from "@/lib/os/automation";
import { osConfigured } from "@/lib/os/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// The scheduled half of the automation engine.
//
// Point a scheduler at this once an hour. On Vercel that is a cron entry in
// vercel.json; anywhere else, any hourly HTTP call works. It does the
// time-based work that no user action can trigger: re-checking readiness
// inside the 24-hour horizon, chasing shoots with no uploaded media, and
// escalating approvals that have sat too long.
//
// Protected by CRON_SECRET. Without that variable set the route refuses to
// run rather than defaulting to open, because an unauthenticated endpoint
// that writes notifications to every manager is a denial-of-service waiting
// to be found.
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured. The sweep will not run until it is set." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : new URL(request.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!osConfigured) {
    return NextResponse.json({ error: "Egypt Eye OS is not connected to a database." }, { status: 503 });
  }

  const result = await runSweep();
  return NextResponse.json(result);
}
