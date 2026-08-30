import { NextRequest, NextResponse } from "next/server";
import { pinUnpinnedStories } from "@/lib/pinterest/sync";

// Hit hourly by Vercel Cron (see vercel.json) — also the same route the
// admin "Pin Remaining Stories" button's server action calls into via
// pinUnpinnedStories() directly (no HTTP round-trip needed there, since it's
// already running server-side). This route exists specifically for the cron
// trigger, which is what makes every future story get auto-pinned with no
// further action from anyone.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pinUnpinnedStories({ limit: 25 });
  return NextResponse.json(result);
}
