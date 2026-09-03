import "server-only";
import { osdb, getOrg } from "../db";
import type { DealStage, Pipeline, StageBlocker } from "./types";

// ---------------------------------------------------------------------------
// STAGES, AND WHAT STANDS BETWEEN A DEAL AND THE NEXT ONE
// ---------------------------------------------------------------------------
// Stages are configuration (os_deal_stages). Each one carries a `requirements`
// document, and this file is the only place that knows what those keys mean.
//
// The rule the whole module follows: a refusal must NAME what is missing and
// where to fix it. "You cannot move this deal" is a dead end; "No decision
// maker is recorded at Southern Cross Journeys — add one on the company" is a
// next action. Every requirement below returns the second kind.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getStages(pipeline: Pipeline): Promise<DealStage[]> {
  const org = await getOrg();
  const { data } = await osdb()
    .from("os_deal_stages")
    .select("id, pipeline, key, label, description, category, color, sort_order, probability_pct, stale_after_days, requirements")
    .eq("org_id", org.id)
    .eq("pipeline", pipeline)
    .eq("active", true)
    .order("sort_order");

  return ((data ?? []) as Raw[]).map((row) => ({
    id: row.id,
    pipeline: row.pipeline,
    key: row.key,
    label: row.label,
    description: row.description,
    category: row.category,
    color: row.color,
    sortOrder: row.sort_order,
    probabilityPct: row.probability_pct,
    staleAfterDays: row.stale_after_days,
    requirements: (row.requirements ?? {}) as Record<string, boolean>,
  }));
}

export async function getAllStages(): Promise<DealStage[]> {
  const [b2c, b2b] = await Promise.all([getStages("b2c"), getStages("b2b")]);
  return [...b2c, ...b2b];
}

const REQUIREMENT_LABELS: Record<string, string> = {
  company: "A partner company",
  contact: "A way to reach them",
  interest: "What they actually want",
  date: "A travel date",
  value: "What the deal is worth",
  quote: "A quote",
  quote_or_terms: "A quote or proposed terms",
  engagement: "A logged conversation",
  decision_maker: "Somebody who can decide",
  agreement: "A drafted agreement",
  agreement_active: "An agreement in force",
  lost_reason: "A reason it was lost",
};

/**
 * What is standing between this deal and the target stage.
 *
 * Returns an empty array when the move is allowed. Every entry names the
 * missing thing and says where to supply it, because a refusal a person
 * cannot act on is just an obstacle.
 */
export async function stageBlockers(dealId: string, targetStage: DealStage): Promise<StageBlocker[]> {
  const requirements = Object.entries(targetStage.requirements)
    .filter(([, required]) => required)
    .map(([key]) => key);
  if (!requirements.length) return [];

  const db = osdb();
  const { data: deal } = await db
    .from("os_deals")
    .select("id, ref, pipeline, client_id, company_id, value_amount, requested_date, expected_close_on, lost_reason_id, primary_quote_id")
    .eq("id", dealId)
    .maybeSingle();
  if (!deal) return [{ key: "deal", label: "The deal", detail: "This deal no longer exists." }];

  const row = deal as Raw;
  const needs = new Set(requirements);
  const blockers: StageBlocker[] = [];

  const [quotes, engagements, contacts, agreements, client] = await Promise.all([
    needs.has("quote") || needs.has("quote_or_terms")
      ? db.from("os_deal_quotes").select("quote_id").eq("deal_id", dealId).limit(1)
      : Promise.resolve({ data: [] as Raw[] }),
    needs.has("engagement")
      ? db.from("os_engagements").select("id").eq("deal_id", dealId).limit(1)
      : Promise.resolve({ data: [] as Raw[] }),
    needs.has("decision_maker") && row.company_id
      ? db.from("os_client_companies").select("id, decision_role").eq("company_id", row.company_id).is("ended_on", null)
      : Promise.resolve({ data: [] as Raw[] }),
    needs.has("agreement") || needs.has("agreement_active")
      ? db.from("os_agreements").select("id, status").eq("deal_id", dealId)
      : Promise.resolve({ data: [] as Raw[] }),
    needs.has("contact") && row.client_id
      ? db.from("os_clients").select("phone, whatsapp, email").eq("id", row.client_id).maybeSingle()
      : Promise.resolve({ data: null as Raw }),
  ]);

  const add = (key: string, detail: string) =>
    blockers.push({ key, label: REQUIREMENT_LABELS[key] ?? key, detail });

  if (needs.has("company") && !row.company_id) {
    add("company", "This deal is not attached to a partner company. Open the deal and link one, or create the company first.");
  }
  if (needs.has("contact")) {
    const c = client.data as Raw;
    const reachable = Boolean(c?.phone || c?.whatsapp || c?.email);
    if (!row.client_id) add("contact", "No person is attached to this deal. Link the client record.");
    else if (!reachable) add("contact", "The client record has no phone, WhatsApp or email. Add one on their profile.");
  }
  if (needs.has("date") && !row.requested_date) {
    add("date", "No travel date is recorded. Add it on the deal — the operation cannot be planned without one.");
  }
  if (needs.has("value") && !(Number(row.value_amount) > 0)) {
    add("value", "The deal is still worth zero. Price it before marking it won, or the forecast and the revenue report both lie.");
  }
  if (needs.has("quote") && !(quotes.data ?? []).length) {
    add("quote", "No quote is attached. Build one in the calculator and attach it to the deal.");
  }
  if (needs.has("quote_or_terms")) {
    const hasQuote = (quotes.data ?? []).length > 0;
    const hasAgreement = ((agreements.data ?? []) as Raw[]).length > 0;
    if (!hasQuote && !hasAgreement) {
      add("quote_or_terms", "Nothing priced has been sent. Attach a quote, or draft the agreement carrying the terms.");
    }
  }
  if (needs.has("engagement") && !(engagements.data ?? []).length) {
    add("engagement", "No conversation has been logged. Record the call or meeting that moved this forward.");
  }
  if (needs.has("decision_maker")) {
    const people = (contacts.data ?? []) as Raw[];
    const found = people.some((p) => ["decision_maker", "signatory"].includes(p.decision_role));
    if (!found) {
      add(
        "decision_maker",
        "Nobody at this company is recorded as able to decide. B2B deals stall here more than anywhere else — add the contact and their role on the partner record.",
      );
    }
  }
  if (needs.has("agreement") && !((agreements.data ?? []) as Raw[]).length) {
    add("agreement", "No agreement is drafted for this deal. Create one on the partner record.");
  }
  if (needs.has("agreement_active")) {
    const active = ((agreements.data ?? []) as Raw[]).some((a) => a.status === "active");
    if (!active) {
      add("agreement_active", "The agreement is not in force yet. Activating it needs the agreements permission and a signed copy.");
    }
  }
  if (needs.has("lost_reason") && !row.lost_reason_id) {
    add("lost_reason", "A lost deal needs its reason. It is the only thing that makes the loss worth anything later.");
  }

  return blockers;
}

/** Days a deal has sat where it is, and whether that is past the stage's own limit. */
export function stageAge(stageEnteredAt: string, staleAfterDays: number | null, now: number): { days: number; stalled: boolean } {
  const days = Math.max(0, Math.floor((now - Date.parse(stageEnteredAt)) / 86_400_000));
  return { days, stalled: staleAfterDays != null && days > staleAfterDays };
}
