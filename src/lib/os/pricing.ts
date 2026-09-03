import "server-only";
import { osdb, getOrg } from "./db";
import { marginPct, sellFromCost } from "./money";

// ---------------------------------------------------------------------------
// THE PRICE BOOK AND THE CALCULATOR
// ---------------------------------------------------------------------------
// One rule underpins all of it: a price is never read from code, a form
// default, or the last quote. It is resolved from os_rates for the DATE OF THE
// TRIP and the tier being sold.
//
// That is what makes the specification's supplier example work correctly:
//
//   Jan-Mar  $50
//   Apr-Jun  $60
//   Jul-Dec  $75
//
// A trip on 15 March resolves $50 forever, even after July, because the quote
// line and the cost line both store the rate id they resolved — not just the
// number, the row it came from. Re-opening that trip a year later shows the
// same figure and can explain where it came from.
// ---------------------------------------------------------------------------

export type PriceItem = {
  id: string;
  key: string;
  name: string;
  category: string;
  unitLabel: string;
  description: string | null;
};

export type ResolvedRate = {
  rateId: string;
  cost: number;
  sell: number | null;
  currency: string;
  validFrom: string;
  validTo: string | null;
  tier: string;
  note: string | null;
};

export type PricingTier = {
  key: string;
  label: string;
  markupPct: number;
  minMarginPct: number;
  description: string | null;
};

export async function getTiers(): Promise<PricingTier[]> {
  const org = await getOrg();
  const { data } = await osdb()
    .from("os_pricing_tiers")
    .select("key, label, markup_pct, min_margin_pct, description")
    .eq("org_id", org.id)
    .order("sort_order");
  return (data ?? []).map((t) => ({
    key: t.key as string,
    label: t.label as string,
    markupPct: Number(t.markup_pct),
    minMarginPct: Number(t.min_margin_pct),
    description: (t.description as string) ?? null,
  }));
}

export async function getPriceItems(category?: string): Promise<PriceItem[]> {
  const org = await getOrg();
  let query = osdb()
    .from("os_price_items")
    .select("id, key, name, category, unit_label, description")
    .eq("org_id", org.id)
    .eq("active", true)
    .order("sort_order");
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return (data ?? []).map((p) => ({
    id: p.id as string,
    key: p.key as string,
    name: p.name as string,
    category: p.category as string,
    unitLabel: p.unit_label as string,
    description: (p.description as string) ?? null,
  }));
}

/**
 * The rate in force for a price item on a given date.
 * Prefers an exact tier match and falls back to the 'any' rate — so a Luxury
 * quote picks up the senior-photographer rate where one exists and the normal
 * rate where it does not, without anybody maintaining a full grid.
 */
export async function resolveRate(
  priceItemId: string,
  onDate: string,
  tier: string = "standard",
): Promise<ResolvedRate | null> {
  const { data } = await osdb()
    .from("os_rates")
    .select("id, cost_amount, sell_amount, currency, valid_from, valid_to, tier, note")
    .eq("price_item_id", priceItemId)
    .lte("valid_from", onDate)
    .or(`valid_to.is.null,valid_to.gte.${onDate}`)
    .in("tier", [tier, "any"])
    .order("tier", { ascending: false })   // the specific tier sorts after 'any'
    .order("valid_from", { ascending: false });

  if (!data?.length) return null;
  const exact = data.find((r) => r.tier === tier) ?? data.find((r) => r.tier === "any");
  if (!exact) return null;
  return {
    rateId: exact.id as string,
    cost: Number(exact.cost_amount),
    sell: exact.sell_amount === null ? null : Number(exact.sell_amount),
    currency: exact.currency as string,
    validFrom: exact.valid_from as string,
    validTo: (exact.valid_to as string) ?? null,
    tier: exact.tier as string,
    note: (exact.note as string) ?? null,
  };
}

/** Resolve many at once — the calculator's hot path. */
export async function resolveRates(
  priceItemIds: string[],
  onDate: string,
  tier: string = "standard",
): Promise<Map<string, ResolvedRate>> {
  const out = new Map<string, ResolvedRate>();
  if (!priceItemIds.length) return out;

  const { data } = await osdb()
    .from("os_rates")
    .select("id, price_item_id, cost_amount, sell_amount, currency, valid_from, valid_to, tier, note")
    .in("price_item_id", priceItemIds)
    .lte("valid_from", onDate)
    .or(`valid_to.is.null,valid_to.gte.${onDate}`)
    .in("tier", [tier, "any"])
    .order("valid_from", { ascending: false });

  for (const r of data ?? []) {
    const key = r.price_item_id as string;
    const existing = out.get(key);
    // A tier-specific rate always beats the generic one; among equals, the
    // most recently effective wins (rows arrive newest-first).
    if (existing && !(r.tier === tier && existing.tier !== tier)) continue;
    out.set(key, {
      rateId: r.id as string,
      cost: Number(r.cost_amount),
      sell: r.sell_amount === null ? null : Number(r.sell_amount),
      currency: r.currency as string,
      validFrom: r.valid_from as string,
      validTo: (r.valid_to as string) ?? null,
      tier: r.tier as string,
      note: (r.note as string) ?? null,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// THE CALCULATOR
// ---------------------------------------------------------------------------

export type CalculatorLine = { priceItemId: string; qty: number };

export type QuoteLine = {
  priceItemId: string;
  rateId: string | null;
  label: string;
  category: string;
  unitLabel: string;
  qty: number;
  unitCost: number;
  unitSell: number;
  cost: number;
  sell: number;
  currency: string;
  /** Where the number came from, so a quote can always explain itself. */
  rateWindow: string | null;
  missing: boolean;
};

export type QuoteResult = {
  lines: QuoteLine[];
  currency: string;
  costTotal: number;
  sellTotal: number;
  marginAmount: number;
  marginPct: number;
  markupPct: number;
  tier: PricingTier | null;
  belowFloor: boolean;
  warnings: string[];
};

export async function calculate(input: {
  lines: CalculatorLine[];
  tripDate: string;
  tier: string;
  currency?: string;
  /** Override the derived selling price with a real one the client is paying. */
  sellOverride?: number | null;
}): Promise<QuoteResult> {
  const tiers = await getTiers();
  const tier = tiers.find((t) => t.key === input.tier) ?? tiers[0] ?? null;
  const currency = input.currency ?? "USD";
  const warnings: string[] = [];

  const itemIds = input.lines.map((l) => l.priceItemId);
  const [rates, items] = await Promise.all([
    resolveRates(itemIds, input.tripDate, input.tier),
    itemIds.length
      ? osdb().from("os_price_items").select("id, key, name, category, unit_label").in("id", itemIds)
      : Promise.resolve({ data: [] as { id: string; key: string; name: string; category: string; unit_label: string }[] }),
  ]);

  const itemMap = new Map((items.data ?? []).map((i) => [i.id as string, i]));

  const lines: QuoteLine[] = input.lines.map((l) => {
    const item = itemMap.get(l.priceItemId);
    const rate = rates.get(l.priceItemId);
    const unitCost = rate?.cost ?? 0;
    const unitSell = rate?.sell ?? (tier ? sellFromCost(unitCost, tier.markupPct) : unitCost);

    if (!rate && item) {
      warnings.push(
        `${item.name} has no rate effective on ${input.tripDate}. Add one in the price book before quoting it — the calculator will not guess.`,
      );
    }

    return {
      priceItemId: l.priceItemId,
      rateId: rate?.rateId ?? null,
      label: item?.name ?? "Unknown item",
      category: item?.category ?? "other",
      unitLabel: item?.unit_label ?? "",
      qty: l.qty,
      unitCost,
      unitSell,
      cost: Math.round(unitCost * l.qty * 100) / 100,
      sell: Math.round(unitSell * l.qty * 100) / 100,
      currency: rate?.currency ?? currency,
      rateWindow: rate ? formatWindow(rate) : null,
      missing: !rate,
    };
  });

  const costTotal = round2(lines.reduce((s, l) => s + l.cost, 0));
  const derivedSell = round2(lines.reduce((s, l) => s + l.sell, 0));
  const sellTotal = input.sellOverride != null ? round2(input.sellOverride) : derivedSell;
  const margin = round2(sellTotal - costTotal);
  const mPct = marginPct(sellTotal, costTotal);
  const belowFloor = Boolean(tier && sellTotal > 0 && mPct < tier.minMarginPct);

  if (belowFloor && tier) {
    warnings.push(
      `This quote lands at ${mPct}% margin, below the ${tier.label} floor of ${tier.minMarginPct}%. ` +
      `Selling it anyway needs a reason, and more than 15% off list needs an approval.`,
    );
  }
  if (input.sellOverride != null && Math.abs(sellTotal - derivedSell) > 0.5) {
    const delta = round2(derivedSell - sellTotal);
    warnings.push(
      delta > 0
        ? `The selling price is ${delta.toFixed(2)} below what the price book suggests.`
        : `The selling price is ${Math.abs(delta).toFixed(2)} above what the price book suggests.`,
    );
  }

  return {
    lines,
    currency,
    costTotal,
    sellTotal,
    marginAmount: margin,
    marginPct: mPct,
    markupPct: costTotal ? Math.round(((sellTotal - costTotal) / costTotal) * 1000) / 10 : 0,
    tier,
    belowFloor,
    warnings,
  };
}

function formatWindow(rate: ResolvedRate): string {
  const from = rate.validFrom;
  const to = rate.validTo ?? "ongoing";
  return rate.tier === "any" ? `${from} → ${to}` : `${rate.tier} rate, ${from} → ${to}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Change a price. Never an UPDATE: the old row's validity window is closed and
 * a new row opens the day the new price starts, so everything already costed
 * keeps its number.
 */
export async function supersedeRate(input: {
  priceItemId: string;
  tier: string;
  cost: number;
  sell: number | null;
  currency: string;
  effectiveFrom: string;
  note?: string;
  actorEmployeeId: string | null;
}): Promise<{ closedRateId: string | null; newRateId: string }> {
  const db = osdb();
  const org = await getOrg();

  const { data: current } = await db
    .from("os_rates")
    .select("id, valid_from, valid_to")
    .eq("price_item_id", input.priceItemId)
    .eq("tier", input.tier)
    .lte("valid_from", input.effectiveFrom)
    .or(`valid_to.is.null,valid_to.gte.${input.effectiveFrom}`)
    .order("valid_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await db
    .from("os_rates")
    .insert({
      org_id: org.id,
      price_item_id: input.priceItemId,
      tier: input.tier,
      cost_amount: input.cost,
      sell_amount: input.sell,
      currency: input.currency,
      valid_from: input.effectiveFrom,
      note: input.note ?? null,
      created_by: input.actorEmployeeId,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (current) {
    const dayBefore = new Date(`${input.effectiveFrom}T00:00:00Z`);
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
    await db
      .from("os_rates")
      .update({ valid_to: dayBefore.toISOString().slice(0, 10), superseded_by: created.id })
      .eq("id", current.id);
  }

  return { closedRateId: (current?.id as string) ?? null, newRateId: created.id as string };
}
