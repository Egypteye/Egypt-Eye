export const STATUSES = ["new", "reviewing", "approved", "negotiating", "confirmed", "completed", "rejected"] as const;
export type CollaborationStatus = (typeof STATUSES)[number];
