import "server-only";
import { osdb, getOrg } from "../db";
import { can, type Actor } from "../actor";
import { todayInCairo } from "../dates";

// ---------------------------------------------------------------------------
// AGREEMENTS AND THE TERMS IN FORCE
// ---------------------------------------------------------------------------
// Terms are effective-dated and superseded, never updated in place — exactly
// the pattern the trip price book uses, for exactly the same reason. A
// commission statement for last spring has to be defensible in a year's time,
// which it cannot be if the row it was computed from has since been edited.
//
// `resolveTerm` therefore always takes a DATE. There is no "the current
// commission" function anywhere in this module, because a booking made in
// March that travels in September is a question with two different right
// answers depending on which one the business means.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type AgreementTerm = {
  id: string;
  agreementId: string;
  tripTypeId: string | null;
  tripTypeName: string | null;
  tier: string | null;
  basis: string;
  commissionPct: number | null;
  netAmount: number | null;
  markupPct: number | null;
  fixedAmount: number | null;
  currency: string;
  minGuests: number | null;
  maxGuests: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  supersedesTermId: string | null;
  note: string | null;
  /** True when today falls inside this term's window. */
  inForce: boolean;
};

export type AgreementRecord = {
  id: string;
  ref: string;
  companyId: string;
  companyName: string | null;
  dealId: string | null;
  title: string;
  kind: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  autoRenew: boolean;
  noticeDays: number | null;
  currency: string;
  minimumTripsPerYear: number | null;
  minimumRevenueAmount: number | null;
  signedOn: string | null;
  signedByName: string | null;
  supersedesAgreementId: string | null;
  notes: string | null;
  /** Days until it ends. Negative when already past. Null when open-ended. */
  daysToExpiry: number | null;
};

const AGREEMENT_SELECT =
  "id, ref, company_id, deal_id, title, kind, status, starts_on, ends_on, auto_renew, notice_days, " +
  "currency, minimum_trips_per_year, minimum_revenue_amount, signed_on, signed_by_name, " +
  "supersedes_agreement_id, notes, created_at, os_companies ( name )";

export async function listAgreements(
  actor: Actor,
  filters: { companyId?: string; statuses?: string[]; expiringWithinDays?: number; limit?: number } = {},
): Promise<AgreementRecord[]> {
  if (!can(actor, "agreements.view")) return [];
  const org = await getOrg();

  let query = osdb().from("os_agreements").select(AGREEMENT_SELECT).eq("org_id", org.id);
  if (filters.companyId) query = query.eq("company_id", filters.companyId);
  if (filters.statuses?.length) query = query.in("status", filters.statuses);

  const { data } = await query.order("starts_on", { ascending: false, nullsFirst: false }).limit(filters.limit ?? 200);
  const today = todayInCairo();

  let items = ((data ?? []) as Raw[]).map((row) => toAgreement(row, today));
  if (filters.expiringWithinDays != null) {
    const window = filters.expiringWithinDays;
    items = items.filter((a) => a.daysToExpiry != null && a.daysToExpiry >= 0 && a.daysToExpiry <= window);
  }
  return items;
}

export async function getAgreement(actor: Actor, id: string): Promise<AgreementRecord | null> {
  if (!can(actor, "agreements.view")) return null;
  const org = await getOrg();
  const { data } = await osdb().from("os_agreements").select(AGREEMENT_SELECT).eq("org_id", org.id).eq("id", id).maybeSingle();
  return data ? toAgreement(data as Raw, todayInCairo()) : null;
}

function toAgreement(row: Raw, today: string): AgreementRecord {
  const daysToExpiry = row.ends_on
    ? Math.round((Date.parse(`${row.ends_on}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)
    : null;
  return {
    id: row.id,
    ref: row.ref,
    companyId: row.company_id,
    companyName: row.os_companies?.name ?? null,
    dealId: row.deal_id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    autoRenew: Boolean(row.auto_renew),
    noticeDays: row.notice_days,
    currency: row.currency ?? "USD",
    minimumTripsPerYear: row.minimum_trips_per_year,
    minimumRevenueAmount: row.minimum_revenue_amount != null ? Number(row.minimum_revenue_amount) : null,
    signedOn: row.signed_on,
    signedByName: row.signed_by_name,
    supersedesAgreementId: row.supersedes_agreement_id,
    notes: row.notes,
    daysToExpiry,
  };
}

/** Every term on an agreement, newest window first, each flagged if it is in force today. */
export async function agreementTerms(agreementId: string): Promise<AgreementTerm[]> {
  const { data } = await osdb()
    .from("os_agreement_terms")
    .select(
      "id, agreement_id, trip_type_id, tier, basis, commission_pct, net_amount, markup_pct, fixed_amount, " +
      "currency, min_guests, max_guests, effective_from, effective_to, supersedes_term_id, note, " +
      "os_trip_types ( name )",
    )
    .eq("agreement_id", agreementId)
    .order("effective_from", { ascending: false });

  const today = todayInCairo();
  return ((data ?? []) as Raw[]).map((row) => ({
    id: row.id,
    agreementId: row.agreement_id,
    tripTypeId: row.trip_type_id,
    tripTypeName: row.os_trip_types?.name ?? null,
    tier: row.tier,
    basis: row.basis,
    commissionPct: row.commission_pct != null ? Number(row.commission_pct) : null,
    netAmount: row.net_amount != null ? Number(row.net_amount) : null,
    markupPct: row.markup_pct != null ? Number(row.markup_pct) : null,
    fixedAmount: row.fixed_amount != null ? Number(row.fixed_amount) : null,
    currency: row.currency,
    minGuests: row.min_guests,
    maxGuests: row.max_guests,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    supersedesTermId: row.supersedes_term_id,
    note: row.note,
    inForce: row.effective_from <= today && (!row.effective_to || row.effective_to >= today),
  }));
}

/**
 * Which term applies to a company on a given DATE, for a given service.
 *
 * The most specific match wins: a term naming this trip type beats one that
 * names none, and a term naming this tier beats one that names none. Returns
 * null rather than a default, because guessing a commission is how a partner
 * ends up invoiced the wrong amount.
 */
export async function resolveTerm(
  companyId: string,
  onDate: string,
  options: { tripTypeId?: string | null; tier?: string | null; guests?: number | null } = {},
): Promise<{ term: AgreementTerm; agreement: AgreementRecord } | null> {
  const db = osdb();
  const { data: agreements } = await db
    .from("os_agreements")
    .select(AGREEMENT_SELECT)
    .eq("company_id", companyId)
    .eq("status", "active");

  const candidates = (agreements ?? []) as Raw[];
  if (!candidates.length) return null;

  const inWindow = candidates.filter(
    (a) => (!a.starts_on || a.starts_on <= onDate) && (!a.ends_on || a.ends_on >= onDate),
  );
  if (!inWindow.length) return null;

  const { data: terms } = await db
    .from("os_agreement_terms")
    .select(
      "id, agreement_id, trip_type_id, tier, basis, commission_pct, net_amount, markup_pct, fixed_amount, " +
      "currency, min_guests, max_guests, effective_from, effective_to, supersedes_term_id, note, " +
      "os_trip_types ( name )",
    )
    .in("agreement_id", inWindow.map((a) => a.id as string))
    .lte("effective_from", onDate);

  const usable = ((terms ?? []) as Raw[]).filter((t) => {
    if (t.effective_to && t.effective_to < onDate) return false;
    if (options.tripTypeId && t.trip_type_id && t.trip_type_id !== options.tripTypeId) return false;
    if (options.tier && t.tier && t.tier !== options.tier) return false;
    if (options.guests != null && t.min_guests != null && options.guests < t.min_guests) return false;
    if (options.guests != null && t.max_guests != null && options.guests > t.max_guests) return false;
    return true;
  });
  if (!usable.length) return null;

  // Most specific first, then the most recently effective.
  usable.sort((a, b) => {
    const specificity = (t: Raw) => (t.trip_type_id ? 2 : 0) + (t.tier ? 1 : 0);
    const diff = specificity(b) - specificity(a);
    if (diff !== 0) return diff;
    return String(b.effective_from).localeCompare(String(a.effective_from));
  });

  const chosen = usable[0];
  const agreement = inWindow.find((a) => a.id === chosen.agreement_id)!;
  const today = todayInCairo();

  return {
    term: {
      id: chosen.id,
      agreementId: chosen.agreement_id,
      tripTypeId: chosen.trip_type_id,
      tripTypeName: chosen.os_trip_types?.name ?? null,
      tier: chosen.tier,
      basis: chosen.basis,
      commissionPct: chosen.commission_pct != null ? Number(chosen.commission_pct) : null,
      netAmount: chosen.net_amount != null ? Number(chosen.net_amount) : null,
      markupPct: chosen.markup_pct != null ? Number(chosen.markup_pct) : null,
      fixedAmount: chosen.fixed_amount != null ? Number(chosen.fixed_amount) : null,
      currency: chosen.currency,
      minGuests: chosen.min_guests,
      maxGuests: chosen.max_guests,
      effectiveFrom: chosen.effective_from,
      effectiveTo: chosen.effective_to,
      supersedesTermId: chosen.supersedes_term_id,
      note: chosen.note,
      inForce: chosen.effective_from <= today && (!chosen.effective_to || chosen.effective_to >= today),
    },
    agreement: toAgreement(agreement, today),
  };
}

/** One sentence describing a term, for the places that show it inline. */
export function describeTerm(term: AgreementTerm): string {
  switch (term.basis) {
    case "commission_pct": return `${term.commissionPct ?? 0}% commission`;
    case "net_rate": return `${term.currency} ${term.netAmount ?? 0} net`;
    case "markup_pct": return `${term.markupPct ?? 0}% markup`;
    case "fixed_fee": return `${term.currency} ${term.fixedAmount ?? 0} fixed`;
    case "per_person": return `${term.currency} ${term.fixedAmount ?? 0} per person`;
    default: return term.basis;
  }
}
