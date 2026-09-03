import "server-only";
import { osdb, getOrg, OsRuleError } from "./db";
import { computeReadiness } from "./readiness";

// ---------------------------------------------------------------------------
// THE TRIP LIFECYCLE
// ---------------------------------------------------------------------------
// Statuses are configuration (os_trip_statuses), so an administrator can add
// "Awaiting Permit" without a developer. What is NOT configuration is the
// shape of the graph: which moves are legal, and which ones have a gate in
// front of them. That lives here, keyed on the status CATEGORY rather than the
// key, so a renamed or added status still behaves sensibly.
//
// The gate that matters: a trip cannot be marked Ready while its readiness
// score says it is not. That is the difference between a status field and a
// status engine — the first records an opinion, the second refuses to record a
// false one.
// ---------------------------------------------------------------------------

export type TripStatus = {
  key: string;
  label: string;
  category: string;
  color: string;
  sortOrder: number;
  requiresReadiness: boolean;
  isTerminal: boolean;
};

export async function getStatuses(): Promise<TripStatus[]> {
  const org = await getOrg();
  const { data } = await osdb()
    .from("os_trip_statuses")
    .select("key, label, category, color, sort_order, requires_readiness, is_terminal")
    .eq("org_id", org.id)
    .eq("active", true)
    .order("sort_order");
  return (data ?? []).map((s) => ({
    key: s.key as string,
    label: s.label as string,
    category: s.category as string,
    color: s.color as string,
    sortOrder: s.sort_order as number,
    requiresReadiness: s.requires_readiness as boolean,
    isTerminal: s.is_terminal as boolean,
  }));
}

// Which categories may follow which. Read as: from a status in category X, you
// may move to a status in any of these categories.
const ALLOWED: Record<string, string[]> = {
  draft:     ["draft", "planning", "cancelled"],
  planning:  ["planning", "ready", "active", "cancelled", "draft"],
  ready:     ["ready", "planning", "active", "cancelled"],
  active:    ["active", "post", "cancelled"],
  post:      ["post", "closed", "active"],
  closed:    ["closed", "post"],
  cancelled: ["cancelled", "planning"],
};

export type TransitionCheck = {
  allowed: boolean;
  reason?: string;
  /** Blockers that stand between the trip and the status it is trying to reach. */
  blockers?: { label: string; detail: string }[];
  /** True when a permission-holder may force it anyway, with a reason. */
  overridable?: boolean;
};

export async function checkTransition(
  tripId: string,
  fromKey: string,
  toKey: string,
): Promise<TransitionCheck> {
  const statuses = await getStatuses();
  const from = statuses.find((s) => s.key === fromKey);
  const to = statuses.find((s) => s.key === toKey);

  if (!to) return { allowed: false, reason: `"${toKey}" is not a status this organization uses.` };
  if (fromKey === toKey) return { allowed: false, reason: "The trip is already at that status." };

  const fromCategory = from?.category ?? "draft";
  if (!ALLOWED[fromCategory]?.includes(to.category)) {
    return {
      allowed: false,
      reason:
        `A trip cannot go straight from ${from?.label ?? fromKey} to ${to.label}. ` +
        `Move it through ${describeAllowed(fromCategory, statuses)} first.`,
    };
  }

  if (to.requiresReadiness) {
    const readiness = await computeReadiness(tripId);
    if (readiness && readiness.state !== "green") {
      return {
        allowed: false,
        reason: `This trip is ${readiness.score}% ready. It cannot be marked ${to.label} until the blockers below are cleared.`,
        blockers: readiness.blockers.map((b) => ({ label: b.label, detail: b.blocker ?? "" })),
        overridable: true,
      };
    }
  }

  return { allowed: true };
}

function describeAllowed(category: string, statuses: TripStatus[]): string {
  const next = ALLOWED[category] ?? [];
  const labels = statuses
    .filter((s) => next.includes(s.category) && s.category !== category)
    .map((s) => s.label);
  return labels.length ? labels.slice(0, 3).join(", ") : "another status";
}

/**
 * Perform the move. Callers must have already checked the permission; this
 * enforces the business rule, writes the history row, and returns what changed.
 */
export async function applyStatus(
  tripId: string,
  toKey: string,
  actorEmployeeId: string | null,
  options: { note?: string; force?: boolean } = {},
): Promise<{ from: string; to: string }> {
  const db = osdb();
  const { data: trip } = await db
    .from("os_trips")
    .select("id, ref, status, readiness_score")
    .eq("id", tripId)
    .single();
  if (!trip) throw new OsRuleError("That trip no longer exists.");

  const from = trip.status as string;
  const check = await checkTransition(tripId, from, toKey);
  if (!check.allowed && !(options.force && check.overridable)) {
    throw new OsRuleError(check.reason ?? "That status change is not allowed.",
      check.blockers?.map((b) => `${b.label}: ${b.detail}`).join(" "));
  }

  const statuses = await getStatuses();
  const to = statuses.find((s) => s.key === toKey)!;

  const patch: Record<string, unknown> = { status: toKey };
  if (to.category === "active") patch.confirmed_at = patch.confirmed_at ?? new Date().toISOString();
  if (to.category === "post" && !patch.completed_at) patch.completed_at = new Date().toISOString();
  if (to.category === "cancelled") {
    patch.cancelled_at = new Date().toISOString();
    patch.cancel_reason = options.note ?? null;
  }
  if (toKey === "confirmed") patch.confirmed_at = new Date().toISOString();

  await db.from("os_trips").update(patch).eq("id", tripId);

  const readiness = await computeReadiness(tripId);
  await db.from("os_trip_status_history").insert({
    trip_id: tripId,
    from_status: from,
    to_status: toKey,
    employee_id: actorEmployeeId,
    note: options.force ? `FORCED. ${options.note ?? ""}`.trim() : options.note ?? null,
    readiness_score: readiness?.score ?? null,
  });

  return { from, to: toKey };
}
