// What a PayPal response body means, as a pure function.
//
// Split from paypalClient.ts for the reason paypalConfig.ts was: that module
// is `server-only`, which puts it out of reach of scripts/check-paypal.mts.
// This logic earned its own module the hard way.
//
// It used to live inline in payPalRequest, and it read the body through a
// helper that truncated to 2000 characters. The truncation is right for a log
// line — a failed call should not dump megabytes into Vercel's log viewer —
// but the SUCCESS path parsed that same truncated string. Any response longer
// than 2000 characters therefore threw
//
//   SyntaxError: Unterminated string in JSON at position 2000
//
// out of whatever was calling it. PayPal's order read-back and capture
// responses are routinely longer than that, so this was not an edge case: it
// broke the admin connection test outright, and the same line sits on the
// capture path, where throwing after PayPal has already moved the money is the
// worst thing this code can do.
//
// Two rules come out of that, and they are why this is a function rather than
// three lines in a try block:
//
// 1. Truncation is for logs only. Parsing always gets the whole body.
// 2. A body we cannot parse is never a success and never a throw. It comes
//    back as a structured failure, so a capture that cannot be read leaves the
//    attempt un-settled for the reconciliation sweep to find, rather than
//    crashing the route and losing the payment.

export type PayPalResponse<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; body: string };

/** As much of a body as belongs in a log line. */
export const MAX_LOGGED_BODY = 2000;

/** Enough of a body to diagnose from, short enough to log. */
export function forLog(body: string | null): string {
  if (body === null) return "<unreadable>";
  if (body.length <= MAX_LOGGED_BODY) return body;
  return `${body.slice(0, MAX_LOGGED_BODY)}… (${body.length} chars, truncated)`;
}

/**
 * The most useful sentence out of a PayPal error body.
 *
 * Its errors nest the thing you need two levels down, and a log line reading
 * `{"name":"UNPROCESSABLE_ENTITY",...}` sends you to the dashboard when the
 * answer was in the response all along. Given the whole body, never a
 * truncated one — a long error body that got cut would fail to parse here and
 * lose exactly the detail this exists to surface.
 */
export function payPalErrorMessage(body: string | null): string {
  if (!body) return "PayPal rejected the request.";
  try {
    const parsed = JSON.parse(body) as {
      name?: string;
      message?: string;
      details?: { issue?: string; description?: string }[];
    };
    const detail = parsed.details?.[0];
    return (
      [parsed.name, parsed.message, detail?.issue, detail?.description].filter(Boolean).join(" — ") ||
      "PayPal rejected the request."
    );
  } catch {
    return "PayPal rejected the request.";
  }
}

/**
 * Turns a status and a raw body into an answer.
 *
 * `raw` is the COMPLETE body, or null if it could not be read at all. Callers
 * must not pre-truncate it; truncation happens here, for logging only.
 */
export function interpretPayPalBody<T>(
  status: number,
  ok: boolean,
  raw: string | null
): PayPalResponse<T> {
  if (!ok) {
    return { ok: false, status, message: payPalErrorMessage(raw), body: forLog(raw) };
  }

  // A 204 carries no body, which is a success for the void and refund calls.
  if (raw === null || raw.trim() === "") {
    return { ok: true, status, data: {} as T };
  }

  try {
    return { ok: true, status, data: JSON.parse(raw) as T };
  } catch {
    // See rule 2 above. Never throws, never reports success.
    return {
      ok: false,
      status,
      message: "PayPal returned a success we could not read.",
      body: forLog(raw),
    };
  }
}
