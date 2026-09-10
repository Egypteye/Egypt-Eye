import "server-only";
import { osdb, getOrg } from "./db";
import type { Actor } from "./actor";
import { can } from "./actor";
import { tripScopeFor, applyTripScope } from "./scope";
import { todayInCairo, addDays, startOfMonth } from "./dates";

// ---------------------------------------------------------------------------
// ANALYTICS
// ---------------------------------------------------------------------------
// Everything here is derived at read time from the operational tables. There
// is no reporting copy of the data to fall out of sync, and no nightly job
// that can quietly stop running and leave the dashboard showing last week.
//
// Financial figures are gated on `analytics.financial`, separately from
// `analytics.view`: Operations should be able to see that Photoshoots are
// growing without seeing what they earn.
// ---------------------------------------------------------------------------

export type Period = { from: string; to: string; label: string };

export function periodPresets(today = todayInCairo()): Record<string, Period> {
  return {
    today: { from: today, to: today, label: "Today" },
    week: { from: addDays(today, -6), to: today, label: "Last 7 days" },
    month: { from: startOfMonth(today), to: today, label: "This month" },
    quarter: { from: addDays(today, -89), to: today, label: "Last 90 days" },
    year: { from: addDays(today, -364), to: today, label: "Last 12 months" },
  };
}

export type OverviewStats = {
  trips: number;
  guests: number;
  completed: number;
  cancelled: number;
  cancellationRate: number;
  atRisk: number;
  critical: number;
  /** Null when the actor may not see money. */
  revenue: number | null;
  cost: number | null;
  profit: number | null;
  marginPct: number | null;
  averageBookingValue: number | null;
  currency: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function overview(actor: Actor, period: Period): Promise<OverviewStats> {
  const org = await getOrg();
  const scope = await tripScopeFor(actor, "trips.view");
  const showMoney = can(actor, "analytics.financial") || can(actor, "trips.financials");

  const empty: OverviewStats = {
    trips: 0, guests: 0, completed: 0, cancelled: 0, cancellationRate: 0, atRisk: 0, critical: 0,
    revenue: showMoney ? 0 : null, cost: showMoney ? 0 : null, profit: showMoney ? 0 : null,
    marginPct: showMoney ? 0 : null, averageBookingValue: showMoney ? 0 : null, currency: actor.baseCurrency,
  };
  if (scope.kind === "none") return empty;

  let query = osdb()
    .from("os_trips")
    .select("id, status, trip_date, guests_adults, guests_children, sell_amount, estimated_cost_amount, actual_cost_amount, readiness_state, unit_id")
    .eq("org_id", org.id)
    .is("archived_at", null)
    .gte("trip_date", period.from)
    .lte("trip_date", period.to);
  query = applyTripScope(query, scope);

  const { data } = await query;
  const trips = (data ?? []) as Raw[];

  let revenue = 0, cost = 0, guests = 0, completed = 0, cancelled = 0, atRisk = 0, critical = 0;
  for (const t of trips) {
    guests += Number(t.guests_adults ?? 0) + Number(t.guests_children ?? 0);
    if (["completed", "content_pending", "client_follow_up", "closed"].includes(t.status)) completed += 1;
    if (t.status === "cancelled") { cancelled += 1; continue; }
    revenue += Number(t.sell_amount ?? 0);
    cost += Number(t.actual_cost_amount ?? 0) || Number(t.estimated_cost_amount ?? 0);
    if (t.readiness_state === "yellow") atRisk += 1;
    if (t.readiness_state === "red") critical += 1;
  }

  const billable = trips.filter((t) => t.status !== "cancelled").length;
  const profit = revenue - cost;

  return {
    trips: trips.length,
    guests,
    completed,
    cancelled,
    cancellationRate: trips.length ? Math.round((cancelled / trips.length) * 1000) / 10 : 0,
    atRisk,
    critical,
    revenue: showMoney ? round2(revenue) : null,
    cost: showMoney ? round2(cost) : null,
    profit: showMoney ? round2(profit) : null,
    marginPct: showMoney ? (revenue ? Math.round((profit / revenue) * 1000) / 10 : 0) : null,
    averageBookingValue: showMoney ? (billable ? round2(revenue / billable) : 0) : null,
    currency: actor.baseCurrency,
  };
}

export type Breakdown = {
  key: string;
  label: string;
  trips: number;
  guests: number;
  revenue: number | null;
  cost: number | null;
  profit: number | null;
  marginPct: number | null;
};

export type BreakdownDimension = "trip_type" | "unit" | "source" | "location" | "client" | "month";

export async function breakdown(actor: Actor, period: Period, dimension: BreakdownDimension): Promise<Breakdown[]> {
  const org = await getOrg();
  const scope = await tripScopeFor(actor, "trips.view");
  const showMoney = can(actor, "analytics.financial") || can(actor, "trips.financials");
  if (scope.kind === "none") return [];

  let query = osdb()
    .from("os_trips")
    .select(
      "id, status, trip_date, source, guests_adults, guests_children, sell_amount, " +
      "estimated_cost_amount, actual_cost_amount, unit_id, " +
      "os_trip_types ( key, name ), os_business_units ( key, name ), os_locations ( name ), os_clients ( id, full_name )",
    )
    .eq("org_id", org.id)
    .is("archived_at", null)
    .neq("status", "cancelled")
    .gte("trip_date", period.from)
    .lte("trip_date", period.to);
  query = applyTripScope(query, scope);

  const { data } = await query;
  const buckets = new Map<string, Breakdown & { _revenue: number; _cost: number }>();

  for (const t of ((data ?? []) as Raw[])) {
    let key: string, label: string;
    switch (dimension) {
      case "trip_type": key = t.os_trip_types?.key ?? "unknown"; label = t.os_trip_types?.name ?? "Uncategorised"; break;
      case "unit": key = t.os_business_units?.key ?? "unknown"; label = t.os_business_units?.name ?? "Unassigned"; break;
      case "source": key = t.source ?? "unknown"; label = t.source ?? "Not recorded"; break;
      case "location": key = t.os_locations?.name ?? "unknown"; label = t.os_locations?.name ?? "No location"; break;
      case "client": key = t.os_clients?.id ?? "unknown"; label = t.os_clients?.full_name ?? "No client"; break;
      case "month": key = String(t.trip_date).slice(0, 7); label = key; break;
    }

    const entry = buckets.get(key) ?? {
      key, label, trips: 0, guests: 0, revenue: null, cost: null, profit: null, marginPct: null,
      _revenue: 0, _cost: 0,
    };
    entry.trips += 1;
    entry.guests += Number(t.guests_adults ?? 0) + Number(t.guests_children ?? 0);
    entry._revenue += Number(t.sell_amount ?? 0);
    entry._cost += Number(t.actual_cost_amount ?? 0) || Number(t.estimated_cost_amount ?? 0);
    buckets.set(key, entry);
  }

  return Array.from(buckets.values())
    .map((b) => ({
      key: b.key,
      label: b.label,
      trips: b.trips,
      guests: b.guests,
      revenue: showMoney ? round2(b._revenue) : null,
      cost: showMoney ? round2(b._cost) : null,
      profit: showMoney ? round2(b._revenue - b._cost) : null,
      marginPct: showMoney ? (b._revenue ? Math.round(((b._revenue - b._cost) / b._revenue) * 1000) / 10 : 0) : null,
    }))
    .sort((a, b) =>
      dimension === "month" ? a.key.localeCompare(b.key) : (b.revenue ?? b.trips) - (a.revenue ?? a.trips),
    );
}

export type UtilizationRow = {
  id: string;
  name: string;
  subtitle: string | null;
  bookings: number;
  upcoming: number;
  /** Percentage of the period's operating days this resource was working. */
  utilizationPct: number;
  status: string | null;
  rating: number | null;
  flag: "overloaded" | "underused" | null;
};

export async function employeeUtilization(actor: Actor, period: Period): Promise<UtilizationRow[]> {
  if (!can(actor, "analytics.view") && !can(actor, "team.view")) return [];
  const org = await getOrg();
  const db = osdb();

  const [{ data: employees }, { data: assignments }, { data: reviews }] = await Promise.all([
    db.from("os_employees").select("id, full_name, job_title, status").eq("org_id", org.id).is("archived_at", null).eq("status", "active"),
    db.from("os_trip_assignments")
      .select("employee_id, starts_at, status")
      .eq("org_id", org.id)
      .not("employee_id", "is", null)
      .in("status", ["assigned", "confirmed"])
      .gte("starts_at", `${period.from}T00:00:00Z`)
      .lte("starts_at", `${period.to}T23:59:59Z`),
    db.from("os_performance_reviews").select("employee_id, rating").eq("org_id", org.id).not("employee_id", "is", null),
  ]);

  const counts = new Map<string, number>();
  const upcoming = new Map<string, number>();
  const now = Date.now();
  for (const a of assignments ?? []) {
    const id = a.employee_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
    if (a.starts_at && new Date(a.starts_at as string).getTime() > now) upcoming.set(id, (upcoming.get(id) ?? 0) + 1);
  }

  const ratings = new Map<string, { sum: number; n: number }>();
  for (const r of reviews ?? []) {
    const id = r.employee_id as string;
    const e = ratings.get(id) ?? { sum: 0, n: 0 };
    e.sum += Number(r.rating); e.n += 1;
    ratings.set(id, e);
  }

  const days = Math.max(1, Math.round((Date.parse(period.to) - Date.parse(period.from)) / 86_400_000) + 1);
  const workingDays = Math.max(1, Math.round(days * (6 / 7)));   // Friday is the weekend day
  const values = Array.from(counts.values());
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  return (employees ?? [])
    .map((e) => {
      const id = e.id as string;
      const bookings = counts.get(id) ?? 0;
      const rating = ratings.get(id);
      const pct = Math.min(100, Math.round((bookings / workingDays) * 100));
      return {
        id,
        name: e.full_name as string,
        subtitle: (e.job_title as string) ?? null,
        bookings,
        upcoming: upcoming.get(id) ?? 0,
        utilizationPct: pct,
        status: (e.status as string) ?? null,
        rating: rating && rating.n ? Math.round((rating.sum / rating.n) * 10) / 10 : null,
        flag: (bookings > average * 1.6 && bookings >= 4
          ? "overloaded"
          : bookings === 0 || (average > 1 && bookings < average * 0.35)
            ? "underused"
            : null) as UtilizationRow["flag"],
      };
    })
    .sort((a, b) => b.bookings - a.bookings);
}

export async function resourceUtilization(actor: Actor, period: Period): Promise<UtilizationRow[]> {
  if (!can(actor, "resources.view")) return [];
  const org = await getOrg();
  const db = osdb();

  const [{ data: resources }, { data: assignments }] = await Promise.all([
    db.from("os_resources").select("id, name, code, kind, status").eq("org_id", org.id).is("archived_at", null).neq("status", "retired"),
    db.from("os_trip_assignments")
      .select("resource_id, starts_at, status")
      .eq("org_id", org.id)
      .not("resource_id", "is", null)
      .in("status", ["assigned", "confirmed"])
      .gte("starts_at", `${period.from}T00:00:00Z`)
      .lte("starts_at", `${period.to}T23:59:59Z`),
  ]);

  const counts = new Map<string, number>();
  const upcoming = new Map<string, number>();
  const now = Date.now();
  for (const a of assignments ?? []) {
    const id = a.resource_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
    if (a.starts_at && new Date(a.starts_at as string).getTime() > now) upcoming.set(id, (upcoming.get(id) ?? 0) + 1);
  }

  const days = Math.max(1, Math.round((Date.parse(period.to) - Date.parse(period.from)) / 86_400_000) + 1);
  const values = Array.from(counts.values());
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  return (resources ?? [])
    .map((r) => {
      const id = r.id as string;
      const bookings = counts.get(id) ?? 0;
      return {
        id,
        name: r.name as string,
        subtitle: `${String(r.kind).replace("_", " ")} · ${r.code}`,
        bookings,
        upcoming: upcoming.get(id) ?? 0,
        utilizationPct: Math.min(100, Math.round((bookings / days) * 100)),
        status: r.status as string,
        rating: null,
        flag: (bookings > average * 1.7 && bookings >= 4
          ? "overloaded"
          : bookings === 0
            ? "underused"
            : null) as UtilizationRow["flag"],
      };
    })
    .sort((a, b) => b.bookings - a.bookings);
}

export type SupplierPerformance = {
  id: string;
  name: string;
  trips: number;
  spend: number | null;
  incidents: number;
  avgRating: number | null;
  categories: string[];
};

export async function supplierPerformance(actor: Actor, period: Period): Promise<SupplierPerformance[]> {
  if (!can(actor, "suppliers.view")) return [];
  const org = await getOrg();
  const db = osdb();
  const showSpend = can(actor, "suppliers.rates") || can(actor, "finance.view");

  const [{ data: suppliers }, { data: costs }, { data: incidents }, { data: reviews }] = await Promise.all([
    db.from("os_suppliers").select("id, name, categories").eq("org_id", org.id).is("archived_at", null),
    db.from("os_trip_cost_lines").select("supplier_id, base_amount, trip_id")
      .eq("org_id", org.id).not("supplier_id", "is", null)
      .gte("incurred_on", period.from).lte("incurred_on", period.to),
    db.from("os_incidents").select("subject_supplier_id").eq("org_id", org.id).not("subject_supplier_id", "is", null)
      .gte("occurred_at", `${period.from}T00:00:00Z`),
    db.from("os_performance_reviews").select("supplier_id, rating").eq("org_id", org.id).not("supplier_id", "is", null),
  ]);

  const spend = new Map<string, number>();
  const tripsBySupplier = new Map<string, Set<string>>();
  for (const c of costs ?? []) {
    const id = c.supplier_id as string;
    spend.set(id, (spend.get(id) ?? 0) + Number(c.base_amount ?? 0));
    if (!tripsBySupplier.has(id)) tripsBySupplier.set(id, new Set());
    tripsBySupplier.get(id)!.add(c.trip_id as string);
  }
  const incidentCounts = new Map<string, number>();
  for (const i of incidents ?? []) {
    const id = i.subject_supplier_id as string;
    incidentCounts.set(id, (incidentCounts.get(id) ?? 0) + 1);
  }
  const ratings = new Map<string, { sum: number; n: number }>();
  for (const r of reviews ?? []) {
    const id = r.supplier_id as string;
    const e = ratings.get(id) ?? { sum: 0, n: 0 };
    e.sum += Number(r.rating); e.n += 1;
    ratings.set(id, e);
  }

  return (suppliers ?? [])
    .map((s) => {
      const id = s.id as string;
      const rating = ratings.get(id);
      return {
        id,
        name: s.name as string,
        trips: tripsBySupplier.get(id)?.size ?? 0,
        spend: showSpend ? round2(spend.get(id) ?? 0) : null,
        incidents: incidentCounts.get(id) ?? 0,
        avgRating: rating && rating.n ? Math.round((rating.sum / rating.n) * 10) / 10 : null,
        categories: (s.categories as string[]) ?? [],
      };
    })
    .sort((a, b) => (b.spend ?? b.trips) - (a.spend ?? a.trips));
}

export type ClientInsight = {
  nationalities: { label: string; count: number }[];
  sources: { label: string; count: number; revenue: number | null }[];
  repeatRate: number;
  topClients: { id: string; name: string; trips: number; spend: number | null }[];
};

export async function clientInsights(actor: Actor, period: Period): Promise<ClientInsight | null> {
  if (!can(actor, "clients.view") || !can(actor, "analytics.view")) return null;
  const org = await getOrg();
  const db = osdb();
  const showMoney = can(actor, "analytics.financial") || can(actor, "trips.financials");

  const [{ data: clients }, { data: trips }] = await Promise.all([
    db.from("os_clients").select("id, full_name, company_name, nationality, country").eq("org_id", org.id).is("archived_at", null),
    db.from("os_trips").select("client_id, source, sell_amount, status")
      .eq("org_id", org.id).is("archived_at", null).neq("status", "cancelled")
      .gte("trip_date", period.from).lte("trip_date", period.to),
  ]);

  const nationalities = new Map<string, number>();
  for (const c of clients ?? []) {
    const key = (c.nationality as string) || (c.country as string) || "Not recorded";
    nationalities.set(key, (nationalities.get(key) ?? 0) + 1);
  }

  const sources = new Map<string, { count: number; revenue: number }>();
  const perClient = new Map<string, { trips: number; spend: number }>();
  for (const t of trips ?? []) {
    const src = (t.source as string) || "Not recorded";
    const s = sources.get(src) ?? { count: 0, revenue: 0 };
    s.count += 1; s.revenue += Number(t.sell_amount ?? 0);
    sources.set(src, s);

    if (t.client_id) {
      const c = perClient.get(t.client_id as string) ?? { trips: 0, spend: 0 };
      c.trips += 1; c.spend += Number(t.sell_amount ?? 0);
      perClient.set(t.client_id as string, c);
    }
  }

  const names = new Map((clients ?? []).map((c) => [c.id as string, ((c.company_name as string) || (c.full_name as string))]));
  const repeatClients = Array.from(perClient.values()).filter((c) => c.trips > 1).length;

  return {
    nationalities: Array.from(nationalities, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    sources: Array.from(sources, ([label, v]) => ({ label, count: v.count, revenue: showMoney ? round2(v.revenue) : null }))
      .sort((a, b) => b.count - a.count),
    repeatRate: perClient.size ? Math.round((repeatClients / perClient.size) * 1000) / 10 : 0,
    topClients: Array.from(perClient, ([id, v]) => ({
      id, name: names.get(id) ?? "Unknown", trips: v.trips, spend: showMoney ? round2(v.spend) : null,
    })).sort((a, b) => (b.spend ?? b.trips) - (a.spend ?? a.trips)).slice(0, 10),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
