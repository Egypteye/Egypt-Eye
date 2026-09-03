import "server-only";
import { osdb } from "./db";

// ---------------------------------------------------------------------------
// SCHEDULING CONFLICTS
// ---------------------------------------------------------------------------
// There are two layers, and they do different jobs.
//
//   HARD  — the database refuses it. Two CONFIRMED assignments for the same
//           person or the same vehicle/dress/camera cannot overlap, enforced
//           by an exclusion constraint (see 0018, section 8). That holds even
//           when two coordinators click at the same instant, which is the race
//           an application-level check always loses.
//
//   SOFT  — this module. Operations legitimately pencils the same photographer
//           into two candidate slots while a client decides, so overlapping
//           'assigned' rows are allowed — but they are reported loudly, and
//           the server action refuses to create one without a written reason,
//           which then raises an approval.
//
// Beyond overlap, this also checks the things a calendar alone cannot see:
// leave and maintenance, and whether a human could physically get from one
// location to the next in the gap between two trips.
// ---------------------------------------------------------------------------

export type ConflictSeverity = "hard" | "soft" | "warning";

export type Conflict = {
  severity: ConflictSeverity;
  kind: "overlap" | "unavailable" | "travel" | "maintenance" | "workload";
  title: string;
  detail: string;
  otherTripRef?: string;
  otherTripId?: string;
};

export type ConflictSubject =
  | { employeeId: string; resourceId?: never }
  | { resourceId: string; employeeId?: never };

/** Minutes of slack we insist on between two trips at different locations. */
const MIN_TURNAROUND_MINUTES = 45;

export async function findConflicts(
  subject: ConflictSubject,
  window: { startsAt: string; endsAt: string },
  options: { excludeTripId?: string; locationId?: string | null; locationName?: string | null } = {},
): Promise<Conflict[]> {
  const db = osdb();
  const conflicts: Conflict[] = [];
  const start = new Date(window.startsAt);
  const end = new Date(window.endsAt);

  // Look a day either side, so the travel check has neighbours to compare with.
  const from = new Date(start.getTime() - 24 * 3_600_000).toISOString();
  const to = new Date(end.getTime() + 24 * 3_600_000).toISOString();

  let assignmentQuery = db
    .from("os_trip_assignments")
    .select(
      "id, trip_id, status, starts_at, ends_at, role_key, " +
      "os_trips ( ref, title, trip_date, location_id, os_locations ( name, typical_drive_minutes ) )",
    )
    .in("status", ["assigned", "confirmed"])
    .gte("starts_at", from)
    .lte("starts_at", to);

  assignmentQuery = subject.employeeId
    ? assignmentQuery.eq("employee_id", subject.employeeId)
    : assignmentQuery.eq("resource_id", subject.resourceId!);

  const unavailQuery = subject.employeeId
    ? db.from("os_unavailability").select("starts_at, ends_at, reason, note").eq("employee_id", subject.employeeId)
    : db.from("os_unavailability").select("starts_at, ends_at, reason, note").eq("resource_id", subject.resourceId!);

  const [assignments, unavailability] = await Promise.all([
    assignmentQuery,
    unavailQuery.lte("starts_at", end.toISOString()).gte("ends_at", start.toISOString()),
  ]);

  type AssignRow = {
    id: string; trip_id: string; status: string; starts_at: string | null; ends_at: string | null; role_key: string;
    os_trips: { ref: string; title: string; trip_date: string; location_id: string | null;
      os_locations: { name: string; typical_drive_minutes: number | null } | null } | null;
  };

  for (const row of ((assignments.data ?? []) as unknown as AssignRow[])) {
    if (options.excludeTripId && row.trip_id === options.excludeTripId) continue;
    if (!row.starts_at || !row.ends_at) continue;
    const otherStart = new Date(row.starts_at);
    const otherEnd = new Date(row.ends_at);
    const overlaps = otherStart < end && start < otherEnd;

    if (overlaps) {
      conflicts.push({
        severity: row.status === "confirmed" ? "hard" : "soft",
        kind: "overlap",
        title:
          row.status === "confirmed"
            ? `Already confirmed on ${row.os_trips?.ref ?? "another trip"}`
            : `Already pencilled in on ${row.os_trips?.ref ?? "another trip"}`,
        detail:
          `${row.os_trips?.title ?? "Another trip"} runs ` +
          `${clock(otherStart)}–${clock(otherEnd)} and overlaps this window. ` +
          (row.status === "confirmed"
            ? "A confirmed assignment cannot be double-booked — release it first."
            : "This is allowed, but one of the two has to give before either is confirmed."),
        otherTripRef: row.os_trips?.ref,
        otherTripId: row.trip_id,
      });
      continue;
    }

    // No overlap, but can they physically make it? Compare the gap against the
    // drive time we know each location actually takes.
    const gapBefore = (start.getTime() - otherEnd.getTime()) / 60_000;
    const gapAfter = (otherStart.getTime() - end.getTime()) / 60_000;
    const gap = gapBefore >= 0 ? gapBefore : gapAfter >= 0 ? gapAfter : null;
    if (gap === null || gap > 6 * 60) continue;

    const sameLocation =
      options.locationId && row.os_trips?.location_id
        ? options.locationId === row.os_trips.location_id
        : false;
    if (sameLocation) continue;

    const drive = row.os_trips?.os_locations?.typical_drive_minutes ?? 60;
    const needed = drive + MIN_TURNAROUND_MINUTES;
    if (gap < needed) {
      conflicts.push({
        severity: "warning",
        kind: "travel",
        title: `Not enough time to get between ${row.os_trips?.os_locations?.name ?? "the other trip"} and this one`,
        detail:
          `There are ${Math.round(gap)} minutes between the two, and the drive alone is about ${drive} minutes. ` +
          `Allow at least ${needed} minutes, or move one of them.`,
        otherTripRef: row.os_trips?.ref,
        otherTripId: row.trip_id,
      });
    }
  }

  for (const u of unavailability.data ?? []) {
    conflicts.push({
      severity: "hard",
      kind: u.reason === "maintenance" || u.reason === "cleaning" ? "maintenance" : "unavailable",
      title: unavailabilityTitle(u.reason as string),
      detail:
        (u.note as string | null) ??
        `Marked ${(u.reason as string).replace("_", " ")} from ${clock(new Date(u.starts_at as string))} on ` +
        `${(u.starts_at as string).slice(0, 10)} to ${(u.ends_at as string).slice(0, 10)}.`,
    });
  }

  return conflicts;
}

function unavailabilityTitle(reason: string): string {
  switch (reason) {
    case "leave": return "On approved leave";
    case "sick": return "Off sick";
    case "holiday": return "Public holiday";
    case "maintenance": return "In maintenance";
    case "cleaning": return "At the cleaner";
    case "training": return "In training";
    default: return "Marked unavailable";
  }
}

function clock(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(date);
}

/**
 * Everyone who is free for a window, ordered by how good a fit they are.
 * This is the data the "smart assignment" screen renders, and the same shape
 * the AI layer will reason over later — the ranking is explainable on purpose,
 * so a human can always see why a name is at the top.
 */
export type Candidate = {
  employeeId: string;
  name: string;
  code: string;
  jobTitle: string | null;
  skills: string[];
  languages: string[];
  homeCity: string | null;
  dayRate: number | null;
  currency: string;
  conflicts: Conflict[];
  available: boolean;
  assignmentsThisWeek: number;
  avgRating: number | null;
  score: number;
  reasons: string[];
};

export async function findCandidates(
  roleKey: string,
  window: { startsAt: string; endsAt: string },
  options: {
    tripId?: string;
    unitId?: string | null;
    locationId?: string | null;
    languages?: string[];
    requiredSkills?: string[];
  } = {},
): Promise<Candidate[]> {
  const db = osdb();

  // Who does this job at all? Role membership is the honest filter — a driver
  // is someone the company has made a driver, not someone whose title happens
  // to contain the word.
  const { data: roleRows } = await db
    .from("os_employee_roles")
    .select("employee_id, os_roles!inner ( key )")
    .eq("os_roles.key", roleKey);

  const employeeIds = (roleRows ?? []).map((r) => r.employee_id as string);
  if (!employeeIds.length) return [];

  const [{ data: employees }, { data: workload }, { data: reviews }] = await Promise.all([
    db.from("os_employees")
      .select("id, code, full_name, job_title, skills, languages, home_city, day_rate_amount, day_rate_currency, primary_unit_id, status")
      .in("id", employeeIds)
      .is("archived_at", null)
      .in("status", ["active", "on_leave"]),
    db.from("os_v_employee_workload").select("employee_id, assignments_this_week").in("employee_id", employeeIds),
    db.from("os_performance_reviews").select("employee_id, rating").in("employee_id", employeeIds),
  ]);

  const workloadMap = new Map((workload ?? []).map((w) => [w.employee_id as string, Number(w.assignments_this_week ?? 0)]));
  const ratingSums = new Map<string, { total: number; count: number }>();
  for (const r of reviews ?? []) {
    const key = r.employee_id as string;
    if (!key) continue;
    const entry = ratingSums.get(key) ?? { total: 0, count: 0 };
    entry.total += Number(r.rating);
    entry.count += 1;
    ratingSums.set(key, entry);
  }

  const candidates = await Promise.all(
    (employees ?? []).map(async (e) => {
      const conflicts = await findConflicts(
        { employeeId: e.id as string },
        window,
        { excludeTripId: options.tripId, locationId: options.locationId },
      );
      const hard = conflicts.filter((c) => c.severity === "hard");
      const soft = conflicts.filter((c) => c.severity === "soft");
      const warn = conflicts.filter((c) => c.severity === "warning");
      const load = workloadMap.get(e.id as string) ?? 0;
      const rating = ratingSums.get(e.id as string);
      const avgRating = rating && rating.count ? Math.round((rating.total / rating.count) * 10) / 10 : null;

      const skills = (e.skills as string[]) ?? [];
      const languages = (e.languages as string[]) ?? [];
      const reasons: string[] = [];
      let score = 100;

      if (hard.length) { score -= 1000; reasons.push(hard[0].title); }
      if (soft.length) { score -= 40; reasons.push("Pencilled in elsewhere at the same time"); }
      if (warn.length) { score -= 15; reasons.push(warn[0].title); }

      const matchedLanguages = (options.languages ?? []).filter((l) => languages.includes(l));
      if (options.languages?.length) {
        if (matchedLanguages.length) { score += 20; reasons.push(`Speaks ${matchedLanguages.join(", ")}`); }
        else { score -= 25; reasons.push(`Does not speak ${options.languages.join(" or ")}`); }
      }

      const matchedSkills = (options.requiredSkills ?? []).filter((s) => skills.includes(s));
      if (options.requiredSkills?.length) {
        if (matchedSkills.length === options.requiredSkills.length) { score += 20; reasons.push(`Has ${matchedSkills.join(", ")}`); }
        else if (matchedSkills.length) { score += 8; reasons.push(`Partial skill match`); }
        else { score -= 20; reasons.push("Missing the skills this trip needs"); }
      }

      if (options.unitId && e.primary_unit_id === options.unitId) { score += 10; reasons.push("Works in this business unit"); }
      if (avgRating !== null) { score += (avgRating - 3) * 8; if (avgRating >= 4.5) reasons.push(`Rated ${avgRating} across past trips`); }

      // Spread the work. Somebody with five assignments this week is a worse
      // choice than an equally capable colleague with one, even if they are
      // technically free.
      score -= load * 6;
      if (load >= 5) reasons.push(`Already on ${load} trips this week`);

      return {
        employeeId: e.id as string,
        name: e.full_name as string,
        code: e.code as string,
        jobTitle: (e.job_title as string) ?? null,
        skills,
        languages,
        homeCity: (e.home_city as string) ?? null,
        dayRate: e.day_rate_amount ? Number(e.day_rate_amount) : null,
        currency: (e.day_rate_currency as string) ?? "USD",
        conflicts,
        available: hard.length === 0,
        assignmentsThisWeek: load,
        avgRating,
        score: Math.round(score),
        reasons,
      } satisfies Candidate;
    }),
  );

  return candidates.sort((a, b) => b.score - a.score);
}

/** The same, for vehicles, dresses and equipment. */
export type ResourceCandidate = {
  resourceId: string;
  code: string;
  name: string;
  kind: string;
  capacity: number | null;
  status: string;
  condition: string;
  costRate: number | null;
  currency: string;
  conflicts: Conflict[];
  available: boolean;
  score: number;
  reasons: string[];
};

export async function findResourceCandidates(
  kind: string,
  window: { startsAt: string; endsAt: string },
  options: { tripId?: string; minCapacity?: number; unitId?: string | null } = {},
): Promise<ResourceCandidate[]> {
  const db = osdb();
  const { data: resources } = await db
    .from("os_resources")
    .select("id, code, name, kind, capacity, status, condition, cost_rate_amount, cost_rate_currency, unit_id")
    .eq("kind", kind)
    .is("archived_at", null)
    .neq("status", "retired");

  const results = await Promise.all(
    (resources ?? []).map(async (r) => {
      const conflicts = await findConflicts({ resourceId: r.id as string }, window, { excludeTripId: options.tripId });
      const hard = conflicts.filter((c) => c.severity === "hard");
      const reasons: string[] = [];
      let score = 100;

      if (r.status === "maintenance" || r.status === "cleaning") {
        score -= 1000;
        reasons.push(r.status === "maintenance" ? "In the workshop" : "At the cleaner");
      }
      if (hard.length) { score -= 1000; reasons.push(hard[0].title); }
      if (r.condition === "needs_repair" || r.condition === "damaged") { score -= 500; reasons.push("Needs repair"); }
      if (r.condition === "excellent") { score += 10; reasons.push("In excellent condition"); }

      const capacity = r.capacity ? Number(r.capacity) : null;
      if (options.minCapacity && capacity !== null) {
        if (capacity < options.minCapacity) { score -= 1000; reasons.push(`Seats ${capacity}, the party is ${options.minCapacity}`); }
        else {
          // Prefer the smallest vehicle that fits — a 12-seat van for two
          // people costs more and drives worse.
          score -= (capacity - options.minCapacity) * 3;
          reasons.push(`Seats ${capacity}`);
        }
      }
      if (options.unitId && r.unit_id === options.unitId) score += 5;

      const blocked = hard.length > 0 || r.status === "maintenance" || r.status === "cleaning" ||
        r.condition === "needs_repair" || r.condition === "damaged";

      return {
        resourceId: r.id as string,
        code: r.code as string,
        name: r.name as string,
        kind: r.kind as string,
        capacity,
        status: r.status as string,
        condition: r.condition as string,
        costRate: r.cost_rate_amount ? Number(r.cost_rate_amount) : null,
        currency: (r.cost_rate_currency as string) ?? "USD",
        conflicts,
        available: !blocked,
        score: Math.round(score),
        reasons,
      } satisfies ResourceCandidate;
    }),
  );

  return results.sort((a, b) => b.score - a.score);
}
