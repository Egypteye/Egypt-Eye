import { NextResponse } from "next/server";
import { getActor } from "@/lib/os/actor";
import { osdb, getOrg, osConfigured } from "@/lib/os/db";

export const dynamic = "force-dynamic";

// The change cursor that LiveRefresh polls. Five timestamps hashed into one
// string: if nothing has moved, the client does nothing at all. Deliberately
// the cheapest query in the system, because every open tab runs it.
export async function GET() {
  if (!osConfigured) return NextResponse.json({ cursor: "unconfigured" });

  const actor = await getActor();
  if (!actor) return NextResponse.json({ cursor: "signed-out" }, { status: 401 });

  const org = await getOrg();
  const { data } = await osdb().rpc("os_pulse", { p_org: org.id });
  const row = Array.isArray(data) ? data[0] : data;

  const cursor = [row?.trips, row?.assignments, row?.tasks, row?.messages, row?.notifications]
    .map((value) => (value ? new Date(value as string).getTime() : 0))
    .join(".");

  return NextResponse.json({ cursor }, { headers: { "Cache-Control": "no-store" } });
}
