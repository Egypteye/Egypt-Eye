import "server-only";
import crypto from "node:crypto";

// Excludes visually ambiguous characters (0/O, 1/I/L) so a code is easy to
// read back over the phone or copy correctly from an email.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateDiscountCode(prefix = "EGY4"): string {
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (let i = 0; i < bytes.length; i++) {
    suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `${prefix}-${suffix}`;
}
