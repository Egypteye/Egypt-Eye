import "server-only";
import { osdb, getOrg } from "../db";
import { todayInCairo } from "../dates";
import type { ScoreFactor } from "./types";

// ---------------------------------------------------------------------------
// LEAD SCORING — arithmetic, published rules, no model
// ---------------------------------------------------------------------------
// The specification's instruction was "do not create unexplained AI scores".
// This is the whole of the mechanism, and it is deliberately boring:
//
//   1. The RULES live in os_lead_score_rules — a key, a label, a points
//      value, and an explanation written for a salesperson to read.
//   2. This file decides which rules MATCH a given lead, and why.
//   3. The score is the sum of the matched rules' points, clamped to 0-100.
//   4. Both the number AND the matched rules are stored on the lead, and
//      every screen that shows the number shows the list.
//
// Three consequences worth being explicit about:
//
//   * There is no weighting anywhere except the points column. Nothing is
//     multiplied by a coefficient nobody can see.
//   * A rule whose `explanation` is empty does not run. An unexplained
//     contribution is exactly the thing this refuses to produce, so the
//     database column is NOT NULL and this code skips blanks anyway.
//   * Changing a number is a configuration edit, and re-running the scorer
//     rescores every lead against the new published rules. It is a company
//     decision, not a developer's opinion compiled into the build.
//
// If Egypt Eye later wants a model here, the honest way in is to add it as
// one more NAMED factor with its own explanation and its own points, sitting
// beside these — not to replace the arithmetic with something opaque.
// ---------------------------------------------------------------------------

export type ScoreRule = {
  key: string;
  label: string;
  explanation: string;
  points: number;
  pipeline: "b2c" | "b2b" | null;
};

export type ScoredLead = {
  score: number;
  band: "hot" | "warm" | "cool" | "cold";
  factors: ScoreFactor[];
};

/** The facts about a lead that the rules are evaluated against. */
export type ScoringInput = {
  pipeline: "b2c" | "b2b";
  requestedDate: string | null;
  dateFlexible: boolean;
  guests: number | null;
  budgetAmount: number | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  contactInstagram: string | null;
  message: string | null;
  source: string;
  referredByClientId: string | null;
  referredByCompanyId: string | null;
  firstResponseMinutes: number | null;
  /** Resolved by the caller: this person has completed trips with us before. */
  isReturningClient: boolean;
  /** Resolved by the caller: their company is already in the partner book. */
  companyKnown: boolean;
  /** Resolved by the caller: the named contact can decide (B2B). */
  isDecisionMaker: boolean;
  /** Stated annual volume, when the enquiry gave one (B2B). */
  statedVolume: number | null;
  /** Set when somebody has marked the enquiry as outside what Egypt Eye sells. */
  outOfScope: boolean;
};

export async function loadScoreRules(): Promise<Map<string, ScoreRule>> {
  const org = await getOrg();
  const { data } = await osdb()
    .from("os_lead_score_rules")
    .select("key, label, explanation, points, pipeline")
    .eq("org_id", org.id)
    .eq("active", true)
    .order("sort_order");

  const rules = new Map<string, ScoreRule>();
  for (const row of data ?? []) {
    const explanation = String(row.explanation ?? "").trim();
    // A rule that cannot explain itself does not run. See the header.
    if (!explanation) continue;
    rules.set(row.key as string, {
      key: row.key as string,
      label: row.label as string,
      explanation,
      points: Number(row.points),
      pipeline: (row.pipeline as "b2c" | "b2b" | null) ?? null,
    });
  }
  return rules;
}

export async function averageBookingValue(): Promise<number> {
  const org = await getOrg();
  const { data } = await osdb()
    .from("os_settings")
    .select("value")
    .eq("org_id", org.id)
    .eq("key", "commercial.average_booking_value")
    .maybeSingle();
  const parsed = Number(data?.value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function firstResponseTargetMinutes(): Promise<number> {
  const org = await getOrg();
  const { data } = await osdb()
    .from("os_settings")
    .select("value")
    .eq("org_id", org.id)
    .eq("key", "commercial.first_response_target_minutes")
    .maybeSingle();
  const parsed = Number(data?.value ?? 60);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

/**
 * Score one lead.
 *
 * Every branch below decides ONE thing: did this rule match, and what is the
 * specific fact that made it match. The fact goes into `detail`, so the
 * screen can say "Travelling in 34 days" rather than only "Travelling within
 * 60 days".
 */
export function scoreLead(
  input: ScoringInput,
  rules: Map<string, ScoreRule>,
  context: { averageBookingValue: number; responseTargetMinutes: number },
): ScoredLead {
  const factors: ScoreFactor[] = [];
  const today = todayInCairo();

  const add = (key: string, detail?: string) => {
    const rule = rules.get(key);
    if (!rule) return;
    if (rule.pipeline && rule.pipeline !== input.pipeline) return;
    factors.push({ key: rule.key, label: rule.label, points: rule.points, explanation: rule.explanation, detail });
  };

  const reachable = Boolean(input.contactPhone || input.contactWhatsapp);
  const anyContact = reachable || Boolean(input.contactEmail) || Boolean(input.contactInstagram);

  // --- Can we even answer them? ------------------------------------------
  if (!anyContact) {
    add("no_contact_detail", "No phone, email or handle was captured.");
  } else if (reachable) {
    add("reachable", input.contactWhatsapp ? "WhatsApp number given." : "Phone number given.");
  }

  // --- How real is the trip? ---------------------------------------------
  if (input.requestedDate) {
    add("has_date", `Asked for ${input.requestedDate}${input.dateFlexible ? ", flexible" : ""}.`);
    const days = daysBetween(today, input.requestedDate);
    if (days !== null && days >= 0 && days <= 60) {
      add("date_soon", `Travelling in ${days} day${days === 1 ? "" : "s"}.`);
    }
  }

  if (input.budgetAmount && input.budgetAmount > 0) {
    add("has_budget", `Stated a budget of ${Math.round(input.budgetAmount)}.`);
    if (context.averageBookingValue > 0 && input.budgetAmount > context.averageBookingValue) {
      add("budget_above_average", `Above our average booking of ${Math.round(context.averageBookingValue)}.`);
    }
  }

  if (input.guests && input.guests >= 4) {
    add("group_size", `${input.guests} guests.`);
  }

  // --- Where did they come from? -----------------------------------------
  if (input.referredByClientId || input.referredByCompanyId || /referr/i.test(input.source)) {
    add("referral", "Arrived through a referral rather than cold.");
  }
  if (input.isReturningClient) {
    add("repeat_customer", "Has completed a trip with us before.");
  }
  if (input.companyKnown) {
    add("known_agency", "Their company is already in the partner book.");
  }
  if (input.isDecisionMaker) {
    add("decision_maker", "The person who wrote can decide.");
  }
  if (input.statedVolume && input.statedVolume > 0) {
    add("agency_volume", `Stated roughly ${input.statedVolume} bookings a year.`);
  }

  // --- Effort, on both sides ---------------------------------------------
  if ((input.message ?? "").trim().length >= 120) {
    add("detailed_message", "Wrote several sentences about what they want.");
  }
  if (input.firstResponseMinutes != null && input.firstResponseMinutes <= context.responseTargetMinutes) {
    add("answered_fast", `We replied in ${input.firstResponseMinutes} minute${input.firstResponseMinutes === 1 ? "" : "s"}.`);
  }

  // --- What is missing ----------------------------------------------------
  if (!input.requestedDate && !input.budgetAmount && !input.guests) {
    add("vague", "No date, no budget and no party size.");
  }
  if (input.outOfScope) {
    add("out_of_scope", "Marked as something Egypt Eye does not sell.");
  }

  const raw = factors.reduce((total, factor) => total + factor.points, 0);
  const score = Math.max(0, Math.min(100, raw));
  return { score, band: bandFor(score), factors };
}

export function bandFor(score: number): ScoredLead["band"] {
  if (score >= 60) return "hot";
  if (score >= 40) return "warm";
  if (score >= 20) return "cool";
  return "cold";
}

export const BAND_LABEL: Record<ScoredLead["band"], string> = {
  hot: "Answer first",
  warm: "Worth working",
  cool: "Answer when you can",
  cold: "Low signal",
};

function daysBetween(from: string, to: string): number | null {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86_400_000);
}
