export const STATUSES = ["new", "reviewing", "approved", "rejected"] as const;
export type AffiliateStatus = (typeof STATUSES)[number];
