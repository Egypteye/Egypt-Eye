import { NextResponse } from "next/server";
import { getActor, can } from "@/lib/os/actor";
import { calculate } from "@/lib/os/pricing";
import { osConfigured } from "@/lib/os/db";

export const dynamic = "force-dynamic";

// The calculator runs server-side so it uses exactly the same rate-resolution
// code as the trip cost lines. A client-side copy of the pricing rules is a
// copy that eventually disagrees with the invoice.
//
// Cost and margin are stripped from the response for anyone without
// `pricing.margins` — the numbers never reach the browser at all, rather than
// being hidden in the UI.
export async function POST(request: Request) {
  if (!osConfigured) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (!can(actor, "pricing.calculate")) {
    return NextResponse.json({ error: "You do not have permission to use the calculator" }, { status: 403 });
  }

  const body = (await request.json()) as {
    lines: { priceItemId: string; qty: number }[];
    tripDate: string;
    tier: string;
    sellOverride: number | null;
  };

  if (!Array.isArray(body.lines) || !body.tripDate) {
    return NextResponse.json({ error: "A trip date and at least one line are needed" }, { status: 400 });
  }

  const quote = await calculate({
    lines: body.lines.slice(0, 80).map((l) => ({ priceItemId: String(l.priceItemId), qty: Number(l.qty) || 0 })),
    tripDate: body.tripDate,
    tier: body.tier || "standard",
    sellOverride: body.sellOverride,
  });

  if (!can(actor, "pricing.margins")) {
    return NextResponse.json({
      ...quote,
      costTotal: 0,
      marginAmount: 0,
      marginPct: 0,
      markupPct: 0,
      belowFloor: false,
      lines: quote.lines.map((line) => ({ ...line, unitCost: 0, cost: 0 })),
      warnings: quote.warnings.filter((w) => !w.toLowerCase().includes("margin")),
    });
  }

  return NextResponse.json(quote);
}
