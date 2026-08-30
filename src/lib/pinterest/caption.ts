// Builds Pinterest-native title/description copy for a Story — the one
// template used for both the initial backfill and every future auto-pin, so
// quality stays consistent and there's a single place to improve wording
// later. Deliberately built from each story's own excerpt/keywords rather
// than a generic boilerplate line, so it reads like a real caption instead
// of an obviously auto-generated one — matching the same no-generic-AI-copy
// standard already applied to the rest of the site.

const PINTEREST_TITLE_MAX = 100;
const PINTEREST_DESCRIPTION_MAX = 500;

// A short, category-flavored opening line — puts a relevant search phrase
// in the first few words, which is what Pinterest's own search ranking
// weighs most heavily, before the story's own excerpt takes over.
const CATEGORY_HOOKS: Record<string, string> = {
  "Travel Guides": "Egypt travel tip:",
  "Ancient Egypt": "Ancient Egypt:",
  "History & Culture": "Ancient Egypt:",
  Culture: "Egypt travel:",
  "Behind the Scenes": "Egypt, from the inside:",
  "Celestial Events": "Egypt travel alert:",
  News: "Egypt travel:",
};

const CTAS = [
  "Save this for your Egypt trip.",
  "Pin this for later.",
  "Full guide on the site.",
  "Read the whole story — link in the Pin.",
  "Worth bookmarking before you book.",
];

function truncateAtWord(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

// Deterministic "random" pick from a slug, so the same story always gets the
// same CTA (stable if the sync ever re-runs its copy-building logic) while
// still varying naturally across ~100+ different stories rather than every
// single Pin ending in the exact same sentence.
function pickForSlug<T>(items: T[], slug: string): T {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return items[hash % items.length];
}

export function buildPinCopy(story: {
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
}): { title: string; description: string } {
  const title = truncateAtWord(story.title, PINTEREST_TITLE_MAX);

  const hook = (story.category && CATEGORY_HOOKS[story.category]) || "Egypt travel:";
  const cta = pickForSlug(CTAS, story.slug);

  // The excerpt is already specific, well-written copy for exactly this
  // purpose (a one-to-two-sentence hook) — lead with it, and only fold in a
  // keyword phrase the excerpt doesn't already naturally contain, so nothing
  // reads as keyword-stuffed.
  const keyword = story.secondaryKeywords?.find(
    (kw) => kw && !story.excerpt.toLowerCase().includes(kw.toLowerCase())
  );

  const parts = [hook, story.excerpt.trim()];
  if (keyword) parts.push(`Everything on ${keyword}, covered.`);
  parts.push(cta);

  const description = truncateAtWord(parts.join(" "), PINTEREST_DESCRIPTION_MAX);

  return { title, description };
}
