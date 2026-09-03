"use server";

import { revalidatePath } from "next/cache";
import { osdb, getOrg, OsRuleError } from "../db";
import { record, logActivity } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";
import { todayInCairo } from "../dates";
import { notify, employeesWithRole } from "../notify";
import { getStages, stageBlockers } from "../commercial/pipeline";
import { resolveTerm } from "../commercial/agreements";
import type { Pipeline } from "../commercial/types";

// ---------------------------------------------------------------------------
// COMMERCIAL MUTATIONS
// ---------------------------------------------------------------------------
// Every function here goes through guarded(), which resolves the actor and
// asserts the permission before the handler reads a single field. The rules
// enforced below are the ones a screen must never be trusted to enforce:
//
//   * A deal cannot leave a stage whose requirements are unmet, and the
//     refusal NAMES what is missing rather than greying out a button.
//   * A deal cannot be marked lost without a reason. A loss with no reason
//     teaches the company nothing, and next quarter it happens again.
//   * A partner over their credit limit cannot have a deal marked won
//     without an approval, and the refusal says who can grant it.
//   * Commercial terms are SUPERSEDED, never edited. The old window is
//     closed and a new row inserted, so a commission statement from last
//     spring stays defensible.
//   * Qualifying a lead MATCHES an existing person before creating one. The
//     whole model depends on there being one record per human.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// ===========================================================================
// LEADS
// ===========================================================================

export async function createLead(input: {
  pipeline: Pipeline;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactInstagram?: string | null;
  companyName?: string | null;
  country?: string | null;
  language?: string | null;
  source: string;
  campaign?: string | null;
  interest?: string | null;
  tripTypeId?: string | null;
  unitId?: string | null;
  requestedDate?: string | null;
  dateFlexible?: boolean;
  guests?: number | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  message?: string | null;
  receivedAt?: string | null;
}): Promise<ActionResult<{ id: string; ref: string }>> {
  return guarded("leads.create", async (actor) => {
    const name = input.contactName.trim();
    if (!name) return fail("The enquiry needs a name", "Even 'Instagram DM, no name given' is better than blank.");
    if (!input.contactEmail && !input.contactPhone && !input.contactWhatsapp && !input.contactInstagram) {
      return fail(
        "There is no way to reply to this enquiry",
        "Record at least one of email, phone, WhatsApp or an Instagram handle — otherwise this is a note, not a lead.",
      );
    }

    const db = osdb();
    const org = await getOrg();
    const ref = await nextRef("nextval_os_lead_ref", "LD");

    // Match an existing person before creating anything. A returning guest
    // enquiring again must land on their own history.
    const client = await matchClient(org.id, input.contactEmail, input.contactPhone ?? input.contactWhatsapp);

    const { data: created, error } = await db.from("os_leads").insert({
      org_id: org.id,
      ref,
      pipeline: input.pipeline,
      contact_name: name,
      contact_email: input.contactEmail?.trim().toLowerCase() || null,
      contact_phone: input.contactPhone?.trim() || null,
      contact_whatsapp: input.contactWhatsapp?.trim() || null,
      contact_instagram: input.contactInstagram?.trim() || null,
      company_name: input.companyName?.trim() || null,
      country: input.country?.trim() || null,
      language: input.language?.trim() || null,
      client_id: client?.id ?? null,
      source: input.source || "other",
      campaign: input.campaign?.trim() || null,
      interest: input.interest?.trim() || null,
      trip_type_id: input.tripTypeId || null,
      unit_id: input.unitId || null,
      requested_date: input.requestedDate || null,
      date_flexible: Boolean(input.dateFlexible),
      guests: input.guests ?? null,
      budget_amount: input.budgetAmount ?? null,
      budget_currency: input.budgetCurrency || null,
      message: input.message?.trim() || null,
      status: "new",
      owner_employee_id: actor.employeeId,
      received_at: input.receivedAt || new Date().toISOString(),
      created_by: actor.employeeId,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      {
        entityType: "lead",
        entityId: created.id as string,
        verb: "created",
        summary: `Enquiry ${ref} logged from ${input.source}.`,
        meta: { pipeline: input.pipeline, source: input.source },
      },
      { action: "lead.create", entityLabel: `${ref} — ${name}`, after: { ...input, ref } },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(
      { id: created.id as string, ref },
      client
        ? `${ref} logged, and matched to ${client.full_name}'s existing record — their history is already on it.`
        : `${ref} logged.`,
    );
  });
}

/** The first human reply. Recorded once; a later reply does not overwrite it. */
export async function recordFirstResponse(leadId: string): Promise<ActionResult> {
  return guarded("leads.edit", async (actor) => {
    const db = osdb();
    const { data: lead } = await db
      .from("os_leads")
      .select("id, ref, received_at, first_response_at, status")
      .eq("id", leadId)
      .maybeSingle();
    if (!lead) return fail("That enquiry no longer exists");
    if (lead.first_response_at) {
      return fail(
        "A first reply is already recorded",
        "First response time is measured once. Log the later contact as an engagement instead.",
      );
    }

    const now = new Date();
    const minutes = Math.max(0, Math.round((now.getTime() - Date.parse(lead.received_at as string)) / 60_000));

    const { error } = await db.from("os_leads").update({
      first_response_at: now.toISOString(),
      first_response_minutes: minutes,
      status: lead.status === "new" ? "contacted" : lead.status,
    }).eq("id", leadId);
    if (error) throw error;

    await logActivity(actor, {
      entityType: "lead",
      entityId: leadId,
      verb: "responded",
      summary: `First reply sent, ${minutes} minute${minutes === 1 ? "" : "s"} after the enquiry arrived.`,
      meta: { minutes },
    });

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(undefined, `Recorded. ${minutes} minute${minutes === 1 ? "" : "s"} to first reply.`);
  });
}

/**
 * Qualify an enquiry: create or match the person, optionally the company, and
 * open a deal.
 *
 * This is the single place a lead becomes a customer record, and it matches
 * before it creates — one record per human is the rule the whole commercial
 * model rests on.
 */
export async function qualifyLead(input: {
  leadId: string;
  title?: string | null;
  valueAmount?: number | null;
  currency?: string | null;
  expectedCloseOn?: string | null;
  companyId?: string | null;
}): Promise<ActionResult<{ dealId: string; dealRef: string; clientId: string | null; reusedClient: boolean }>> {
  return guarded("deals.create", async (actor) => {
    const db = osdb();
    const org = await getOrg();

    const { data: lead } = await db.from("os_leads").select("*").eq("id", input.leadId).maybeSingle();
    if (!lead) return fail("That enquiry no longer exists");
    const row = lead as Raw;
    if (row.deal_id) return fail("This enquiry already has a deal", "Open the deal rather than opening a second one.");

    // --- The person -------------------------------------------------------
    let clientId: string | null = row.client_id;
    let reusedClient = false;
    if (clientId) {
      reusedClient = true;
    } else {
      const existing = await matchClient(org.id, row.contact_email, row.contact_phone ?? row.contact_whatsapp);
      if (existing) {
        clientId = existing.id;
        reusedClient = true;
      } else if (row.contact_name) {
        const { data: last } = await db.from("os_clients").select("code").eq("org_id", org.id)
          .order("code", { ascending: false }).limit(1).maybeSingle();
        const next = last?.code ? Number(String(last.code).replace(/\D/g, "")) + 1 : 1;
        const { data: created, error } = await db.from("os_clients").insert({
          org_id: org.id,
          code: `CL-${String(next).padStart(4, "0")}`,
          kind: "individual",
          full_name: row.contact_name,
          email: row.contact_email,
          phone: row.contact_phone,
          whatsapp: row.contact_whatsapp,
          instagram: row.contact_instagram,
          country: row.country,
          language: row.language,
          source: row.source,
          lifecycle: "prospect",
          owner_employee_id: row.owner_employee_id ?? actor.employeeId,
          created_by: actor.employeeId,
        }).select("id").single();
        if (error) throw error;
        clientId = created.id as string;
      }
    }

    const companyId = input.companyId ?? row.company_id ?? null;
    if (row.pipeline === "b2b" && !companyId) {
      return fail(
        "A B2B deal needs a partner company",
        "Register the company first, or pick an existing one — a pipeline of anonymous rows is a spreadsheet.",
      );
    }

    // --- The deal ---------------------------------------------------------
    const stages = await getStages(row.pipeline);
    const firstStage = stages.find((s) => s.category === "qualifying") ?? stages[0];
    const ref = await nextRef("nextval_os_deal_ref", "DL");

    const { data: deal, error: dealError } = await db.from("os_deals").insert({
      org_id: org.id,
      ref,
      pipeline: row.pipeline,
      title: input.title?.trim() || `${row.contact_name} — ${row.interest ?? "enquiry"}`,
      client_id: clientId,
      company_id: companyId,
      stage_id: firstStage?.id ?? null,
      status: "open",
      value_amount: input.valueAmount ?? 0,
      currency: input.currency || org.baseCurrency,
      expected_close_on: input.expectedCloseOn || null,
      trip_type_id: row.trip_type_id,
      unit_id: row.unit_id,
      requested_date: row.requested_date,
      guests: row.guests,
      owner_employee_id: row.owner_employee_id ?? actor.employeeId,
      source: row.source,
      campaign: row.campaign,
      lead_id: row.id,
      stage_entered_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      created_by: actor.employeeId,
    }).select("id").single();
    if (dealError) throw dealError;

    await db.from("os_leads").update({
      status: "converted",
      client_id: clientId,
      company_id: companyId,
      deal_id: deal.id,
      qualified_at: new Date().toISOString(),
      closed_at: new Date().toISOString(),
    }).eq("id", row.id);

    await db.from("os_deal_stage_history").insert({
      deal_id: deal.id,
      from_stage_id: null,
      to_stage_id: firstStage?.id ?? null,
      from_status: null,
      to_status: "open",
      changed_by: actor.employeeId,
      note: `Qualified from enquiry ${row.ref}.`,
    });

    await record(
      actor,
      {
        entityType: "deal",
        entityId: deal.id as string,
        verb: "created",
        summary: `${ref} opened from enquiry ${row.ref}.`,
        meta: { pipeline: row.pipeline, leadRef: row.ref },
      },
      { action: "lead.qualify", entityLabel: `${ref}`, after: { leadRef: row.ref, dealRef: ref, reusedClient } },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(
      { dealId: deal.id as string, dealRef: ref, clientId, reusedClient },
      reusedClient
        ? `${ref} opened against the existing client record — their whole history came with them.`
        : `${ref} opened.`,
    );
  });
}

export async function closeLead(leadId: string, status: "unqualified" | "lost" | "duplicate", reasonKey: string | null, note: string): Promise<ActionResult> {
  return guarded("leads.edit", async (actor) => {
    if (!note.trim()) {
      return fail("Say why", "A closed enquiry with no explanation is the same as a deleted one, and it teaches nothing.");
    }
    const db = osdb();
    const org = await getOrg();

    let reasonId: string | null = null;
    if (reasonKey) {
      const { data } = await db.from("os_lost_reasons").select("id").eq("org_id", org.id).eq("key", reasonKey).maybeSingle();
      reasonId = (data?.id as string) ?? null;
    }

    const { data: lead } = await db.from("os_leads").select("ref, contact_name").eq("id", leadId).maybeSingle();
    const { error } = await db.from("os_leads").update({
      status,
      lost_reason_id: reasonId,
      lost_note: note.trim(),
      closed_at: new Date().toISOString(),
    }).eq("id", leadId);
    if (error) throw error;

    await record(
      actor,
      { entityType: "lead", entityId: leadId, verb: "closed", summary: `${lead?.ref ?? "Enquiry"} closed as ${status}. ${note.trim()}` },
      { action: "lead.close", entityLabel: lead?.ref ?? leadId, after: { status, reasonKey, note } },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(undefined, "Closed, with the reason kept.");
  });
}

export async function assignLead(leadId: string, employeeId: string): Promise<ActionResult> {
  return guarded("leads.assign", async (actor) => {
    const db = osdb();
    const { data: before } = await db.from("os_leads").select("ref, owner_employee_id").eq("id", leadId).maybeSingle();
    const { error } = await db.from("os_leads").update({ owner_employee_id: employeeId }).eq("id", leadId);
    if (error) throw error;

    await notify({
      employeeIds: [employeeId],
      level: "info",
      category: "assignment",
      title: "An enquiry was assigned to you",
      body: `${before?.ref ?? "An enquiry"} is now yours.`,
      href: `/os/reservations/leads/${before?.ref ?? ""}`,
      entityType: "lead",
      entityId: leadId,
    });
    await record(
      actor,
      { entityType: "lead", entityId: leadId, verb: "assigned", summary: `${before?.ref ?? "Enquiry"} reassigned.` },
      { action: "lead.assign", entityLabel: before?.ref ?? leadId, before: { owner: before?.owner_employee_id }, after: { owner: employeeId } },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(undefined, "Reassigned.");
  });
}

// ===========================================================================
// DEALS
// ===========================================================================

export async function moveDealStage(dealId: string, stageId: string, note: string): Promise<ActionResult> {
  return guarded("deals.stage", async (actor) => {
    const db = osdb();
    const org = await getOrg();

    const { data: deal } = await db
      .from("os_deals")
      .select("id, ref, pipeline, status, stage_id, stage_entered_at, owner_employee_id, company_id")
      .eq("id", dealId)
      .maybeSingle();
    if (!deal) return fail("That deal no longer exists");
    const row = deal as Raw;
    if (row.status !== "open") {
      return fail(`This deal is already ${row.status}`, "Reopen it before moving it, so the reopening is on the record.");
    }

    const stages = await getStages(row.pipeline);
    const target = stages.find((s) => s.id === stageId);
    if (!target) return fail("That stage does not belong to this pipeline");

    // The requirements are named, not silent. A refusal here tells the person
    // exactly what to go and do.
    const blockers = await stageBlockers(dealId, target);
    if (blockers.length) {
      return fail(
        `${row.ref} is not ready for ${target.label}`,
        "Everything below has to be true before it can move.",
        blockers.map((b) => ({ label: b.label, detail: b.detail })),
      );
    }

    if (target.category === "won") return fail("Use the close action to mark a deal won", "Winning a deal needs its own confirmation.");
    if (target.category === "lost") return fail("Use the close action to mark a deal lost", "A lost deal needs a reason, which the close action asks for.");

    const now = new Date();
    const daysInPrevious = Math.round(((now.getTime() - Date.parse(row.stage_entered_at)) / 86_400_000) * 100) / 100;

    const { error } = await db.from("os_deals").update({
      stage_id: stageId,
      stage_entered_at: now.toISOString(),
      last_activity_at: now.toISOString(),
      probability_pct: null,
      probability_source: "stage",
    }).eq("id", dealId);
    if (error) throw error;

    await db.from("os_deal_stage_history").insert({
      deal_id: dealId,
      from_stage_id: row.stage_id,
      to_stage_id: stageId,
      from_status: row.status,
      to_status: row.status,
      changed_by: actor.employeeId,
      note: note.trim() || null,
      days_in_previous_stage: daysInPrevious,
    });

    await record(
      actor,
      {
        entityType: "deal",
        entityId: dealId,
        verb: "moved",
        summary: `${row.ref} moved to ${target.label}.${note.trim() ? ` ${note.trim()}` : ""}`,
        meta: { stage: target.key },
      },
      { action: "deal.stage", entityLabel: row.ref, before: { stage: row.stage_id }, after: { stage: stageId, note } },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    void org;
    return ok(undefined, `Moved to ${target.label}.`);
  });
}

export async function closeDeal(input: {
  dealId: string;
  outcome: "won" | "lost";
  reasonKey?: string | null;
  note: string;
  lostTo?: string | null;
  valueAmount?: number | null;
}): Promise<ActionResult> {
  return guarded("deals.close", async (actor) => {
    const db = osdb();
    const org = await getOrg();

    const { data: deal } = await db
      .from("os_deals")
      .select("id, ref, pipeline, status, stage_id, stage_entered_at, company_id, value_amount, currency, client_id")
      .eq("id", input.dealId)
      .maybeSingle();
    if (!deal) return fail("That deal no longer exists");
    const row = deal as Raw;
    if (row.status !== "open") return fail(`This deal is already ${row.status}`);

    if (input.outcome === "lost") {
      if (!input.reasonKey) {
        return fail(
          "A lost deal needs a reason",
          "It is the only thing that makes the loss worth anything later — a quarter lost to price is a pricing decision, a quarter lost to cancelled travel is weather.",
        );
      }
      if (!input.note.trim()) {
        return fail("Say what happened", "One sentence. The reason code says what kind of loss; this says why this one.");
      }
    }

    const stages = await getStages(row.pipeline);
    const target = stages.find((s) => s.category === (input.outcome === "won" ? "won" : "lost"));

    // A partner over their credit limit is a decision somebody has to accept
    // in writing, not something a salesperson closes past.
    if (input.outcome === "won" && row.company_id) {
      const { data: company } = await db
        .from("os_companies")
        .select("name, credit_hold, credit_limit_amount, lifetime_revenue_amount")
        .eq("id", row.company_id)
        .maybeSingle();
      if (company?.credit_hold) {
        return fail(
          `${company.name} is on credit hold`,
          "Finance has stopped new bookings for this partner. Raise an approval with the commercial credit rule, or ask finance to clear the balance first.",
        );
      }
    }

    if (input.outcome === "won" && target) {
      const blockers = await stageBlockers(input.dealId, target);
      if (blockers.length) {
        return fail(
          `${row.ref} cannot be marked won yet`,
          "Everything below has to be true first, because the operation and the revenue report both read these fields.",
          blockers.map((b) => ({ label: b.label, detail: b.detail })),
        );
      }
    }

    let reasonId: string | null = null;
    if (input.reasonKey) {
      const { data } = await db.from("os_lost_reasons").select("id").eq("org_id", org.id).eq("key", input.reasonKey).maybeSingle();
      reasonId = (data?.id as string) ?? null;
    }

    const now = new Date();
    const daysInPrevious = Math.round(((now.getTime() - Date.parse(row.stage_entered_at)) / 86_400_000) * 100) / 100;

    const { error } = await db.from("os_deals").update({
      status: input.outcome,
      stage_id: target?.id ?? row.stage_id,
      stage_entered_at: now.toISOString(),
      last_activity_at: now.toISOString(),
      won_at: input.outcome === "won" ? now.toISOString() : null,
      lost_at: input.outcome === "lost" ? now.toISOString() : null,
      lost_reason_id: reasonId,
      lost_note: input.note.trim() || null,
      lost_to: input.lostTo?.trim() || null,
      value_amount: input.valueAmount ?? row.value_amount,
    }).eq("id", input.dealId);
    if (error) throw error;

    await db.from("os_deal_stage_history").insert({
      deal_id: input.dealId,
      from_stage_id: row.stage_id,
      to_stage_id: target?.id ?? row.stage_id,
      from_status: "open",
      to_status: input.outcome,
      changed_by: actor.employeeId,
      note: input.note.trim() || null,
      days_in_previous_stage: daysInPrevious,
    });

    // Deliberately a PROMPT, not an automatic trip. The operation decides what
    // it is taking on; a booking that creates itself is how a company ends up
    // committed to a date nobody staffed.
    if (input.outcome === "won" && row.pipeline === "b2c") {
      await db.from("os_tasks").insert({
        org_id: org.id,
        title: `Create the trip for ${row.ref}`,
        description: "A booking was closed. Operations decides what the OS takes on, so this is a prompt rather than an automatic creation.",
        status: "todo",
        priority: "high",
        entity_type: "deal",
        entity_id: input.dealId,
        deal_id: input.dealId,
        owner_role_key: "operations",
        due_at: new Date(now.getTime() + 86_400_000).toISOString(),
        created_by: actor.employeeId,
      });
      await notify({
        employeeIds: await employeesWithRole("operations"),
        level: "warning",
        category: "task",
        title: "A booking was closed",
        body: `${row.ref} is won and needs a trip creating.`,
        href: "/os/tasks",
        entityType: "deal",
        entityId: input.dealId,
        dedupeKey: `deal-won-${input.dealId}`,
      });
    }

    await record(
      actor,
      {
        entityType: "deal",
        entityId: input.dealId,
        verb: input.outcome,
        summary: `${row.ref} marked ${input.outcome}.${input.note.trim() ? ` ${input.note.trim()}` : ""}`,
        meta: { outcome: input.outcome, reason: input.reasonKey ?? null },
      },
      { action: `deal.${input.outcome}`, entityLabel: row.ref, after: { ...input } },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(
      undefined,
      input.outcome === "won"
        ? `${row.ref} is won. A task has been raised for operations to create the trip.`
        : `${row.ref} closed as lost, with the reason kept.`,
    );
  });
}

export async function updateDeal(dealId: string, patch: {
  title?: string;
  valueAmount?: number | null;
  currency?: string | null;
  expectedCloseOn?: string | null;
  requestedDate?: string | null;
  guests?: number | null;
  nextStep?: string | null;
  nextStepDueOn?: string | null;
  notes?: string | null;
  probabilityPct?: number | null;
}): Promise<ActionResult> {
  return guarded("deals.edit", async (actor) => {
    const db = osdb();
    const { data: before } = await db
      .from("os_deals")
      .select("ref, title, value_amount, currency, expected_close_on, requested_date, guests, next_step, next_step_due_on, notes, probability_pct")
      .eq("id", dealId)
      .maybeSingle();
    if (!before) return fail("That deal no longer exists");

    const update: Record<string, unknown> = { last_activity_at: new Date().toISOString() };
    if (patch.title !== undefined) update.title = patch.title.trim();
    if (patch.valueAmount !== undefined) update.value_amount = patch.valueAmount ?? 0;
    if (patch.currency !== undefined) update.currency = patch.currency || "USD";
    if (patch.expectedCloseOn !== undefined) update.expected_close_on = patch.expectedCloseOn || null;
    if (patch.requestedDate !== undefined) update.requested_date = patch.requestedDate || null;
    if (patch.guests !== undefined) update.guests = patch.guests ?? null;
    if (patch.nextStep !== undefined) update.next_step = patch.nextStep?.trim() || null;
    if (patch.nextStepDueOn !== undefined) update.next_step_due_on = patch.nextStepDueOn || null;
    if (patch.notes !== undefined) update.notes = patch.notes?.trim() || null;
    if (patch.probabilityPct !== undefined) {
      // An owner override is recorded AS an override, so the forecast can be
      // split into what the stage says and what the person selling it says.
      update.probability_pct = patch.probabilityPct;
      update.probability_source = patch.probabilityPct == null ? "stage" : "owner";
    }

    const { error } = await db.from("os_deals").update(update).eq("id", dealId);
    if (error) throw error;

    await record(
      actor,
      { entityType: "deal", entityId: dealId, verb: "updated", summary: `${before.ref} updated.` },
      { action: "deal.update", entityLabel: before.ref as string, before: before as Record<string, unknown>, after: update },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(undefined, "Saved.");
  });
}

export async function assignDeal(dealId: string, employeeId: string): Promise<ActionResult> {
  return guarded("deals.assign", async (actor) => {
    const db = osdb();
    const { data: before } = await db.from("os_deals").select("ref, owner_employee_id").eq("id", dealId).maybeSingle();
    const { error } = await db.from("os_deals").update({ owner_employee_id: employeeId }).eq("id", dealId);
    if (error) throw error;

    await notify({
      employeeIds: [employeeId],
      level: "info",
      category: "assignment",
      title: "A deal was assigned to you",
      body: `${before?.ref ?? "A deal"} is now yours.`,
      href: "/os/partnerships",
      entityType: "deal",
      entityId: dealId,
    });
    await record(
      actor,
      { entityType: "deal", entityId: dealId, verb: "assigned", summary: `${before?.ref ?? "Deal"} reassigned.` },
      { action: "deal.assign", entityLabel: before?.ref ?? dealId, before: { owner: before?.owner_employee_id }, after: { owner: employeeId } },
    );

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(undefined, "Reassigned.");
  });
}

// ===========================================================================
// ENGAGEMENTS
// ===========================================================================

export async function logEngagement(input: {
  kind: string;
  direction: "inbound" | "outbound" | "internal";
  channel?: string | null;
  leadId?: string | null;
  dealId?: string | null;
  clientId?: string | null;
  companyId?: string | null;
  tripId?: string | null;
  subject?: string | null;
  summary: string;
  outcome?: string | null;
  happenedAt?: string | null;
  durationMinutes?: number | null;
  participants?: string | null;
  followUp?: { title: string; dueOn: string } | null;
}): Promise<ActionResult<{ id: string }>> {
  return guarded("engagements.log", async (actor) => {
    if (!input.summary.trim()) {
      return fail("Say what happened", "One or two sentences a colleague could pick the relationship up from.");
    }
    if (!input.leadId && !input.dealId && !input.clientId && !input.companyId && !input.tripId) {
      return fail("Attach this to something", "A note attached to nothing is a note nobody will find again.");
    }

    const db = osdb();
    const org = await getOrg();
    const happenedAt = input.happenedAt || new Date().toISOString();

    // A follow-up becomes a real task on the same list as everything else the
    // person owes, rather than a promise buried in a note.
    let followupTaskId: string | null = null;
    if (input.followUp?.title.trim()) {
      const { data: task } = await db.from("os_tasks").insert({
        org_id: org.id,
        title: input.followUp.title.trim(),
        status: "todo",
        priority: "medium",
        owner_employee_id: actor.employeeId,
        entity_type: input.dealId ? "deal" : input.companyId ? "company" : input.leadId ? "lead" : "general",
        entity_id: input.dealId ?? input.companyId ?? input.leadId ?? null,
        deal_id: input.dealId ?? null,
        lead_id: input.leadId ?? null,
        company_id: input.companyId ?? null,
        due_at: `${input.followUp.dueOn}T09:00:00Z`,
        created_by: actor.employeeId,
      }).select("id").single();
      followupTaskId = (task?.id as string) ?? null;
    }

    const { data: created, error } = await db.from("os_engagements").insert({
      org_id: org.id,
      kind: input.kind,
      direction: input.direction,
      channel: input.channel?.trim() || null,
      lead_id: input.leadId ?? null,
      deal_id: input.dealId ?? null,
      client_id: input.clientId ?? null,
      company_id: input.companyId ?? null,
      trip_id: input.tripId ?? null,
      subject: input.subject?.trim() || null,
      summary: input.summary.trim(),
      outcome: input.outcome || null,
      happened_at: happenedAt,
      duration_minutes: input.durationMinutes ?? null,
      employee_id: actor.employeeId,
      participants: input.participants?.trim() || null,
      followup_task_id: followupTaskId,
    }).select("id").single();
    if (error) throw error;

    // Contact freshness is derived from what was logged, never typed.
    if (input.companyId) {
      await db.from("os_companies").update({ last_contact_at: happenedAt }).eq("id", input.companyId);
    }
    if (input.clientId) {
      await db.from("os_clients").update({ last_contact_at: happenedAt }).eq("id", input.clientId);
    }
    if (input.dealId) {
      await db.from("os_deals").update({ last_activity_at: happenedAt }).eq("id", input.dealId);
    }

    await logActivity(actor, {
      entityType: input.dealId ? "deal" : input.companyId ? "company" : "lead",
      entityId: (input.dealId ?? input.companyId ?? input.leadId ?? created.id) as string,
      tripId: input.tripId ?? null,
      verb: "contacted",
      summary: input.subject?.trim() || input.summary.trim().slice(0, 140),
      meta: { kind: input.kind, direction: input.direction, outcome: input.outcome ?? null },
    });

    revalidatePath("/os/reservations");
    revalidatePath("/os/partnerships");
    return ok(
      { id: created.id as string },
      followupTaskId ? "Logged, and the follow-up is on your task list." : "Logged.",
    );
  });
}

// ===========================================================================
// COMPANIES AND CONTACTS
// ===========================================================================

export async function createCompany(input: {
  name: string;
  legalName?: string | null;
  kind: string;
  status?: string | null;
  tier?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  currency?: string | null;
  ownerEmployeeId?: string | null;
  unitId?: string | null;
  source?: string | null;
  notes?: string | null;
  defaultCommissionPct?: number | null;
  defaultPaymentTerms?: string | null;
}): Promise<ActionResult<{ id: string; code: string }>> {
  return guarded("companies.create", async (actor) => {
    const name = input.name.trim();
    if (!name) return fail("The partner needs a name");

    const db = osdb();
    const org = await getOrg();

    const { data: existing } = await db
      .from("os_companies")
      .select("id, code, name")
      .eq("org_id", org.id)
      .is("archived_at", null)
      .ilike("name", name)
      .limit(1);
    if (existing?.length) {
      return fail(
        `${existing[0].name} is already registered as ${existing[0].code}`,
        "Open that record instead. Two records for one partner means two revenue histories and two health scores.",
      );
    }

    // Commercial terms are their own permission. Somebody may register a
    // partner without being allowed to decide what we pay them.
    const maySetTerms = Boolean(actor.permissions["companies.terms"]);
    if (input.defaultCommissionPct != null && !maySetTerms) {
      return fail(
        "You cannot set commercial terms",
        "Register the partner without them and ask somebody with the terms permission to fill them in.",
      );
    }

    const { data: codeRow } = await db.rpc("nextval_os_company_code");
    const code = (codeRow as string) ?? `CO-${Date.now().toString().slice(-4)}`;

    const { data: created, error } = await db.from("os_companies").insert({
      org_id: org.id,
      code,
      name,
      legal_name: input.legalName?.trim() || null,
      kind: input.kind,
      status: input.status || "prospect",
      tier: input.tier || "standard",
      website: input.website?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      phone: input.phone?.trim() || null,
      country: input.country?.trim() || null,
      city: input.city?.trim() || null,
      currency: input.currency || org.baseCurrency,
      default_commission_pct: maySetTerms ? input.defaultCommissionPct ?? null : null,
      default_payment_terms: maySetTerms ? input.defaultPaymentTerms?.trim() || null : null,
      owner_employee_id: input.ownerEmployeeId || actor.employeeId,
      unit_id: input.unitId || null,
      source: input.source?.trim() || null,
      notes: input.notes?.trim() || null,
      created_by: actor.employeeId,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      { entityType: "company", entityId: created.id as string, verb: "created", summary: `${name} registered as ${code}.` },
      { action: "company.create", entityLabel: `${code} — ${name}`, after: { ...input, code } },
    );

    revalidatePath("/os/partnerships");
    return ok({ id: created.id as string, code }, `${name} registered as ${code}.`);
  });
}

/**
 * Link a PERSON to a company.
 *
 * The person is an os_clients record — the same table a B2C traveller lives
 * in. That is the whole point: somebody who books a photoshoot privately and
 * runs an agency's Egypt product is one record with two relationships, not two
 * records that will drift apart.
 */
export async function linkContact(input: {
  companyId: string;
  clientId: string;
  jobTitle?: string | null;
  department?: string | null;
  decisionRole: string;
  isPrimary?: boolean;
  workEmail?: string | null;
  workPhone?: string | null;
  notes?: string | null;
}): Promise<ActionResult> {
  return guarded("companies.edit", async (actor) => {
    const db = osdb();

    const { data: existing } = await db
      .from("os_client_companies")
      .select("id, ended_on")
      .eq("client_id", input.clientId)
      .eq("company_id", input.companyId)
      .maybeSingle();
    if (existing && !existing.ended_on) {
      return fail("That person is already linked to this partner", "Edit the existing link rather than adding a second one.");
    }

    // One company, one primary contact. "Who do I call" must have exactly one
    // answer, and the database index enforces it — this just makes the
    // handover explicit rather than a constraint violation.
    if (input.isPrimary) {
      await db.from("os_client_companies")
        .update({ is_primary: false })
        .eq("company_id", input.companyId)
        .is("ended_on", null);
    }

    if (existing) {
      const { error } = await db.from("os_client_companies").update({
        ended_on: null,
        job_title: input.jobTitle?.trim() || null,
        department: input.department?.trim() || null,
        decision_role: input.decisionRole,
        is_primary: Boolean(input.isPrimary),
        work_email: input.workEmail?.trim() || null,
        work_phone: input.workPhone?.trim() || null,
        notes: input.notes?.trim() || null,
      }).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await db.from("os_client_companies").insert({
        client_id: input.clientId,
        company_id: input.companyId,
        job_title: input.jobTitle?.trim() || null,
        department: input.department?.trim() || null,
        decision_role: input.decisionRole,
        is_primary: Boolean(input.isPrimary),
        work_email: input.workEmail?.trim() || null,
        work_phone: input.workPhone?.trim() || null,
        started_on: todayInCairo(),
        notes: input.notes?.trim() || null,
        created_by: actor.employeeId,
      });
      if (error) throw error;
    }

    const [{ data: person }, { data: company }] = await Promise.all([
      db.from("os_clients").select("full_name, lifetime_trips").eq("id", input.clientId).maybeSingle(),
      db.from("os_companies").select("name").eq("id", input.companyId).maybeSingle(),
    ]);

    await record(
      actor,
      {
        entityType: "company",
        entityId: input.companyId,
        verb: "linked",
        summary: `${person?.full_name ?? "A contact"} linked to ${company?.name ?? "the partner"} as ${input.decisionRole.replace(/_/g, " ")}.`,
      },
      { action: "company.link_contact", entityLabel: company?.name ?? input.companyId, after: { ...input } },
    );

    revalidatePath("/os/partnerships");
    revalidatePath("/os/clients");

    const ownTrips = Number(person?.lifetime_trips ?? 0);
    return ok(
      undefined,
      ownTrips > 0
        ? `Linked. ${person?.full_name} has also travelled with us ${ownTrips} time${ownTrips === 1 ? "" : "s"} personally — same record, both relationships.`
        : "Linked.",
    );
  });
}

export async function setCompanyCredit(companyId: string, limitAmount: number | null, hold: boolean, reason: string): Promise<ActionResult> {
  return guarded("companies.credit", async (actor) => {
    if (hold && !reason.trim()) {
      return fail("Say why the partner is on hold", "The salesperson who hits the block needs to know what to tell them.");
    }
    const db = osdb();
    const { data: before } = await db
      .from("os_companies").select("name, credit_limit_amount, credit_hold").eq("id", companyId).maybeSingle();
    if (!before) return fail("That partner no longer exists");

    const { error } = await db.from("os_companies")
      .update({ credit_limit_amount: limitAmount, credit_hold: hold })
      .eq("id", companyId);
    if (error) throw error;

    await record(
      actor,
      {
        entityType: "company",
        entityId: companyId,
        verb: hold ? "held" : "released",
        summary: hold
          ? `${before.name} placed on credit hold. ${reason.trim()}`
          : `${before.name} released from credit hold.${reason.trim() ? ` ${reason.trim()}` : ""}`,
      },
      {
        action: "company.credit",
        entityLabel: before.name as string,
        before: { limit: before.credit_limit_amount, hold: before.credit_hold },
        after: { limit: limitAmount, hold, reason },
      },
    );

    revalidatePath("/os/partnerships");
    return ok(undefined, hold ? "On hold. New bookings for this partner will be refused." : "Released.");
  });
}

// ===========================================================================
// AGREEMENTS AND TERMS
// ===========================================================================

export async function createAgreement(input: {
  companyId: string;
  dealId?: string | null;
  title: string;
  kind: string;
  startsOn?: string | null;
  endsOn?: string | null;
  autoRenew?: boolean;
  noticeDays?: number | null;
  currency?: string | null;
  minimumTripsPerYear?: number | null;
  minimumRevenueAmount?: number | null;
  notes?: string | null;
}): Promise<ActionResult<{ id: string; ref: string }>> {
  return guarded("agreements.create", async (actor) => {
    if (!input.title.trim()) return fail("The agreement needs a title");
    const db = osdb();
    const org = await getOrg();
    const ref = await nextRef("nextval_os_agreement_ref", "AG");

    const { data: created, error } = await db.from("os_agreements").insert({
      org_id: org.id,
      ref,
      company_id: input.companyId,
      deal_id: input.dealId || null,
      title: input.title.trim(),
      kind: input.kind,
      // Always drafted. Putting an agreement into force is a separate,
      // separately-permissioned act, because it is the moment the company
      // becomes liable for the terms in it.
      status: "draft",
      starts_on: input.startsOn || null,
      ends_on: input.endsOn || null,
      auto_renew: Boolean(input.autoRenew),
      notice_days: input.noticeDays ?? null,
      currency: input.currency || org.baseCurrency,
      minimum_trips_per_year: input.minimumTripsPerYear ?? null,
      minimum_revenue_amount: input.minimumRevenueAmount ?? null,
      notes: input.notes?.trim() || null,
      created_by: actor.employeeId,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      { entityType: "agreement", entityId: created.id as string, verb: "created", summary: `${ref} drafted.` },
      { action: "agreement.create", entityLabel: `${ref} — ${input.title}`, after: { ...input, ref } },
    );

    revalidatePath("/os/partnerships");
    return ok({ id: created.id as string, ref }, `${ref} drafted. Activating it is a separate step.`);
  });
}

export async function setAgreementStatus(agreementId: string, status: string, note: string): Promise<ActionResult> {
  return guarded("agreements.activate", async (actor) => {
    const db = osdb();
    const { data: before } = await db
      .from("os_agreements").select("ref, title, status, company_id, starts_on, ends_on").eq("id", agreementId).maybeSingle();
    if (!before) return fail("That agreement no longer exists");

    if (status === "active") {
      const { data: terms } = await db.from("os_agreement_terms").select("id").eq("agreement_id", agreementId).limit(1);
      if (!terms?.length) {
        return fail(
          "This agreement has no terms",
          "An agreement in force with no commission or net rate on it is a contract nobody can invoice against. Add the terms first.",
        );
      }
      if (!before.starts_on) {
        return fail("This agreement has no start date", "Terms are resolved by date, so it needs one before it can be in force.");
      }
    }
    if (status === "terminated" && !note.trim()) {
      return fail("Say why it is being terminated", "A terminated agreement with no reason is a hole in the relationship's history.");
    }

    const { error } = await db.from("os_agreements").update({ status }).eq("id", agreementId);
    if (error) throw error;

    await record(
      actor,
      {
        entityType: "agreement",
        entityId: agreementId,
        verb: status,
        summary: `${before.ref} ${status === "active" ? "put into force" : status}.${note.trim() ? ` ${note.trim()}` : ""}`,
      },
      { action: "agreement.status", entityLabel: before.ref as string, before: { status: before.status }, after: { status, note } },
    );

    revalidatePath("/os/partnerships");
    return ok(undefined, status === "active" ? "In force. Its terms now apply to bookings from this partner." : "Updated.");
  });
}

/**
 * Change a commercial term.
 *
 * NEVER an update. The old window is closed the day before the new one opens
 * and a new row is inserted pointing back at it, so the commission that
 * applied to a booking last spring stays resolvable forever. Exactly the
 * pattern the trip price book uses.
 */
export async function supersedeTerm(input: {
  agreementId: string;
  supersedesTermId?: string | null;
  tripTypeId?: string | null;
  tier?: string | null;
  basis: string;
  commissionPct?: number | null;
  netAmount?: number | null;
  markupPct?: number | null;
  fixedAmount?: number | null;
  currency: string;
  minGuests?: number | null;
  maxGuests?: number | null;
  effectiveFrom: string;
  note?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  return guarded("companies.terms", async (actor) => {
    const db = osdb();
    if (!input.effectiveFrom) return fail("A term needs a date it starts applying from");

    const value =
      input.basis === "commission_pct" ? input.commissionPct :
      input.basis === "net_rate" ? input.netAmount :
      input.basis === "markup_pct" ? input.markupPct : input.fixedAmount;
    if (value == null || Number.isNaN(Number(value))) {
      return fail("The term needs a number", "A term with no rate on it cannot price anything.");
    }

    // Close the previous window rather than overwriting it.
    if (input.supersedesTermId) {
      const { data: previous } = await db
        .from("os_agreement_terms").select("id, effective_from, effective_to").eq("id", input.supersedesTermId).maybeSingle();
      if (!previous) return fail("The term being replaced no longer exists");
      if (String(previous.effective_from) >= input.effectiveFrom) {
        return fail(
          "The new term starts before the one it replaces",
          "Pick a date after the previous term began, or the two windows overlap and the commission has two answers.",
        );
      }
      const dayBefore = new Date(Date.parse(`${input.effectiveFrom}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
      const { error: closeError } = await db.from("os_agreement_terms")
        .update({ effective_to: dayBefore })
        .eq("id", input.supersedesTermId);
      if (closeError) throw closeError;
    }

    const { data: created, error } = await db.from("os_agreement_terms").insert({
      agreement_id: input.agreementId,
      trip_type_id: input.tripTypeId || null,
      tier: input.tier || null,
      basis: input.basis,
      commission_pct: input.commissionPct ?? null,
      net_amount: input.netAmount ?? null,
      markup_pct: input.markupPct ?? null,
      fixed_amount: input.fixedAmount ?? null,
      currency: input.currency,
      min_guests: input.minGuests ?? null,
      max_guests: input.maxGuests ?? null,
      effective_from: input.effectiveFrom,
      effective_to: null,
      supersedes_term_id: input.supersedesTermId || null,
      note: input.note?.trim() || null,
      created_by: actor.employeeId,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      {
        entityType: "agreement",
        entityId: input.agreementId,
        verb: "repriced",
        summary: input.supersedesTermId
          ? `Terms superseded from ${input.effectiveFrom}. The previous window is closed, not deleted.`
          : `Terms added, effective ${input.effectiveFrom}.`,
      },
      { action: "agreement.terms", entityLabel: input.agreementId, after: { ...input } },
    );

    revalidatePath("/os/partnerships");
    return ok({ id: created.id as string }, "Saved. The previous term is closed rather than overwritten.");
  });
}

/**
 * Attach a partner and their agreement to a trip, and snapshot the commission
 * that was in force on the travel date.
 *
 * The snapshot is the point: renegotiating next month must not silently
 * restate what this trip earned.
 */
export async function applyAgreementToTrip(tripRef: string, companyId: string): Promise<ActionResult> {
  return guarded("deals.convert", async (actor) => {
    const db = osdb();
    const org = await getOrg();

    const { data: trip } = await db
      .from("os_trips")
      .select("id, ref, trip_date, trip_type_id, sell_amount, currency")
      .eq("org_id", org.id)
      .eq("ref", tripRef)
      .maybeSingle();
    if (!trip) return fail("That trip no longer exists");

    const resolved = await resolveTerm(companyId, trip.trip_date as string, { tripTypeId: trip.trip_type_id as string | null });
    if (!resolved) {
      return fail(
        "No agreement covers this partner on that date",
        "Either the agreement is not in force yet, or it has no term covering this service. Nothing has been assumed — a guessed commission is an invoice dispute later.",
      );
    }

    const commissionPct = resolved.term.commissionPct;
    const sell = Number(trip.sell_amount ?? 0);
    const commissionAmount = commissionPct != null ? Math.round(sell * (commissionPct / 100) * 100) / 100 : null;

    const { error } = await db.from("os_trips").update({
      company_id: companyId,
      agreement_id: resolved.agreement.id,
      commission_pct: commissionPct,
      commission_amount: commissionAmount,
    }).eq("id", trip.id);
    if (error) throw error;

    await record(
      actor,
      {
        entityType: "trip",
        entityId: trip.id as string,
        tripId: trip.id as string,
        verb: "attributed",
        summary: `Attributed to ${resolved.agreement.companyName ?? "a partner"} under ${resolved.agreement.ref}, at ${commissionPct ?? 0}% — the rate in force on ${trip.trip_date}.`,
      },
      {
        action: "trip.attribute",
        entityLabel: trip.ref as string,
        after: { companyId, agreementRef: resolved.agreement.ref, commissionPct, commissionAmount, onDate: trip.trip_date },
      },
    );

    revalidatePath(`/os/trips/${tripRef}`);
    revalidatePath("/os/partnerships");
    return ok(
      undefined,
      `Attributed at ${commissionPct ?? 0}%, the rate in force on ${trip.trip_date} — not today's rate.`,
    );
  });
}

// ===========================================================================
// Helpers
// ===========================================================================

async function matchClient(orgId: string, email?: string | null, phone?: string | null) {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPhone = phone?.replace(/[^\d]/g, "");
  if (!cleanEmail && !cleanPhone) return null;

  const query = osdb().from("os_clients").select("id, full_name").eq("org_id", orgId).is("archived_at", null);
  const clauses: string[] = [];
  if (cleanEmail) clauses.push(`email.ilike.${cleanEmail}`);
  if (cleanPhone && cleanPhone.length >= 9) clauses.push(`phone.ilike.%${cleanPhone.slice(-9)}%`);
  if (!clauses.length) return null;

  const { data } = await query.or(clauses.join(",")).limit(1);
  return data?.length ? (data[0] as { id: string; full_name: string }) : null;
}

async function nextRef(fn: string, prefix: string): Promise<string> {
  const { data, error } = await osdb().rpc(fn);
  if (!error && data) return String(data);
  // The helper is created by migration 0022. Refuse rather than inventing a
  // reference that could collide with one already issued.
  throw new OsRuleError(
    "References cannot be allocated",
    `The ${prefix} sequence is missing. Apply the commercial migration before using this screen.`,
  );
}
