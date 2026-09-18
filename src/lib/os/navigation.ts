import type { PermissionKey } from "./permissions";
import type { IconName } from "@/components/os/icons";

// ---------------------------------------------------------------------------
// NAVIGATION
// ---------------------------------------------------------------------------
// One declarative map, filtered by permission. Two consequences worth naming:
//
//  * A driver's sidebar is four items, not forty greyed-out ones. Showing
//    someone a menu of things they cannot do is a worse experience than a
//    small menu, and it leaks the shape of the company to people who have no
//    reason to see it.
//
//  * The permission listed here is exactly the one the destination screen
//    asserts. The nav is a convenience; the page is the boundary.
// ---------------------------------------------------------------------------

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** Visible when the actor holds ANY of these. Empty means always visible. */
  permissions?: PermissionKey[];
  /** Marks the primary mobile tabs. */
  mobile?: boolean;
  exact?: boolean;
  description?: string;
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Operate",
    items: [
      { href: "/os", label: "Command centre", icon: "Home", exact: true, mobile: true, description: "What is happening inside Egypt Eye right now" },
      { href: "/os/me", label: "My day", icon: "Today", mobile: true, description: "Your trips, tasks and check-in" },
      { href: "/os/today", label: "Today", icon: "Today", permissions: ["trips.view"], description: "Every trip running today" },
      { href: "/os/tomorrow", label: "Tomorrow", icon: "Flag", permissions: ["trips.view"], mobile: true, description: "Tomorrow's board, and what is missing" },
      { href: "/os/trips", label: "Trips", icon: "Trip", permissions: ["trips.view"], mobile: true, description: "Every trip, filtered any way you need" },
      { href: "/os/calendar", label: "Operations calendar", icon: "Calendar", permissions: ["calendar.view"], description: "Day, week and month" },
      { href: "/os/tasks", label: "Tasks", icon: "CheckSquare", permissions: ["tasks.view"], mobile: true, description: "Work assigned across the company" },
      { href: "/os/approvals", label: "Approvals", icon: "Shield", permissions: ["approvals.view"], description: "Decisions waiting on someone" },
      { href: "/os/incidents", label: "Incidents", icon: "Alert", permissions: ["incidents.view"], description: "What went wrong, and what was done" },
    ],
  },
  {
    // The commercial half of the company. Two workspaces over ONE data model:
    // a lead, a deal and a person are the same tables on both sides, and the
    // pipeline column is what makes them read differently.
    label: "Sell",
    items: [
      { href: "/os/reservations", label: "Reservations", icon: "Client", permissions: ["leads.view", "deals.view"], description: "B2C — enquiries, quotes and bookings" },
      { href: "/os/partnerships", label: "Partnerships", icon: "Building", permissions: ["companies.view", "deals.view"], description: "B2B — partners, pipeline and agreements" },
      { href: "/os/commercial", label: "Commercial reporting", icon: "Chart", permissions: ["commercial.analytics"], description: "Pipeline, conversion, sources and partner revenue" },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/os/clients", label: "Clients", icon: "Client", permissions: ["clients.view"], description: "Every guest and agency, with their whole history" },
      { href: "/os/team", label: "Team", icon: "Users", permissions: ["team.view"], description: "The people who deliver the work" },
      { href: "/os/resources", label: "Resources", icon: "Truck", permissions: ["resources.view"], description: "Vehicles, dresses and equipment" },
      { href: "/os/suppliers", label: "Suppliers", icon: "Building", permissions: ["suppliers.view"], description: "Partners, rates and reliability" },
    ],
  },
  {
    label: "Deliver",
    items: [
      { href: "/os/content", label: "Content pipeline", icon: "Camera", permissions: ["content.view"], description: "Every shoot from upload to delivery" },
      { href: "/os/calculator", label: "Trip calculator", icon: "Calculator", permissions: ["pricing.calculate"], description: "Cost, price and margin before you promise" },
      { href: "/os/pricing", label: "Price book", icon: "Money", permissions: ["pricing.view"], description: "Every rate, effective-dated" },
      { href: "/os/finance", label: "Finance", icon: "Money", permissions: ["finance.view"], description: "Revenue, cost and what is outstanding" },
      { href: "/os/analytics", label: "Analytics", icon: "Chart", permissions: ["analytics.view"], description: "What is working and what is not" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/os/knowledge", label: "Knowledge", icon: "Book", permissions: ["knowledge.view"], description: "How Egypt Eye actually does things" },
      { href: "/os/chat", label: "Channels", icon: "Chat", permissions: ["chat.view"], description: "Internal conversation, attached to the work" },
      { href: "/os/company-calendar", label: "Company calendar", icon: "Calendar", permissions: ["events.view"], description: "Meetings, training and deadlines" },
      { href: "/os/attendance", label: "Attendance", icon: "Clock", permissions: ["attendance.view"], description: "Who is working, and when" },
      { href: "/os/admin", label: "Admin centre", icon: "Settings", permissions: ["admin.users", "admin.roles", "admin.settings", "admin.audit", "admin.catalog", "admin.automations"], description: "Configure the system" },
    ],
  },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/os/admin", label: "Overview", icon: "Settings", exact: true },
  { href: "/os/admin/users", label: "Users and access", icon: "Users", permissions: ["admin.users"] },
  { href: "/os/admin/roles", label: "Roles and permissions", icon: "Shield", permissions: ["admin.roles"] },
  { href: "/os/admin/catalog", label: "Units, services and statuses", icon: "Box", permissions: ["admin.catalog", "admin.units"] },
  { href: "/os/admin/templates", label: "Templates", icon: "Doc", permissions: ["admin.templates"] },
  { href: "/os/admin/automations", label: "Automations", icon: "Play", permissions: ["admin.automations"] },
  { href: "/os/admin/integrations", label: "Integrations", icon: "Link", permissions: ["admin.integrations"] },
  { href: "/os/admin/settings", label: "System settings", icon: "Settings", permissions: ["admin.settings"] },
  { href: "/os/admin/audit", label: "Audit log", icon: "Shield", permissions: ["admin.audit"] },
];

/** Filter a nav tree down to what one actor may actually reach. */
export function visibleNav(
  groups: NavGroup[],
  holds: (key: PermissionKey) => boolean,
): NavGroup[] {
  return groups
    .map((group) => ({
      label: group.label,
      items: group.items.filter((item) => !item.permissions?.length || item.permissions.some(holds)),
    }))
    .filter((group) => group.items.length > 0);
}

export function visibleItems(items: NavItem[], holds: (key: PermissionKey) => boolean): NavItem[] {
  return items.filter((item) => !item.permissions?.length || item.permissions.some(holds));
}
