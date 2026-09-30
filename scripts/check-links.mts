/**
 * Guards the clusters, because their failure mode is invisible.
 *
 * Two separate things link this library together. The related-articles row
 * comes from `withDerivedRelatedStories` in sanity/fetchers.ts, which has
 * filled it for every article since September and needs no help here. What
 * this file guards is the other half: the pillar an article supports and the
 * Egypt Eye service its reader should be able to reach.
 *
 * That half fails silently. Rename a pillar's slug and its cluster keeps
 * matching articles, keeps rendering, and simply stops linking anywhere —
 * the build stays green and the only symptom is a missing link nobody looks
 * for. So it is asserted: every cluster points at a real published article,
 * every article lands in a cluster, and none of them points at itself.
 *
 * The related row is checked too, but through the real derivation rather than
 * a second copy of it — a check that re-implements the thing it is checking
 * proves only that the copy agrees with itself.
 */
import { stories } from "../src/content/stories";
import { pickRelated } from "../src/lib/relatedPicker";
import { CLUSTERS, clusterFor, pillarFor, serviceFor } from "../src/lib/storyLinking";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const all = stories.filter((s) => s.status === "published");
const bySlug = new Map(all.map((s) => [s.slug, s]));

// ---------------------------------------------------------------------------
// Pillars. A cluster pointing at a renamed or unpublished slug links nowhere.
// ---------------------------------------------------------------------------
for (const cluster of CLUSTERS) {
  ok(
    `cluster "${cluster.id}" points at ${cluster.pillarSlug}, which is not a published article`,
    bySlug.has(cluster.pillarSlug)
  );
}

const pillarSlugs = CLUSTERS.map((c) => c.pillarSlug);
ok("two clusters share a pillar, which silently merges them", new Set(pillarSlugs).size === pillarSlugs.length);

const serviceHrefs = CLUSTERS.map((c) => c.service.href);
ok(
  "a cluster routes to a path that is not a real section",
  serviceHrefs.every((href) => ["/tours", "/photoshoots", "/transfers", "/weekly-trips", "/customize", "/testimonials"].includes(href))
);

// ---------------------------------------------------------------------------
// Coverage. An article outside every cluster gets no pillar and no service
// route, which is the state this whole file exists to prevent.
// ---------------------------------------------------------------------------
const noCluster = all.filter((s) => !clusterFor(s));
ok(
  `${noCluster.length} article(s) match no cluster, so they offer no route to a service: ` +
    noCluster.slice(0, 5).map((s) => s.slug).join(", "),
  noCluster.length === 0
);

const noService = all.filter((s) => !serviceFor(s));
ok(`${noService.length} article(s) offer no route to an Egypt Eye service`, noService.length === 0);

for (const story of all) {
  const pillar = pillarFor(story, all);
  ok(`${story.slug} is listed as its own pillar`, pillar?.slug !== story.slug);
  if (pillar) ok(`${story.slug} points at an unpublished pillar`, bySlug.has(pillar.slug));
}

// A pillar that scores into someone else's cluster is the subtlest failure
// here: every page still renders, and the head of a cluster quietly sends its
// readers to a different head and a different service. Two pillars did exactly
// that before this was asserted.
for (const cluster of CLUSTERS) {
  const pillar = bySlug.get(cluster.pillarSlug);
  if (!pillar) continue;
  const own = clusterFor(pillar);
  ok(
    `${cluster.pillarSlug} is the pillar of "${cluster.id}" but classifies as "${own?.id ?? "none"}", ` +
      `so it routes its readers to another cluster's service`,
    own?.id === cluster.id
  );
}

// ---------------------------------------------------------------------------
// The related row, through the derivation the site actually uses. The call
// shape mirrors withDerivedRelatedStories: ring rotation, grouped by
// category, four per article.
// ---------------------------------------------------------------------------
const emptyRelated: string[] = [];
for (const story of all) {
  if (story.relatedStories?.length) continue;
  const derived = pickRelated(all, story, 4, (s) => s.category);
  if (derived.length === 0) emptyRelated.push(story.slug);
  ok(`${story.slug} derives a related link to itself`, !derived.some((d) => d.slug === story.slug));
}
ok(
  `${emptyRelated.length} article(s) end with no related row at all: ${emptyRelated.slice(0, 5).join(", ")}`,
  emptyRelated.length === 0
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
    `every one with a pillar route and a service route, every related row filled.`
);
