import type {
  StoryBodyBlock,
  StoryCalloutBlock,
  StoryCtaBlock,
  StoryQuoteBlock,
} from "./types";

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// Rough word-count-based estimate (~200 wpm), walking the Portable Text
// body plus the text-bearing custom blocks. Good enough for a "X min read"
// label — not meant to be exact.
export function estimateReadingTime(body?: StoryBodyBlock[]): number {
  if (!body || body.length === 0) return 1;

  let words = 0;
  for (const block of body) {
    // `PortableTextBlock._type` is typed as a wide `string` (not a literal),
    // so TS can't narrow the union purely on `_type` equality here — cast
    // after checking, which is safe since these shapes are content-authored.
    if (block._type === "block" && "children" in block && Array.isArray(block.children)) {
      for (const child of block.children) {
        if (typeof child === "object" && child && "text" in child && typeof child.text === "string") {
          words += countWords(child.text);
        }
      }
    } else if (block._type === "quoteBlock") {
      words += countWords((block as StoryQuoteBlock).quote);
    } else if (block._type === "calloutBlock") {
      words += countWords((block as StoryCalloutBlock).body);
    } else if (block._type === "ctaBlock") {
      const body = (block as StoryCtaBlock).body;
      if (body) words += countWords(body);
    }
  }

  return Math.max(1, Math.round(words / 200));
}
