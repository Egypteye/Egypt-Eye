import "server-only";
import { osdb, getOrg } from "./db";

// ---------------------------------------------------------------------------
// TRIP READINESS
// ---------------------------------------------------------------------------
// The question this answers is not "is the paperwork done" but "if this trip
// started right now, would it actually work". Every check below is something
// that has, at some point, ruined a real morning.
//
// What must be true is NOT hard-coded per service. It comes from the trip
// type's `requirements` JSON, so adding a new Egypt Eye service is a
// configuration row, not a code change:
//
//   {"photographer":true,"driver":true,"vehicle":true,"dress":true,
//    "client_contact":true,"pickup":true,"pricing":true,"media_folder":true}
//
// Weights reflect consequence, not effort. A missing driver is not the same
// size of problem as a missing itinerary line, and a score that treats them
// equally is a score nobody trusts.
//
// The result is deliberately explainable: every check carries the sentence a
// coordinator would say out loud about it, so the screen never just shows a
// number.
// ---------------------------------------------------------------------------

export type ReadinessState = "green" | "yellow" | "red";

export type ReadinessCheck = {
  key: string;
  label: string;
  ok: boolean;
  weight: number;
  /** Shown when the check fails. Written as an instruction, not a status. */
  blocker?: string;
  /** Where to go to fix it. */
  fixHref?: string;
};

export type Readiness = {
  score: number;
  state: ReadinessState;
  checks: ReadinessCheck[];
  blockers: ReadinessCheck[];
  /** True when this trip is close enough that a failing check is an emergency. */
  critical: boolean;
};

const CREW_ROLES = ["guide", "driver", "photographer", "videographer", "coordinator", "representative"] as const;
const RESOURCE_ROLES = ["vehicle", "dress", "equipment"] as const;

const LABELS: Record<string, string> = {
  guide: "Guide assigned",
  driver: "Driver assigned",
  photographer: "Photographer assigned",
  videographer: "Videographer assigned",
  coordinator: "Coordinator assigned",
  representative: "Representative assigned",
  vehicle: "Vehicle assigned",
  dress: "Dress confirmed",
  equipment: "Equipment assigned",
  client_contact: "Client contact details",
  pickup: "Pickup confirmed",
  itinerary: "Itinerary built",
  tickets: "Tickets and permits",
  supplier_confirmation: "Supplier confirmation",
  media_folder: "Media folder linked",
  pricing: "Selling price set",
  blocking_tasks: "Blocking tasks done",
};

const WEIGHTS: Record<string, number> = {
  guide: 3, driver: 3, photographer: 3, videographer: 2, coordinator: 2, representative: 2,
  vehicle: 3, dress: 3, equipment: 1,
  client_contact: 3, pickup: 2, itinerary: 1, tickets: 2,
  supplier_confirmation: 2, media_folder: 2, pricing: 2, blocking_tasks: 2,
};

/** Everything the engine needs about one trip, gathered in bulk by `computeReadinessFor`. */
export type ReadinessInput = {
  id: string;
  ref: string;
  starts_at: string | null;
  trip_date: string;
  status: string;
  sell_amount: number;
  pickup_location: string | null;
  pickup_time: string | null;
  requirements: Record<string, boolean>;
  client: { phone: string | null; email: string | null; whatsapp: string | null } | null;
  crewRoles: Set<string>;
  resourceRoles: Set<string>;
  itineraryCount: number;
  hasTicketCost: boolean;
  hasTicketDoc: boolean;
  hasSupplierConfirmation: boolean;
  hasMediaLink: boolean;
  openBlockingTasks: number;
};

export function evaluateReadiness(
  input: ReadinessInput,
  thresholds: { green: number; yellow: number },
  criticalHorizonHours: number,
  now: Date = new Date(),
): Readiness {
  const req = input.requirements ?? {};
  const checks: ReadinessCheck[] = [];
  const base = `/os/trips/${input.ref}`;

  const push = (key: string, ok: boolean, blocker: string, fixHref?: string) => {
    if (!req[key]) return;
    checks.push({ key, label: LABELS[key] ?? key, ok, weight: WEIGHTS[key] ?? 1, blocker: ok ? undefined : blocker, fixHref });
  };

  for (const role of CREW_ROLES) {
    push(
      role,
      input.crewRoles.has(role),
      `No ${role.replace("_", " ")} is assigned. This trip cannot run without one.`,
      `${base}/team`,
    );
  }
  for (const kind of RESOURCE_ROLES) {
    push(
      kind,
      input.resourceRoles.has(kind),
      kind === "dress"
        ? "No dress is reserved. Check it is not at the cleaner and not booked elsewhere."
        : `No ${kind} is assigned.`,
      `${base}/team`,
    );
  }

  const contactOk = Boolean(input.client?.phone || input.client?.whatsapp || input.client?.email);
  push(
    "client_contact",
    contactOk,
    "We have no phone, WhatsApp or email for this client. If the crew cannot reach them at 06:00, the trip does not happen.",
    base,
  );

  push(
    "pickup",
    Boolean(input.pickup_location && input.pickup_time),
    input.pickup_location
      ? "The pickup time is missing."
      : "No pickup point is recorded. Name the exact door, not just the hotel.",
    `${base}/edit`,
  );

  push("itinerary", input.itineraryCount > 0, "The itinerary is empty. The crew has nothing to follow.", `${base}/itinerary`);

  push(
    "tickets",
    input.hasTicketCost || input.hasTicketDoc,
    "No tickets or permits are recorded. Interior and timed-entry tickets sell out — buy them the day before.",
    `${base}/costs`,
  );

  push(
    "supplier_confirmation",
    input.hasSupplierConfirmation,
    "No written supplier confirmation is attached. A booking that exists only as a phone call does not exist.",
    `${base}/documents`,
  );

  // A media folder is only meaningful once the shoot has happened. Before
  // that it is noise, and readiness that cries wolf gets ignored.
  const shootHappened = ["in_progress", "completed", "content_pending", "client_follow_up", "closed"].includes(input.status);
  if (req.media_folder && shootHappened) {
    checks.push({
      key: "media_folder",
      label: LABELS.media_folder,
      ok: input.hasMediaLink,
      weight: WEIGHTS.media_folder,
      blocker: input.hasMediaLink ? undefined : "No Google Drive folder is linked. The client has nothing to receive.",
      fixHref: `${base}/media`,
    });
  }

  push("pricing", input.sell_amount > 0, "No selling price is recorded, so this trip cannot be reported on.", `${base}/costs`);

  push(
    "blocking_tasks",
    input.openBlockingTasks === 0,
    input.openBlockingTasks === 1
      ? "One task that blocks readiness is still open."
      : `${input.openBlockingTasks} tasks that block readiness are still open.`,
    `${base}/tasks`,
  );

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const metWeight = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);
  const score = totalWeight ? Math.round((metWeight / totalWeight) * 100) : 100;

  const state: ReadinessState = score >= thresholds.green ? "green" : score >= thresholds.yellow ? "yellow" : "red";

  const startsAt = input.starts_at ? new Date(input.starts_at).getTime() : null;
  const hoursAway = startsAt ? (startsAt - now.getTime()) / 3_600_000 : Number.POSITIVE_INFINITY;
  const critical = state !== "green" && hoursAway >= 0 && hoursAway <= criticalHorizonHours;

  return { score, state, checks, blockers: checks.filter((c) => !c.ok), critical };
}

/**
 * Compute readiness for a set of trips in a fixed number of queries, and write
 * the cached score back so lists and dashboards never have to recompute it.
 */
export async function computeReadinessFor(tripIds: string[]): Promise<Map<string, Readiness>> {
  const result = new Map<string, Readiness>();
  if (!tripIds.length) return result;

  const db = osdb();
  const org = await getOrg();

  const [settingsRes, tripsRes, assignRes, itinRes, costRes, docRes, mediaRes, taskRes] = await Promise.all([
    db.from("os_settings").select("key, value").eq("org_id", org.id)
      .in("key", ["readiness.thresholds", "readiness.critical_horizon_hours"]),
    db.from("os_trips")
      .select(
        "id, ref, starts_at, trip_date, status, sell_amount, pickup_location, pickup_time, " +
        "readiness_score, readiness_state, " +
        "os_trip_types ( requirements ), os_clients ( phone, email, whatsapp )",
      )
      .in("id", tripIds),
    db.from("os_trip_assignments")
      .select("trip_id, role_key, employee_id, resource_id, status")
      .in("trip_id", tripIds)
      .in("status", ["assigned", "confirmed"]),
    db.from("os_itinerary_items").select("trip_id").in("trip_id", tripIds),
    db.from("os_trip_cost_lines").select("trip_id, category").in("trip_id", tripIds).in("category", ["ticket", "permit"]),
    db.from("os_documents").select("trip_id, kind").in("trip_id", tripIds).in("kind", ["ticket", "supplier_confirmation"]),
    db.from("os_media_links").select("trip_id").in("trip_id", tripIds),
    db.from("os_tasks").select("trip_id, status").in("trip_id", tripIds).eq("blocking", true)
      .in("status", ["todo", "in_progress", "blocked"]),
  ]);

  const settings = new Map((settingsRes.data ?? []).map((s) => [s.key as string, s.value]));
  const thresholds = (settings.get("readiness.thresholds") as { green: number; yellow: number }) ?? { green: 90, yellow: 60 };
  const horizon = Number(settings.get("readiness.critical_horizon_hours") ?? 48);

  const crewByTrip = new Map<string, Set<string>>();
  const resourceByTrip = new Map<string, Set<string>>();
  for (const a of assignRes.data ?? []) {
    const map = a.employee_id ? crewByTrip : resourceByTrip;
    const key = a.trip_id as string;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(a.role_key as string);
  }

  const countBy = <T extends { trip_id: string }>(rows: T[] | null) => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) m.set(r.trip_id, (m.get(r.trip_id) ?? 0) + 1);
    return m;
  };
  const itinCounts = countBy(itinRes.data as { trip_id: string }[] | null);
  const mediaCounts = countBy(mediaRes.data as { trip_id: string }[] | null);
  const blockingCounts = countBy(taskRes.data as { trip_id: string }[] | null);

  const ticketCosts = new Set((costRes.data ?? []).map((c) => c.trip_id as string));
  const ticketDocs = new Set((docRes.data ?? []).filter((d) => d.kind === "ticket").map((d) => d.trip_id as string));
  const supplierDocs = new Set(
    (docRes.data ?? []).filter((d) => d.kind === "supplier_confirmation").map((d) => d.trip_id as string),
  );

  type TripRow = {
    id: string; ref: string; starts_at: string | null; trip_date: string; status: string;
    sell_amount: number; pickup_location: string | null; pickup_time: string | null;
    os_trip_types: { requirements: Record<string, boolean> } | null;
    os_clients: { phone: string | null; email: string | null; whatsapp: string | null } | null;
  };

  const updates: { id: string; readiness_score: number; readiness_state: string; readiness_blockers: unknown; readiness_checked_at: string }[] = [];
  const cached = new Map(
    ((tripsRes.data ?? []) as unknown as { id: string; readiness_score?: number; readiness_state?: string }[])
      .map((t) => [t.id, { score: t.readiness_score, state: t.readiness_state }]),
  );

  for (const t of (tripsRes.data ?? []) as unknown as TripRow[]) {
    const readiness = evaluateReadiness(
      {
        id: t.id,
        ref: t.ref,
        starts_at: t.starts_at,
        trip_date: t.trip_date,
        status: t.status,
        sell_amount: Number(t.sell_amount ?? 0),
        pickup_location: t.pickup_location,
        pickup_time: t.pickup_time,
        requirements: t.os_trip_types?.requirements ?? {},
        client: t.os_clients,
        crewRoles: crewByTrip.get(t.id) ?? new Set(),
        resourceRoles: resourceByTrip.get(t.id) ?? new Set(),
        itineraryCount: itinCounts.get(t.id) ?? 0,
        hasTicketCost: ticketCosts.has(t.id),
        hasTicketDoc: ticketDocs.has(t.id),
        hasSupplierConfirmation: supplierDocs.has(t.id),
        hasMediaLink: (mediaCounts.get(t.id) ?? 0) > 0,
        openBlockingTasks: blockingCounts.get(t.id) ?? 0,
      },
      thresholds,
      horizon,
    );
    result.set(t.id, readiness);

    // Only write the cache back when it actually moved. A board of thirty
    // trips recomputes all thirty on every load; it should not also issue
    // thirty pointless updates.
    const previous = cached.get(t.id);
    if (previous?.score === readiness.score && previous?.state === readiness.state) continue;

    updates.push({
      id: t.id,
      readiness_score: readiness.score,
      readiness_state: readiness.state,
      readiness_blockers: readiness.blockers.map((b) => ({ key: b.key, label: b.label, blocker: b.blocker })),
      readiness_checked_at: new Date().toISOString(),
    });
  }

  // Write the cache back so trip lists can sort and filter on readiness
  // without recomputing. Failure here is not fatal — the value shown is still
  // correct, it just was not persisted.
  if (updates.length) {
    await Promise.all(
      updates.map((u) =>
        db.from("os_trips")
          .update({
            readiness_score: u.readiness_score,
            readiness_state: u.readiness_state,
            readiness_blockers: u.readiness_blockers,
            readiness_checked_at: u.readiness_checked_at,
          })
          .eq("id", u.id),
      ),
    );
  }

  return result;
}

export async function computeReadiness(tripId: string): Promise<Readiness | null> {
  const map = await computeReadinessFor([tripId]);
  return map.get(tripId) ?? null;
}

export const READINESS_LABEL: Record<ReadinessState, string> = {
  green: "Ready",
  yellow: "At risk",
  red: "Not ready",
};
