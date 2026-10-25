/**
 * A table of contents, for the articles long enough to need one.
 *
 * =========================================================================
 * IT DOES TWO JOBS, AND THE SECOND ONE IS THE REASON IT EXISTS
 * =========================================================================
 * For a reader it is navigation: these pieces answer several questions each,
 * and somebody who arrived worrying about one of them should not have to
 * scroll past the other four to find out whether it is here.
 *
 * For everything that reads the page without a scrollbar — a search engine
 * assembling a result, an assistant answering a question with a citation —
 * it is a statement of what the article covers, in the article's own words,
 * above the fold and in document order. That is not a trick; it is the same
 * information a contents page has always carried, and it is only useful
 * because the headings are real questions rather than keyword slots.
 *
 * =========================================================================
 * WHY IT IS CONDITIONAL
 * =========================================================================
 * A contents list above a three-section article is longer than the thing it
 * indexes, and it pushes the first paragraph off a phone screen for no gain.
 * The threshold is a floor on sections, not on words: a long article with
 * four headings is still four clicks, and a short one with eight is a list
 * worth having.
 *
 * Anchors come from the heading text through the same slugifier the headings
 * use, so there is one function deciding what an id is and no way for the
 * link and the target to disagree.
 */

export const TOC_MIN_SECTIONS = 5;

/**
 * A stable, readable id from a heading.
 *
 * Diacritics are stripped rather than dropped, so "Fayoum's lakes" and a
 * heading with an accented character both produce something a person can read
 * in the address bar. Collisions are the caller's problem and the check
 * script's: two identical headings in one article is an editorial mistake,
 * not something to paper over with a counter.
 */
export function headingId(heading: string): string {
  return heading
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function StoryToc({ headings }: { headings: string[] }) {
  if (headings.length < TOC_MIN_SECTIONS) return null;

  return (
    <nav className="fd-toc" aria-labelledby="fd-toc-heading">
      <p className="fd-eyebrow" id="fd-toc-heading">
        In this article
      </p>
      <ol className="fd-toc-list">
        {headings.map((heading) => (
          <li key={heading}>
            <a href={`#${headingId(heading)}`}>{heading}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
