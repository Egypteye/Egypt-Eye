import { NextRequest, NextResponse } from "next/server";
import { hydrateJourneyRefs, type HydratedJourney, type JourneyRef } from "@/lib/journeyHydrate";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export type JourneyDetailsResponse = HydratedJourney;

// Read-only lookup, called anonymously on every /reserve and /my-journey
// page load — the rate limit here is deliberately generous (this isn't a
// once-per-visit form submission) but still caps how many fan-out Sanity
// fetches a single IP can trigger.
export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({ bucket: "journey-lookup", key: getClientIp(request), max: 60, windowSeconds: 600 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: { items?: JourneyRef[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 50);
  const response = await hydrateJourneyRefs(items);
  return NextResponse.json(response);
}
