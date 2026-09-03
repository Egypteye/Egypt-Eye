"use server";

import { revalidatePath } from "next/cache";
import { osdb, getOrg } from "../db";
import { record, logActivity } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";
import { computeReadiness } from "../readiness";
import { notify, employeesWithRole, markRead } from "../notify";
import { getTripRecord } from "../trips";
import { todayInCairo } from "../dates";

// ---------------------------------------------------------------------------
// TASKS
// ---------------------------------------------------------------------------

export async function setTaskStatus(taskId: string, status: string): Promise<ActionResult> {
  return guarded("tasks.edit", async (actor) => {
    const db = osdb();
    const { data: task } = await db
      .from("os_tasks")
      .select("id, title, status, started_at, trip_id, owner_employee_id, blocking, os_trips ( ref )")
      .eq("id", taskId).maybeSingle();
    if (!task) return fail("That task no longer exists");

    // 'own' scope means you may only close your own work, or work on a trip
    // you are on. Checked here rather than trusted from the page.
    if (actor.permissions["tasks.edit"] === "own" && task.owner_employee_id !== actor.employeeId) {
      const { data: mine } = await db
        .from("os_trip_assignments").select("id")
        .eq("trip_id", task.trip_id).eq("employee_id", actor.employeeId).maybeSingle();
      if (!mine) return fail("That task belongs to someone else");
    }

    const patch: Record<string, unknown> = { status };
    if (status === "done") { patch.completed_at = new Date().toISOString(); patch.completed_by = actor.employeeId; }
    if (status === "in_progress" && !task.started_at) patch.started_at = new Date().toISOString();
    if (status !== "done") { patch.completed_at = null; patch.completed_by = null; }

    await db.from("os_tasks").update(patch).eq("id", taskId);

    await record(
      actor,
      { entityType: "task", entityId: taskId, tripId: (task.trip_id as string) ?? null, verb: "task_status",
        summary: `${task.title} → ${status.replace("_", " ")}` },
      { action: "task.status", entityLabel: task.title, before: { status: task.status }, after: { status } },
    );

    if (task.blocking && task.trip_id) await computeReadiness(task.trip_id as string);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const ref = (task as any).os_trips?.ref;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (ref) { revalidatePath(`/os/trips/${ref}/tasks`); revalidatePath(`/os/trips/${ref}`); }
    revalidatePath("/os/tasks");
    revalidatePath("/os/me");
    return ok(undefined, status === "done" ? "Done." : `Marked ${status.replace("_", " ")}.`);
  });
}

export async function createTask(input: {
  title: string;
  description?: string | null;
  priority: string;
  dueAt: string | null;
  ownerEmployeeId: string | null;
  tripRef?: string | null;
  blocking?: boolean;
}): Promise<ActionResult> {
  return guarded("tasks.create", async (actor) => {
    if (!input.title.trim()) return fail("The task needs a title");
    const db = osdb();
    const org = await getOrg();

    let tripId: string | null = null;
    let unitId: string | null = null;
    if (input.tripRef) {
      const trip = await getTripRecord(actor, input.tripRef);
      if (!trip) return fail("That trip does not exist, or you cannot reach it");
      tripId = trip.id as string;
      unitId = (trip.unit_id as string) ?? null;
    }

    const { data: created, error } = await db.from("os_tasks").insert({
      org_id: org.id,
      title: input.title.trim(),
      description: input.description ?? null,
      status: "todo",
      priority: input.priority,
      owner_employee_id: input.ownerEmployeeId,
      entity_type: tripId ? "trip" : "general",
      entity_id: tripId,
      trip_id: tripId,
      unit_id: unitId,
      due_at: input.dueAt,
      blocking: Boolean(input.blocking),
      created_by: actor.employeeId,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      { entityType: "task", entityId: created.id as string, tripId, verb: "task_created", summary: `Task created: ${input.title}` },
      { action: "task.create", entityLabel: input.title, after: { ...input } },
    );

    if (input.ownerEmployeeId && input.ownerEmployeeId !== actor.employeeId) {
      await notify({
        employeeIds: [input.ownerEmployeeId],
        level: input.priority === "critical" ? "critical" : "info",
        category: "task",
        title: `${actor.displayName} gave you a task`,
        body: input.title,
        href: input.tripRef ? `/os/trips/${input.tripRef}/tasks` : "/os/tasks",
        entityType: "task",
        entityId: created.id as string,
      });
    }
    if (input.blocking && tripId) await computeReadiness(tripId);

    if (input.tripRef) revalidatePath(`/os/trips/${input.tripRef}/tasks`);
    revalidatePath("/os/tasks");
    return ok(undefined, "Task created.");
  });
}

export async function assignTask(taskId: string, employeeId: string | null): Promise<ActionResult> {
  return guarded("tasks.assign", async (actor) => {
    const db = osdb();
    const { data: task } = await db.from("os_tasks").select("id, title, owner_employee_id, trip_id, os_trips ( ref )").eq("id", taskId).maybeSingle();
    if (!task) return fail("That task no longer exists");

    await db.from("os_tasks").update({ owner_employee_id: employeeId }).eq("id", taskId);
    await record(
      actor,
      { entityType: "task", entityId: taskId, tripId: (task.trip_id as string) ?? null, verb: "task_assigned",
        summary: `${task.title} reassigned.` },
      { action: "task.assign", entityLabel: task.title, before: { owner: task.owner_employee_id }, after: { owner: employeeId } },
    );
    if (employeeId) {
      await notify({
        employeeIds: [employeeId], level: "info", category: "task",
        title: "A task was assigned to you", body: task.title as string,
        href: "/os/tasks", entityType: "task", entityId: taskId,
      });
    }
    revalidatePath("/os/tasks");
    return ok(undefined, "Reassigned.");
  });
}

// ---------------------------------------------------------------------------
// APPROVALS
// ---------------------------------------------------------------------------

export async function requestApproval(input: {
  kind: string;
  title: string;
  detail: string;
  amount?: number | null;
  currency?: string;
  tripRef?: string | null;
}): Promise<ActionResult> {
  return guarded("approvals.request", async (actor) => {
    if (!input.title.trim()) return fail("The request needs a title");
    if (!input.detail.trim()) return fail("Say what you are asking for and why", "The person deciding has only what you write here.");

    const db = osdb();
    const org = await getOrg();

    let tripId: string | null = null;
    if (input.tripRef) {
      const trip = await getTripRecord(actor, input.tripRef);
      if (!trip) return fail("That trip does not exist, or you cannot reach it");
      tripId = trip.id as string;
    }

    const { data: rule } = await db.from("os_approval_rules")
      .select("id, approver_role_key, escalate_after_hours")
      .eq("org_id", org.id).eq("kind", input.kind).eq("active", true).limit(1).maybeSingle();

    const { data: seq } = await db.rpc("nextval_os_approval_ref");
    const approverRole = rule?.approver_role_key ?? "management";

    const { data: created, error } = await db.from("os_approvals").insert({
      org_id: org.id,
      ref: `AP-${seq ?? Date.now().toString().slice(-4)}`,
      kind: input.kind,
      title: input.title.trim(),
      detail: input.detail.trim(),
      trip_id: tripId,
      amount: input.amount ?? null,
      currency: input.currency ?? "USD",
      status: "pending",
      requested_by: actor.employeeId,
      approver_role_key: approverRole,
      rule_id: rule?.id ?? null,
      due_at: new Date(Date.now() + Number(rule?.escalate_after_hours ?? 24) * 3_600_000).toISOString(),
    }).select("id, ref").single();
    if (error) throw error;

    await db.from("os_approval_events").insert({
      approval_id: created.id, employee_id: actor.employeeId, action: "requested", note: input.detail.trim(),
    });

    await record(
      actor,
      { entityType: "approval", entityId: created.id as string, tripId, verb: "approval_requested",
        summary: `${actor.name} requested approval: ${input.title}` },
      { action: "approval.request", entityLabel: created.ref as string, after: { ...input } },
    );

    await notify({
      employeeIds: await employeesWithRole(approverRole),
      level: "warning",
      category: "approval",
      title: `Approval needed: ${input.title}`,
      body: `${actor.name} — ${input.detail.slice(0, 160)}`,
      href: "/os/approvals",
      entityType: "approval",
      entityId: created.id as string,
    });

    revalidatePath("/os/approvals");
    if (input.tripRef) revalidatePath(`/os/trips/${input.tripRef}`);
    return ok(undefined, `${created.ref} raised with ${approverRole.replace("_", " ")}.`);
  });
}

export async function decideApproval(
  approvalId: string,
  decision: "approved" | "rejected" | "changes_requested",
  note: string,
): Promise<ActionResult> {
  return guarded("approvals.decide", async (actor) => {
    const db = osdb();
    const { data: approval } = await db
      .from("os_approvals").select("id, ref, title, status, requested_by, trip_id, approver_role_key").eq("id", approvalId).maybeSingle();
    if (!approval) return fail("That approval no longer exists");
    if (approval.status !== "pending") return fail("That approval has already been decided");

    // You cannot approve your own request, whatever your role. This is the one
    // separation-of-duties rule the system enforces absolutely.
    if (approval.requested_by === actor.employeeId) {
      return fail("You cannot decide your own request", "Someone else with approval rights has to look at it.");
    }
    if (decision === "rejected" && !note.trim()) {
      return fail("A rejection needs a reason", "The person who asked has to know what to do differently.");
    }

    await db.from("os_approvals").update({
      status: decision,
      decided_by: actor.employeeId,
      decided_at: new Date().toISOString(),
      decision_note: note.trim() || null,
    }).eq("id", approvalId);

    await db.from("os_approval_events").insert({
      approval_id: approvalId, employee_id: actor.employeeId,
      action: decision === "changes_requested" ? "changes_requested" : decision,
      note: note.trim() || null,
    });

    await record(
      actor,
      { entityType: "approval", entityId: approvalId, tripId: (approval.trip_id as string) ?? null,
        verb: `approval_${decision}`, summary: `${actor.name} ${decision.replace("_", " ")}: ${approval.title}` },
      { action: "approval.decide", entityLabel: approval.ref as string,
        before: { status: "pending" }, after: { status: decision, note } },
    );

    if (approval.requested_by) {
      await notify({
        employeeIds: [approval.requested_by as string],
        level: decision === "approved" ? "info" : "warning",
        category: "approval",
        title: `${approval.ref}: ${decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : "changes requested"}`,
        body: note.trim() || approval.title as string,
        href: "/os/approvals",
        entityType: "approval",
        entityId: approvalId,
      });
    }

    revalidatePath("/os/approvals");
    revalidatePath("/os");
    return ok(undefined, `${approval.ref} ${decision.replace("_", " ")}.`);
  });
}

// ---------------------------------------------------------------------------
// INCIDENTS
// ---------------------------------------------------------------------------

export async function reportIncident(input: {
  title: string;
  description: string;
  severity: string;
  category: string;
  tripRef?: string | null;
  clientImpact: string;
  subjectEmployeeId?: string | null;
  subjectSupplierId?: string | null;
  subjectResourceId?: string | null;
}): Promise<ActionResult> {
  return guarded("incidents.create", async (actor) => {
    if (!input.title.trim()) return fail("The incident needs a title");
    const db = osdb();
    const org = await getOrg();

    let tripId: string | null = null;
    if (input.tripRef) {
      const trip = await getTripRecord(actor, input.tripRef);
      if (!trip) return fail("That trip does not exist, or you cannot reach it");
      tripId = trip.id as string;
    }

    const { data: seq } = await db.rpc("nextval_os_incident_ref");
    const { data: created, error } = await db.from("os_incidents").insert({
      org_id: org.id,
      ref: `INC-${String(seq ?? Date.now()).slice(-4).padStart(4, "0")}`,
      trip_id: tripId,
      severity: input.severity,
      category: input.category,
      title: input.title.trim(),
      description: input.description.trim() || null,
      reported_by: actor.employeeId,
      owner_employee_id: null,
      subject_employee_id: input.subjectEmployeeId ?? null,
      subject_supplier_id: input.subjectSupplierId ?? null,
      subject_resource_id: input.subjectResourceId ?? null,
      status: "open",
      client_impact: input.clientImpact,
    }).select("id, ref").single();
    if (error) throw error;

    await record(
      actor,
      { entityType: "incident", entityId: created.id as string, tripId, verb: "incident_reported",
        summary: `${input.severity} incident reported: ${input.title}` },
      { action: "incident.create", entityLabel: created.ref as string, after: { ...input } },
    );

    await notify({
      employeeIds: [
        ...(await employeesWithRole("operations_manager")),
        ...(input.severity === "critical" ? await employeesWithRole("management") : []),
      ],
      level: input.severity === "critical" || input.severity === "high" ? "critical" : "warning",
      category: "incident",
      title: `${created.ref}: ${input.title}`,
      body: input.description.slice(0, 200),
      href: "/os/incidents",
      entityType: "incident",
      entityId: created.id as string,
    });

    revalidatePath("/os/incidents");
    if (input.tripRef) revalidatePath(`/os/trips/${input.tripRef}`);
    return ok(undefined, `${created.ref} logged.`);
  });
}

export async function updateIncident(
  incidentId: string,
  patch: { status?: string; ownerEmployeeId?: string | null; actionsTaken?: string; resolution?: string; costAmount?: number | null },
): Promise<ActionResult> {
  return guarded("incidents.edit", async (actor) => {
    const db = osdb();
    const { data: incident } = await db.from("os_incidents").select("id, ref, status, trip_id, title").eq("id", incidentId).maybeSingle();
    if (!incident) return fail("That incident no longer exists");

    if (patch.status && ["resolved", "closed"].includes(patch.status) && !patch.resolution?.trim()) {
      return fail("Closing an incident needs a resolution", "What was actually done about it, so the next person knows.");
    }

    const update: Record<string, unknown> = {};
    if (patch.status) update.status = patch.status;
    if (patch.ownerEmployeeId !== undefined) update.owner_employee_id = patch.ownerEmployeeId;
    if (patch.actionsTaken !== undefined) update.actions_taken = patch.actionsTaken;
    if (patch.resolution !== undefined) update.resolution = patch.resolution;
    if (patch.costAmount !== undefined) update.cost_amount = patch.costAmount;
    if (patch.status && ["resolved", "closed"].includes(patch.status)) update.resolved_at = new Date().toISOString();
    update.updated_at = new Date().toISOString();

    await db.from("os_incidents").update(update).eq("id", incidentId);
    await record(
      actor,
      { entityType: "incident", entityId: incidentId, tripId: (incident.trip_id as string) ?? null,
        verb: "incident_updated", summary: `${incident.ref} ${patch.status ?? "updated"}.` },
      { action: "incident.update", entityLabel: incident.ref as string, before: { status: incident.status }, after: update },
    );
    revalidatePath("/os/incidents");
    return ok(undefined, "Saved.");
  });
}

// ---------------------------------------------------------------------------
// ATTENDANCE
// ---------------------------------------------------------------------------

export async function checkIn(): Promise<ActionResult> {
  return guarded("attendance.self", async (actor) => {
    const db = osdb();
    const org = await getOrg();
    const today = todayInCairo();

    const { data: existing } = await db
      .from("os_attendance").select("id, check_in_at").eq("employee_id", actor.employeeId).eq("work_date", today).maybeSingle();
    if (existing?.check_in_at) return fail("You already checked in today", `At ${new Date(existing.check_in_at as string).toLocaleTimeString("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit" })}.`);

    const { data: setting } = await db.from("os_settings").select("value").eq("org_id", org.id).eq("key", "operations.day_start").maybeSingle();
    const dayStart = (setting?.value as string) ?? "06:00";
    const { data: lateSetting } = await db.from("os_settings").select("value").eq("org_id", org.id).eq("key", "operations.late_threshold_minutes").maybeSingle();
    const lateAfter = Number(lateSetting?.value ?? 15);

    const now = new Date();
    const nowMinutes = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", hour12: false }).format(now)) * 60 +
      Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", minute: "2-digit" }).format(now));
    const [sh, sm] = String(dayStart).split(":").map(Number);
    const late = nowMinutes > sh * 60 + sm + lateAfter;

    if (existing) {
      await db.from("os_attendance").update({ check_in_at: now.toISOString(), status: late ? "late" : "present", check_in_source: "web" }).eq("id", existing.id);
    } else {
      await db.from("os_attendance").insert({
        org_id: org.id, employee_id: actor.employeeId, work_date: today,
        check_in_at: now.toISOString(), status: late ? "late" : "present", check_in_source: "web",
      });
    }

    await logActivity(actor, {
      entityType: "employee", entityId: actor.employeeId, verb: "checked_in",
      summary: `${actor.name} checked in${late ? " (late)" : ""}.`,
    });

    revalidatePath("/os/me");
    revalidatePath("/os/attendance");
    return ok(undefined, late ? "Checked in, marked late." : "Checked in.");
  });
}

export async function checkOut(): Promise<ActionResult> {
  return guarded("attendance.self", async (actor) => {
    const db = osdb();
    const today = todayInCairo();
    const { data: existing } = await db
      .from("os_attendance").select("id, check_in_at, check_out_at").eq("employee_id", actor.employeeId).eq("work_date", today).maybeSingle();
    if (!existing?.check_in_at) return fail("You have not checked in today");
    if (existing.check_out_at) return fail("You already checked out today");

    const now = new Date();
    const minutes = Math.round((now.getTime() - new Date(existing.check_in_at as string).getTime()) / 60_000);
    await db.from("os_attendance").update({ check_out_at: now.toISOString(), minutes, check_out_source: "web" }).eq("id", existing.id);

    revalidatePath("/os/me");
    revalidatePath("/os/attendance");
    return ok(undefined, `Checked out. ${Math.floor(minutes / 60)}h ${minutes % 60}m today.`);
  });
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS AND CHAT
// ---------------------------------------------------------------------------

export async function markNotificationsRead(ids?: string[]): Promise<ActionResult> {
  return guarded("attendance.self", async (actor) => {
    await markRead(actor.employeeId, ids);
    revalidatePath("/os/notifications");
    revalidatePath("/os");
    return ok();
  });
}

export async function postMessage(channelId: string, body: string): Promise<ActionResult> {
  return guarded("chat.post", async (actor) => {
    if (!body.trim()) return fail("Write something first");
    const db = osdb();

    const { data: member } = await db
      .from("os_channel_members").select("channel_id").eq("channel_id", channelId).eq("employee_id", actor.employeeId).maybeSingle();
    if (!member) {
      // Joining an open team channel by posting in it is fine; a trip channel
      // you are not on is not, and the membership check is what says so.
      const { data: channel } = await db.from("os_channels").select("kind, trip_id").eq("id", channelId).maybeSingle();
      if (!channel) return fail("That channel no longer exists");
      if (channel.kind === "trip" || channel.kind === "direct") {
        return fail("You are not in this conversation");
      }
      await db.from("os_channel_members").insert({ channel_id: channelId, employee_id: actor.employeeId });
    }

    await db.from("os_messages").insert({ channel_id: channelId, employee_id: actor.employeeId, body: body.trim() });
    await db.from("os_channel_members").update({ last_read_at: new Date().toISOString() })
      .eq("channel_id", channelId).eq("employee_id", actor.employeeId);

    revalidatePath("/os/chat");
    return ok(undefined, "Sent.");
  });
}
