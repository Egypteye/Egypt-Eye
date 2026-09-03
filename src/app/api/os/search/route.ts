import { NextResponse } from "next/server";
import { getActor } from "@/lib/os/actor";
import { globalSearch } from "@/lib/os/search";
import { osConfigured } from "@/lib/os/db";

export const dynamic = "force-dynamic";

// Backs the Cmd+K palette. The permission and scope checks live inside
// globalSearch, not here, so this route cannot be the place someone forgets
// them — it resolves the actor and hands over.
export async function GET(request: Request) {
  if (!osConfigured) return NextResponse.json({ results: [] });

  const actor = await getActor();
  if (!actor) return NextResponse.json({ results: [] }, { status: 401 });

  const term = new URL(request.url).searchParams.get("q") ?? "";
  if (term.trim().length < 2) return NextResponse.json({ results: [] });

  const results = await globalSearch(actor, term);
  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
