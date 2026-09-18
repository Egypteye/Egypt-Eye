import "server-only";
import { osdb, getOrg } from "../db";
import { can, type Actor } from "../actor";
import { nowMs } from "../dates";
import { commercialScope, applyCommercialScope } from "./scope";
import { getStages, stageAge } from "./pipeline";
import type { DealListItem, DealStage, Pipeline } from "./types";

// ---------------------------------------------------------------------------
// THE PIPELINE
// ---------------------------------------------------------------------------
// ONE table, two pipelines. `pipeline` is a filter, not a different system —
// which is why "how much is open across the business" is a single query, and
// why a B2C enquiry that turns out to be an agency is re-pointed rather than
// re-typed.
//
// Money is stripped rather than hidden. An actor without deals.value gets a
// list where `money` is null — the amount is absent from the response, not
// styled out of the page.
// ---------------------------------------------------------------------------

export type DealFilters = {
  pipeline?: Pipeline;
  stageKeys?: string[];
  statuses?: string[];
  ownerId?: string;
  mineOnly?: boolean;
  companyId?: string;
  clientId?: string;
  stalledOnly?: boolean;
  closingBefore?: string;
  search?: string;
  limit?: number;
};

const DEAL_SELECT =
  "id, ref, pipeline, title, status, stage_id, client_id, company_id, owner_employee_id, " +
  "value_amount, currency, probability_pct, probability_source, expected_close_on, " +
  "requested_date, guests, source, campaign, next_step, next_step_due_on, " +
  "stage_entered_at, last_activity_at, lost_note, lost_to, unit_id, " +
  "os_deal_stages ( id, key, label, category, color, sort_order, probability_pct, stale_after_days ), " +
  "os_clients ( id, full_name ), " +
  "os_companies ( id, name ), " +
  "os_lost_reasons ( label, controllable ), " +
  "os_employees!os_deals_owner_employee_id_fkey ( full_name ), " +
  "os_trip_types ( name )";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listDeals(actor: Actor, filters: DealFilters = {}): Promise<DealListItem[]> {
  if (!can(actor, "deals.view")) return [];
  const org = await getOrg();
  const scope = commercialScope(actor, "deals.view");
  if (scope.kind === "none") return [];

  let query = osdb().from("os_deals").select(DEAL_SELECT).eq("org_id", org.id).is("archived_at", null);
  query = applyCommercialScope(query, scope, {
    ownerColumn: "owner_employee_id",
    createdColumn: "created_by",
    unitColumn: "unit_id",
  });

  if (filters.pipeline) query = query.eq("pipeline", filters.pipeline);
  if (filters.statuses?.length) query = query.in("status", filters.statuses);
  if (filters.ownerId) query = query.eq("owner_employee_id", filters.ownerId);
  if (filters.mineOnly) query = query.eq("owner_employee_id", actor.employeeId);
  if (filters.companyId) query = query.eq("company_id", filters.companyId);
  if (filters.clientId) query = query.eq("client_id", filters.clientId);
  if (filters.closingBefore) query = query.lte("expected_close_on", filters.closingBefore);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`ref.ilike.%${term}%,title.ilike.%${term}%`);
  }

  const { data } = await query.order("stage_entered_at", { ascending: true }).limit(filters.limit ?? 300);
  const rows = (data ?? []) as Raw[];

  const now = nowMs();
  let items = rows.map((row) => toDealItem(row, actor, now));
  if (filters.stageKeys?.length) items = items.filter((d) => d.stageKey && filters.stageKeys!.includes(d.stageKey));
  if (filters.stalledOnly) items = items.filter((d) => d.stalled && d.status === "open");
  return items;
}

export async function getDeal(actor: Actor, ref: string): Promise<DealListItem | null> {
  if (!can(actor, "deals.view")) return null;
  const org = await getOrg();
  const scope = commercialScope(actor, "deals.view");
  if (scope.kind === "none") return null;

  const { data } = await osdb().from("os_deals").select(DEAL_SELECT).eq("org_id", org.id).eq("ref", ref).maybeSingle();
  if (!data) return null;
  const row = data as Raw;

  if (scope.kind === "own" && row.owner_employee_id !== actor.employeeId) return null;
  if (scope.kind === "unit" && row.unit_id && !scope.unitIds.includes(row.unit_id)) return null;

  return toDealItem(row, actor, nowMs());
}

function toDealItem(row: Raw, actor: Actor, now: number): DealListItem {
  const stage = row.os_deal_stages;
  const probability = row.probability_pct ?? stage?.probability_pct ?? 0;
  const value = Number(row.value_amount ?? 0);
  const age = stageAge(row.stage_entered_at, stage?.stale_after_days ?? null, now);
  const showMoney = can(actor, "deals.value");

  return {
    id: row.id,
    ref: row.ref,
    pipeline: row.pipeline,
    title: row.title,
    status: row.status,
    stageId: row.stage_id,
    stageKey: stage?.key ?? null,
    stageLabel: stage?.label ?? null,
    stageCategory: stage?.category ?? null,
    stageColor: stage?.color ?? "#7c8a91",
    clientId: row.os_clients?.id ?? null,
    clientName: row.os_clients?.full_name ?? null,
    companyId: row.os_companies?.id ?? null,
    companyName: row.os_companies?.name ?? null,
    ownerId: row.owner_employee_id,
    ownerName: row.os_employees?.full_name ?? null,
    expectedCloseOn: row.expected_close_on,
    requestedDate: row.requested_date,
    guests: row.guests,
    typeName: row.os_trip_types?.name ?? null,
    source: row.source,
    nextStep: row.next_step,
    nextStepDueOn: row.next_step_due_on,
    stageEnteredAt: row.stage_entered_at,
    lastActivityAt: row.last_activity_at,
    daysInStage: age.days,
    stalled: age.stalled,
    lostReason: row.os_lost_reasons?.label ?? null,
    lostNote: row.lost_note,
    // Absent from the payload entirely, not hidden in CSS.
    money: showMoney
      ? {
          value,
          currency: row.currency ?? "USD",
          probabilityPct: probability,
          probabilitySource: (row.probability_source ?? "stage") as "stage" | "owner",
          weighted: Math.round(value * (probability / 100) * 100) / 100,
        }
      : null,
  };
}

/** The board: every stage in a pipeline with its deals, in stage order. */
export async function pipelineBoard(
  actor: Actor,
  pipeline: Pipeline,
  filters: DealFilters = {},
): Promise<{ stage: DealStage; deals: DealListItem[] }[]> {
  const [stages, deals] = await Promise.all([
    getStages(pipeline),
    listDeals(actor, { ...filters, pipeline, statuses: filters.statuses ?? ["open"] }),
  ]);
  return stages
    .filter((s) => s.category !== "lost" || (filters.statuses ?? []).includes("lost"))
    .map((stage) => ({ stage, deals: deals.filter((d) => d.stageId === stage.id) }));
}

/** The stage history of one deal, oldest first. Append-only, so this is the whole truth. */
export async function dealStageHistory(dealId: string) {
  const { data } = await osdb()
    .from("os_deal_stage_history")
    .select(
      "id, note, days_in_previous_stage, changed_at, to_status, " +
      "from_stage:os_deal_stages!os_deal_stage_history_from_stage_id_fkey ( label ), " +
      "to_stage:os_deal_stages!os_deal_stage_history_to_stage_id_fkey ( label ), " +
      "os_employees ( full_name )",
    )
    .eq("deal_id", dealId)
    .order("changed_at", { ascending: true });

  return ((data ?? []) as Raw[]).map((row) => ({
    id: row.id as string,
    fromStage: row.from_stage?.label ?? null,
    toStage: row.to_stage?.label ?? null,
    toStatus: row.to_status as string | null,
    note: row.note as string | null,
    daysInPrevious: row.days_in_previous_stage ? Number(row.days_in_previous_stage) : null,
    by: row.os_employees?.full_name ?? "System",
    at: row.changed_at as string,
  }));
}
