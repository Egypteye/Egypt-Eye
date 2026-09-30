/**
 * Guards the internal linking, because its failure mode is invisible.
 *
 * Before this system, 127 of 182 published articles had no related links at
 * all: a reader arriving from search read one page and left, and a crawler
 * found no path onward. Nothing looked broken. The pages rendered fine, the
 * build was green, and the only symptom was a library that behaved like 182
 * unrelated pages instead of one site.
 *
 * That is exactly the kind of regression a build cannot catch, so it is
 * asserted here: every article reaches other articles, every article offers a
 * route to something Egypt Eye actually sells, and every declared pillar is a
 * real published page rather than a slug someone renamed.
 */
import { stories } from "../src/content/stories";
import {
  CLUSTERS,
  buildRelatedIndex,
  clusterFor,
  pillarFor,
  serviceFor,
} from "../src/lib/storyLinking";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const all = stories.filter((s) => s.status === "published");
const bySlug = new Map(all.map((s) => [s.slug, s]));
const index = buildRelatedIndex(all);

// ---------------------------------------------------------------------------
// Pillars have to exist. A cluster pointing at a renamed slug silently stops
// linking, and nothing else in the build would notice.
// ---------------------------------------------------------------------------
for (const cluster of CLUSTERS) {
  ok(
    `cluster "${cluster.id}" points at ${cluster.pillarSlug}, which is not a published story`,
    bySlug.has(cluster.pillarSlug)
  );
}

// Two clusters sharing a pillar would merge them by accident.
const pillarSlugs = CLUSTERS.map((c) => c.pillarSlug);
ok("every cluster has its own pillar", new Set(pillarSlugs).size === pillarSlugs.length);

// ---------------------------------------------------------------------------
// Coverage. These are the numbers the system exists to produce.
// ---------------------------------------------------------------------------
const noCluster = all.filter((s) => !clusterFor(s));
ok(
  `${noCluster.length} article(s) match no cluster, so they get no service link: ${noCluster
    .slice(0, 5)
    .map((s) => s.slug)
    .join(", ")}`,
  noCluster.length === 0
);

const noService = all.filter((s) => !serviceFor(s));
ok(`${noService.length} article(s) offer no route to an Egypt Eye service`, noService.length === 0);

const noRelated = all.filter((s) => (index.get(s.slug) ?? []).length === 0);
ok(
  `${noRelated.length} article(s) are dead ends with no related links: ${noRelated
    .slice(0, 5)
    .map((s) => s.slug)
    .join(", ")}`,
  noRelated.length === 0
);

// ---------------------------------------------------------------------------
// The links have to point at real, published, other articles.
// ---------------------------------------------------------------------------
for (const story of all) {
  const related = index.get(story.slug) ?? [];
  ok(`${story.slug} links to itself`, !related.some((r) => r.slug === story.slug));
  for (const r of related) {
    ok(`${story.slug} links to ${r.slug}, which is not a published story`, bySlug.has(r.slug));
  }
  ok(`${story.slug} has duplicate related links`, new Set(related.map((r) => r.slug)).size === related.length);

  const pillar = pillarFor(story, all);
  ok(`${story.slug} points at itself as its own pillar`, pillar?.slug !== story.slug);
}

// ---------------------------------------------------------------------------
// Inbound reach. Not every article can be linked to from another — a handful
// in dense clusters lose every tie — but the long tail should be small, and a
// sharp rise means the balancing in buildRelatedIndex has stopped working.
// ---------------------------------------------------------------------------
const inbound = new Map<string, number>();
for (const story of all) {
  for (const r of index.get(story.slug) ?? []) inbound.set(r.slug, (inbound.get(r.slug) ?? 0) + 1);
  const pillar = pillarFor(story, all);
  if (pillar) inbound.set(pillar.slug, (inbound.get(pillar.slug) ?? 0) + 1);
}
const orphans = all.filter((s) => !inbound.has(s.slug));
const orphanShare = orphans.length / all.length;
ok(
  `${orphans.length} of ${all.length} articles receive no inbound link (${(orphanShare * 100).toFixed(0)}%) — ` +
    `over the 10% ceiling, so the link balancing is not spreading`,
  orphanShare <= 0.1
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-links: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-links: ok — ${all.length} articles across ${CLUSTERS.length} clusters, ` +
    `every one with related links and a service route, ` +
    `${orphans.length} with no inbound link.`
);
