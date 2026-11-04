import type { StoryBodyBlock, StoryFaqItem } from "./types";
import { tours } from "./tours";
import { hiddenTourSlugs } from "./hiddenTours";

// Small body-block builders shared by every Stories content file (the main
// src/content/stories.ts plus any src/content/storyBatches/*.ts), so a new
// article's copy doesn't have to hand-write Portable Text block/span
// boilerplate for every paragraph. `nextBlockKey`'s counter is a
// module-level singleton, so every file that imports from here draws from
// the same sequence — _key values stay globally unique across the whole
// site without any file needing to coordinate with another.
let blockKeySeq = 0;
export function nextBlockKey(prefix: string) {
  blockKeySeq += 1;
  return `${prefix}${blockKeySeq}`;
}

export function p(text: string): StoryBodyBlock {
  return {
    _type: "block",
    _key: nextBlockKey("p"),
    style: "normal",
    children: [{ _type: "span", _key: nextBlockKey("s"), text, marks: [] }],
    markDefs: [],
  } as StoryBodyBlock;
}

/**
 * A paragraph with links in it.
 *
 * Portable Text puts a link in two places at once — a `markDefs` entry
 * holding the href, and a `marks: [thatKey]` on the span it covers — which is
 * enough boilerplate per link that article copy written by hand simply went
 * without. Before this helper, not one of the 184 published articles carried
 * a single inline link, so the only way one could point at another was the
 * related-stories strip under the footer. For a library this size that is the
 * difference between pages that reinforce each other and pages that compete.
 *
 * Segments are given in reading order, a plain string for ordinary prose and
 * `{ text, href }` where a link belongs:
 *
 *   pl(["Both stand at ", { text: "Karnak", href: "/stories/karnak-temple-complete-guide" }, "."])
 *
 * An href starting with "/" renders through next/link; anything else is
 * treated as outbound. See components/StoryBody.tsx.
 */
export function pl(segments: (string | { text: string; href: string })[]): StoryBodyBlock {
  const markDefs: { _type: "link"; _key: string; href: string }[] = [];
  const children = segments.map((segment) => {
    if (typeof segment === "string") {
      return { _type: "span", _key: nextBlockKey("s"), text: segment, marks: [] };
    }
    const linkKey = nextBlockKey("link");
    markDefs.push({ _type: "link", _key: linkKey, href: segment.href });
    return { _type: "span", _key: nextBlockKey("s"), text: segment.text, marks: [linkKey] };
  });
  return {
    _type: "block",
    _key: nextBlockKey("p"),
    style: "normal",
    children,
    markDefs,
  } as StoryBodyBlock;
}

export function h2(text: string): StoryBodyBlock {
  return {
    _type: "block",
    _key: nextBlockKey("h"),
    style: "h2",
    children: [{ _type: "span", _key: nextBlockKey("s"), text, marks: [] }],
    markDefs: [],
  } as StoryBodyBlock;
}

/**
 * A sub-heading inside a section an `h2` already opened.
 *
 * @portabletext/react renders `h3` from its own defaults, and the Studio's
 * default `block` type offers it, so the style was always available — there
 * was just no builder for it, and no article used it. A piece with
 * sub-sections under a heading had nothing to express them with except
 * another `h2`, which flattens the outline a reader and a crawler both read.
 */
export function h3(text: string): StoryBodyBlock {
  return {
    _type: "block",
    _key: nextBlockKey("h"),
    style: "h3",
    children: [{ _type: "span", _key: nextBlockKey("s"), text, marks: [] }],
    markDefs: [],
  } as StoryBodyBlock;
}

export function bullets(items: string[]): StoryBodyBlock[] {
  return items.map(
    (text) =>
      ({
        _type: "block",
        _key: nextBlockKey("li"),
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: nextBlockKey("s"), text, marks: [] }],
        markDefs: [],
      }) as StoryBodyBlock
  );
}

export function callout(body: string, opts?: { title?: string; tone?: "Info" | "Safety" | "Highlight" }): StoryBodyBlock {
  return { _type: "calloutBlock", _key: nextBlockKey("callout"), title: opts?.title, body, tone: opts?.tone ?? "Highlight" };
}

export function photo(url: string, opts?: { caption?: string; alt?: string }): StoryBodyBlock {
  return { _type: "photoBlock", _key: nextBlockKey("photo"), url, caption: opts?.caption, alt: opts?.alt };
}

export function faq(faqs: StoryFaqItem[], title?: string): StoryBodyBlock {
  return { _type: "faqBlock", _key: nextBlockKey("faq"), title, faqs };
}

export function cta(opts: { title?: string; body?: string; buttonLabel: string; buttonHref: string }): StoryBodyBlock {
  return {
    _type: "ctaBlock",
    _key: nextBlockKey("cta"),
    title: opts.title,
    body: opts.body,
    buttonLabel: opts.buttonLabel,
    buttonHref: opts.buttonHref,
  };
}

/**
 * Resolves a story's "related tours" strip from slugs.
 *
 * Shared by every Stories file rather than redefined in each one: this used
 * to be a copy-pasted local helper in sixteen places, so a change to what
 * counts as a recommendable tour had to be remembered sixteen times.
 *
 * Hidden tours are dropped (see content/hiddenTours.ts). The strip is a
 * recommendation, and recommending a trip that is no longer offered is worse
 * than showing one card fewer. Prose and CTA links inside a story body are
 * deliberately untouched — those are editorial sentences, and a hidden
 * tour's own page still resolves.
 */
export function toursBySlug(...slugs: string[]) {
  return slugs
    .map((slug) => tours.find((t) => t.slug === slug))
    .filter((t): t is (typeof tours)[number] => Boolean(t) && !hiddenTourSlugs.has(t!.slug));
}
