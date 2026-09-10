import "server-only";
import { osdb, getOrg } from "../db";
import { can, type Actor } from "../actor";
import { todayInCairo } from "../dates";
import { resolveTerm, describeTerm, type AgreementTerm } from "./agreements";

// ---------------------------------------------------------------------------
// QUOTES — what a deal actually offers
// ---------------------------------------------------------------------------
// A quote is priced from the central price book at the rates in force on the
// TRAVEL date, not today's. It is stored with its lines and the rate id each
// line resolved to, so months later it can still explain itself: "guide fee
// $45, from the rate effective 1 Apr to 30 Jun".
//
// When the deal belongs to a partner, the agreement's commission is resolved
// for the same travel date and shown as what the booking actually nets. It is
// never assumed: if no agreement covers that date, the quote says so rather
// than quietly pricing at zero commission.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type QuoteRecord = {
  id: string;
  ref: string;
  title: string | null;
  status: string;
  tier: string;
  tripDate: string | null;
  guests: number;
  currency: string;
  sellTotal: number;
  /** Present only with the margin permission — cost is not a client-facing number. */
  costTotal: number | null;
  marginAmount: number | null;
  marginPct: number | null;
  validUntil: string | null;
  sentAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  /** What the price book said before any discount. Null when nothing was overridden. */
  listTotal: number | null;
  discountPct: number | null;
  lines: {
    label: string;
    category: string;
    qty: number;
    unitSell: number;
    sell: number;
    currency: string;
    /** Which rate window this line came from. */
    rateWindow: string | null;
  }[];
  /** Partner commission resolved for the travel date, when there is one. */
  commission: { pct: number | null; amount: number | null; describes: string; agreementRef: string } | null;
};

const QUOTE_SELECT =
  "id, ref, title, status, tier, trip_date, guests_adults, guests_children, currency, " +
  "cost_total, sell_total, margin_amount, margin_pct, valid_until, sent_at, decided_at, notes, created_at, " +
  "deal_id, company_id, agreement_id, client_id";

/** Every quote on a deal, newest first. */
export async function dealQuotes(actor: Actor, dealId: string): Promise<QuoteRecord[]> {
  const db = osdb();
  const { data: links } = await db.from("os_deal_quotes").select("quote_id, label").eq("deal_id", dealId);
  const ids = ((links ?? []) as Raw[]).map((l) => l.quote_id as string);
  if (!ids.length) return [];

  const [{ data: quotes }, { data: lines }] = await Promise.all([
    db.from("os_quotes").select(QUOTE_SELECT).in("id", ids).order("created_at", { ascending: false }),
    db.from("os_quote_lines")
      .select("quote_id, seq, label, category, qty, unit_sell, currency, notes")
      .in("quote_id", ids)
      .order("seq"),
  ]);

  const linesByQuote = new Map<string, Raw[]>();
  for (const line of (lines ?? []) as Raw[]) {
    linesByQuote.set(line.quote_id, [...(linesByQuote.get(line.quote_id) ?? []), line]);
  }

  const showMargin = can(actor, "pricing.margins") || can(actor, "trips.financials");
  const out: QuoteRecord[] = [];

  for (const row of (quotes ?? []) as Raw[]) {
    out.push(await toQuoteRecord(row, linesByQuote.get(row.id) ?? [], showMargin));
  }
  return out;
}

export async function getQuote(actor: Actor, quoteId: string): Promise<QuoteRecord | null> {
  const db = osdb();
  const org = await getOrg();
  const [{ data: quote }, { data: lines }] = await Promise.all([
    db.from("os_quotes").select(QUOTE_SELECT).eq("org_id", org.id).eq("id", quoteId).maybeSingle(),
    db.from("os_quote_lines").select("quote_id, seq, label, category, qty, unit_sell, currency, notes").eq("quote_id", quoteId).order("seq"),
  ]);
  if (!quote) return null;
  const showMargin = can(actor, "pricing.margins") || can(actor, "trips.financials");
  return toQuoteRecord(quote as Raw, (lines ?? []) as Raw[], showMargin);
}

async function toQuoteRecord(row: Raw, lines: Raw[], showMargin: boolean): Promise<QuoteRecord> {
  // The list price is the sum of the lines. Where the stored sell total is
  // lower, the difference is a discount somebody chose to give, and it is
  // shown rather than absorbed into the number.
  const listTotal = round2(lines.reduce((total, l) => total + Number(l.unit_sell ?? 0) * Number(l.qty ?? 0), 0));
  const sellTotal = Number(row.sell_total ?? 0);
  const discountPct = listTotal > 0 && sellTotal < listTotal
    ? Math.round(((listTotal - sellTotal) / listTotal) * 1000) / 10
    : null;

  let commission: QuoteRecord["commission"] = null;
  if (row.company_id && row.trip_date) {
    const resolved = await resolveTerm(row.company_id as string, row.trip_date as string, {
      tripTypeId: null,
      tier: row.tier as string,
    });
    if (resolved) {
      const term: AgreementTerm = resolved.term;
      const amount = term.commissionPct != null ? round2(sellTotal * (term.commissionPct / 100)) : null;
      commission = {
        pct: term.commissionPct,
        amount,
        describes: describeTerm(term),
        agreementRef: resolved.agreement.ref,
      };
    }
  }

  return {
    id: row.id,
    ref: row.ref,
    title: row.title,
    status: row.status,
    tier: row.tier,
    tripDate: row.trip_date,
    guests: Number(row.guests_adults ?? 0) + Number(row.guests_children ?? 0),
    currency: row.currency ?? "USD",
    sellTotal,
    costTotal: showMargin ? Number(row.cost_total ?? 0) : null,
    marginAmount: showMargin ? Number(row.margin_amount ?? 0) : null,
    marginPct: showMargin ? Number(row.margin_pct ?? 0) : null,
    validUntil: row.valid_until,
    sentAt: row.sent_at,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
    listTotal: listTotal > 0 ? listTotal : null,
    discountPct,
    lines: lines.map((l) => ({
      label: l.label,
      category: l.category ?? "other",
      qty: Number(l.qty ?? 0),
      unitSell: Number(l.unit_sell ?? 0),
      sell: round2(Number(l.unit_sell ?? 0) * Number(l.qty ?? 0)),
      currency: l.currency ?? row.currency ?? "USD",
      rateWindow: l.notes ?? null,
    })),
    commission,
  };
}

/** The configured percentage at or beyond which a discount needs a decision. */
export async function discountApprovalThreshold(): Promise<number> {
  const org = await getOrg();
  const { data } = await osdb()
    .from("os_settings")
    .select("value")
    .eq("org_id", org.id)
    .eq("key", "commercial.discount_approval_pct")
    .maybeSingle();
  const parsed = Number(data?.value ?? 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

/**
 * Whether this quote may be sent, and what stands in the way.
 *
 * Computed here so the screen and the server action agree — the button is
 * disabled for the same reason the action would refuse, rather than the two
 * drifting apart.
 */
export async function quoteSendability(quoteId: string): Promise<{
  sendable: boolean;
  discountPct: number | null;
  threshold: number;
  reason: string | null;
  approvalRef: string | null;
  approvalStatus: string | null;
}> {
  const db = osdb();
  const threshold = await discountApprovalThreshold();

  const [{ data: quote }, { data: lines }, { data: approvals }] = await Promise.all([
    db.from("os_quotes").select("id, ref, status, sell_total, valid_until").eq("id", quoteId).maybeSingle(),
    db.from("os_quote_lines").select("qty, unit_sell").eq("quote_id", quoteId),
    db.from("os_approvals").select("ref, status").eq("quote_id", quoteId).order("requested_at", { ascending: false }).limit(1),
  ]);

  if (!quote) {
    return { sendable: false, discountPct: null, threshold, reason: "That quote no longer exists.", approvalRef: null, approvalStatus: null };
  }

  const listTotal = round2(((lines ?? []) as Raw[]).reduce((t, l) => t + Number(l.unit_sell ?? 0) * Number(l.qty ?? 0), 0));
  const sellTotal = Number(quote.sell_total ?? 0);
  const discountPct = listTotal > 0 && sellTotal < listTotal
    ? Math.round(((listTotal - sellTotal) / listTotal) * 1000) / 10
    : null;

  const approval = ((approvals ?? []) as Raw[])[0] ?? null;
  const approvalRef = (approval?.ref as string) ?? null;
  const approvalStatus = (approval?.status as string) ?? null;

  if (quote.status !== "draft") {
    return { sendable: false, discountPct, threshold, reason: `This quote is already ${quote.status}.`, approvalRef, approvalStatus };
  }
  if (!listTotal) {
    return { sendable: false, discountPct, threshold, reason: "The quote has no priced lines.", approvalRef, approvalStatus };
  }

  if (discountPct != null && discountPct >= threshold) {
    if (approvalStatus === "approved") {
      return { sendable: true, discountPct, threshold, reason: null, approvalRef, approvalStatus };
    }
    return {
      sendable: false,
      discountPct,
      threshold,
      reason:
        approvalStatus === "pending"
          ? `${approvalRef} is waiting on a decision. A ${discountPct}% discount cannot be sent until it is approved.`
          : `This is ${discountPct}% below the price book, at or beyond the ${threshold}% that needs a decision. Raise an approval before sending it.`,
      approvalRef,
      approvalStatus,
    };
  }

  return { sendable: true, discountPct, threshold, reason: null, approvalRef, approvalStatus };
}

export function quoteExpired(quote: QuoteRecord): boolean {
  return Boolean(quote.validUntil && quote.validUntil < todayInCairo());
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
