import "server-only";
import { osdb, getOrg } from "./db";
import type { Actor } from "./actor";
import { can } from "./actor";
import { tripScopeFor, applyTripScope, NO_MATCH } from "./scope";
import { computeReadinessFor, type Readiness } from "./readiness";
import { todayInCairo, addDays } from "./dates";

// ---------------------------------------------------------------------------
// READING TRIPS
// ---------------------------------------------------------------------------
// Every function here takes the actor and applies their scope before the query
// leaves. There is no "get all trips" that a caller could forget to filter,
// which is the single most common way permission systems leak in practice.
//
// Financial fields are stripped rather than hidden, so an Operations user's
// page never carries the margin in its HTML payload at all. Hiding a column in
// CSS leaves the number in the response; this does not.
// ---------------------------------------------------------------------------

export type TripListItem = {
  id: string;
  ref: string;
  title: string;
  status: string;
  priority: string;
  tripDate: string;
  startTime: string | null;
  endTime: string | null;
  startsAt: string | null;
  durationMinutes: number | null;
  guests: number;
  pickupLocation: string | null;
  pickupTime: string | null;
  source: string | null;
  typeKey: string | null;
  typeName: string | null;
  typeColor: string;
  unitId: string | null;
  unitKey: string | null;
  unitName: string | null;
  locationName: string | null;
  clientId: string | null;
  clientName: string | null;
  clientVip: boolean;
  readinessScore: number;
  readinessState: "green" | "yellow" | "red";
  readinessBlockers: { key: string; label: string; blocker: string }[];
  crew: { roleKey: string; name: string; employeeId: string | null; resourceId: string | null; status: string }[];
  /** Present only when the actor holds trips.financials. */
  money: { currency: string; sell: number; estimatedCost: number; actualCost: number; paid: number; margin: number; marginPct: number } | null;
};

export type TripFilters = {
  from?: string;
  to?: string;
  date?: string;
  statuses?: string[];
  statusCategory?: string[];
  unitIds?: string[];
  typeKeys?: string[];
  employeeId?: string;
  resourceId?: string;
  clientId?: string;
  readiness?: ("green" | "yellow" | "red")[];
  search?: string;
  /**
   * A crew role the trip does NOT have. Two values are not roles:
   * `crew` means no confirmed or assigned person at all, and `media` means
   * no media link has been attached yet.
   */
  missingRole?: string;
  /** Tag key, matched through os_taggings. */
  tag?: string;
  /** Only trip types whose readiness contract includes a media folder. */
  producesContent?: boolean;
  /** Only trips where the client still owes money. Needs trips.financials. */
  balanceDue?: boolean;
  /** Margin band, in percent. Needs trips.financials. */
  marginPctGte?: number;
  marginPctLt?: number;
  limit?: number;
  order?: "date_asc" | "date_desc" | "readiness";
  includeArchived?: boolean;
};

/**
 * Filters that read money, and therefore cannot be honoured for somebody who
 * does not hold trips.financials. Callers ask so they can say so, rather than
 * quietly returning an unfiltered list that looks filtered.
 */
export function financialFilterKeys(filters: TripFilters): string[] {
  const keys: string[] = [];
  if (filters.balanceDue) keys.push("unpaid balance");
  if (filters.marginPctGte != null || filters.marginPctLt != null) keys.push("margin");
  return keys;
}

const TRIP_SELECT =
  "id, ref, title, status, priority, trip_date, start_time, end_time, starts_at, duration_minutes, " +
  "guests_adults, guests_children, pickup_location, pickup_time, source, unit_id, client_id, currency, " +
  "sell_amount, estimated_cost_amount, actual_cost_amount, paid_amount, " +
  "readiness_score, readiness_state, readiness_blockers, archived_at, " +
  "os_trip_types ( key, name, color ), " +
  "os_business_units ( key, name ), " +
  "os_locations ( name ), " +
  "os_clients ( id, full_name, vip )";

/* eslint-disable @typescript-eslint/no-explicit-any */
type RawTrip = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listTrips(actor: Actor, filters: TripFilters = {}): Promise<TripListItem[]> {
  const org = await getOrg();
  const db = osdb();
  const scope = await tripScopeFor(actor, "trips.view");
  if (scope.kind === "none") return [];

  let query = db.from("os_trips").select(TRIP_SELECT).eq("org_id", org.id);
  if (!filters.includeArchived) query = query.is("archived_at", null);

  query = applyTripScope(query, scope);

  if (filters.date) query = query.eq("trip_date", filters.date);
  if (filters.from) query = query.gte("trip_date", filters.from);
  if (filters.to) query = query.lte("trip_date", filters.to);
  if (filters.statuses?.length) query = query.in("status", filters.statuses);
  if (filters.unitIds?.length) query = query.in("unit_id", filters.unitIds);
  if (filters.clientId) query = query.eq("client_id", filters.clientId);
  if (filters.readiness?.length) query = query.in("readiness_state", filters.readiness);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`ref.ilike.%${term}%,title.ilike.%${term}%`);
  }

  // A tag lives in os_taggings, so resolve the matching trip ids first. An
  // unknown tag key matches nothing rather than everything.
  if (filters.tag) {
    const { data: tag } = await db
      .from("os_tags")
      .select("id")
      .eq("org_id", org.id)
      .eq("key", filters.tag)
      .maybeSingle();
    const taggedIds: string[] = [];
    if (tag?.id) {
      const { data: taggings } = await db
        .from("os_taggings")
        .select("entity_id")
        .eq("tag_id", tag.id as string)
        .eq("entity_type", "trip");
      for (const row of taggings ?? []) taggedIds.push(row.entity_id as string);
    }
    query = query.in("id", taggedIds.length ? taggedIds : [NO_MATCH]);
  }

  // Filtering by who is on the trip needs the assignment table first.
  if (filters.employeeId || filters.resourceId) {
    let assignQuery = db.from("os_trip_assignments").select("trip_id").in("status", ["proposed", "assigned", "confirmed"]);
    if (filters.employeeId) assignQuery = assignQuery.eq("employee_id", filters.employeeId);
    if (filters.resourceId) assignQuery = assignQuery.eq("resource_id", filters.resourceId);
    const { data: rows } = await assignQuery;
    const ids = Array.from(new Set((rows ?? []).map((r) => r.trip_id as string)));
    query = query.in("id", ids.length ? ids : [NO_MATCH]);
  }

  const order = filters.order ?? "date_asc";
  if (order === "date_desc") query = query.order("trip_date", { ascending: false }).order("start_time", { ascending: false, nullsFirst: false });
  else if (order === "readiness") query = query.order("readiness_score", { ascending: true });
  else query = query.order("trip_date").order("start_time", { nullsFirst: false });

  query = query.limit(filters.limit ?? 200);

  const { data } = await query;
  let trips = (data ?? []) as RawTrip[];

  if (filters.typeKeys?.length) {
    trips = trips.filter((t) => filters.typeKeys!.includes(t.os_trip_types?.key));
  }

  if (!trips.length) return [];

  const tripIds = trips.map((t) => t.id as string);
  const [assignments, readiness] = await Promise.all([
    db.from("os_trip_assignments")
      .select("trip_id, role_key, status, employee_id, resource_id, os_employees ( full_name ), os_resources ( name )")
      .in("trip_id", tripIds)
      .in("status", ["proposed", "assigned", "confirmed"]),
    // Recompute rather than trusting the cache: a trip's readiness can go
    // stale the moment anything around it changes, and a board showing a
    // yesterday's-truth score is worse than no board.
    computeReadinessFor(tripIds),
  ]);

  const crewByTrip = new Map<string, TripListItem["crew"]>();
  for (const a of (assignments.data ?? []) as RawTrip[]) {
    const list = crewByTrip.get(a.trip_id) ?? [];
    list.push({
      roleKey: a.role_key,
      name: a.os_employees?.full_name ?? a.os_resources?.name ?? "—",
      employeeId: a.employee_id ?? null,
      resourceId: a.resource_id ?? null,
      status: a.status,
    });
    crewByTrip.set(a.trip_id, list);
  }

  let items = trips.map((t) => toListItem(t, actor, crewByTrip.get(t.id) ?? [], readiness.get(t.id)));

  if (filters.missingRole === "crew") {
    // Nobody at all. The trip has a date and no human attached to it.
    items = items.filter((t) => !t.crew.some((c) => c.employeeId));
  } else if (filters.missingRole === "media") {
    // Deliberately the same test readiness uses — any media link at all, so
    // "missing a folder" means the same thing on both screens.
    const { data: links } = await db.from("os_media_links").select("trip_id").in("trip_id", tripIds);
    const withMedia = new Set((links ?? []).map((l) => l.trip_id as string));
    items = items.filter((t) => !withMedia.has(t.id));
  } else if (filters.missingRole) {
    items = items.filter((t) => !t.crew.some((c) => c.roleKey === filters.missingRole));
  }

  if (filters.producesContent) {
    const { data: types } = await db.from("os_trip_types").select("key, requirements").eq("org_id", org.id);
    const producing = new Set(
      (types ?? [])
        .filter((t) => Boolean((t.requirements as Record<string, boolean> | null)?.media_folder))
        .map((t) => t.key as string),
    );
    items = items.filter((t) => t.typeKey && producing.has(t.typeKey));
  }

  // Money filters are only run for somebody who can see money. For anybody
  // else `money` is absent from the payload entirely, so there is nothing to
  // filter on — the caller is told through financialFilterKeys() and says so
  // on screen rather than showing an unfiltered list under a filtered title.
  if (can(actor, "trips.financials")) {
    if (filters.balanceDue) {
      items = items.filter((t) => t.money != null && t.money.sell - t.money.paid > 0.009);
    }
    if (filters.marginPctGte != null) {
      const floor = filters.marginPctGte;
      items = items.filter((t) => t.money != null && t.money.sell > 0 && t.money.marginPct >= floor);
    }
    if (filters.marginPctLt != null) {
      const ceiling = filters.marginPctLt;
      items = items.filter((t) => t.money != null && t.money.sell > 0 && t.money.marginPct < ceiling);
    }
  }
  if (filters.statusCategory?.length) {
    // Category filtering needs the status table; do it in memory since the
    // status list is tiny and already cached by the caller in practice.
    const { data: statuses } = await db.from("os_trip_statuses").select("key, category").eq("org_id", org.id);
    const byKey = new Map((statuses ?? []).map((s) => [s.key as string, s.category as string]));
    items = items.filter((t) => filters.statusCategory!.includes(byKey.get(t.status) ?? ""));
  }

  return items;
}

function toListItem(t: RawTrip, actor: Actor, crew: TripListItem["crew"], readiness?: Readiness): TripListItem {
  const sell = Number(t.sell_amount ?? 0);
  const cost = Number(t.actual_cost_amount ?? 0) || Number(t.estimated_cost_amount ?? 0);
  const showMoney = can(actor, "trips.financials");

  return {
    id: t.id,
    ref: t.ref,
    title: t.title,
    status: t.status,
    priority: t.priority,
    tripDate: t.trip_date,
    startTime: t.start_time,
    endTime: t.end_time,
    startsAt: t.starts_at,
    durationMinutes: t.duration_minutes,
    guests: Number(t.guests_adults ?? 0) + Number(t.guests_children ?? 0),
    pickupLocation: t.pickup_location,
    pickupTime: t.pickup_time,
    source: t.source,
    typeKey: t.os_trip_types?.key ?? null,
    typeName: t.os_trip_types?.name ?? null,
    typeColor: t.os_trip_types?.color ?? "#c9a227",
    unitId: t.unit_id,
    unitKey: t.os_business_units?.key ?? null,
    unitName: t.os_business_units?.name ?? null,
    locationName: t.os_locations?.name ?? null,
    clientId: t.os_clients?.id ?? null,
    clientName: t.os_clients?.full_name ?? null,
    clientVip: Boolean(t.os_clients?.vip),
    readinessScore: readiness?.score ?? Number(t.readiness_score ?? 0),
    readinessState: readiness?.state ?? (t.readiness_state ?? "red"),
    readinessBlockers: readiness
      ? readiness.blockers.map((b) => ({ key: b.key, label: b.label, blocker: b.blocker ?? "" }))
      : (t.readiness_blockers ?? []),
    crew,
    // Not "hidden in the UI" — genuinely absent from the payload.
    money: showMoney
      ? {
          currency: t.currency ?? "USD",
          sell,
          estimatedCost: Number(t.estimated_cost_amount ?? 0),
          actualCost: Number(t.actual_cost_amount ?? 0),
          paid: Number(t.paid_amount ?? 0),
          margin: Math.round((sell - cost) * 100) / 100,
          marginPct: sell ? Math.round(((sell - cost) / sell) * 1000) / 10 : 0,
        }
      : null,
  };
}

/** One trip in full, or null if it does not exist or the actor cannot reach it. */
export async function getTrip(actor: Actor, ref: string): Promise<TripListItem | null> {
  const org = await getOrg();
  const scope = await tripScopeFor(actor, "trips.view");
  if (scope.kind === "none") return null;

  const { data } = await osdb()
    .from("os_trips")
    .select(TRIP_SELECT)
    .eq("org_id", org.id)
    .eq("ref", ref)
    .maybeSingle();
  if (!data) return null;

  const trip = data as RawTrip;
  if (scope.kind === "unit" && !(trip.unit_id && scope.unitIds.includes(trip.unit_id))) return null;
  if (scope.kind === "own" && !scope.tripIds.includes(trip.id)) return null;

  const [assignments, readiness] = await Promise.all([
    osdb().from("os_trip_assignments")
      .select("trip_id, role_key, status, employee_id, resource_id, os_employees ( full_name ), os_resources ( name )")
      .eq("trip_id", trip.id)
      .in("status", ["proposed", "assigned", "confirmed"]),
    computeReadinessFor([trip.id]),
  ]);

  const crew = ((assignments.data ?? []) as RawTrip[]).map((a) => ({
    roleKey: a.role_key as string,
    name: (a.os_employees?.full_name ?? a.os_resources?.name ?? "—") as string,
    employeeId: (a.employee_id ?? null) as string | null,
    resourceId: (a.resource_id ?? null) as string | null,
    status: a.status as string,
  }));

  return toListItem(trip, actor, crew, readiness.get(trip.id));
}

/** The raw row, for screens that need every field. Still scope-checked. */
export async function getTripRecord(actor: Actor, ref: string) {
  const org = await getOrg();
  const scope = await tripScopeFor(actor, "trips.view");
  if (scope.kind === "none") return null;
  const { data } = await osdb().from("os_trips").select("*").eq("org_id", org.id).eq("ref", ref).maybeSingle();
  if (!data) return null;
  if (scope.kind === "unit" && !(data.unit_id && scope.unitIds.includes(data.unit_id as string))) return null;
  if (scope.kind === "own" && !scope.tripIds.includes(data.id as string)) return null;
  return data;
}

/** The operational day: what is happening, in order, for a given date. */
export async function boardFor(actor: Actor, date: string): Promise<TripListItem[]> {
  return listTrips(actor, { date, order: "date_asc" });
}

export async function todayBoard(actor: Actor) {
  return boardFor(actor, todayInCairo());
}

export async function tomorrowBoard(actor: Actor) {
  return boardFor(actor, addDays(todayInCairo(), 1));
}

/** Next trip reference, allocated from a sequence so two clicks cannot collide. */
export async function nextTripRef(): Promise<string> {
  const { data, error } = await osdb().rpc("nextval_os_trip_ref");
  if (!error && data) return `EE-${data}`;
  // The helper function is created by migration 0021; fall back to a scan if
  // it is not there yet rather than failing the whole create.
  const { data: last } = await osdb()
    .from("os_trips")
    .select("ref")
    .order("ref", { ascending: false })
    .limit(1)
    .maybeSingle();
  const n = last?.ref ? Number(String(last.ref).replace(/\D/g, "")) : 10000;
  return `EE-${n + 1}`;
}
