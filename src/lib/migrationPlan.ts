// Works out what a Take Egypt Home update would change, before anything is
// written.
//
// This is a separate, pure module for one reason: it decides what to overwrite
// in the live Sanity dataset, and the route it lives in cannot be run without
// production credentials. Keeping the decision here means it can be tested
// against real content — see scripts/check-migration-plan.mts.

export type PlannedDoc = {
  _id: string;
  _type: string;
  slug: { _type: string; current: string };
} & Record<string, unknown>;

export type TreasurePlan = {
  create: PlannedDoc[];
  update: { id: string; document: string; fields: string[]; changed: Record<string, unknown> }[];
  unchanged: string[];
  orphans: string[];
};

/**
 * Whether a field already holds what the content file would write.
 *
 * Compared structurally, with Sanity's own bookkeeping ignored: `_key` and
 * `_type` are added to array items and objects by the Studio, so an array
 * that has round-tripped through Sanity comes back carrying them whether or
 * not the payload had any. Without this, every array reads as changed on
 * every run and the diff says nothing.
 */
export function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalise(a)) === JSON.stringify(normalise(b));
}

function normalise(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalise);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([k, v]) => k !== "_key" && k !== "_type" && v !== undefined)
        .sort(([x], [y]) => x.localeCompare(y))
        .map(([k, v]) => [k, normalise(v)])
    );
  }
  return value;
}

/**
 * The plan.
 *
 * The rule that matters: a field the content file leaves undefined is never
 * touched. That is what keeps an update from blanking a price, a photograph,
 * a variant or an SEO override that exists only in the Studio — and it means
 * an update can only ever overwrite a field the repo has an opinion about.
 */
export function planTreasureUpdate(docs: PlannedDoc[], live: Record<string, unknown>[]): TreasurePlan {
  const liveById = new Map(live.map((d) => [d._id as string, d]));
  const plan: TreasurePlan = { create: [], update: [], unchanged: [], orphans: [] };

  for (const doc of docs) {
    const existing = liveById.get(doc._id);
    if (!existing) {
      plan.create.push(doc);
      continue;
    }

    const changed: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(doc)) {
      if (field === "_id" || field === "_type" || value === undefined) continue;
      if (!sameValue(value, existing[field])) changed[field] = value;
    }

    const label = `${doc._type}: ${doc.slug.current}`;
    if (Object.keys(changed).length === 0) plan.unchanged.push(label);
    else plan.update.push({ id: doc._id, document: label, fields: Object.keys(changed).sort(), changed });
  }

  // Documents in Sanity that the content files no longer describe — the stale
  // samples a real catalogue replaces. Reported, never deleted: removing a
  // document is destructive, it may be an editor's own work, and it is two
  // clicks in the Studio.
  const managed = new Set(docs.map((d) => d._id));
  for (const doc of live) {
    if (!managed.has(doc._id as string)) {
      plan.orphans.push(`${doc._type}: ${doc._id} — in Sanity, not in the content files`);
    }
  }

  return plan;
}
