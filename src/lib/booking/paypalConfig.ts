// How PayPal is configured, and the pure rules that follow from it.
//
// Split from paypalClient.ts for the same reason the deposit wording has its
// own module: scripts/check-paypal.mts has to assert these rules against the
// real code, and `server-only` would take that check offline. What lives here
// is everything that can be decided without a network and without a secret —
// which turns out to be every rule that matters.
//
// Reading the environment here is safe in a client bundle even though nothing
// should: Next only inlines NEXT_PUBLIC_* variables, so a browser evaluating
// this gets `undefined` and therefore `null`, which is the honest answer. The
// secret itself is only ever USED in paypalClient.ts, which is server-only.

import type { PaymentMode } from "./wording";

const LIVE = "https://api-m.paypal.com";
const SANDBOX = "https://api-m.sandbox.paypal.com";

export type PayPalIntent = "CAPTURE" | "AUTHORIZE";

export type PayPalConfig = {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  /** Live or sandbox — carried so callers can show which one is wired up. */
  env: "live" | "sandbox";
  /**
   * CAPTURE takes the money when the customer approves. AUTHORIZE only holds
   * it, and a person captures later.
   *
   * CAPTURE is the default because it is what "instant payment" means and
   * what the existing payment links already do, so switching rails does not
   * silently change what happens to a customer's money. AUTHORIZE is the
   * tidier fit for this booking model on paper — a date Egypt Eye cannot do
   * costs the customer nothing and needs no refund — but it is not free:
   * PayPal honours an authorization for 3 days and allows capture up to 29,
   * after which a capture can fail or come back short, and not every funding
   * source supports it. Switching is one environment variable, and every
   * customer-facing sentence follows automatically through PaymentMode.
   */
  intent: PayPalIntent;
  /** Set once the webhook is created in the dashboard. */
  webhookId: string | null;
};

/**
 * The configuration, or null.
 *
 * Read at call time rather than module load for the same reason the Sanity and
 * Supabase clients do it: a build-time snapshot of an environment variable is
 * a stale answer that is very hard to see.
 */
export function payPalConfig(): PayPalConfig | null {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  // Sandbox unless live is asked for explicitly. The asymmetry is deliberate:
  // guessing wrong towards sandbox costs a confusing test payment, guessing
  // wrong towards live spends somebody's actual money.
  const env = process.env.PAYPAL_ENV?.trim().toLowerCase() === "live" ? "live" : "sandbox";

  // Anything other than an explicit AUTHORIZE is CAPTURE. A typo must not
  // silently produce holds that nobody is watching for and that expire.
  const intent: PayPalIntent =
    process.env.PAYPAL_INTENT?.trim().toUpperCase() === "AUTHORIZE" ? "AUTHORIZE" : "CAPTURE";

  return {
    clientId,
    clientSecret,
    baseUrl: env === "live" ? LIVE : SANDBOX,
    env,
    intent,
    webhookId: process.env.PAYPAL_WEBHOOK_ID?.trim() || null,
  };
}

/**
 * What is wrong with a configuration that still "works".
 *
 * Every one of these is a setting that takes real money correctly and then
 * fails at something later, quietly. None of them stops a payment, which is
 * exactly why they need saying out loud — a live deployment that is silently
 * missing its webhook looks perfect until the first payment that needs it.
 */
export type LiveReadinessWarning =
  | "live-without-webhook"
  | "live-with-authorize"
  | "sandbox-on-public-site"
  | "sandbox";

/**
 * Whether this URL is somewhere real customers arrive.
 *
 * localhost and Vercel preview deployments are where sandbox belongs. Anything
 * else is a domain somebody might book on for real.
 */
function isPublicSite(siteUrl: string | undefined): boolean {
  if (!siteUrl) return false;
  try {
    const host = new URL(siteUrl).hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return false;
    // Preview deployments are disposable and nobody books on them.
    if (host.endsWith(".vercel.app")) return false;
    return true;
  } catch {
    return false;
  }
}

export function liveReadiness(
  config: PayPalConfig | null,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL
): LiveReadinessWarning[] {
  if (!config) return [];
  const warnings: LiveReadinessWarning[] = [];
  if (config.env !== "live") {
    // The dangerous direction, and the one that is easy to reach by accident:
    // sandbox credentials on the real domain mean a visitor completes a
    // payment that moves no money while the site records the booking as paid.
    // Nobody finds out until the desk wonders where the deposit went.
    if (isPublicSite(siteUrl)) warnings.push("sandbox-on-public-site");
    warnings.push("sandbox");
    return warnings;
  }
  // The one that costs money. With no webhook id every delivery is refused,
  // so anything that happens after the customer closes the tab — a reviewed
  // payment clearing, a refund issued from the PayPal dashboard, a dispute —
  // never reaches the site. Payments still work, which is what makes this
  // invisible until it matters.
  if (!config.webhookId) warnings.push("live-without-webhook");
  // Not wrong, but worth knowing on day one: a hold PayPal honours for three
  // days, on a booking nobody has confirmed yet, is a clock somebody has to
  // watch.
  if (config.intent === "AUTHORIZE") warnings.push("live-with-authorize");
  return warnings;
}

export function describeReadiness(warning: LiveReadinessWarning): string {
  switch (warning) {
    case "live-without-webhook":
      return (
        "PayPal is LIVE but PAYPAL_WEBHOOK_ID is not set, so every webhook delivery is refused. " +
        "Payments still complete in the browser, but a payment that clears later, a refund issued " +
        "from the PayPal dashboard, or a dispute will never reach this site."
      );
    case "live-with-authorize":
      return (
        "PayPal is LIVE with AUTHORIZE intent: deposits are held, not taken. PayPal honours a hold " +
        "for 3 days and allows capture up to 29, so an unconfirmed booking is a clock."
      );
    case "sandbox-on-public-site":
      return (
        "PayPal is in SANDBOX on what looks like a public site. Visitors can complete a payment that " +
        "moves NO REAL MONEY while the booking is recorded as paid. Set PAYPAL_ENV=live, or clear the " +
        "PayPal credentials so bookings fall back to a request."
      );
    case "sandbox":
      return "PayPal is in SANDBOX. No real money moves.";
  }
}
/**
 * What the customer's money is doing, from the intent alone.
 *
 * Derived rather than configured beside the intent, because two fields that
 * can disagree eventually do — and the disagreement here reads as "your money
 * is held" to somebody PayPal has already charged.
 */
export function moneyModeFor(intent: PayPalIntent): PaymentMode {
  return intent === "CAPTURE" ? "paid" : "hold";
}

/** The headers PayPal signs every webhook delivery with. */
export const WEBHOOK_SIGNATURE_HEADERS = [
  "paypal-auth-algo",
  "paypal-cert-url",
  "paypal-transmission-id",
  "paypal-transmission-sig",
  "paypal-transmission-time",
] as const;

/**
 * Whether a delivery even carries a signature to check.
 *
 * Separated so it can be asserted without a network: a delivery missing any of
 * these cannot be verified by anyone, so it is refused before PayPal is called
 * rather than after.
 */
export function hasWebhookSignatureHeaders(headers: Headers): boolean {
  return WEBHOOK_SIGNATURE_HEADERS.every((name) => {
    const value = headers.get(name);
    return typeof value === "string" && value.trim() !== "";
  });
}

// ---------------------------------------------------------------------------
// Money
//
// PayPal takes and returns amounts as decimal strings, and the only safe way
// to handle money in JavaScript is to never let it become a float that
// something then rounds. Deposits are whole dollars by rule (see
// resolveDeposit) but extras are not, so the conversion is exact in both
// directions and every comparison happens in integer cents.
// ---------------------------------------------------------------------------

export function toPayPalAmount(usd: number): string {
  return (Math.round(usd * 100) / 100).toFixed(2);
}

/** Cents, or null if the string is not a money amount PayPal would send. */
export function parsePayPalAmount(value: unknown): number | null {
  if (typeof value !== "string") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return null;
  const cents = Math.round(Number(value) * 100);
  return Number.isFinite(cents) ? cents : null;
}

/**
 * Whether PayPal's reported amount is the one we asked for.
 *
 * The comparison that stands between a booking and being marked paid for the
 * wrong figure. In integer cents, because comparing money as floats is how a
 * payment that is a cent short passes.
 */
export function sameMoney(usd: number, paypalAmount: unknown): boolean {
  const theirs = parsePayPalAmount(paypalAmount);
  return theirs !== null && theirs === Math.round(usd * 100);
}
