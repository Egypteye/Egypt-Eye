import "server-only";
import { osdb, getOrg } from "../db";
import { can, type Actor } from "../actor";
import { todayInCairo, addDays } from "../dates";
import { commercialScope, applyCommercialScope } from "./scope";
import { getAllStages } from "./pipeline";
import type { Pipeline } from "./types";

// ---------------------------------------------------------------------------
// COMMERCIAL REPORTING
// ---------------------------------------------------------------------------
// Everything here is derived at read time from the same rows the workspaces
// show. There is no reporting copy of the pipeline, so a number on this page
// and a number on the board can never disagree.
//
// Two habits carried over from the operations analytics:
//   * A figure the actor may not see is ABSENT, not blanked.
//   * A conversion rate is always shown with its denominator. "38%" with no
//     "of 21" behind it is a number nobody can sanity-check.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type PipelineSummary = {
  pipeline: Pipeline;
  open: number;
  won: number;
  lost: number;
  /** Present only with deals.value. */
  money: { openValue: number; weighted: number; wonValue: number; currency: string } | null;
  stages: { key: string; label: string; color: string; count: number; value: number | null }[];
  stalled: number;
};

export async function pipelineSummary(actor: Actor, pipeline: Pipeline): Promise<PipelineSummary | null> {
  if (!can(actor, "deals.view")) return null;
  const org = await getOrg();
  const scope = commercialScope(actor, "deals.view");
  if (scope.kind === "none") return null;

  let query = osdb()
    .from("os_deals")
    .select("id, status, stage_id, value_amount, currency, probability_pct, stage_entered_at, unit_id, owner_employee_id, created_by")
    .eq("org_id", org.id)
    .eq("pipeline", pipeline)
    .is("archived_at", null);
  query = applyCommercialScope(query, scope, {
    ownerColumn: "owner_employee_id",
    createdColumn: "created_by",
    unitColumn: "unit_id",
  });

  const [{ data }, stages] = await Promise.all([query, getAllStages()]);
  const rows = (data ?? []) as Raw[];
  const stageById = new Map(stages.map((s) => [s.id, s]));
  const showMoney = can(actor, "deals.value");
  const now = Date.now();

  const open = rows.filter((d) => d.status === "open");
  const won = rows.filter((d) => d.status === "won");
  const lost = rows.filter((d) => d.status === "lost");

  const weighted = open.reduce((total, d) => {
    const stage = stageById.get(d.stage_id);
    const probability = d.probability_pct ?? stage?.probabilityPct ?? 0;
    return total + Number(d.value_amount ?? 0) * (probability / 100);
  }, 0);

  const stalled = open.filter((d) => {
    const stage = stageById.get(d.stage_id);
    if (!stage?.staleAfterDays) return false;
    return (now - Date.parse(d.stage_entered_at)) / 86_400_000 > stage.staleAfterDays;
  }).length;

  return {
    pipeline,
    open: open.length,
    won: won.length,
    lost: lost.length,
    money: showMoney
      ? {
          openValue: round(open.reduce((t, d) => t + Number(d.value_amount ?? 0), 0)),
          weighted: round(weighted),
          wonValue: round(won.reduce((t, d) => t + Number(d.value_amount ?? 0), 0)),
          currency: actor.baseCurrency,
        }
      : null,
    stages: stages
      .filter((s) => s.pipeline === pipeline && s.category !== "lost")
      .map((stage) => {
        const inStage = open.filter((d) => d.stage_id === stage.id);
        return {
          key: stage.key,
          label: stage.label,
          color: stage.color,
          count: inStage.length,
          value: showMoney ? round(inStage.reduce((t, d) => t + Number(d.value_amount ?? 0), 0)) : null,
        };
      }),
    stalled,
  };
}

export type SourcePerformance = {
  source: string;
  leads: number;
  answered: number;
  qualified: number;
  won: number;
  /** Won as a share of leads, with the denominator kept so it can be checked. */
  conversionPct: number;
  medianResponseMinutes: number | null;
  revenue: number | null;
};

/**
 * Which channels actually produce business.
 *
 * Deliberately counts leads, not impressions: the OS has no advertising data
 * and inventing a cost-per-lead here would be exactly the fake functionality
 * the brief forbids.
 */
export async function sourcePerformance(actor: Actor, days = 180): Promise<SourcePerformance[]> {
  if (!can(actor, "commercial.analytics")) return [];
  const org = await getOrg();
  const db = osdb();
  const from = addDays(todayInCairo(), -days);

  const [leadsRes, dealsRes, attributionRes] = await Promise.all([
    db.from("os_leads")
      .select("id, source, status, first_response_minutes, deal_id")
      .eq("org_id", org.id)
      .gte("received_at", `${from}T00:00:00Z`),
    db.from("os_deals").select("id, source, status, value_amount").eq("org_id", org.id),
    can(actor, "deals.value")
      ? db.from("os_revenue_attribution").select("channel, revenue_amount").eq("org_id", org.id).gte("recognised_on", from)
      : Promise.resolve({ data: [] as Raw[] }),
  ]);

  const leads = (leadsRes.data ?? []) as Raw[];
  const deals = (dealsRes.data ?? []) as Raw[];
  const wonDealIds = new Set(deals.filter((d) => d.status === "won").map((d) => d.id as string));

  const revenueBySource = new Map<string, number>();
  for (const row of (attributionRes.data ?? []) as Raw[]) {
    const key = String(row.channel ?? "Unknown");
    revenueBySource.set(key, (revenueBySource.get(key) ?? 0) + Number(row.revenue_amount ?? 0));
  }

  const bySource = new Map<string, Raw[]>();
  for (const lead of leads) {
    const key = String(lead.source ?? "other");
    bySource.set(key, [...(bySource.get(key) ?? []), lead]);
  }

  return Array.from(bySource.entries())
    .map(([source, rows]) => {
      const answered = rows.filter((l) => l.first_response_minutes != null);
      const qualified = rows.filter((l) => ["qualified", "converted"].includes(l.status)).length;
      const won = rows.filter((l) => l.deal_id && wonDealIds.has(l.deal_id)).length;
      const times = answered.map((l) => Number(l.first_response_minutes)).sort((a, b) => a - b);
      return {
        source,
        leads: rows.length,
        answered: answered.length,
        qualified,
        won,
        conversionPct: rows.length ? Math.round((won / rows.length) * 1000) / 10 : 0,
        medianResponseMinutes: times.length ? times[Math.floor(times.length / 2)] : null,
        revenue: can(actor, "deals.value") ? round(revenueBySource.get(source) ?? 0) : null,
      };
    })
    .sort((a, b) => b.leads - a.leads);
}

export type LossBreakdown = {
  reason: string;
  controllable: boolean;
  count: number;
  value: number | null;
};

/**
 * Why deals are lost, split by whether Egypt Eye could have changed it.
 *
 * The split is the entire point. A quarter lost to price is a pricing
 * decision; a quarter lost to cancelled travel is weather, and a list that
 * mixes them teaches nobody anything.
 */
export async function lossBreakdown(actor: Actor, pipeline?: Pipeline): Promise<LossBreakdown[]> {
  if (!can(actor, "commercial.analytics")) return [];
  const org = await getOrg();

  let query = osdb()
    .from("os_deals")
    .select("id, value_amount, pipeline, os_lost_reasons ( label, controllable )")
    .eq("org_id", org.id)
    .eq("status", "lost");
  if (pipeline) query = query.eq("pipeline", pipeline);

  const { data } = await query;
  const showMoney = can(actor, "deals.value");
  const grouped = new Map<string, { controllable: boolean; count: number; value: number }>();

  for (const row of (data ?? []) as Raw[]) {
    const label = row.os_lost_reasons?.label ?? "No reason recorded";
    const controllable = Boolean(row.os_lost_reasons?.controllable);
    const current = grouped.get(label) ?? { controllable, count: 0, value: 0 };
    current.count += 1;
    current.value += Number(row.value_amount ?? 0);
    grouped.set(label, current);
  }

  return Array.from(grouped.entries())
    .map(([reason, v]) => ({ reason, controllable: v.controllable, count: v.count, value: showMoney ? round(v.value) : null }))
    .sort((a, b) => b.count - a.count);
}

export type PartnerRevenue = {
  companyId: string;
  name: string;
  trips: number;
  revenue: number;
  commission: number;
  currency: string;
};

/** What each partnership actually earns, from the attribution snapshots. */
export async function partnerRevenue(actor: Actor, days = 365): Promise<PartnerRevenue[]> {
  if (!can(actor, "commercial.analytics") || !can(actor, "deals.value")) return [];
  const org = await getOrg();
  const from = addDays(todayInCairo(), -days);

  const { data } = await osdb()
    .from("os_revenue_attribution")
    .select("company_id, revenue_amount, commission_amount, currency, os_companies ( name )")
    .eq("org_id", org.id)
    .not("company_id", "is", null)
    .gte("recognised_on", from);

  const grouped = new Map<string, PartnerRevenue>();
  for (const row of (data ?? []) as Raw[]) {
    const id = row.company_id as string;
    const current = grouped.get(id) ?? {
      companyId: id,
      name: row.os_companies?.name ?? "Unknown partner",
      trips: 0,
      revenue: 0,
      commission: 0,
      currency: row.currency ?? actor.baseCurrency,
    };
    current.trips += 1;
    current.revenue += Number(row.revenue_amount ?? 0);
    current.commission += Number(row.commission_amount ?? 0);
    grouped.set(id, current);
  }

  return Array.from(grouped.values())
    .map((p) => ({ ...p, revenue: round(p.revenue), commission: round(p.commission) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export type ResponseSummary = {
  targetMinutes: number;
  answered: number;
  withinTarget: number;
  medianMinutes: number | null;
  waiting: number;
  overdue: number;
};

/** How fast enquiries are actually answered, against the configured target. */
export async function responseSummary(actor: Actor, days = 30): Promise<ResponseSummary | null> {
  if (!can(actor, "leads.view")) return null;
  const org = await getOrg();
  const db = osdb();
  const from = addDays(todayInCairo(), -days);

  const [{ data: setting }, { data }] = await Promise.all([
    db.from("os_settings").select("value").eq("org_id", org.id).eq("key", "commercial.first_response_target_minutes").maybeSingle(),
    db.from("os_leads")
      .select("id, status, received_at, first_response_minutes")
      .eq("org_id", org.id)
      .gte("received_at", `${from}T00:00:00Z`),
  ]);

  const targetMinutes = Number(setting?.value ?? 60) || 60;
  const rows = (data ?? []) as Raw[];
  const answered = rows.filter((l) => l.first_response_minutes != null);
  const times = answered.map((l) => Number(l.first_response_minutes)).sort((a, b) => a - b);
  const open = rows.filter((l) => l.first_response_minutes == null && !["lost", "unqualified", "duplicate"].includes(l.status));
  const now = Date.now();

  return {
    targetMinutes,
    answered: answered.length,
    withinTarget: times.filter((m) => m <= targetMinutes).length,
    medianMinutes: times.length ? times[Math.floor(times.length / 2)] : null,
    waiting: open.length,
    overdue: open.filter((l) => (now - Date.parse(l.received_at)) / 60_000 > targetMinutes).length,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
