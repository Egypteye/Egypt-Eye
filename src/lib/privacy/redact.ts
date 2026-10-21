// Taking the person out of a payment record.
//
// PayPal's webhooks arrive carrying the payer: their name, their email, and
// on a capture often their home address. We were storing all of it. A check
// of the live table found an email in 15 of 15 events, and a full postal
// address in 10 of them.
//
// None of it is needed. The reconciliation and settlement code works from
// the ORDER ID, the amount and the status; it never reads the payer block.
// And PayPal keeps the real record — the order id is the pointer back to it,
// so "who paid this?" is answered by logging into PayPal rather than by us
// holding a copy of somebody's address forever.
//
// So this strips the payer before the row is written. Not deleted later on a
// schedule — never stored. Data you do not hold cannot leak, cannot be
// demanded, and does not need a retention period.
//
// Pure and free of `server-only` on purpose: the webhook route cannot be
// reached by the check scripts, and "we do not store payer details" is
// exactly the kind of claim that has to be provable offline.

/**
 * Keys that carry a person, anywhere in a PayPal payload.
 *
 * Matched case-insensitively on the key NAME, at any depth, so a payload
 * shape we have not seen before still gets cleaned. The alternative —
 * listing the paths PayPal uses today — breaks silently the first time they
 * add a field, which is the wrong way round for this.
 */
const PERSONAL_KEYS = [
  "payer",
  // The funding instrument. Nothing reads it — settlement works from the
  // order id, amount and status — and on a card payment it carries the last
  // four digits and the issuing bank.
  "payment_source",
  "payee",
  "payer_name",
  "payer_id",
  "given_name",
  "surname",
  "full_name",
  "email_address",
  "phone",
  "phone_number",
  "national_number",
  "address",
  "shipping",
  "address_line_1",
  "address_line_2",
  "admin_area_1",
  "admin_area_2",
  "postal_code",
  "country_code",
  "birth_date",
  "tax_info",
  "card",
  "last_digits",
  "bin_details",
];

const PERSONAL = new Set(PERSONAL_KEYS.map((k) => k.toLowerCase()));

/** What replaces a stripped value, so the shape is still readable. */
export const REDACTED = "[redacted]";

/**
 * A payload with every person-carrying field removed, at any depth.
 *
 * Everything else survives: event type, order and capture ids, amounts,
 * currency, status, timestamps — the things reconciliation actually reads.
 */
export function redactPayerData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactPayerData);
  if (value === null || typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    if (PERSONAL.has(key.toLowerCase())) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = redactPayerData(inner);
  }
  return out;
}

/** True when a payload still carries something that identifies a person. */
export function containsPayerData(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsPayerData);
  if (value === null || typeof value !== "object") return false;
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    if (PERSONAL.has(key.toLowerCase()) && inner !== REDACTED) return true;
    if (containsPayerData(inner)) return true;
  }
  return false;
}
