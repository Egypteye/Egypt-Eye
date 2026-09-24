import "server-only";
import { cache } from "react";
import { osdb } from "./db";

// ---------------------------------------------------------------------------
// MONEY
// ---------------------------------------------------------------------------
// Two rules the whole system depends on:
//
//  1. Every stored amount carries its currency AND, where it feeds reporting,
//     a base_amount already converted at a rate that was recorded at the time.
//     Reports never re-convert historical figures, so last quarter's profit
//     does not move when the pound does.
//
//  2. Conversion always asks for the rate AS OF a date. There is no "current
//     rate" function, deliberately — that is how historical numbers drift.
// ---------------------------------------------------------------------------

export type Currency = { code: string; name: string; symbol: string; decimals: number };

export const getCurrencies = cache(async (): Promise<Currency[]> => {
  const { data } = await osdb()
    .from("os_currencies")
    .select("code, name, symbol, decimals")
    .eq("active", true)
    .order("sort_order");
  return (data ?? []) as Currency[];
});

/**
 * The exchange rate that was in force on `asOf`. Returns null when we have no
 * rate at or before that date, and callers must then refuse to guess — a
 * silently assumed 1.0 is how a $900 shoot becomes a 900 EGP shoot in a report.
 */
export const fxRate = cache(async (from: string, to: string, asOf: string): Promise<number | null> => {
  if (from === to) return 1;
  const db = osdb();
  const { data } = await db
    .from("os_fx_rates")
    .select("rate")
    .eq("base_currency", from)
    .eq("quote_currency", to)
    .lte("as_of", asOf)
    .order("as_of", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) return Number(data.rate);

  // Try the inverse pair before giving up.
  const { data: inverse } = await db
    .from("os_fx_rates")
    .select("rate")
    .eq("base_currency", to)
    .eq("quote_currency", from)
    .lte("as_of", asOf)
    .order("as_of", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (inverse && Number(inverse.rate) !== 0) return 1 / Number(inverse.rate);
  return null;
});

/** Convert into the org's base currency for reporting, refusing to guess. */
export async function toBase(
  amount: number,
  currency: string,
  baseCurrency: string,
  asOf: string,
): Promise<{ amount: number; rate: number } | null> {
  const rate = await fxRate(currency, baseCurrency, asOf);
  if (rate === null) return null;
  return { amount: Math.round(amount * rate * 100) / 100, rate };
}

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number | null | undefined, currency = "USD", options?: { compact?: boolean }): string {
  if (amount === null || amount === undefined) return "—";
  const key = `${currency}:${options?.compact ? "c" : "f"}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: options?.compact ? "compact" : "standard",
      maximumFractionDigits: options?.compact ? 1 : currency === "JPY" || currency === "KRW" ? 0 : 2,
      minimumFractionDigits: options?.compact ? 0 : currency === "JPY" || currency === "KRW" ? 0 : 2,
    });
    formatters.set(key, fmt);
  }
  return fmt.format(amount);
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(digits)}%`;
}

/** Margin as a percentage of the selling price, the way the business thinks about it. */
export function marginPct(sell: number, cost: number): number {
  if (!sell) return 0;
  return Math.round(((sell - cost) / sell) * 1000) / 10;
}

export function markupPct(sell: number, cost: number): number {
  if (!cost) return 0;
  return Math.round(((sell - cost) / cost) * 1000) / 10;
}

/** Apply a tier's markup to a cost to get a suggested selling price. */
export function sellFromCost(cost: number, markup: number): number {
  return Math.round(cost * (1 + markup / 100) * 100) / 100;
}
