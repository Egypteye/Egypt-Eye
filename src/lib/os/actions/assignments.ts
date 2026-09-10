"use server";

import { revalidatePath } from "next/cache";
import { osdb, getOrg } from "../db";
import { record } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";
import { findConflicts } from "../conflicts";
import { onAssignmentCreated } from "../automation";
import { computeReadiness } from "../readiness";
import { reassignRoleTasks } from "../tasks";
import { getTripRecord } from "../trips";
import { notify, employeesWithRole } from "../notify";

// ---------------------------------------------------------------------------
// PUTTING PEOPLE AND THINGS ON TRIPS
// ---------------------------------------------------------------------------
// The conflict rules, restated where they are enforced:
//
//   * A HARD conflict (already confirmed elsewhere, on leave, in the workshop)
//     is refused outright. There is no override, because the override would be
//     a lie — the person genuinely cannot be in two places.
//
//   * A SOFT conflict (pencilled in elsewhere at 'assigned') is refused
//     UNLESS the caller supplies a written reason. That reason is stored on
//     the assignment, written to the audit log, and raised as an approval for
//     the operations manager. Nobody forces a conflict quietly.
// ---------------------------------------------------------------------------

export async function assignToTrip(input: {
  tripRef: string;
  roleKey: string;
  employeeId?: string | null;
  resourceId?: string | null;
  overrideReason?: string | null;
}): Promise<ActionResult<{ conflicts?: { severity: string; title: string; detail: string }[] }>> {
  return guarded("trips.assign", async (actor) => {
    const db = osdb();
    const org = await getOrg();

    const trip = await getTripRecord(actor, input.tripRef);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");
    if (!input.employeeId && !input.resourceId) return fail("Choose a person or a resource to assign");
    if (input.employeeId && input.resourceId) return fail("An assignment is either a person or a resource, not both");

    const window = { startsAt: trip.starts_at as string, endsAt: trip.ends_at as string };
    const subject = input.employeeId ? { employeeId: input.employeeId } : { resourceId: input.resourceId! };

    const conflicts = await findConflicts(subject, window, {
      excludeTripId: trip.id as string,
      locationId: trip.location_id as string | null,
    });

    const hard = conflicts.filter((c) => c.severity === "hard");
    if (hard.length) {
      return fail(hard[0].title, hard[0].detail);
    }

    const soft = conflicts.filter((c) => c.severity === "soft");
    if (soft.length && !input.overrideReason?.trim()) {
      return {
        ok: false,
        error: soft[0].title,
        detail: `${soft[0].detail} To do it anyway, give a reason — it will be recorded and sent to the operations manager for approval.`,
        blockers: conflicts.map((c) => ({ label: c.title, detail: c.detail })),
      };
    }

    // Name for the activity line and the notification.
    const label = input.employeeId
      ? (await db.from("os_employees").select("full_name").eq("id", input.employeeId).maybeSingle()).data?.full_name
      : (await db.from("os_resources").select("name").eq("id", input.resourceId!).maybeSingle()).data?.name;

    const { error } = await db.from("os_trip_assignments").insert({
      org_id: org.id,
      trip_id: trip.id,
      role_key: input.roleKey,
      employee_id: input.employeeId ?? null,
      resource_id: input.resourceId ?? null,
      status: "assigned",
      starts_at: trip.starts_at,
      ends_at: trip.ends_at,
      override_reason: input.overrideReason?.trim() || null,
      assigned_by: actor.employeeId,
    });
    if (error) throw error;

    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "assigned",
        summary: `${label ?? "Someone"} assigned as ${input.roleKey.replace("_", " ")}${input.overrideReason ? " (conflict overridden)" : ""}.`,
        meta: { role: input.roleKey, name: label, override: input.overrideReason ?? null } },
      { action: "assignment.create", entityLabel: `${input.tripRef} · ${input.roleKey}`,
        after: { role: input.roleKey, employee_id: input.employeeId, resource_id: input.resourceId, override_reason: input.overrideReason ?? null } },
    );

    if (input.employeeId) {
      await reassignRoleTasks(trip.id as string, input.roleKey, input.employeeId);
    }

    await onAssignmentCreated(trip.id as string, {
      employeeId: input.employeeId ?? null,
      roleKey: input.roleKey,
      name: (label as string) ?? "A resource",
    });

    // A forced conflict raises a real approval, not a silent flag.
    if (input.overrideReason?.trim()) {
      const { data: seq } = await db.rpc("nextval_os_approval_ref");
      const { data: rule } = await db.from("os_approval_rules")
        .select("id, escalate_after_hours").eq("org_id", org.id).eq("key", "assignment_override").maybeSingle();
      const { data: approval } = await db.from("os_approvals").insert({
        org_id: org.id,
        ref: `AP-${seq ?? Date.now().toString().slice(-4)}`,
        kind: "assignment_override",
        title: `Scheduling conflict forced on ${input.tripRef}`,
        detail: `${label} was assigned as ${input.roleKey.replace("_", " ")} despite: ${soft.map((c) => c.title).join("; ")}.\n\nReason given: ${input.overrideReason.trim()}`,
        trip_id: trip.id,
        status: "pending",
        requested_by: actor.employeeId,
        approver_role_key: "operations_manager",
        rule_id: rule?.id ?? null,
        due_at: new Date(Date.now() + Number(rule?.escalate_after_hours ?? 4) * 3_600_000).toISOString(),
      }).select("id, ref").single();

      if (approval) {
        await db.from("os_approval_events").insert({
          approval_id: approval.id, employee_id: actor.employeeId, action: "requested", note: input.overrideReason.trim(),
        });
        await notify({
          employeeIds: await employeesWithRole("operations_manager"),
          level: "warning",
          category: "approval",
          title: `Conflict forced on ${input.tripRef}`,
          body: `${actor.name} assigned ${label} despite an overlap. Reason: ${input.overrideReason.trim()}`,
          href: "/os/approvals",
          entityType: "approval",
          entityId: approval.id as string,
        });
      }
    }

    revalidatePath(`/os/trips/${input.tripRef}`);
    revalidatePath(`/os/trips/${input.tripRef}/team`);
    revalidatePath("/os/trips");
    revalidatePath("/os/calendar");

    return ok(
      { conflicts: conflicts.map((c) => ({ severity: c.severity, title: c.title, detail: c.detail })) },
      `${label} assigned as ${input.roleKey.replace("_", " ")}.`,
    );
  });
}

export async function setAssignmentStatus(
  assignmentId: string,
  status: "assigned" | "confirmed" | "declined" | "released",
  tripRef: string,
): Promise<ActionResult> {
  return guarded("trips.assign", async (actor) => {
    const db = osdb();
    const { data: assignment } = await db
      .from("os_trip_assignments")
      .select("id, trip_id, role_key, status, employee_id, resource_id, os_employees ( full_name ), os_resources ( name )")
      .eq("id", assignmentId).maybeSingle();
    if (!assignment) return fail("That assignment no longer exists");

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const label = (assignment as any).os_employees?.full_name ?? (assignment as any).os_resources?.name ?? "Someone";
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const patch: Record<string, unknown> = { status, responded_at: new Date().toISOString() };
    if (status === "released" || status === "declined") patch.released_at = new Date().toISOString();

    const { error } = await db.from("os_trip_assignments").update(patch).eq("id", assignmentId);
    if (error) throw error;   // the exclusion constraint speaks here on confirm

    if (status === "released" || status === "declined") {
      await reassignRoleTasks(assignment.trip_id as string, assignment.role_key as string, null);
    }

    await record(
      actor,
      { entityType: "trip", entityId: assignment.trip_id as string, tripId: assignment.trip_id as string,
        verb: `assignment_${status}`,
        summary: `${label} ${status === "confirmed" ? "confirmed" : status === "released" ? "released from" : status} ${assignment.role_key.replace("_", " ")}.` },
      { action: "assignment.status", entityLabel: `${tripRef} · ${assignment.role_key}`,
        before: { status: assignment.status }, after: { status } },
    );

    await computeReadiness(assignment.trip_id as string);
    revalidatePath(`/os/trips/${tripRef}`);
    revalidatePath(`/os/trips/${tripRef}/team`);
    revalidatePath("/os/calendar");
    return ok(undefined, `${label} ${status}.`);
  });
}

/**
 * Field status from a phone: on my way / arrived / started / completed / issue.
 * Deliberately available to anyone who can see the trip, because the person
 * reporting it is the person doing the work.
 */
export async function reportFieldStatus(
  tripRef: string,
  status: "on_my_way" | "arrived" | "started" | "completed" | "issue",
): Promise<ActionResult> {
  return guarded("trips.view", async (actor) => {
    const db = osdb();
    const trip = await getTripRecord(actor, tripRef);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");

    const { data: assignment } = await db
      .from("os_trip_assignments")
      .select("id, role_key")
      .eq("trip_id", trip.id)
      .eq("employee_id", actor.employeeId)
      .in("status", ["assigned", "confirmed"])
      .maybeSingle();
    if (!assignment) return fail("You are not on this trip", "Only assigned crew report field status.");

    await db.from("os_trip_assignments").update({
      field_status: status,
      field_status_at: new Date().toISOString(),
    }).eq("id", assignment.id);

    const phrase: Record<string, string> = {
      on_my_way: "is on the way", arrived: "has arrived", started: "has started",
      completed: "has finished", issue: "has reported a problem",
    };

    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "field_status",
        summary: `${actor.name} ${phrase[status]}.`, meta: { status, role: assignment.role_key } },
      { action: "assignment.field_status", entityLabel: `${tripRef} · ${actor.code}`, after: { status } },
    );

    const { data: channel } = await db.from("os_channels").select("id").eq("trip_id", trip.id).maybeSingle();
    if (channel) {
      await db.from("os_messages").insert({
        channel_id: channel.id, employee_id: null, kind: "system",
        body: `${actor.name} ${phrase[status]}.`,
      });
    }

    if (status === "issue") {
      await notify({
        employeeIds: [
          ...(await employeesWithRole("operations")),
          ...(await employeesWithRole("operations_manager")),
        ],
        level: "critical",
        category: "incident",
        title: `${actor.name} reported a problem on ${tripRef}`,
        body: "Open the trip and call them.",
        href: `/os/trips/${tripRef}`,
        entityType: "trip",
        entityId: trip.id as string,
      });
    }

    revalidatePath(`/os/trips/${tripRef}`);
    revalidatePath("/os/me");
    return ok(undefined, `Reported: ${phrase[status]}.`);
  });
}
