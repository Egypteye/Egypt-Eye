import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { listTrips, type TripFilters } from "@/lib/os/trips";
import { getStatuses } from "@/lib/os/status";
import { osdb, getOrg } from "@/lib/os/db";
import { todayInCairo, addDays } from "@/lib/os/dates";
import { PageHeader, EmptyState, buttonClass, NoAccess, Table, Th, Card } from "@/components/os/ui";
import { TripRow } from "@/components/os/trip";
import { Icon } from "@/components/os/icons";
import { TripFilterBar } from "./TripFilterBar";
import { scopeNote } from "@/lib/os/scope";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trips" };

// Every trip, filtered any way operations needs, plus the saved views that
// answer the questions people ask daily. Filters live in the URL so a view is
// shareable: pasting the link into the trip channel shows a colleague exactly
// what you were looking at.
export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "trips.view")) return <NoAccess what="trips" permission="trips.view" />;

  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]![0] : params[key]) as string | undefined;
  const many = (key: string) => {
    const value = params[key];
    if (!value) return undefined;
    return (Array.isArray(value) ? value : value.split(",")).filter(Boolean);
  };

  const today = todayInCairo();
  const range = one("range") ?? "upcoming";
  const preset: Record<string, { from?: string; to?: string }> = {
    upcoming: { from: today },
    today: { from: today, to: today },
    week: { from: today, to: addDays(today, 6) },
    month: { from: today.slice(0, 8) + "01", to: addDays(today, 60) },
    past: { to: addDays(today, -1) },
    all: {},
  };

  const filters: TripFilters = {
    ...(preset[range] ?? preset.upcoming),
    from: one("from") ?? preset[range]?.from,
    to: one("to") ?? preset[range]?.to,
    statuses: many("status"),
    unitIds: many("unit"),
    typeKeys: many("type"),
    readiness: many("readiness") as TripFilters["readiness"],
    missingRole: one("missing"),
    search: one("q"),
    order: range === "past" ? "date_desc" : (one("sort") as TripFilters["order"]) ?? "date_asc",
    limit: 300,
  };

  const org = await getOrg();
  const db = osdb();

  const [trips, statuses, units, types, savedViews] = await Promise.all([
    listTrips(actor, filters),
    getStatuses(),
    db.from("os_business_units").select("id, key, name").eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_trip_types").select("key, name").eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_saved_views").select("id, name, query, icon").eq("org_id", org.id).eq("resource", "trips").eq("shared", true).order("sort_order"),
  ]);

  const showMoney = can(actor, "trips.financials");

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Trips"
        description={`${trips.length} trip${trips.length === 1 ? "" : "s"} match your filters.`}
        actions={
          <>
            {can(actor, "trips.export") ? (
              <a
                href={`/api/os/export/trips?${new URLSearchParams(
                  Object.entries(params).flatMap(([k, v]) => (v ? [[k, Array.isArray(v) ? v.join(",") : v]] : [])) as [string, string][],
                ).toString()}`}
                className={buttonClass.secondary}
              >
                <Icon.Download size={15} />Export
              </a>
            ) : null}
            {can(actor, "trips.create") ? (
              <Link href="/os/trips/new" className={buttonClass.gold}><Icon.Plus size={15} />New trip</Link>
            ) : null}
          </>
        }
        meta={scopeNote(actor.permissions["trips.view"] ?? null) ? (
          <p className="text-[12px] text-os-faint">{scopeNote(actor.permissions["trips.view"] ?? null)}</p>
        ) : null}
      />

      <TripFilterBar
        statuses={statuses.map((s) => ({ key: s.key, label: s.label }))}
        units={(units.data ?? []).map((u) => ({ id: u.id as string, name: u.name as string }))}
        types={(types.data ?? []).map((t) => ({ key: t.key as string, name: t.name as string }))}
        savedViews={(savedViews.data ?? []).map((v) => ({ id: v.id as string, name: v.name as string }))}
      />

      {trips.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            title="No trips match these filters"
            description="Widen the date range, or clear a filter. If you expected to see something here, check whether it belongs to a business unit you have access to."
            action={<Link href="/os/trips" className={buttonClass.secondary}>Clear filters</Link>}
            icon={<Icon.Trip size={26} />}
          />
        </Card>
      ) : (
        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Trip</Th>
                <Th>When</Th>
                <Th>Client</Th>
                <Th>Service</Th>
                <Th>Status</Th>
                <Th>Ready</Th>
                <Th>Crew</Th>
                {showMoney ? <Th align="right">Value</Th> : null}
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => <TripRow key={trip.id} trip={trip} />)}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
}
