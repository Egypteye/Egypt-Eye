"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";
import { osdb, getOrg } from "../db";
import {
  calendarId,
  calendarPublishingConfigured,
  publishPending,
  reconcileCalendar,
  queueTripPublish,
} from "../calendar-sync";
import { checkCalendarAccess } from "../google/calendar";

// ---------------------------------------------------------------------------
// CALENDAR PUBLISHING — the manual controls
// ---------------------------------------------------------------------------
// Everything here is available to the hourly sweep too. These exist so that
// somebody setting the integration up for the first time is not told to wait
// an hour to find out whether they got the sharing permission right.
// ---------------------------------------------------------------------------

/** Proves the service account can actually write to the configured calendar. */
export async function testCalendarConnection(): Promise<ActionResult<{ summary: string }>> {
  return guarded("admin.integrations", async () => {
    const target = calendarId();
    if (!target) {
      return fail(
        "No calendar is configured",
        "Set GOOGLE_CALENDAR_ID to the calendar's ID, from its settings page in Google Calendar.",
      );
    }
    if (!calendarPublishingConfigured()) {
      return fail(
        "The Google service account is not configured",
        "Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, then redeploy.",
      );
    }

    const result = await checkCalendarAccess(target);
    if (!result.ok) return fail(result.reason, result.detail);
    return ok({ summary: result.summary }, `Connected to “${result.summary}”.`);
  });
}

/** Works the queue now rather than waiting for the sweep. */
export async function publishCalendarNow(): Promise<ActionResult<{ summary: string }>> {
  return guarded("admin.integrations", async (actor) => {
    if (!calendarPublishingConfigured()) {
      return fail("Google Calendar is not configured", "Nothing was published.");
    }

    const drift = await reconcileCalendar();
    const result = await publishPending(25);

    // Audit only, no activity line. os_activity hangs off a record — its
    // entity_id is a uuid — and an integration is not a record. The audit log
    // takes a null entity and a label, which is exactly this case.
    await logAudit(actor, {
      action: "calendar.publish",
      entityType: "integration",
      entityId: null,
      entityLabel: "Google Calendar",
      after: { ...result, queued: drift.queued },
    });

    const summary =
      `${result.created} created, ${result.updated} updated, ${result.deleted} removed, ` +
      `${result.unchanged} already in step` +
      (result.failed ? `, ${result.failed} failed` : "");

    revalidatePath("/os/admin/integrations");
    if (result.failed) return fail("Some trips did not publish", `${summary}. ${result.errors[0] ?? ""}`);
    return ok({ summary }, summary);
  });
}

/** Clears failed rows back to pending so the next run tries them again. */
export async function retryFailedCalendarPublishes(): Promise<ActionResult> {
  return guarded("admin.integrations", async (actor) => {
    const org = await getOrg();
    const { error, count } = await osdb()
      .from("os_calendar_links")
      .update({ state: "pending", attempts: 0, last_error: null }, { count: "exact" })
      .eq("org_id", org.id)
      .eq("state", "failed");
    if (error) throw error;

    await logAudit(actor, {
      action: "calendar.retry",
      entityType: "integration",
      entityId: null,
      entityLabel: "Google Calendar",
      after: { requeued: count ?? 0 },
    });

    revalidatePath("/os/admin/integrations");
    return ok(undefined, `${count ?? 0} queued to try again on the next run.`);
  });
}

/** Re-publishes one trip — the per-trip control on a trip page. */
export async function publishTripToCalendar(tripId: string): Promise<ActionResult> {
  return guarded("trips.edit", async () => {
    if (!calendarPublishingConfigured()) {
      return fail("Google Calendar is not configured", "Ask an administrator to connect it under Admin → Integrations.");
    }
    await queueTripPublish(tripId);
    const result = await publishPending(1);
    if (result.failed) return fail("That trip did not publish", result.errors[0]);
    return ok(undefined, result.created ? "Published to the calendar." : result.updated ? "Calendar event updated." : "Already in step.");
  });
}
