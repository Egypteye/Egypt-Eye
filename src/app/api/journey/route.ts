import { NextRequest, NextResponse } from "next/server";
import {
  getDestinationHubBySlug,
  getExperienceBySlug,
  getPhotoshootBySlug,
  getTourBySlug,
} from "@/sanity/fetchers";
import type { DestinationHub, Experience, Photoshoot, Tour } from "@/content/types";

// Hydrates the lightweight { type, slug } refs stored in the visitor's
// localStorage "My Journey" shortlist (see src/lib/journey.ts) back into
// full, live CMS records — so the My Journey page always shows today's
// real price/duration/photo, not a stale copy frozen at "Add" time.

type JourneyRef = { type: "tour" | "experience" | "photoshoot" | "destination"; slug: string };

export type JourneyDetailsResponse = {
  tours: Tour[];
  experiences: Experience[];
  photoshoots: Photoshoot[];
  destinations: DestinationHub[];
};

export async function POST(request: NextRequest) {
  let body: { items?: JourneyRef[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const slugsFor = (type: JourneyRef["type"]) =>
    [...new Set(items.filter((i) => i?.type === type && typeof i.slug === "string").map((i) => i.slug))];

  const [tours, experiences, photoshoots, destinations] = await Promise.all([
    Promise.all(slugsFor("tour").map((slug) => getTourBySlug(slug))),
    Promise.all(slugsFor("experience").map((slug) => getExperienceBySlug(slug))),
    Promise.all(slugsFor("photoshoot").map((slug) => getPhotoshootBySlug(slug))),
    Promise.all(slugsFor("destination").map((slug) => getDestinationHubBySlug(slug))),
  ]);

  const response: JourneyDetailsResponse = {
    tours: tours.filter((t): t is Tour => Boolean(t)),
    experiences: experiences.filter((e): e is Experience => Boolean(e)),
    photoshoots: photoshoots.filter((p): p is Photoshoot => Boolean(p)),
    destinations: destinations.filter((d): d is DestinationHub => Boolean(d)),
  };

  return NextResponse.json(response);
}
