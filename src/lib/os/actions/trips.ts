"use server";

import { revalidatePath } from "next/cache";
import { osdb, getOrg, OsRuleError } from "../db";
import { record } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";
import { applyStatus } from "../status";
import { onTripCreated, onTripCompleted, notifyTripChanged } from "../automation";
import { computeReadiness } from "../readiness";
import { getTripRecord } from "../trips";
import { canReachTrip } from "../scope";

// ---------------------------------------------------------------------------
// TRIP MUTATIONS
// ---------------------------------------------------------------------------
// This is where the reservation desk's closed deal becomes an operation. Note
// what createTrip does beyond inserting a row: it allocates a collision-proof
// reference, generates the operational checklist from the trip type's
// template, opens the trip's conversation, and computes readiness. That whole
// chain is the difference between a booking record and an operating system.
// ---------------------------------------------------------------------------

export async function createTrip(input: {
  title: string;
  tripTypeId: string;
  clientId: string | null;
  tripDate: string;
  startTime: string | null;
  endTime: string | null;
  locationId: string | null;
  pickupLocation: string | null;
  pickupTime: string | null;
  dropoffLocation: string | null;
  guestsAdults: number;
  guestsChildren: number;
  source: string | null;
  sellAmount: number;
  currency: string;
  priority: string;
  specialRequests: string | null;
  notesInternal: string | null;
}): Promise<ActionResult<{ ref: string }>> {
  return guarded("trips.create", async (actor) => {
    const db = osdb();
    const org = await getOrg();

    if (!input.title.trim()) return fail("The trip needs a title");
    if (!input.tripDate) return fail("The trip needs a date");

    const { data: type } = await db
      .from("os_trip_types").select("id, unit_id, default_duration_minutes, name")
      .eq("id", input.tripTypeId).maybeSingle();
    if (!type) return fail("That service type no longer exists");

    const { data: seq } = await db.rpc("nextval_os_trip_ref");
    const ref = `EE-${seq ?? Date.now().toString().slice(-5)}`;

    const { data: trip, error } = await db.from("os_trips").insert({
      org_id: org.id,
      ref,
      title: input.title.trim(),
      trip_type_id: input.tripTypeId,
      unit_id: type.unit_id,
      client_id: input.clientId,
      status: "confirmed",
      priority: input.priority || "normal",
      trip_date: input.tripDate,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      duration_minutes: input.startTime && input.endTime ? null : type.default_duration_minutes,
      location_id: input.locationId,
      pickup_location: input.pickupLocation,
      pickup_time: input.pickupTime || null,
      dropoff_location: input.dropoffLocation,
      guests_adults: input.guestsAdults,
      guests_children: input.guestsChildren,
      source: input.source,
      currency: input.currency || "USD",
      sell_amount: input.sellAmount || 0,
      special_requests: input.specialRequests,
      notes_internal: input.notesInternal,
      created_by: actor.employeeId,
      confirmed_at: new Date().toISOString(),
    }).select("id, ref, title").single();

    if (error || !trip) throw error ?? new OsRuleError("The trip could not be created.");

    await db.from("os_trip_status_history").insert({
      trip_id: trip.id, from_status: null, to_status: "confirmed",
      employee_id: actor.employeeId, note: "Created from a confirmed booking.",
    });

    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "created",
        summary: `Trip created from a confirmed ${type.name} booking.` },
      { action: "trip.create", entityLabel: `${ref} — ${input.title}`, after: { ...input, ref } },
    );

    await onTripCreated(trip.id as string, actor.employeeId);

    revalidatePath("/os/trips");
    revalidatePath("/os");
    return ok({ ref }, `${ref} created. Its checklist and channel are ready.`);
  });
}

export async function updateTrip(
  ref: string,
  patch: Record<string, string | number | null>,
): Promise<ActionResult> {
  return guarded("trips.edit", async (actor) => {
    const before = await getTripRecord(actor, ref);
    if (!before) return fail("That trip does not exist, or you cannot reach it");
    if (!(await canReachTrip(actor, "trips.edit", { id: before.id as string, unit_id: before.unit_id as string | null }))) {
      return fail("You can view this trip but not change it");
    }

    const allowed = [
      "title", "trip_date", "start_time", "end_time", "location_id", "pickup_location", "pickup_time",
      "dropoff_location", "guests_adults", "guests_children", "source", "priority",
      "special_requests", "notes_internal", "notes_client", "emergency_notes", "client_id", "trip_type_id",
    ];
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (allowed.includes(key)) clean[key] = value === "" ? null : value;
    }
    if (!Object.keys(clean).length) return ok(undefined, "Nothing to change.");

    const { error } = await osdb().from("os_trips").update(clean).eq("id", before.id);
    if (error) throw error;

    const changed = Object.keys(clean).filter(
      (k) => JSON.stringify((before as Record<string, unknown>)[k]) !== JSON.stringify(clean[k]),
    );
    if (changed.length) {
      await record(
        actor,
        { entityType: "trip", entityId: before.id as string, tripId: before.id as string, verb: "updated",
          summary: `${changed.map(humanField).join(", ")} updated.` },
        { action: "trip.update", entityLabel: ref,
          before: Object.fromEntries(changed.map((k) => [k, (before as Record<string, unknown>)[k]])),
          after: Object.fromEntries(changed.map((k) => [k, clean[k]])) },
      );

      // A moved date or time is the change most likely to strand a driver at
      // the wrong hotel, so the crew hears about it specifically.
      if (changed.includes("trip_date") || changed.includes("start_time") || changed.includes("pickup_location") || changed.includes("pickup_time")) {
        await notifyTripChanged(
          before.id as string,
          `${ref} has been rescheduled`,
          `${clean.trip_date ?? before.trip_date}${clean.start_time ? `, ${String(clean.start_time).slice(0, 5)}` : ""}. Check your pickup details again.`,
          actor.employeeId,
        );
      }
    }

    await computeReadiness(before.id as string);
    revalidatePath(`/os/trips/${ref}`);
    revalidatePath("/os/trips");
    return ok(undefined, "Saved.");
  });
}

export async function changeTripStatus(
  ref: string,
  toStatus: string,
  options: { note?: string; force?: boolean } = {},
): Promise<ActionResult> {
  return guarded("trips.status", async (actor) => {
    const trip = await getTripRecord(actor, ref);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");

    // Forcing past a readiness gate is a management act, not an operations one.
    if (options.force && !actor.permissions["approvals.decide"]) {
      return fail(
        "Only someone who can approve may override the readiness gate",
        "Clear the blockers, or ask a manager to make the call.",
      );
    }

    try {
      const { from, to } = await applyStatus(trip.id as string, toStatus, actor.employeeId, options);
      await record(
        actor,
        { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "status_changed",
          summary: `Status moved from ${from} to ${to}${options.force ? " (readiness gate overridden)" : ""}.`,
          meta: { from, to, forced: Boolean(options.force) } },
        { action: "trip.status", entityLabel: ref, before: { status: from }, after: { status: to, note: options.note ?? null } },
      );

      if (["completed", "content_pending"].includes(toStatus)) {
        await onTripCompleted(trip.id as string, actor.employeeId);
      }
      await notifyTripChanged(trip.id as string, `${ref} is now ${to.replace("_", " ")}`, options.note ?? "", actor.employeeId);

      revalidatePath(`/os/trips/${ref}`);
      revalidatePath("/os/trips");
      revalidatePath("/os");
      return ok(undefined, `${ref} is now ${to.replace("_", " ")}.`);
    } catch (error) {
      if (error instanceof OsRuleError) {
        return fail(error.message, error.detail);
      }
      throw error;
    }
  });
}

export async function archiveTrip(ref: string, reason: string): Promise<ActionResult> {
  return guarded("trips.delete", async (actor) => {
    const trip = await getTripRecord(actor, ref);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");
    if (!reason.trim()) return fail("Archiving needs a reason", "It goes on the permanent record.");

    // Archive, never delete. A trip that ran is part of the company's history
    // whatever went wrong with it.
    await osdb().from("os_trips").update({ archived_at: new Date().toISOString() }).eq("id", trip.id);
    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "archived",
        summary: `Archived. ${reason}` },
      { action: "trip.archive", entityLabel: ref, before: { archived_at: null }, after: { archived_at: new Date().toISOString(), reason } },
    );
    revalidatePath("/os/trips");
    return ok(undefined, `${ref} archived.`);
  });
}

export async function addItineraryItem(
  ref: string,
  item: { title: string; startTime: string | null; endTime: string | null; kind: string; description: string | null; locationId: string | null },
): Promise<ActionResult> {
  return guarded("trips.edit", async (actor) => {
    const trip = await getTripRecord(actor, ref);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");
    if (!item.title.trim()) return fail("The itinerary item needs a title");

    const { data: last } = await osdb()
      .from("os_itinerary_items").select("seq").eq("trip_id", trip.id)
      .order("seq", { ascending: false }).limit(1).maybeSingle();

    await osdb().from("os_itinerary_items").insert({
      trip_id: trip.id,
      seq: Number(last?.seq ?? 0) + 1,
      title: item.title.trim(),
      start_time: item.startTime || null,
      end_time: item.endTime || null,
      kind: item.kind,
      description: item.description,
      location_id: item.locationId,
    });

    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "itinerary_added",
        summary: `Itinerary: ${item.title}` },
      { action: "trip.itinerary.add", entityLabel: ref, after: item },
    );
    await computeReadiness(trip.id as string);
    revalidatePath(`/os/trips/${ref}/itinerary`);
    return ok(undefined, "Added to the itinerary.");
  });
}

export async function removeItineraryItem(ref: string, itemId: string): Promise<ActionResult> {
  return guarded("trips.edit", async (actor) => {
    const trip = await getTripRecord(actor, ref);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");
    const { data: item } = await osdb().from("os_itinerary_items").select("title").eq("id", itemId).eq("trip_id", trip.id).maybeSingle();
    if (!item) return fail("That itinerary item no longer exists");

    await osdb().from("os_itinerary_items").delete().eq("id", itemId).eq("trip_id", trip.id);
    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "itinerary_removed",
        summary: `Removed from itinerary: ${item.title}` },
      { action: "trip.itinerary.remove", entityLabel: ref, before: item },
    );
    await computeReadiness(trip.id as string);
    revalidatePath(`/os/trips/${ref}/itinerary`);
    return ok(undefined, "Removed.");
  });
}

function humanField(key: string): string {
  return key.replace(/_/g, " ").replace(/\bid\b/, "").trim();
}
