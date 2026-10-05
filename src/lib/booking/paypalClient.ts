import "server-only";

import { type PayPalConfig } from "./paypalConfig";

export type { PayPalConfig, PayPalIntent } from "./paypalConfig";
export {
  payPalConfig,
  moneyModeFor,
  hasWebhookSignatureHeaders,
  toPayPalAmount,
  parsePayPalAmount,
  sameMoney,
} from "./paypalConfig";

// The PayPal REST API, as thin a layer as the job allows.
//
// Everything here is server-side and must stay that way: the secret is here,
// and more importantly every *decision* is here. The browser's only role in a
// PayPal payment is to say "the customer approved it" — it never says what was
// paid, how much, or for which booking. Those three facts are read back from
// PayPal by this file, because the browser is the one participant in the
// transaction that the customer controls.
//
// Two environments, one code path. PAYPAL_ENV=live switches the base URL; a
// sandbox client id against the live host (or the reverse) fails with an
// authentication error rather than doing something subtly wrong, which is the
// failure mode you want.

// ---------------------------------------------------------------------------
// Access tokens
//
// PayPal's tokens last several hours. Fetching one per request would add a
// round trip to every payment and burn rate limit for nothing, so it is cached
// in module scope with a safety margin. The cache is keyed by client id so a
// credential rotation cannot be served a token minted for the old one — a
// mistake that would look like a baffling intermittent 401.
// ---------------------------------------------------------------------------
type CachedToken = { clientId: string; token: string; expiresAt: number };
let cached: CachedToken | null = null;

// A minute of slack, so a token cannot expire in flight between the check and
// the call that uses it.
const EXPIRY_MARGIN_MS = 60_000;

async function accessToken(config: PayPalConfig): Promise<string | null> {
  const now = Date.now();
  if (cached && cached.clientId === config.clientId && cached.expiresAt > now) {
    return cached.token;
  }

  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  try {
    const response = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("paypal: token request failed", response.status, await safeText(response));
      return null;
    }
    const data = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    const ttlMs = Math.max(0, (data.expires_in ?? 0) * 1000 - EXPIRY_MARGIN_MS);
    cached = { clientId: config.clientId, token: data.access_token, expiresAt: now + ttlMs };
    return data.access_token;
  } catch (err) {
    console.error("paypal: token request threw", err);
    return null;
  }
}

/** Drops the cached token. Called when PayPal rejects one as unauthorized. */
function forgetToken() {
  cached = null;
}

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 2000);
  } catch {
    return "<unreadable>";
  }
}

export type PayPalResponse<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; body: string };

/**
 * One authenticated call.
 *
 * Retries exactly once on a 401, after dropping the cached token — the single
 * case where retrying is clearly right, because a rotated credential or a
 * token PayPal expired early is indistinguishable from a real auth failure
 * until you try again with a fresh one. Nothing else is retried: a payment
 * call that failed for any other reason must surface, not be repeated.
 */
export async function payPalRequest<T>(
  config: PayPalConfig,
  path: string,
  init: { method: string; body?: unknown; idempotencyKey?: string }
): Promise<PayPalResponse<T>> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await accessToken(config);
    if (!token) {
      return { ok: false, status: 0, message: "Could not authenticate with PayPal.", body: "" };
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    // PayPal's own idempotency mechanism. Without it a retried or double-
    // submitted capture can take the money twice, and the customer's
    // complaint arrives before the log does.
    if (init.idempotencyKey) headers["PayPal-Request-Id"] = init.idempotencyKey;

    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}${path}`, {
        method: init.method,
        headers,
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        cache: "no-store",
      });
    } catch (err) {
      return {
        ok: false,
        status: 0,
        message: "Could not reach PayPal.",
        body: err instanceof Error ? err.message : String(err),
      };
    }

    if (response.status === 401 && attempt === 0) {
      forgetToken();
      continue;
    }

    const body = await safeText(response);
    if (!response.ok) {
      return { ok: false, status: response.status, message: payPalErrorMessage(body), body };
    }
    // 204s carry no body, which is a success for void/refund calls.
    return { ok: true, status: response.status, data: (body ? JSON.parse(body) : {}) as T };
  }

  return { ok: false, status: 401, message: "PayPal rejected our credentials.", body: "" };
}

/**
 * The most useful sentence out of a PayPal error body.
 *
 * Its errors nest the thing you need two levels down, and a log line reading
 * `{"name":"UNPROCESSABLE_ENTITY",...}` sends you to the dashboard when the
 * answer was in the response all along.
 */
function payPalErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as {
      name?: string;
      message?: string;
      details?: { issue?: string; description?: string }[];
    };
    const detail = parsed.details?.[0];
    return [parsed.name, parsed.message, detail?.issue, detail?.description]
      .filter(Boolean)
      .join(" — ") || "PayPal rejected the request.";
  } catch {
    return "PayPal rejected the request.";
  }
}
