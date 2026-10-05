// Which attempt states are finished with.
//
// Split out of attempts.ts so scripts/check-booking.mts can assert it against
// the real code: that module imports `server-only`, and a rule this important
// should not be guarded by a restatement of itself.
//
// The two directions fail differently, which is why both are asserted. Treat a
// settled attempt as open and a late webhook re-captures money or re-sends a
// receipt. Treat an open attempt as settled and a real payment is never
// collected.
//
// `mismatch` is terminal not because nothing more will happen, but because
// what happens next has to be a person: marking it paid would be wrong, and
// marking it failed would hide real money.
const TERMINAL = new Set(["captured", "failed", "cancelled", "expired", "refunded", "reversed", "mismatch"]);

export function isTerminal(status: string): boolean {
  return TERMINAL.has(status);
}
