// Who may do what, as pure functions over a role string.
//
// Separate from session.ts on purpose: that module reaches for cookies and a
// Supabase client, so it cannot be imported by an offline check. These rules
// are the part worth asserting, so they live where scripts/check-os.mts can
// import them without a database.
//
// Nothing here reads a request. These functions decide policy; the server
// actions and pages are what enforce it, by calling them before they write.

export const USER_ROLES = ["customer", "admin", "reservations", "operations", "social"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

/**
 * The roles that may open the OS at all.
 *
 * An allow-list rather than "anyone who is not a customer", so a role added by
 * a later migration and forgotten here is refused instead of waved through.
 * `customer` is absent, which keeps every real traveller's account away from
 * other guests' phone numbers and from what a booking was sold for.
 */
export const OS_ROLES = ["admin", "reservations", "operations", "social"] as const;

export type OsRole = (typeof OS_ROLES)[number];

export function isOsRole(role: unknown): role is OsRole {
  return typeof role === "string" && (OS_ROLES as readonly string[]).includes(role);
}

// ---------------------------------------------------------------------------
// What each role may change.
//
// The split follows who is accountable for the fact, not seniority:
//
// * The desk that sold the booking owns the guest, the dates and the money.
// * Operations owns the logistics of a day — it is their driver, their guide,
//   and they are the ones who find out at 7am that the pick-up moved.
// * Social owns the content columns, and has no business in either.
//
// Operations can SEE the money because a driver collects the outstanding
// balance in cash and needs to know the figure. Social cannot, because
// nothing in their job requires it.
// ---------------------------------------------------------------------------

/** Create a booking, change its guest, dates, status or price. */
export function canManageBookings(role: UserRole): boolean {
  return role === "admin" || role === "reservations";
}

/** Change what a booking is worth or what has been paid. */
export function canEditMoney(role: UserRole): boolean {
  return role === "admin" || role === "reservations";
}

/** See what a booking was sold for. */
export function canSeeMoney(role: UserRole): boolean {
  return role === "admin" || role === "reservations" || role === "operations";
}

/** Set a day's pick-up time and place, driver, guide and inclusions. */
export function canEditLogistics(role: UserRole): boolean {
  return role === "admin" || role === "reservations" || role === "operations";
}

/** Set the photographer, the assist, and whether the content data is in. */
export function canEditContent(role: UserRole): boolean {
  return role === "admin" || role === "reservations" || role === "social";
}

/** Work the follow-up list: add leads, move their dates, close them out. */
export function canManageLeads(role: UserRole): boolean {
  return role === "admin" || role === "reservations";
}
