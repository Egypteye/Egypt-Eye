/**
 * Guards the inline links inside article bodies, all three ways they break
 * without anyone noticing.
 *
 * RAW HTML. Article copy arrives as prose, and prose written for the web
 * arrives with `<a href="...">` in it. Portable Text has no idea what that
 * is: the span is rendered as text, React escapes it, and the reader sees
 * literal angle brackets in the middle of a sentence. The three sanctuary
 * articles were supplied exactly this way, so this is not hypothetical — it
 * is the thing that was in the file before it was converted.
 *
 * HALF A LINK. A Portable Text link lives in two places that have to agree:
 * a `markDefs` entry carrying the href, and the same `_key` listed in the
 * `marks` of the span it covers. Write only the markDef and the text renders
 * plain, with no indication a link was intended. Write only the mark and
 * @portabletext/react has nothing to resolve it against. Either way the page
 * builds, renders and looks fine.
 *
 * LINKS INTO A 404. An internal link is a string, so nothing stops it
 * pointing at a story slug that was renamed or never existed. That is worse
 * than no link: it spends a reader's click on an error page, and it spends
 * crawl budget telling Google this site links to its own missing pages.
 *
 * All three are checked against the real article bodies, not a copy of them.
 */
import { stories } from "../src/content/stories";
import { STORY_REDIRECTS } from "../src/content/redirectedStories";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const published = stories.filter((s) => s.status === "published");
const publishedSlugs = new Set(published.map((s) => s.slug));

// Tags that mean someone pasted markup into prose. Deliberately a list of
// real tags rather than /<[^>]+>/ — a sentence may legitimately contain
// "3 < 5" or an arrow, and failing on those would make the check something
// people route around instead of fix.
const HTML_TAG =
  /<\/?(?:a|p|br|div|span|strong|b|em|i|h[1-6]|ul|ol|li|img|figure|table|section|blockquote)\b[^>]*>/i;

type Span = { _type?: string; text?: string; marks?: string[] };
type MarkDef = { _type?: string; _key?: string; href?: string };

let spansChecked = 0;
let linksChecked = 0;
let internalLinksChecked = 0;

for (const story of published) {
  for (const block of story.body ?? []) {
    const b = block as { _type?: string; children?: Span[]; markDefs?: MarkDef[] };
    if (b._type !== "block") continue;

    const children = b.children ?? [];
    const markDefs = b.markDefs ?? [];
    const definedKeys = new Set(markDefs.map((d) => d._key).filter(Boolean) as string[]);
    const usedKeys = new Set<string>();

    for (const span of children) {
      if (typeof span.text !== "string") continue;
      spansChecked++;

      const tag = HTML_TAG.exec(span.text);
      if (tag) {
        errors.push(
          `${story.slug}: a body span contains raw HTML (${tag[0]}), which renders as visible ` +
            `angle brackets — use pl() for links. Text: ${JSON.stringify(span.text.slice(0, 80))}`
        );
      }

      for (const mark of span.marks ?? []) {
        // Decorators (strong/em/…) are marks too and have no markDef.
        if (["strong", "em", "code", "underline", "strike-through"].includes(mark)) continue;
        usedKeys.add(mark);
        if (!definedKeys.has(mark)) {
          errors.push(
            `${story.slug}: a span is marked with ${JSON.stringify(mark)} but the block has no ` +
              `matching markDefs entry, so nothing renders as a link. ` +
              `Text: ${JSON.stringify(span.text.slice(0, 60))}`
          );
        }
      }
    }

    for (const def of markDefs) {
      if (def._type !== "link") continue;
      linksChecked++;

      if (!def._key || !usedKeys.has(def._key)) {
        errors.push(
          `${story.slug}: markDefs carries a link to ${JSON.stringify(def.href ?? "")} that no span ` +
            `references, so the text renders plain and the link is lost.`
        );
      }

      const href = def.href ?? "";
      ok(`${story.slug}: a link has no href`, href.length > 0);

      if (!href.startsWith("/")) continue;
      internalLinksChecked++;

      const storyPath = /^\/stories\/([^/#?]+)/.exec(href);
      if (storyPath) {
        const slug = storyPath[1];
        const redirectsTo = (STORY_REDIRECTS as Record<string, string>)[slug];
        if (!publishedSlugs.has(slug) && !redirectsTo) {
          errors.push(
            `${story.slug}: links to /stories/${slug}, which is not a published story and has no ` +
              `redirect — the link spends a reader's click on a 404.`
          );
        }
      }

      if (href.includes(`/stories/${story.slug}`)) {
        errors.push(`${story.slug}: links to itself.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// The check has something to check.
//
// Without these, every assertion above passes on a library where no article
// links to anything — which is exactly the state this library was in before
// pl() existed, and exactly what this is meant to stop returning to.
// ---------------------------------------------------------------------------
ok(
  `only ${spansChecked} body spans were walked — the body blocks are no longer shaped the way ` +
    "this check reads them, so the HTML and mark assertions are inspecting almost nothing",
  spansChecked > 3000
);
ok(
  "no article body contains a single inline link, so every link assertion above is vacuous",
  linksChecked > 0
);
ok(
  "no article links internally to another article, so the 404 assertion is vacuous",
  internalLinksChecked > 0
);

// ---------------------------------------------------------------------------
// The renderer actually handles them.
//
// The data being correct is half of it. @portabletext/react ships a default
// `link` renderer, so a wrong-but-present component here is not a crash — it
// is a bare <a> with no rel on an outbound link and a full page reload on an
// internal one. Both are silent.
// ---------------------------------------------------------------------------
const { readFileSync } = await import("node:fs");
const renderer = readFileSync("src/components/StoryBody.tsx", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

ok(
  "src/components/StoryBody.tsx defines no marks.link component, so inline links fall back to " +
    "@portabletext/react's bare <a> — no rel on outbound links, no next/link internally",
  /marks\s*:\s*\{[\s\S]{0,600}?link\s*:/.test(renderer)
);
ok(
  "StoryBody's link component does not send internal hrefs through next/link",
  /href\.startsWith\(\s*["']\/["']\s*\)[\s\S]{0,300}?<Link/.test(renderer)
);
ok(
  'StoryBody\'s link component does not set rel="noopener noreferrer" on outbound links, which ' +
    "hands window.opener and the referrer to whatever the article points at",
  /rel=\{?["']noopener noreferrer["']/.test(renderer)
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-story-links: ${errors.length} problem(s)\n`);
  for (const e of errors.slice(0, 40)) console.error(`  ✗ ${e}`);
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-story-links: ok — ${spansChecked} body spans across ${published.length} published ` +
    `articles carry no raw HTML; ${linksChecked} inline links all pair a markDef with the span ` +
    `that uses it; ${internalLinksChecked} internal links all resolve to a published story, none ` +
    "to itself; and the renderer sends internal links through next/link and outbound ones out " +
    "with rel=noopener noreferrer."
);
