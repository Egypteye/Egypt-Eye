// ---------------------------------------------------------------------------
// SAVED VIEWS
// ---------------------------------------------------------------------------
// A saved view is a stored FILTER SET, not a stored result — os_saved_views
// holds a `query` JSON document and it is re-run on every open, so "Trips at
// risk" is always today's answer rather than the answer it was when somebody
// saved it.
//
// This module is the one place that knows how that stored document becomes a
// screen. It translates the query into the URL vocabulary the list pages
// already speak, which keeps a single source of truth for filtering: a saved
// view produces exactly the same URL a person would get by clicking the
// filters by hand, so a view is shareable, bookmarkable, and can never claim
// something the filter bar cannot do.
//
// The honesty rule: anything in a stored query this application cannot
// currently honour comes back in `unsupported`, and the UI says so on the
// chip. A view that quietly drops half its query is worse than no view — it
// shows a confident, wrong list.
//
// Not marked `server-only`: the filter bar is a client component and renders
// these links itself.
// ---------------------------------------------------------------------------

export type SavedViewQuery = Record<string, unknown>;

export type SavedView = {
  id: string;
  name: string;
  resource: string;
  query: SavedViewQuery;
  icon?: string | null;
};

export type SavedViewLink = {
  href: string;
  /** Query keys this build cannot honour. Empty for every view that ships. */
  unsupported: string[];
};

/** Date ranges a stored query may ask for, mapped to the `range` parameter. */
const RANGE_ALIASES: Record<string, string> = {
  today: "today",
  tomorrow: "tomorrow",
  upcoming: "upcoming",
  next_7_days: "week",
  this_week: "week",
  week: "week",
  this_month: "month",
  month: "month",
  last_90_days: "quarter",
  quarter: "quarter",
  past: "past",
  all: "all",
  any: "all",
};

const TRIP_MISSING = [
  "driver", "guide", "photographer", "videographer", "coordinator",
  "representative", "vehicle", "dress", "crew", "media",
];

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function isTrue(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Turn a stored view into the link its chip points at.
 *
 * Every key is handled explicitly. A key that falls through to the end is
 * reported rather than ignored, which is what keeps a stored query and the
 * screen it opens from drifting apart.
 */
export function savedViewLink(resource: string, rawQuery: SavedViewQuery | null | undefined): SavedViewLink {
  const query = rawQuery ?? {};
  const params = new URLSearchParams();
  const unsupported: string[] = [];

  const set = (key: string, value: string | null) => {
    if (value) params.set(key, value);
  };

  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === "" || (Array.isArray(value) && !value.length)) continue;

    switch (`${resource}.${key}`) {
      // -- Trips -----------------------------------------------------------
      case "trips.when": {
        const range = RANGE_ALIASES[String(value)];
        if (range) set("range", range);
        else unsupported.push(key);
        break;
      }
      case "trips.readiness": set("readiness", list(value).join(",")); break;
      case "trips.status": set("status", list(value).join(",")); break;
      case "trips.unit": set("unit", list(value).join(",")); break;
      case "trips.type": set("type", list(value).join(",")); break;
      case "trips.tag": set("tag", String(value)); break;
      case "trips.missing": {
        const missing = String(value);
        if (TRIP_MISSING.includes(missing)) set("missing", missing);
        else unsupported.push(key);
        break;
      }
      case "trips.produces_content": if (isTrue(value)) set("produces", "content"); break;
      case "trips.balance_due": if (isTrue(value)) set("balance", "due"); break;
      case "trips.margin_pct_gte": set("margin_gte", num(value)?.toString() ?? null); break;
      case "trips.margin_pct_lt": set("margin_lt", num(value)?.toString() ?? null); break;
      case "trips.sort": set("sort", String(value)); break;

      // -- Tasks -----------------------------------------------------------
      case "tasks.owner": set("who", String(value) === "me" ? "me" : "all"); break;
      case "tasks.overdue": if (isTrue(value)) set("overdue", "1"); break;
      case "tasks.include_done": if (isTrue(value)) set("done", "1"); break;

      // -- Clients ---------------------------------------------------------
      case "clients.tag": set("tag", String(value)); break;
      case "clients.kind": set("kind", String(value)); break;

      // -- Resources -------------------------------------------------------
      case "resources.status": set("status", list(value).join(",")); break;
      case "resources.kind": set("kind", String(value)); break;

      // -- Suppliers -------------------------------------------------------
      case "suppliers.category": set("category", String(value)); break;

      // -- Approvals and incidents -----------------------------------------
      case "approvals.status": set("status", list(value).join(",")); break;
      case "incidents.status": set("status", list(value).join(",")); break;
      case "incidents.severity": set("severity", list(value).join(",")); break;

      default:
        // Free text search is spelled the same way everywhere.
        if (key === "q" || key === "search") set("q", String(value));
        else unsupported.push(key);
    }
  }

  const path = SAVED_VIEW_PATH[resource] ?? "/os";
  const search = params.toString();
  return { href: search ? `${path}?${search}` : path, unsupported };
}

const SAVED_VIEW_PATH: Record<string, string> = {
  trips: "/os/trips",
  tasks: "/os/tasks",
  clients: "/os/clients",
  resources: "/os/resources",
  suppliers: "/os/suppliers",
  approvals: "/os/approvals",
  incidents: "/os/incidents",
};

/** The sentence a chip shows when part of its stored query cannot be run. */
export function unsupportedNote(unsupported: string[]): string | undefined {
  if (!unsupported.length) return undefined;
  return `This view also stores ${unsupported.join(", ")}, which this screen cannot filter on yet — the list below ignores it.`;
}
