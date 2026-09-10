import "server-only";
import { osdb, getOrg } from "../db";
import { can, type Actor } from "../actor";
import { commercialScope, applyCommercialScope } from "./scope";
import { loadScoreRules, scoreLead, averageBookingValue, firstResponseTargetMinutes, bandFor } from "./scoring";
import type { LeadListItem, Pipeline, ScoreFactor } from "./types";

// ---------------------------------------------------------------------------
// ENQUIRIES
// ---------------------------------------------------------------------------
// This is NOT an inbox. Egypt Eye answers people on Instagram, WhatsApp and
// email, and those tools are better at it than anything built here. A lead
// records that an enquiry ARRIVED — where from, what it asked for, who owns
// it, how fast we replied, and what became of it.
//
// Scores are recomputed on read rather than trusted from the cache, for the
// same reason readiness is: a lead scored yesterday against today's rules is
// a number nobody can defend. The recompute is written back only when it
// actually changed.
// ---------------------------------------------------------------------------

export type LeadFilters = {
  pipeline?: Pipeline;
  statuses?: string[];
  ownerId?: string;
  mineOnly?: boolean;
  source?: string;
  band?: string;
  unansweredOnly?: boolean;
  search?: string;
  limit?: number;
};

const LEAD_SELECT =
  "id, ref, pipeline, contact_name, contact_email, contact_phone, contact_whatsapp, contact_instagram, " +
  "company_name, country, language, client_id, company_id, source, campaign, " +
  "referred_by_client_id, referred_by_company_id, interest, requested_date, date_flexible, guests, " +
  "budget_amount, budget_currency, message, status, owner_employee_id, " +
  "score, score_band, score_factors, received_at, first_response_at, first_response_minutes, notes, " +
  "os_trip_types ( name ), os_employees!os_leads_owner_employee_id_fkey ( full_name )";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listLeads(actor: Actor, filters: LeadFilters = {}): Promise<LeadListItem[]> {
  if (!can(actor, "leads.view")) return [];
  const org = await getOrg();
  const db = osdb();
  const scope = commercialScope(actor, "leads.view");
  if (scope.kind === "none") return [];

  let query = db.from("os_leads").select(LEAD_SELECT).eq("org_id", org.id).is("archived_at", null);
  query = applyCommercialScope(query, scope, {
    ownerColumn: "owner_employee_id",
    createdColumn: "created_by",
    unitColumn: "unit_id",
  });

  if (filters.pipeline) query = query.eq("pipeline", filters.pipeline);
  if (filters.statuses?.length) query = query.in("status", filters.statuses);
  if (filters.ownerId) query = query.eq("owner_employee_id", filters.ownerId);
  if (filters.mineOnly) query = query.eq("owner_employee_id", actor.employeeId);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.unansweredOnly) query = query.is("first_response_at", null);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) {
      query = query.or(
        `ref.ilike.%${term}%,contact_name.ilike.%${term}%,contact_email.ilike.%${term}%,company_name.ilike.%${term}%`,
      );
    }
  }

  const { data } = await query.order("received_at", { ascending: false }).limit(filters.limit ?? 200);
  const rows = (data ?? []) as Raw[];
  if (!rows.length) return [];

  const scored = await rescore(rows);
  let items = rows.map((row) => toLeadItem(row, scored.get(row.id)!, scored.get(row.id)!.targetMinutes));
  if (filters.band) items = items.filter((l) => l.scoreBand === filters.band);
  return items;
}

export async function getLead(actor: Actor, ref: string): Promise<LeadListItem | null> {
  if (!can(actor, "leads.view")) return null;
  const org = await getOrg();
  const scope = commercialScope(actor, "leads.view");
  if (scope.kind === "none") return null;

  const { data } = await osdb().from("os_leads").select(LEAD_SELECT).eq("org_id", org.id).eq("ref", ref).maybeSingle();
  if (!data) return null;
  const row = data as Raw;

  if (scope.kind === "own" && row.owner_employee_id !== actor.employeeId) return null;
  if (scope.kind === "unit" && row.unit_id && !scope.unitIds.includes(row.unit_id)) return null;

  const scored = await rescore([row]);
  const result = scored.get(row.id)!;
  return toLeadItem(row, result, result.targetMinutes);
}

type Rescored = { score: number; band: LeadListItem["scoreBand"]; factors: ScoreFactor[]; targetMinutes: number };

/**
 * Recompute every lead's score against the CURRENT published rules, in a
 * handful of queries rather than one per lead, and write back only what moved.
 */
async function rescore(rows: Raw[]): Promise<Map<string, Rescored>> {
  const db = osdb();
  const [rules, average, targetMinutes] = await Promise.all([
    loadScoreRules(),
    averageBookingValue(),
    firstResponseTargetMinutes(),
  ]);

  const clientIds = Array.from(new Set(rows.map((r) => r.client_id).filter(Boolean))) as string[];
  const companyIds = Array.from(new Set(rows.map((r) => r.company_id).filter(Boolean))) as string[];

  const [returningRes, decisionRes] = await Promise.all([
    clientIds.length
      ? db.from("os_clients").select("id, lifetime_trips").in("id", clientIds)
      : Promise.resolve({ data: [] as Raw[] }),
    clientIds.length
      ? db.from("os_client_companies").select("client_id, company_id, decision_role").in("client_id", clientIds)
      : Promise.resolve({ data: [] as Raw[] }),
  ]);

  const returning = new Set(
    ((returningRes.data ?? []) as Raw[]).filter((c) => Number(c.lifetime_trips ?? 0) > 0).map((c) => c.id as string),
  );
  const decisionMakers = new Set(
    ((decisionRes.data ?? []) as Raw[])
      .filter((m) => ["decision_maker", "signatory"].includes(m.decision_role))
      .map((m) => m.client_id as string),
  );
  const knownCompanies = new Set(companyIds);

  const out = new Map<string, Rescored>();
  const updates: { id: string; score: number; score_band: string; score_factors: ScoreFactor[]; score_computed_at: string }[] = [];

  for (const row of rows) {
    const result = scoreLead(
      {
        pipeline: row.pipeline,
        requestedDate: row.requested_date,
        dateFlexible: Boolean(row.date_flexible),
        guests: row.guests,
        budgetAmount: row.budget_amount ? Number(row.budget_amount) : null,
        contactPhone: row.contact_phone,
        contactWhatsapp: row.contact_whatsapp,
        contactEmail: row.contact_email,
        contactInstagram: row.contact_instagram,
        message: row.message,
        source: row.source ?? "other",
        referredByClientId: row.referred_by_client_id,
        referredByCompanyId: row.referred_by_company_id,
        firstResponseMinutes: row.first_response_minutes,
        isReturningClient: row.client_id ? returning.has(row.client_id) : false,
        companyKnown: row.company_id ? knownCompanies.has(row.company_id) : false,
        isDecisionMaker: row.client_id ? decisionMakers.has(row.client_id) : false,
        statedVolume: null,
        outOfScope: row.status === "unqualified",
      },
      rules,
      { averageBookingValue: average, responseTargetMinutes: targetMinutes },
    );

    out.set(row.id, { ...result, targetMinutes });

    if (Number(row.score) !== result.score || row.score_band !== result.band) {
      updates.push({
        id: row.id,
        score: result.score,
        score_band: result.band,
        score_factors: result.factors,
        score_computed_at: new Date().toISOString(),
      });
    }
  }

  // Write back only what actually changed. A read that rewrites every row it
  // touched turns a list page into a write storm.
  await Promise.all(
    updates.map((u) =>
      db.from("os_leads").update({
        score: u.score,
        score_band: u.score_band,
        score_factors: u.score_factors,
        score_computed_at: u.score_computed_at,
      }).eq("id", u.id),
    ),
  );

  return out;
}

function toLeadItem(row: Raw, scored: Rescored, targetMinutes: number): LeadListItem {
  const ageMinutes = (Date.now() - Date.parse(row.received_at)) / 60_000;
  return {
    id: row.id,
    ref: row.ref,
    pipeline: row.pipeline,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone ?? row.contact_whatsapp,
    companyName: row.company_name,
    country: row.country,
    source: row.source ?? "other",
    campaign: row.campaign,
    interest: row.interest,
    typeName: row.os_trip_types?.name ?? null,
    requestedDate: row.requested_date,
    dateFlexible: Boolean(row.date_flexible),
    guests: row.guests,
    budgetAmount: row.budget_amount ? Number(row.budget_amount) : null,
    budgetCurrency: row.budget_currency,
    message: row.message,
    status: row.status,
    ownerId: row.owner_employee_id,
    ownerName: row.os_employees?.full_name ?? null,
    clientId: row.client_id,
    companyId: row.company_id,
    dealId: row.deal_id ?? null,
    score: scored.score,
    scoreBand: scored.band,
    scoreFactors: scored.factors,
    receivedAt: row.received_at,
    firstResponseAt: row.first_response_at,
    firstResponseMinutes: row.first_response_minutes,
    responseOverdue: !row.first_response_at && ageMinutes > targetMinutes && !["lost", "unqualified", "duplicate"].includes(row.status),
    notes: row.notes,
  };
}

export { bandFor };
