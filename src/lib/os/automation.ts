import "server-only";
import { osdb, getOrg } from "./db";
import { notify, employeesWithRole, employeesOnTrip } from "./notify";
import { generateTripTasks } from "./tasks";
import { computeReadinessFor } from "./readiness";
import { todayInCairo, addDays, formatTime } from "./dates";

// ---------------------------------------------------------------------------
// THE AUTOMATION LAYER
// ---------------------------------------------------------------------------
// Two ways an automation fires:
//
//   * ON A MUTATION — the code that changed something calls the matching
//     function here, in the same request. Creating a trip generates its
//     checklist and opens its channel; assigning someone notifies them.
//
//   * ON A SCHEDULE — runSweep() is called by /api/os/cron, which a Vercel
//     cron (or any scheduler) hits hourly. It does the time-based work:
//     re-checking readiness inside the 24-hour horizon, chasing missing media,
//     escalating stalled approvals.
//
// Every run is written to os_automation_runs, so "did the 24-hour check
// actually run last night" has an answer instead of an assumption.
//
// Automations registered in os_automations with implemented = false are NOT
// executed and are not silently skipped either — the Admin Center shows them
// with the integration they are waiting on. There is no toggle that pretends.
// ---------------------------------------------------------------------------

async function markRun(key: string, status: "ok" | "skipped" | "error", detail?: string, entity?: { type: string; id: string }) {
  const org = await getOrg();
  const db = osdb();
  const { data: automation } = await db
    .from("os_automations").select("id, run_count").eq("org_id", org.id).eq("key", key).maybeSingle();
  if (!automation) return;
  await Promise.all([
    db.from("os_automation_runs").insert({
      automation_id: automation.id,
      trigger_event: key,
      entity_type: entity?.type ?? null,
      entity_id: entity?.id ?? null,
      status,
      detail: detail ?? null,
    }),
    db.from("os_automations").update({
      last_run_at: new Date().toISOString(),
      run_count: Number(automation.run_count ?? 0) + 1,
    }).eq("id", automation.id),
  ]);
}

/** Everything that should happen the moment a trip exists. */
export async function onTripCreated(tripId: string, actorEmployeeId: string | null): Promise<void> {
  const db = osdb();
  const org = await getOrg();

  const { data: trip } = await db
    .from("os_trips").select("id, ref, title, unit_id, created_by").eq("id", tripId).maybeSingle();
  if (!trip) return;

  const created = await generateTripTasks(tripId, actorEmployeeId);
  await markRun("trip_created_tasks", "ok", `${created} tasks generated.`, { type: "trip", id: tripId });

  // The trip's own conversation, so decisions about it never live in a
  // personal chat that leaves with the employee.
  const { data: existing } = await db.from("os_channels").select("id").eq("trip_id", tripId).maybeSingle();
  if (!existing) {
    const { data: channel } = await db.from("os_channels").insert({
      org_id: org.id,
      kind: "trip",
      name: `${trip.ref} — ${trip.title}`,
      trip_id: tripId,
      unit_id: trip.unit_id,
      created_by: actorEmployeeId ?? trip.created_by,
    }).select("id").single();

    if (channel) {
      const owner = actorEmployeeId ?? (trip.created_by as string | null);
      if (owner) await db.from("os_channel_members").insert({ channel_id: channel.id, employee_id: owner, role: "owner" });
      await db.from("os_messages").insert({
        channel_id: channel.id,
        employee_id: null,
        kind: "system",
        body: `Trip ${trip.ref} created. Everything decided about this trip belongs here.`,
      });
    }
    await markRun("trip_created_channel", "ok", undefined, { type: "trip", id: tripId });
  }

  await computeReadinessFor([tripId]);
  await markRun("readiness_recompute", "ok", undefined, { type: "trip", id: tripId });
}

/** Tell the person, tell the crew, and keep readiness honest. */
export async function onAssignmentCreated(
  tripId: string,
  assignment: { employeeId: string | null; roleKey: string; name: string },
): Promise<void> {
  const db = osdb();

  const { data: trip } = await db
    .from("os_trips").select("ref, title, trip_date, start_time, pickup_location, pickup_time").eq("id", tripId).maybeSingle();
  if (!trip) return;

  if (assignment.employeeId) {
    await notify({
      employeeIds: [assignment.employeeId],
      level: "info",
      category: "assignment",
      title: `You are on ${trip.ref} as ${assignment.roleKey.replace("_", " ")}`,
      body: `${trip.title} — ${trip.trip_date}${trip.start_time ? `, ${formatTime(trip.start_time as string)}` : ""}` +
        `${trip.pickup_location ? `. Pickup: ${trip.pickup_location}` : ""}`,
      href: `/os/trips/${trip.ref}`,
      entityType: "trip",
      entityId: tripId,
    });
    // Put them in the trip conversation, and say so in it.
    const { data: channel } = await db.from("os_channels").select("id").eq("trip_id", tripId).maybeSingle();
    if (channel) {
      await db.from("os_channel_members").upsert(
        { channel_id: channel.id, employee_id: assignment.employeeId },
        { onConflict: "channel_id,employee_id", ignoreDuplicates: true },
      );
    }
  }

  const { data: channel } = await db.from("os_channels").select("id").eq("trip_id", tripId).maybeSingle();
  if (channel) {
    await db.from("os_messages").insert({
      channel_id: channel.id,
      employee_id: null,
      kind: "system",
      body: `${assignment.name} assigned as ${assignment.roleKey.replace("_", " ")}.`,
    });
  }

  await computeReadinessFor([tripId]);
  await markRun("assignment_notify", "ok", undefined, { type: "trip", id: tripId });
}

/** A completed shoot opens its content job and its post-production tasks. */
export async function onTripCompleted(tripId: string, actorEmployeeId: string | null): Promise<void> {
  const db = osdb();
  const org = await getOrg();

  const { data: trip } = await db
    .from("os_trips")
    .select("id, ref, title, os_trip_types ( requirements, key )")
    .eq("id", tripId)
    .maybeSingle();
  if (!trip) return;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const producesContent = Boolean((trip as any).os_trip_types?.requirements?.media_folder);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (!producesContent) {
    await markRun("trip_completed_content", "skipped", "This trip type does not produce client media.", { type: "trip", id: tripId });
    return;
  }

  const { data: existing } = await db.from("os_content_jobs").select("id").eq("trip_id", tripId).maybeSingle();
  if (existing) return;

  const { data: photographer } = await db
    .from("os_trip_assignments").select("employee_id")
    .eq("trip_id", tripId).in("role_key", ["photographer", "videographer"])
    .not("employee_id", "is", null).limit(1).maybeSingle();

  const editors = await employeesWithRole("editor");

  const target = Number(
    ((await db.from("os_settings").select("value").eq("org_id", org.id).eq("key", "content.delivery_target_days").maybeSingle()).data?.value) ?? 7,
  );
  const promised = new Date();
  promised.setDate(promised.getDate() + target);

  await db.from("os_content_jobs").insert({
    org_id: org.id,
    trip_id: tripId,
    stage: "upload_pending",
    photographer_employee_id: photographer?.employee_id ?? null,
    editor_employee_id: editors[0] ?? null,
    promised_at: promised.toISOString(),
  });

  const recipients = [photographer?.employee_id as string, ...editors].filter(Boolean);
  await notify({
    employeeIds: recipients,
    level: "info",
    category: "content",
    title: `${trip.ref} is ready for upload`,
    body: `${trip.title} finished. Raw files are due the same day, and the client is promised delivery in ${target} working days.`,
    href: `/os/content`,
    entityType: "trip",
    entityId: tripId,
    dedupeKey: `content-open:${tripId}`,
  });

  await generateTripTasks(tripId, actorEmployeeId);
  await markRun("trip_completed_content", "ok", undefined, { type: "trip", id: tripId });
}

// ---------------------------------------------------------------------------
// THE SCHEDULED SWEEP
// ---------------------------------------------------------------------------

export type SweepResult = {
  readinessChecked: number;
  criticalRaised: number;
  mediaChased: number;
  approvalsEscalated: number;
  ranAt: string;
};

export async function runSweep(): Promise<SweepResult> {
  const db = osdb();
  const org = await getOrg();
  const today = todayInCairo();

  // 1. Re-check every trip inside the horizon and shout about what is not ready.
  const { data: upcoming } = await db
    .from("os_trips")
    .select("id, ref, title, trip_date, start_time, unit_id, status")
    .eq("org_id", org.id)
    .is("archived_at", null)
    .gte("trip_date", today)
    .lte("trip_date", addDays(today, 2))
    .not("status", "in", '("cancelled","closed")');

  const tripIds = (upcoming ?? []).map((t) => t.id as string);
  const readiness = await computeReadinessFor(tripIds);

  const opsOwners = Array.from(
    new Set([...(await employeesWithRole("operations")), ...(await employeesWithRole("operations_manager"))]),
  );

  let criticalRaised = 0;
  for (const trip of upcoming ?? []) {
    const r = readiness.get(trip.id as string);
    if (!r || r.state === "green") continue;

    const worst = r.blockers.slice().sort((a, b) => b.weight - a.weight)[0];
    await notify({
      employeeIds: opsOwners,
      level: r.critical ? "critical" : "warning",
      category: "readiness",
      title: `${trip.ref} is ${r.score}% ready — ${trip.trip_date === today ? "today" : trip.trip_date === addDays(today, 1) ? "tomorrow" : trip.trip_date}`,
      body: worst?.blocker ?? `${r.blockers.length} things still missing.`,
      href: `/os/trips/${trip.ref}`,
      entityType: "trip",
      entityId: trip.id as string,
      // One line per trip per day, however many times the sweep runs.
      dedupeKey: `readiness:${trip.id}:${today}`,
    });
    if (r.critical) criticalRaised += 1;
  }
  await markRun("readiness_sweep_24h", "ok", `${tripIds.length} trips checked, ${criticalRaised} critical.`);

  // 2. Chase completed shoots with no media folder.
  const { data: stalled } = await db
    .from("os_content_jobs")
    .select("id, trip_id, stage, photographer_employee_id, promised_at, os_trips ( ref, title, trip_date )")
    .eq("org_id", org.id)
    .eq("stage", "upload_pending")
    .lt("created_at", new Date(Date.now() - 24 * 3_600_000).toISOString());

  let mediaChased = 0;
  const contentTeam = await employeesWithRole("content_team");
  for (const job of stalled ?? []) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const trip = (job as any).os_trips;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    await notify({
      employeeIds: [job.photographer_employee_id as string, ...contentTeam].filter(Boolean),
      level: "warning",
      category: "content",
      title: `${trip?.ref ?? "A shoot"} still has no uploaded media`,
      body: `${trip?.title ?? ""} was shot on ${trip?.trip_date ?? "a previous day"} and the raw folder is still empty. The client is waiting.`,
      href: `/os/content`,
      entityType: "trip",
      entityId: job.trip_id as string,
      dedupeKey: `media-chase:${job.trip_id}:${today}`,
    });
    mediaChased += 1;
  }
  await markRun("media_missing_alert", "ok", `${mediaChased} chased.`);

  // 3. Escalate approvals that have sat past their rule's window.
  const { data: pending } = await db
    .from("os_approvals")
    .select("id, ref, title, due_at, escalated_at, requested_by, os_approval_rules ( escalate_to_role_key )")
    .eq("org_id", org.id)
    .eq("status", "pending")
    .lt("due_at", new Date().toISOString())
    .is("escalated_at", null);

  let approvalsEscalated = 0;
  for (const approval of pending ?? []) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const escalateTo = (approval as any).os_approval_rules?.escalate_to_role_key as string | undefined;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const recipients = escalateTo ? await employeesWithRole(escalateTo) : await employeesWithRole("management");
    await Promise.all([
      db.from("os_approvals").update({ escalated_at: new Date().toISOString() }).eq("id", approval.id),
      db.from("os_approval_events").insert({
        approval_id: approval.id,
        action: "escalated",
        note: `No decision within the window. Escalated to ${escalateTo ?? "management"}.`,
      }),
      notify({
        employeeIds: recipients,
        level: "critical",
        category: "approval",
        title: `Escalated: ${approval.title}`,
        body: `${approval.ref} has been waiting past its deadline and needs a decision.`,
        href: `/os/approvals`,
        entityType: "approval",
        entityId: approval.id as string,
        dedupeKey: `approval-escalated:${approval.id}`,
      }),
    ]);
    approvalsEscalated += 1;
  }
  await markRun("approval_escalation", "ok", `${approvalsEscalated} escalated.`);

  return {
    readinessChecked: tripIds.length,
    criticalRaised,
    mediaChased,
    approvalsEscalated,
    ranAt: new Date().toISOString(),
  };
}

/** Notify the crew that something on their trip moved. */
export async function notifyTripChanged(
  tripId: string,
  title: string,
  body: string,
  excludeEmployeeId?: string | null,
): Promise<void> {
  const { data: trip } = await osdb().from("os_trips").select("ref").eq("id", tripId).maybeSingle();
  const crew = (await employeesOnTrip(tripId)).filter((id) => id !== excludeEmployeeId);
  if (!crew.length) return;
  await notify({
    employeeIds: crew,
    level: "info",
    category: "trip",
    title,
    body,
    href: trip ? `/os/trips/${trip.ref}` : "/os/trips",
    entityType: "trip",
    entityId: tripId,
  });
}
