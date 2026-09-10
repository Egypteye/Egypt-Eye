// The permission vocabulary of Egypt Eye OS, mirrored from the catalog in
// supabase/migrations/0019_egypt_eye_os_config.sql.
//
// This list is the compile-time half of the contract: `can(actor, "trips.view")`
// type-checks, and a typo becomes a build error rather than a silent
// always-false at runtime. The database half is the source of truth for what
// each ROLE holds; this half is the source of truth for what exists at all.
// The two are kept honest by src/lib/os/permissions.check.ts, which the OS
// Admin Center runs and reports on.

export const PERMISSION_KEYS = [
  "trips.view", "trips.create", "trips.edit", "trips.delete", "trips.assign",
  "trips.status", "trips.financials", "trips.export", "trips.bulk",
  "clients.view", "clients.contact", "clients.create", "clients.edit",
  "clients.delete", "clients.export",
  "resources.view", "resources.create", "resources.edit", "resources.delete", "resources.costs",
  "team.view", "team.create", "team.edit", "team.rates", "team.roles", "team.performance",
  "suppliers.view", "suppliers.create", "suppliers.edit", "suppliers.rates",
  "pricing.view", "pricing.edit", "pricing.calculate", "pricing.margins",
  "finance.view", "finance.edit", "finance.export",
  "tasks.view", "tasks.create", "tasks.edit", "tasks.assign",
  "projects.view", "projects.manage",
  "approvals.view", "approvals.request", "approvals.decide",
  "incidents.view", "incidents.create", "incidents.edit",
  "quality.review", "feedback.view", "feedback.manage",
  "content.view", "content.edit",
  "media.view", "media.manage", "documents.view", "documents.manage",
  "knowledge.view", "knowledge.edit",
  "calendar.view", "calendar.edit", "events.view", "events.edit",
  "chat.view", "chat.post",
  "attendance.self", "attendance.view", "attendance.edit",
  "analytics.view", "analytics.financial", "analytics.export",
  "admin.users", "admin.roles", "admin.units", "admin.catalog", "admin.templates",
  "admin.tags", "admin.automations", "admin.settings", "admin.integrations", "admin.audit",
  "ai.ask", "ai.act", "ai.admin",
  // Commercial — B2C Reservations and B2B Sales & Partnerships, mirrored from
  // supabase/migrations/0023_egypt_eye_commercial_config.sql.
  "leads.view", "leads.create", "leads.edit", "leads.assign",
  "deals.view", "deals.create", "deals.edit", "deals.stage", "deals.value",
  "deals.close", "deals.assign", "deals.convert",
  "companies.view", "companies.create", "companies.edit", "companies.terms", "companies.credit",
  "agreements.view", "agreements.create", "agreements.edit", "agreements.activate",
  "engagements.view", "engagements.log",
  "commercial.discount", "commercial.analytics", "commercial.export",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

// all  — every record in the organization
// unit — records belonging to a business unit the actor is a member of
// own  — only records the actor is assigned to, owns, or created
export type Scope = "all" | "unit" | "own";

export const SCOPE_RANK: Record<Scope, number> = { own: 1, unit: 2, all: 3 };

export function widerScope(a: Scope, b: Scope): Scope {
  return SCOPE_RANK[a] >= SCOPE_RANK[b] ? a : b;
}

export const SCOPE_LABEL: Record<Scope, string> = {
  all: "Everything",
  unit: "Their business unit",
  own: "Only their own",
};

// Grouped for the Admin Center's permission matrix. Order is the order the
// matrix renders in.
export const PERMISSION_MODULES: { key: string; label: string; description: string }[] = [
  { key: "trips", label: "Trips", description: "The central operational object and everything on it." },
  { key: "clients", label: "Clients", description: "Client records, contact details and travel history." },
  { key: "resources", label: "Resources", description: "Vehicles, dresses and equipment." },
  { key: "team", label: "Team", description: "Staff records, rates, roles and performance." },
  { key: "suppliers", label: "Suppliers", description: "Partners, their services and what we pay them." },
  { key: "pricing", label: "Pricing", description: "The price book and the trip calculator." },
  { key: "finance", label: "Finance", description: "Costs, payments and balances." },
  { key: "tasks", label: "Tasks and projects", description: "Operational checklists and internal projects." },
  { key: "approvals", label: "Approvals", description: "Requesting and deciding." },
  { key: "incidents", label: "Incidents and quality", description: "Problems, performance and client feedback." },
  { key: "content", label: "Content and documents", description: "The post-shoot pipeline, media links and files." },
  { key: "knowledge", label: "Knowledge", description: "Articles and standard operating procedures." },
  { key: "calendar", label: "Calendars", description: "Operations calendar and the internal company calendar." },
  { key: "chat", label: "Communication", description: "Internal channels." },
  { key: "attendance", label: "Attendance", description: "Check-in and the attendance record." },
  { key: "analytics", label: "Analytics", description: "Operational and financial reporting." },
  { key: "admin", label: "Administration", description: "Configuration of the system itself." },
  { key: "ai", label: "AI", description: "The assistant layer and its action ledger." },
  { key: "leads", label: "Enquiries", description: "Enquiries that have arrived, before they are qualified." },
  { key: "deals", label: "Pipeline", description: "Opportunities in both the B2C and B2B pipelines." },
  { key: "companies", label: "Partners", description: "Agencies, operators, hotels and their commercial terms." },
  { key: "agreements", label: "Agreements", description: "Contracts with partners and the terms in force." },
  { key: "engagements", label: "Contact history", description: "Calls, meetings and messages logged against a relationship." },
  { key: "commercial", label: "Commercial", description: "Discounts, commercial reporting and exports." },
];
