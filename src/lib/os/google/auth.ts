import "server-only";
import { createSign } from "node:crypto";

// ---------------------------------------------------------------------------
// GOOGLE SERVICE-ACCOUNT ACCESS TOKENS
// ---------------------------------------------------------------------------
// Mints an OAuth2 access token from a service account's private key, by hand.
//
// WHY BY HAND, AND NOT `googleapis`
// The official client is tens of megabytes for what is, at bottom, one signed
// JWT posted to one URL. On a serverless function that weight is paid on every
// cold start. Node can already sign RS256, and the token exchange is a single
// fetch, so the whole thing is forty lines and no supply chain.
//
// The token is cached in module scope and re-minted a minute before it expires.
// That cache lives for the life of one warm function instance, which is exactly
// the right lifetime: long enough to matter inside a sweep that publishes
// twenty trips, short enough that nothing is holding a credential for hours.
// ---------------------------------------------------------------------------

export class GoogleAuthError extends Error {
  constructor(message: string, readonly detail?: string) {
    super(message);
    this.name = "GoogleAuthError";
  }
}

type ServiceAccount = { clientEmail: string; privateKey: string; subject?: string };

/**
 * Reads the service-account credentials, or returns null when they are absent.
 * Absent is a normal state — the OS runs perfectly well without Google — so
 * this never throws for a missing variable. It throws only for one that is
 * present and malformed, because a key that cannot be parsed is a
 * misconfiguration somebody needs to be told about.
 */
export function googleServiceAccount(): ServiceAccount | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!clientEmail || !raw) return null;

  // A PEM key pasted into a dashboard field arrives with its newlines escaped
  // as the two characters \ and n. Both forms are accepted; neither is the
  // user's problem to notice.
  const privateKey = raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
  if (!privateKey.includes("BEGIN") || !privateKey.includes("PRIVATE KEY")) {
    throw new GoogleAuthError(
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY does not look like a private key",
      "Paste the whole `private_key` value from the service account's JSON file, including the BEGIN and END lines.",
    );
  }

  return {
    clientEmail,
    privateKey,
    // Only needed for domain-wide delegation, which this integration does not
    // require. Set it to act as a real user — the one case where Google will
    // let an event actually invite attendees.
    subject: process.env.GOOGLE_IMPERSONATE_EMAIL?.trim() || undefined,
  };
}

export function googleConfigured(): boolean {
  try {
    return googleServiceAccount() !== null;
  } catch {
    // A malformed key is still "configured" — it is a broken configuration
    // rather than an absent one, and the page reporting status should say so
    // rather than pretending Google was never set up.
    return true;
  }
}

const base64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

let cached: { token: string; expiresAt: number; scope: string } | null = null;

/** An access token for the given scope, minted or reused from cache. */
export async function googleAccessToken(scope: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.scope === scope && cached.expiresAt > now + 60) return cached.token;

  const account = googleServiceAccount();
  if (!account) {
    throw new GoogleAuthError(
      "Google is not connected",
      "Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
    );
  }

  const claims = {
    iss: account.clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    ...(account.subject ? { sub: account.subject } : {}),
  };

  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify(claims))}`;
  let signature: string;
  try {
    signature = base64url(createSign("RSA-SHA256").update(unsigned).sign(account.privateKey));
  } catch (error) {
    throw new GoogleAuthError(
      "The Google private key could not be used to sign",
      error instanceof Error ? error.message : undefined,
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !body.access_token) {
    // Google's own words, forwarded rather than flattened into "auth failed",
    // because "invalid_grant: Invalid JWT Signature" and "unauthorized_client"
    // send you to two completely different settings pages.
    throw new GoogleAuthError(
      "Google refused the service account",
      [body.error, body.error_description].filter(Boolean).join(": ") || `HTTP ${response.status}`,
    );
  }

  cached = { token: body.access_token, expiresAt: now + (body.expires_in ?? 3600), scope };
  return body.access_token;
}

/** Drops the cached token. Used when a call comes back 401 on a live token. */
export function forgetGoogleToken(): void {
  cached = null;
}
