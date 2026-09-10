// Picks the "you might also like" items shown at the bottom of a detail page.
//
// The naive version of this — `all.filter(sameCategory).slice(0, 3)` — quietly
// breaks internal linking: every tour in a category links to the same first
// three siblings, so three pages collect every sibling link and the rest of the
// catalogue ends up with a single inbound link from its listing page. A crawl
// of the built site found exactly that, with 76 of 79 tours on one link each.
//
// Instead, walk the catalogue as a ring starting just after the current item.
// Each item then points at the *next* few after it, so inbound sibling links
// spread evenly across the whole catalogue: with a count of 3, every item
// receives three. It stays deterministic (same input, same output, so pages
// prerender and cache normally) and needs no extra data on the records.

/** Stable offset for an item that isn't in the pool, so pages still differ. */
function hashIndex(seed: string, length: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % length;
}

export function pickRelated<T extends { slug: string }>(
  all: readonly T[],
  current: T,
  count: number,
  groupOf?: (item: T) => string | undefined,
): T[] {
  const picked: T[] = [];
  const seen = new Set<string>([current.slug]);

  const take = (pool: readonly T[]) => {
    if (pool.length === 0 || picked.length >= count) return;
    const at = pool.findIndex((item) => item.slug === current.slug);
    const from = at >= 0 ? at : hashIndex(current.slug, pool.length);
    for (let step = 1; step <= pool.length && picked.length < count; step += 1) {
      const item = pool[(from + step) % pool.length];
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      picked.push(item);
    }
  };

  // Same group first (a category, a destination — whatever the caller keys on),
  // then the rest of the catalogue so a one-item group still fills its row.
  if (groupOf) {
    const group = groupOf(current);
    if (group) take(all.filter((item) => groupOf(item) === group));
  }
  take(all);

  return picked;
}
