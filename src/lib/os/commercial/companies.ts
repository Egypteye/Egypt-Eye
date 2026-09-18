import "server-only";
import { osdb, getOrg } from "../db";
import { can, type Actor } from "../actor";
import { nowMs } from "../dates";
import { commercialScope, applyCommercialScope } from "./scope";
import type { CompanyListItem, ScoreFactor } from "./types";

// ---------------------------------------------------------------------------
// PARTNERS
// ---------------------------------------------------------------------------
// A company is the organisation. The PEOPLE at it are os_clients rows joined
// through os_client_companies, because a person who is a contact here may also
// be a customer in their own right — and splitting them into two records is
// how a company loses the fact that its best agency contact is also a guest.
//
// Commercial terms (commission, payment terms, credit) are absent from the
// payload for anybody without companies.terms. Relationship health is
// recomputed on read and always carries its factors.
// ---------------------------------------------------------------------------

export type CompanyFilters = {
  statuses?: string[];
  kinds?: string[];
  tier?: string;
  ownerId?: string;
  mineOnly?: boolean;
  healthStates?: string[];
  search?: string;
  limit?: number;
};

const COMPANY_SELECT =
  "id, code, name, legal_name, kind, status, tier, website, email, phone, country, city, languages, " +
  "default_commission_pct, default_payment_terms, currency, credit_limit_amount, credit_hold, " +
  "owner_employee_id, unit_id, source, referred_by_company_id, " +
  "health_score, health_state, health_factors, health_computed_at, " +
  "first_deal_on, last_deal_on, last_contact_at, lifetime_trips, lifetime_revenue_amount, lifetime_revenue_currency, " +
  "notes, created_at, " +
  "os_employees!os_companies_owner_employee_id_fkey ( full_name )";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listCompanies(actor: Actor, filters: CompanyFilters = {}): Promise<CompanyListItem[]> {
  if (!can(actor, "companies.view")) return [];
  const org = await getOrg();
  const db = osdb();
  const scope = commercialScope(actor, "companies.view");
  if (scope.kind === "none") return [];

  let query = db.from("os_companies").select(COMPANY_SELECT).eq("org_id", org.id).is("archived_at", null);
  query = applyCommercialScope(query, scope, {
    ownerColumn: "owner_employee_id",
    createdColumn: "created_by",
    unitColumn: "unit_id",
  });

  if (filters.statuses?.length) query = query.in("status", filters.statuses);
  if (filters.kinds?.length) query = query.in("kind", filters.kinds);
  if (filters.tier) query = query.eq("tier", filters.tier);
  if (filters.ownerId) query = query.eq("owner_employee_id", filters.ownerId);
  if (filters.mineOnly) query = query.eq("owner_employee_id", actor.employeeId);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%,city.ilike.%${term}%`);
  }

  const { data } = await query.order("name").limit(filters.limit ?? 200);
  const rows = (data ?? []) as Raw[];
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id as string);
  const [contacts, deals, agreements] = await Promise.all([
    db.from("os_client_companies")
      .select("company_id, client_id, is_primary, decision_role, os_clients ( id, full_name )")
      .in("company_id", ids)
      .is("ended_on", null),
    db.from("os_deals").select("company_id, status").in("company_id", ids),
    db.from("os_agreements").select("id, company_id, title, status, ends_on").in("company_id", ids),
  ]);

  const contactRows = (contacts.data ?? []) as Raw[];
  const dealRows = (deals.data ?? []) as Raw[];
  const agreementRows = (agreements.data ?? []) as Raw[];

  const health = await computeHealth(rows, { contactRows, dealRows, agreementRows });

  let items = rows.map((row) => toCompanyItem(row, actor, health.get(row.id)!, { contactRows, dealRows, agreementRows }));
  if (filters.healthStates?.length) items = items.filter((c) => filters.healthStates!.includes(c.healthState));
  return items;
}

export async function getCompany(actor: Actor, id: string): Promise<CompanyListItem | null> {
  const items = await listCompanies(actor, { limit: 500 });
  return items.find((c) => c.id === id) ?? null;
}

/** Everyone at a company, with the private-customer half of their record intact. */
export async function companyContacts(companyId: string) {
  const { data } = await osdb()
    .from("os_client_companies")
    .select(
      "id, job_title, department, decision_role, is_primary, work_email, work_phone, started_on, ended_on, notes, " +
      "os_clients ( id, code, full_name, email, phone, whatsapp, country, language, lifetime_trips, lifetime_revenue_amount, vip )",
    )
    .eq("company_id", companyId)
    .order("is_primary", { ascending: false });

  return ((data ?? []) as Raw[]).map((row) => ({
    membershipId: row.id as string,
    clientId: row.os_clients?.id as string,
    code: row.os_clients?.code as string,
    name: row.os_clients?.full_name as string,
    email: (row.work_email ?? row.os_clients?.email) as string | null,
    phone: (row.work_phone ?? row.os_clients?.phone) as string | null,
    country: row.os_clients?.country as string | null,
    jobTitle: row.job_title as string | null,
    department: row.department as string | null,
    decisionRole: row.decision_role as string,
    isPrimary: Boolean(row.is_primary),
    startedOn: row.started_on as string | null,
    endedOn: row.ended_on as string | null,
    notes: row.notes as string | null,
    /** How many trips this person has taken PERSONALLY. The whole point of one record. */
    ownTrips: Number(row.os_clients?.lifetime_trips ?? 0),
    ownRevenue: Number(row.os_clients?.lifetime_revenue_amount ?? 0),
    vip: Boolean(row.os_clients?.vip),
  }));
}

/** Every company one person acts for. The other half of the same join. */
export async function clientCompanies(clientId: string) {
  const { data } = await osdb()
    .from("os_client_companies")
    .select("id, job_title, decision_role, is_primary, ended_on, os_companies ( id, code, name, kind, status, tier )")
    .eq("client_id", clientId);

  return ((data ?? []) as Raw[])
    .filter((row) => row.os_companies)
    .map((row) => ({
      membershipId: row.id as string,
      companyId: row.os_companies.id as string,
      code: row.os_companies.code as string,
      name: row.os_companies.name as string,
      kind: row.os_companies.kind as string,
      status: row.os_companies.status as string,
      tier: row.os_companies.tier as string,
      jobTitle: row.job_title as string | null,
      decisionRole: row.decision_role as string,
      isPrimary: Boolean(row.is_primary),
      current: !row.ended_on,
    }));
}

// ---------------------------------------------------------------------------
// RELATIONSHIP HEALTH — the same discipline as lead scoring
// ---------------------------------------------------------------------------
// Not a model, not a hidden weighting. Five observable facts about a
// relationship, each worth a stated number of points, each carrying the
// sentence that explains it. Recomputed on read and written back only when it
// moved, so a partner list is never showing last month's opinion.
//
// The factors are deliberately about US as much as them: "nobody has spoken to
// them in six months" is our failure, and a health score that only measured
// the partner's behaviour would quietly blame them for it.
// ---------------------------------------------------------------------------

type HealthResult = { score: number; state: string; factors: ScoreFactor[] };

async function computeHealth(
  rows: Raw[],
  ctx: { contactRows: Raw[]; dealRows: Raw[]; agreementRows: Raw[] },
): Promise<Map<string, HealthResult>> {
  const now = nowMs();
  const out = new Map<string, HealthResult>();
  const updates: { id: string; score: number; state: string; factors: ScoreFactor[] }[] = [];

  for (const row of rows) {
    const factors: ScoreFactor[] = [];
    const push = (key: string, label: string, points: number, explanation: string, detail: string) =>
      factors.push({ key, label, points, explanation, detail });

    // 1. Have we spoken to them lately?
    const daysSinceContact = row.last_contact_at
      ? Math.floor((now - Date.parse(row.last_contact_at)) / 86_400_000)
      : null;
    if (daysSinceContact == null) {
      push("no_contact", "No contact recorded", -10,
        "Nothing has ever been logged against this partner, so nobody can pick the relationship up.",
        "No calls, meetings or messages on file.");
    } else if (daysSinceContact <= 30) {
      push("recent_contact", "Spoken to recently", 25,
        "A partner talked to in the last month is a partner who remembers us when a booking comes in.",
        `Last contact ${daysSinceContact} day${daysSinceContact === 1 ? "" : "s"} ago.`);
    } else if (daysSinceContact <= 90) {
      push("contact_slipping", "Not spoken to this quarter", 10,
        "Still warm, but the relationship is coasting rather than being worked.",
        `Last contact ${daysSinceContact} days ago.`);
    } else {
      push("contact_cold", "Out of touch", -15,
        "Past ninety days a partner starts routing bookings elsewhere, and that is our doing rather than theirs.",
        `Last contact ${daysSinceContact} days ago.`);
    }

    // 2. Are they actually sending us work?
    const trips = Number(row.lifetime_trips ?? 0);
    const daysSinceDeal = row.last_deal_on
      ? Math.floor((now - Date.parse(`${row.last_deal_on}T00:00:00Z`)) / 86_400_000)
      : null;
    if (trips > 0 && daysSinceDeal != null && daysSinceDeal <= 120) {
      push("booking", "Booking with us", 30,
        "Recent bookings are the only unarguable evidence a partnership is working.",
        `${trips} trip${trips === 1 ? "" : "s"}, most recently ${row.last_deal_on}.`);
    } else if (trips > 0) {
      push("booking_lapsed", "Has booked, but not lately", 5,
        "The relationship produced work once. Whatever stopped it is worth a conversation.",
        daysSinceDeal != null ? `Last booking ${daysSinceDeal} days ago.` : `${trips} trips on record.`);
    } else {
      push("never_booked", "Never booked", 0,
        "A signed partner who has never sent a booking is a prospect with paperwork.",
        "No trips attributed to this partner yet.");
    }

    // 3. Is anything moving right now?
    const openDeals = ctx.dealRows.filter((d) => d.company_id === row.id && d.status === "open").length;
    if (openDeals > 0) {
      push("open_pipeline", "Live opportunity", 15,
        "Something is being negotiated, so the relationship has a next step by definition.",
        `${openDeals} open deal${openDeals === 1 ? "" : "s"}.`);
    }

    // 4. Is the contract sound?
    const agreements = ctx.agreementRows.filter((a) => a.company_id === row.id);
    const active = agreements.find((a) => a.status === "active");
    if (active) {
      const daysToExpiry = active.ends_on
        ? Math.floor((Date.parse(`${active.ends_on}T00:00:00Z`) - now) / 86_400_000)
        : null;
      if (daysToExpiry != null && daysToExpiry < 90) {
        push("agreement_expiring", "Agreement expiring", 5,
          "An agreement inside ninety days of expiry needs a renewal conversation now, not on the day.",
          `Expires in ${daysToExpiry} day${daysToExpiry === 1 ? "" : "s"}.`);
      } else {
        push("agreement_active", "Agreement in force", 20,
          "Terms are settled and in writing, which is what makes the relationship predictable on both sides.",
          active.ends_on ? `Runs to ${active.ends_on}.` : "No end date.");
      }
    } else if (agreements.length) {
      push("agreement_pending", "No agreement in force", -5,
        "There is paperwork but nothing signed and active, so every booking is negotiated from scratch.",
        `${agreements.length} agreement${agreements.length === 1 ? "" : "s"} on file, none active.`);
    }

    // 5. Are we owed money?
    if (row.credit_hold) {
      push("credit_hold", "On credit hold", -25,
        "New bookings are blocked until the balance clears. Whatever else is true, this is the relationship's real state.",
        "Set by finance.");
    }

    // 6. Does anybody there make decisions?
    const people = ctx.contactRows.filter((c) => c.company_id === row.id);
    const decider = people.some((c) => ["decision_maker", "signatory"].includes(c.decision_role));
    if (people.length && !decider) {
      push("no_decision_maker", "No decision maker recorded", -10,
        "We know people there but nobody who can commit. This is the single most common reason a B2B relationship never converts.",
        `${people.length} contact${people.length === 1 ? "" : "s"}, none marked as able to decide.`);
    }

    const raw = factors.reduce((total, f) => total + f.points, 0);
    const score = Math.max(0, Math.min(100, raw));
    const state = healthState(score, row.status);
    out.set(row.id, { score, state, factors });

    if (Number(row.health_score) !== score || row.health_state !== state) {
      updates.push({ id: row.id, score, state, factors });
    }
  }

  await Promise.all(
    updates.map((u) =>
      osdb().from("os_companies").update({
        health_score: u.score,
        health_state: u.state,
        health_factors: u.factors,
        health_computed_at: new Date().toISOString(),
      }).eq("id", u.id),
    ),
  );

  return out;
}

function healthState(score: number, status: string): string {
  if (status === "former" || status === "dormant") return "dormant";
  if (score >= 65) return "strong";
  if (score >= 45) return "steady";
  if (score >= 25) return "slipping";
  return "at_risk";
}

export const HEALTH_LABEL: Record<string, string> = {
  strong: "Strong",
  steady: "Steady",
  slipping: "Slipping",
  at_risk: "At risk",
  dormant: "Dormant",
  unknown: "Not scored",
};

function toCompanyItem(
  row: Raw,
  actor: Actor,
  health: HealthResult,
  ctx: { contactRows: Raw[]; dealRows: Raw[]; agreementRows: Raw[] },
): CompanyListItem {
  const people = ctx.contactRows.filter((c) => c.company_id === row.id);
  const primary = people.find((c) => c.is_primary) ?? people[0];
  const active = ctx.agreementRows.find((a) => a.company_id === row.id && a.status === "active");
  const showTerms = can(actor, "companies.terms");
  const showValue = showTerms || can(actor, "deals.value");

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    kind: row.kind,
    status: row.status,
    tier: row.tier,
    country: row.country,
    city: row.city,
    ownerId: row.owner_employee_id,
    ownerName: row.os_employees?.full_name ?? null,
    primaryContactId: primary?.os_clients?.id ?? null,
    primaryContactName: primary?.os_clients?.full_name ?? null,
    contactCount: people.length,
    openDeals: ctx.dealRows.filter((d) => d.company_id === row.id && d.status === "open").length,
    lastContactAt: row.last_contact_at,
    healthScore: health.score,
    healthState: health.state,
    healthFactors: health.factors,
    creditHold: Boolean(row.credit_hold),
    activeAgreementId: active?.id ?? null,
    activeAgreementTitle: active?.title ?? null,
    agreementEndsOn: active?.ends_on ?? null,
    terms: showTerms
      ? {
          commissionPct: row.default_commission_pct != null ? Number(row.default_commission_pct) : null,
          paymentTerms: row.default_payment_terms,
          currency: row.currency ?? "USD",
          creditLimit: row.credit_limit_amount != null ? Number(row.credit_limit_amount) : null,
        }
      : null,
    lifetime: showValue
      ? {
          trips: Number(row.lifetime_trips ?? 0),
          revenue: Number(row.lifetime_revenue_amount ?? 0),
          currency: row.lifetime_revenue_currency ?? "USD",
        }
      : null,
    website: row.website,
    email: row.email,
    phone: row.phone,
    source: row.source,
    notes: row.notes,
  };
}
