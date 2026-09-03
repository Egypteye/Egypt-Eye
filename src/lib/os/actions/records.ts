"use server";

import { revalidatePath } from "next/cache";
import { osdb, getOrg } from "../db";
import { record } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";
import { computeReadiness } from "../readiness";
import { getTripRecord } from "../trips";
import { supersedeRate } from "../pricing";
import { notify, employeesWithRole } from "../notify";

// ---------------------------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------------------------
// createClient deliberately looks for an existing person first. A returning
// guest six months later must land on the same record, with their whole
// history, rather than becoming "John Smith (2)". Matching is on email, then
// phone — both normalised — and the caller is told when a match was reused.
// ---------------------------------------------------------------------------

export async function createClient(input: {
  fullName: string;
  kind: "individual" | "agency";
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  nationality?: string | null;
  country?: string | null;
  language?: string | null;
  instagram?: string | null;
  source?: string | null;
  vip?: boolean;
  notes?: string | null;
  preferences?: string | null;
}): Promise<ActionResult<{ id: string; reused: boolean }>> {
  return guarded("clients.create", async (actor) => {
    if (!input.fullName.trim()) return fail("The client needs a name");
    const db = osdb();
    const org = await getOrg();

    const email = input.email?.trim().toLowerCase() || null;
    const phone = normalisePhone(input.phone);

    if (email || phone) {
      let q = db.from("os_clients").select("id, full_name, email, phone").eq("org_id", org.id).is("archived_at", null);
      const clauses: string[] = [];
      if (email) clauses.push(`email.ilike.${email}`);
      if (phone) clauses.push(`phone.ilike.%${phone.slice(-9)}%`);
      q = q.or(clauses.join(","));
      const { data: matches } = await q.limit(1);
      if (matches?.length) {
        return ok<{ id: string; reused: boolean }>(
          { id: matches[0].id as string, reused: true },
          `${matches[0].full_name} is already in the system — opening their existing record rather than creating a second one.`,
        );
      }
    }

    const { data: last } = await db.from("os_clients").select("code").eq("org_id", org.id)
      .order("code", { ascending: false }).limit(1).maybeSingle();
    const nextNumber = last?.code ? Number(String(last.code).replace(/\D/g, "")) + 1 : 1;
    const code = `CL-${String(nextNumber).padStart(4, "0")}`;

    const { data: created, error } = await db.from("os_clients").insert({
      org_id: org.id,
      code,
      kind: input.kind,
      full_name: input.fullName.trim(),
      company_name: input.companyName ?? null,
      email,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? null,
      nationality: input.nationality ?? null,
      country: input.country ?? null,
      language: input.language ?? null,
      instagram: input.instagram ?? null,
      source: input.source ?? null,
      vip: Boolean(input.vip),
      notes: input.notes ?? null,
      preferences: input.preferences ?? null,
      created_by: actor.employeeId,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      { entityType: "client", entityId: created.id as string, verb: "created", summary: `Client record created for ${input.fullName}.` },
      { action: "client.create", entityLabel: `${code} — ${input.fullName}`, after: { ...input, code } },
    );

    revalidatePath("/os/clients");
    return ok<{ id: string; reused: boolean }>({ id: created.id as string, reused: false }, `${input.fullName} added as ${code}.`);
  });
}

export async function updateClient(clientId: string, patch: Record<string, string | boolean | null>): Promise<ActionResult> {
  return guarded("clients.edit", async (actor) => {
    const db = osdb();
    const { data: before } = await db.from("os_clients").select("*").eq("id", clientId).maybeSingle();
    if (!before) return fail("That client no longer exists");

    const allowed = [
      "full_name", "company_name", "email", "phone", "whatsapp", "nationality", "country", "city",
      "language", "gender", "instagram", "tiktok", "facebook", "youtube", "website", "source",
      "vip", "preferences", "dietary_notes", "notes", "payment_terms",
    ];
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) if (allowed.includes(k)) clean[k] = v === "" ? null : v;
    if (!Object.keys(clean).length) return ok(undefined, "Nothing to change.");

    await db.from("os_clients").update(clean).eq("id", clientId);
    const changed = Object.keys(clean).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(clean[k]));
    if (changed.length) {
      await record(
        actor,
        { entityType: "client", entityId: clientId, verb: "updated", summary: `${changed.map((c) => c.replace(/_/g, " ")).join(", ")} updated.` },
        { action: "client.update", entityLabel: before.full_name as string,
          before: Object.fromEntries(changed.map((k) => [k, before[k]])),
          after: Object.fromEntries(changed.map((k) => [k, clean[k]])) },
      );
    }
    revalidatePath(`/os/clients/${clientId}`);
    revalidatePath("/os/clients");
    return ok(undefined, "Saved.");
  });
}

export async function toggleTag(entityType: string, entityId: string, tagId: string): Promise<ActionResult> {
  const permission = entityType === "client" ? "clients.edit" : "trips.edit";
  return guarded(permission, async (actor) => {
    const db = osdb();
    const { data: existing } = await db
      .from("os_taggings").select("tag_id").eq("tag_id", tagId).eq("entity_type", entityType).eq("entity_id", entityId).maybeSingle();
    const { data: tag } = await db.from("os_tags").select("label").eq("id", tagId).maybeSingle();

    if (existing) {
      await db.from("os_taggings").delete().eq("tag_id", tagId).eq("entity_type", entityType).eq("entity_id", entityId);
    } else {
      await db.from("os_taggings").insert({ tag_id: tagId, entity_type: entityType, entity_id: entityId, tagged_by: actor.employeeId });
    }

    await record(
      actor,
      { entityType, entityId, verb: existing ? "untagged" : "tagged", summary: `${existing ? "Removed" : "Added"} tag: ${tag?.label ?? ""}` },
      { action: "tag.toggle", entityLabel: tag?.label as string, after: { added: !existing } },
    );
    revalidatePath(`/os/${entityType}s/${entityId}`);
    return ok(undefined, existing ? "Tag removed." : "Tag added.");
  });
}

// ---------------------------------------------------------------------------
// COSTS AND PAYMENTS
// ---------------------------------------------------------------------------

export async function addCostLine(input: {
  tripRef: string;
  kind: "estimated" | "actual";
  category: string;
  label: string;
  qty: number;
  unitAmount: number;
  currency: string;
  supplierId?: string | null;
  priceItemId?: string | null;
  rateId?: string | null;
  incurredOn?: string | null;
  notes?: string | null;
}): Promise<ActionResult> {
  return guarded("finance.edit", async (actor) => {
    const db = osdb();
    const org = await getOrg();
    const trip = await getTripRecord(actor, input.tripRef);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");
    if (!input.label.trim()) return fail("The cost line needs a label");

    const amount = Math.round(input.qty * input.unitAmount * 100) / 100;

    // Convert into the reporting currency using the rate in force on the day
    // the cost was incurred, and store both. Never re-derived later.
    let fxRateValue = 1;
    let baseAmount = amount;
    if (input.currency !== org.baseCurrency) {
      const asOf = input.incurredOn ?? (trip.trip_date as string);
      const { data: fx } = await db.from("os_fx_rates").select("rate")
        .eq("base_currency", input.currency).eq("quote_currency", org.baseCurrency)
        .lte("as_of", asOf).order("as_of", { ascending: false }).limit(1).maybeSingle();
      if (!fx) {
        return fail(
          `No exchange rate on file for ${input.currency} to ${org.baseCurrency}`,
          `Add one dated on or before ${asOf} under Admin → Currencies. The system will not guess a rate, because a guessed rate silently corrupts every report that touches this trip.`,
        );
      }
      fxRateValue = Number(fx.rate);
      baseAmount = Math.round(amount * fxRateValue * 100) / 100;
    }

    // An unplanned actual cost above the threshold needs approval before it is
    // committed, so it is recorded but the approval is raised alongside.
    const { data: thresholdSetting } = await db.from("os_settings").select("value")
      .eq("org_id", org.id).eq("key", "approvals.extra_cost_threshold_usd").maybeSingle();
    const threshold = Number(thresholdSetting?.value ?? 150);

    const { error } = await db.from("os_trip_cost_lines").insert({
      org_id: org.id,
      trip_id: trip.id,
      kind: input.kind,
      category: input.category,
      label: input.label.trim(),
      price_item_id: input.priceItemId ?? null,
      rate_id: input.rateId ?? null,
      supplier_id: input.supplierId ?? null,
      qty: input.qty,
      unit_amount: input.unitAmount,
      amount,
      currency: input.currency,
      fx_rate: fxRateValue,
      base_amount: baseAmount,
      incurred_on: input.kind === "actual" ? (input.incurredOn ?? (trip.trip_date as string)) : null,
      notes: input.notes ?? null,
      created_by: actor.employeeId,
    });
    if (error) throw error;

    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "cost_added",
        summary: `${input.kind === "actual" ? "Actual" : "Estimated"} cost: ${input.label} — ${input.currency} ${amount.toFixed(2)}` },
      { action: "cost.add", entityLabel: input.tripRef, after: { ...input, amount, base_amount: baseAmount } },
    );

    if (input.kind === "actual" && baseAmount > threshold) {
      await notify({
        employeeIds: await employeesWithRole("operations_manager"),
        level: "warning",
        category: "approval",
        title: `Unplanned cost on ${input.tripRef}`,
        body: `${input.label} — ${input.currency} ${amount.toFixed(2)}, above the ${org.baseCurrency} ${threshold} threshold. Raise an approval if this was not already agreed.`,
        href: `/os/trips/${input.tripRef}/costs`,
        entityType: "trip",
        entityId: trip.id as string,
        dedupeKey: `cost-threshold:${trip.id}:${input.label}`,
      });
    }

    await computeReadiness(trip.id as string);
    revalidatePath(`/os/trips/${input.tripRef}/costs`);
    revalidatePath(`/os/trips/${input.tripRef}`);
    return ok(undefined, "Cost recorded.");
  });
}

export async function setTripPrice(tripRef: string, sellAmount: number, currency: string): Promise<ActionResult> {
  return guarded("trips.financials", async (actor) => {
    const trip = await getTripRecord(actor, tripRef);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");
    if (sellAmount < 0) return fail("A selling price cannot be negative");

    await osdb().from("os_trips").update({ sell_amount: sellAmount, currency }).eq("id", trip.id);
    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "price_set",
        summary: `Selling price set to ${currency} ${sellAmount.toFixed(2)}.` },
      { action: "trip.price", entityLabel: tripRef,
        before: { sell_amount: trip.sell_amount, currency: trip.currency }, after: { sell_amount: sellAmount, currency } },
    );
    await computeReadiness(trip.id as string);
    revalidatePath(`/os/trips/${tripRef}/costs`);
    return ok(undefined, "Price saved.");
  });
}

export async function recordPayment(input: {
  tripRef: string;
  amount: number;
  currency: string;
  method: string;
  reference?: string | null;
  paidOn: string;
}): Promise<ActionResult> {
  return guarded("finance.edit", async (actor) => {
    const db = osdb();
    const org = await getOrg();
    const trip = await getTripRecord(actor, input.tripRef);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");
    if (input.amount <= 0) return fail("A payment must be more than zero");

    let fx = 1;
    let base = input.amount;
    if (input.currency !== org.baseCurrency) {
      const { data: rate } = await db.from("os_fx_rates").select("rate")
        .eq("base_currency", input.currency).eq("quote_currency", org.baseCurrency)
        .lte("as_of", input.paidOn).order("as_of", { ascending: false }).limit(1).maybeSingle();
      if (!rate) return fail(`No exchange rate on file for ${input.currency} on ${input.paidOn}`, "Add one under Admin → Currencies first.");
      fx = Number(rate.rate);
      base = Math.round(input.amount * fx * 100) / 100;
    }

    await db.from("os_payments").insert({
      org_id: org.id,
      trip_id: trip.id,
      client_id: trip.client_id,
      direction: "in",
      method: input.method,
      amount: input.amount,
      currency: input.currency,
      fx_rate: fx,
      base_amount: base,
      status: "received",
      reference: input.reference ?? null,
      paid_on: input.paidOn,
      recorded_by: actor.employeeId,
    });

    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "payment_recorded",
        summary: `Payment received: ${input.currency} ${input.amount.toFixed(2)} by ${input.method.replace("_", " ")}.` },
      { action: "payment.record", entityLabel: input.tripRef, after: { ...input, base_amount: base } },
    );
    revalidatePath(`/os/trips/${input.tripRef}/costs`);
    revalidatePath("/os/finance");
    return ok(undefined, "Payment recorded.");
  });
}

// ---------------------------------------------------------------------------
// MEDIA, DOCUMENTS AND THE CONTENT PIPELINE
// ---------------------------------------------------------------------------

export async function addMediaLink(input: {
  tripRef: string;
  kind: string;
  title: string;
  url: string;
  visibility: string;
  itemCount?: number | null;
}): Promise<ActionResult> {
  return guarded("media.manage", async (actor) => {
    const db = osdb();
    const org = await getOrg();
    const trip = await getTripRecord(actor, input.tripRef);
    if (!trip) return fail("That trip does not exist, or you cannot reach it");

    let url: URL;
    try { url = new URL(input.url.trim()); } catch { return fail("That does not look like a link", "Paste the full URL, starting with https://"); }
    if (url.protocol !== "https:") return fail("Media links must be https");

    const provider = url.hostname.includes("google") ? "google_drive"
      : url.hostname.includes("dropbox") ? "dropbox"
      : url.hostname.includes("wetransfer") ? "wetransfer"
      : url.hostname.includes("youtube") || url.hostname.includes("youtu.be") ? "youtube"
      : url.hostname.includes("vimeo") ? "vimeo" : "other";

    await db.from("os_media_links").insert({
      org_id: org.id,
      trip_id: trip.id,
      client_id: trip.client_id,
      kind: input.kind,
      title: input.title.trim() || `${input.tripRef} — ${input.kind.replace("_", " ")}`,
      url: url.toString(),
      provider,
      visibility: input.visibility,
      item_count: input.itemCount ?? null,
      added_by: actor.employeeId,
    });

    await record(
      actor,
      { entityType: "trip", entityId: trip.id as string, tripId: trip.id as string, verb: "media_added",
        summary: `${input.kind.replace("_", " ")} folder linked.` },
      { action: "media.add", entityLabel: input.tripRef, after: { kind: input.kind, url: url.toString(), provider } },
    );

    await computeReadiness(trip.id as string);
    revalidatePath(`/os/trips/${input.tripRef}/media`);
    revalidatePath("/os/content");
    return ok(undefined, "Link added. Verify it opens from outside our Google account before sending it to a client.");
  });
}

export async function verifyMediaLink(mediaId: string, tripRef: string): Promise<ActionResult> {
  return guarded("media.manage", async (actor) => {
    // Verification is a human act: someone opened the link, from outside the
    // company account, and confirmed it works and is not empty. The system
    // records who said so rather than pretending to have checked.
    await osdb().from("os_media_links").update({
      verified_at: new Date().toISOString(), verified_by: actor.employeeId,
    }).eq("id", mediaId);
    await record(
      actor,
      { entityType: "media", entityId: mediaId, verb: "media_verified", summary: `${actor.name} confirmed the link opens and is not empty.` },
      { action: "media.verify", entityLabel: tripRef, after: { verified_by: actor.name } },
    );
    revalidatePath(`/os/trips/${tripRef}/media`);
    return ok(undefined, "Marked as verified.");
  });
}

export async function advanceContentJob(jobId: string, stage: string): Promise<ActionResult> {
  return guarded("content.edit", async (actor) => {
    const db = osdb();
    const { data: job } = await db
      .from("os_content_jobs")
      .select("id, trip_id, stage, marketing_permission, os_trips ( ref, title )")
      .eq("id", jobId).maybeSingle();
    if (!job) return fail("That content job no longer exists");

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const trip = (job as any).os_trips;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (stage === "delivered") {
      const { data: delivery } = await db
        .from("os_media_links").select("id, verified_at")
        .eq("trip_id", job.trip_id).eq("kind", "client_delivery").maybeSingle();
      if (!delivery) {
        return fail("There is no client delivery link on this trip", "Add the gallery link before marking it delivered.");
      }
      if (!delivery.verified_at) {
        return fail(
          "The delivery link has not been verified",
          "Open it from outside our Google account first. A link that works for us and not for the client is the most common delivery failure there is.",
        );
      }
    }

    const patch: Record<string, unknown> = { stage };
    const now = new Date().toISOString();
    if (stage === "uploaded") patch.uploaded_at = now;
    if (stage === "editing") patch.editing_started_at = now;
    if (stage === "ready") patch.ready_at = now;
    if (stage === "delivered") patch.delivered_at = now;

    await db.from("os_content_jobs").update(patch).eq("id", jobId);
    await record(
      actor,
      { entityType: "content_job", entityId: jobId, tripId: job.trip_id as string, verb: "content_stage",
        summary: `Content pipeline: ${String(job.stage).replace("_", " ")} → ${stage.replace("_", " ")}.` },
      { action: "content.stage", entityLabel: trip?.ref ?? jobId, before: { stage: job.stage }, after: { stage } },
    );

    revalidatePath("/os/content");
    if (trip?.ref) revalidatePath(`/os/trips/${trip.ref}`);
    return ok(undefined, `Moved to ${stage.replace("_", " ")}.`);
  });
}

export async function addDocument(input: {
  tripRef?: string | null;
  entityType: string;
  entityId: string;
  title: string;
  kind: string;
  url: string;
  visibility: string;
}): Promise<ActionResult> {
  return guarded("documents.manage", async (actor) => {
    const db = osdb();
    const org = await getOrg();
    let url: URL;
    try { url = new URL(input.url.trim()); } catch { return fail("That does not look like a link"); }
    if (url.protocol !== "https:") return fail("Document links must be https");

    let tripId: string | null = null;
    if (input.tripRef) {
      const trip = await getTripRecord(actor, input.tripRef);
      if (!trip) return fail("That trip does not exist, or you cannot reach it");
      tripId = trip.id as string;
    }

    await db.from("os_documents").insert({
      org_id: org.id,
      title: input.title.trim(),
      kind: input.kind,
      url: url.toString(),
      entity_type: input.entityType,
      entity_id: input.entityId,
      trip_id: tripId,
      visibility: input.visibility,
      uploaded_by: actor.employeeId,
    });

    await record(
      actor,
      { entityType: input.entityType, entityId: input.entityId, tripId, verb: "document_added", summary: `Document attached: ${input.title}` },
      { action: "document.add", entityLabel: input.title, after: { kind: input.kind, visibility: input.visibility } },
    );
    if (tripId) await computeReadiness(tripId);
    if (input.tripRef) revalidatePath(`/os/trips/${input.tripRef}/documents`);
    return ok(undefined, "Document attached.");
  });
}

// ---------------------------------------------------------------------------
// PRICE BOOK
// ---------------------------------------------------------------------------

export async function changeRate(input: {
  priceItemId: string;
  tier: string;
  cost: number;
  sell: number | null;
  currency: string;
  effectiveFrom: string;
  note?: string;
}): Promise<ActionResult> {
  return guarded("pricing.edit", async (actor) => {
    if (input.cost < 0) return fail("A cost cannot be negative");
    const { data: item } = await osdb().from("os_price_items").select("name").eq("id", input.priceItemId).maybeSingle();
    if (!item) return fail("That price item no longer exists");

    // Never an update. The old rate keeps its window; a new row opens on the
    // effective date. Everything already costed keeps its number.
    const { closedRateId, newRateId } = await supersedeRate({ ...input, actorEmployeeId: actor.employeeId });

    await record(
      actor,
      { entityType: "price_item", entityId: input.priceItemId, verb: "rate_changed",
        summary: `${item.name}: ${input.currency} ${input.cost.toFixed(2)} from ${input.effectiveFrom}.` },
      { action: "rate.supersede", entityLabel: item.name as string,
        before: { superseded_rate: closedRateId }, after: { new_rate: newRateId, ...input } },
    );
    revalidatePath("/os/pricing");
    return ok(undefined, `New rate effective ${input.effectiveFrom}. Trips already costed keep the old price.`);
  });
}

function normalisePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
}
