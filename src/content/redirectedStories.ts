/**
 * Story URLs that now 301 somewhere else, and where each one points.
 *
 * Distinct from RETIRED_STORY_SLUGS in ./retiredStories, which is the other
 * half of the same problem: those articles were pulled with nothing to replace
 * them and answer 410 Gone. These ones still have a page — it just lives at a
 * different slug, because the article was rewritten under a better URL or
 * merged into a stronger one. They keep their equity instead of losing it.
 *
 * Three things have to agree about a redirected slug, and each used to keep
 * its own copy of the list:
 *
 *   1. next.config.ts has to issue the 301, so crawled links and bookmarks
 *      keep working.
 *   2. src/lib/sitemapEntries.ts has to keep it out of the sitemap —
 *      submitting a URL that redirects is a Search Console warning, and
 *      Google drops it.
 *   3. The Sanity dataset still holds a document for most of them. That
 *      document has no counterpart in src/content/stories.ts, so no content
 *      edit can reach it: it renders in the /stories grid with no cover photo,
 *      linking to a URL that immediately redirects away.
 *      /api/purge-redirected-stories removes those documents.
 *
 * One map, three consumers. Adding a redirect here is the whole change.
 *
 * The destination must be a slug that actually resolves — a 301 into a 404 is
 * worse than the 404 it replaced. scripts/check-story-images.mts asserts that,
 * and that no slug is listed here while still published.
 */
export const STORY_REDIRECTS: Record<string, string> = {
  // Twenty-one world-trends articles were rewritten as the Egypt subject that
  // was buried under the trend hook — a URL reading "apple-ecosystem-2026" on
  // a piece about the Rosetta Stone is a ranking signal pointing the wrong
  // way. Unlike the slugs in ./retiredStories, these had a real Egypt subject
  // worth keeping, so they were rewritten rather than pulled.
  "ai-safety-abu-simbel-lesson-in-moving-fast": "how-abu-simbel-was-moved",
  "vr-ar-spatial-computing-2026-giza-sound-light-show": "giza-sound-and-light-show-guide",
  "apple-ecosystem-2026-rosetta-stone-egypt": "rosetta-stone-what-it-says",
  "longevity-fitness-2026-beni-hasan-wrestling-egypt": "beni-hasan-tombs-wrestling-scenes",
  "mars-human-spaceflight-2026-hatshepsut-punt-expedition": "hatshepsut-expedition-to-punt",
  "creator-communities-2026-deir-el-medina-workers-village":
    "deir-el-medina-village-that-built-the-tombs",
  "gene-editing-2026-tutankhamun-dna-family-tree": "tutankhamun-dna-family-tree",
  "brain-computer-interface-2026-egypt-discarded-brain": "how-mummification-worked",
  "longevity-technology-2026-egypt-defeat-death-ambition": "ancient-egyptian-afterlife-beliefs",
  "humanoid-robots-2026-ushabti-ancient-labor-figures": "ushabti-figures-egypt",
  "science-backed-skincare-2026-egyptian-kohl-study": "ancient-egyptian-kohl-eye-makeup",
  "deepfakes-2026-ancient-egypt-usurped-cartouches": "usurped-cartouches-erased-pharaohs",
  "serialized-short-form-content-2026-tale-of-sinuhe": "tale-of-sinuhe",
  "fashion-nostalgia-2026-egyptomania-cycles": "egyptomania-history",
  "space-exploration-2026-egypt-ancient-astronomy": "ancient-egyptian-astronomy",
  "next-gen-gaming-2026-senet-oldest-board-game": "senet-ancient-egyptian-board-game",
  "functional-drinks-2026-egypt-medicinal-beer": "ancient-egyptian-beer",
  "cinematic-authentic-content-2026-egypt-tomb-art-duality": "how-to-read-egyptian-tomb-art",
  "ai-influencers-2026-pharaoh-propaganda": "why-every-pharaoh-looks-the-same",
  "photorealistic-video-games-2026-pyramid-laser-scan": "scanning-the-great-pyramid",
  "y2k-nostalgia-2026-jarre-pyramids-millennium-concert": "jarre-pyramids-millennium-concert",

  // Near-duplicate of the 2026 edition — same topic, same intent.
  "best-travel-agencies-in-egypt-2025-guide": "best-travel-agencies-in-egypt-2026-guide",

  // Absorbed into the flying dress pillar as its "Timing" sections. The two
  // were competing for the same intent and the timing piece was the thinner
  // of them, so its material moved into the guide rather than being dropped.
  "best-time-flying-dress-photoshoot": "flying-dress-photoshoot-egypt-guide",
};

/** Every redirected slug, for membership checks. */
export const REDIRECTED_STORY_SLUGS: ReadonlySet<string> = new Set(Object.keys(STORY_REDIRECTS));

export function isRedirectedStorySlug(slug: string): boolean {
  return REDIRECTED_STORY_SLUGS.has(slug);
}

/** The 301s, in the shape next.config.ts's `redirects()` returns. */
export function storyRedirectRules() {
  return Object.entries(STORY_REDIRECTS).map(([from, to]) => ({
    source: `/stories/${from}`,
    destination: `/stories/${to}`,
    permanent: true,
  }));
}
