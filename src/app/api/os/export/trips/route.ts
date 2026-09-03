import { getActor, can } from "@/lib/os/actor";
import { listTrips, type TripFilters } from "@/lib/os/trips";
import { osConfigured } from "@/lib/os/db";
import { todayInCairo, addDays } from "@/lib/os/dates";

export const dynamic = "force-dynamic";

// CSV export, with the same permission and scope rules as the screen it is
// launched from — including the financial columns, which are simply absent
// from the file for anyone without trips.financials rather than blanked out.
export async function GET(request: Request) {
  if (!osConfigured) return new Response("Not configured", { status: 503 });

  const actor = await getActor();
  if (!actor) return new Response("Not authorized", { status: 401 });
  if (!can(actor, "trips.export")) return new Response("You do not have permission to export trips", { status: 403 });

  const params = new URL(request.url).searchParams;
  const today = todayInCairo();
  const range = params.get("range") ?? "upcoming";
  const preset: Record<string, { from?: string; to?: string }> = {
    upcoming: { from: today },
    today: { from: today, to: today },
    week: { from: today, to: addDays(today, 6) },
    month: { from: today.slice(0, 8) + "01", to: addDays(today, 60) },
    past: { to: addDays(today, -1) },
    all: {},
  };
  const split = (key: string) => params.get(key)?.split(",").filter(Boolean);

  const filters: TripFilters = {
    ...(preset[range] ?? preset.upcoming),
    statuses: split("status"),
    unitIds: split("unit"),
    typeKeys: split("type"),
    readiness: split("readiness") as TripFilters["readiness"],
    search: params.get("q") ?? undefined,
    limit: 2000,
  };

  const trips = await listTrips(actor, filters);
  const showMoney = can(actor, "trips.financials");

  const headers = [
    "Reference", "Title", "Date", "Start", "Service", "Business unit", "Status",
    "Client", "Guests", "Location", "Pickup", "Source", "Readiness", "Crew",
    ...(showMoney ? ["Currency", "Selling price", "Estimated cost", "Actual cost", "Margin", "Margin %"] : []),
  ];

  const rows = trips.map((trip) => [
    trip.ref, trip.title, trip.tripDate, trip.startTime ?? "", trip.typeName ?? "", trip.unitName ?? "",
    trip.status, trip.clientName ?? "", String(trip.guests), trip.locationName ?? "", trip.pickupLocation ?? "",
    trip.source ?? "", `${trip.readinessScore}%`,
    trip.crew.map((c) => `${c.roleKey}: ${c.name}`).join("; "),
    ...(showMoney && trip.money
      ? [trip.money.currency, String(trip.money.sell), String(trip.money.estimatedCost), String(trip.money.actualCost), String(trip.money.margin), String(trip.money.marginPct)]
      : showMoney ? ["", "", "", "", "", ""] : []),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="egypt-eye-trips-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

// Guard against a title starting with = or + being executed as a formula when
// the file is opened in Excel. A real, boring, frequently-missed export bug.
function escapeCsv(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
