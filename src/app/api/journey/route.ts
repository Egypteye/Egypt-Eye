import { NextRequest, NextResponse } from "next/server";
import { hydrateJourneyRefs, type HydratedJourney, type JourneyRef } from "@/lib/journeyHydrate";

export type JourneyDetailsResponse = HydratedJourney;

export async function POST(request: NextRequest) {
  let body: { items?: JourneyRef[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const response = await hydrateJourneyRefs(items);
  return NextResponse.json(response);
}
