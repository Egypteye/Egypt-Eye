import Link from "next/link";
import { storiesLinkedFrom, storyReadingMinutes } from "@/content/flyingDressStories";
import { fdPath } from "../_lib/seo";

/**
 * The articles that asked to be linked from this page.
 *
 * =========================================================================
 * THE PROBLEM THIS SOLVES IS INVISIBLE FROM INSIDE AN ARTICLE
 * =========================================================================
 * Six articles were published here, each one linking outward to the products
 * it was about, and nothing linked back. The only route in was the Stories
 * index, which is itself two links deep. That is an editorial section that
 * exists for whoever already knows it exists.
 *
 * It costs twice. A reader on the Pyramids Rooftop page wondering what a
 * rooftop with a view of the pyramids actually is has the answer written,
 * published and unreachable from where they are standing. And a search engine
 * working out which pages this site considers worth reading sees six pages
 * nothing points to.
 *
 * =========================================================================
 * THE DIRECTION OF THE EDIT
 * =========================================================================
 * The article names the pages it wants links from, in `inboundFrom`, and the
 * pages ask. The alternative — every commercial page carrying its own list of
 * article slugs — spreads one decision across a dozen files and guarantees
 * that the page and the article disagree the first time an article is
 * renamed. Here there is one place to look and the link check covers it.
 *
 * It renders NOTHING when no article asked. A heading over an empty list is
 * worse than no section, and most pages will legitimately have none until the
 * library grows into them.
 */
export function StoriesFromHere({
  path,
  heading = "Worth reading first",
  limit = 2,
}: {
  /** The brand-relative path of the page asking, e.g. "/wardrobe". */
  path: string;
  heading?: string;
  limit?: number;
}) {
  const stories = storiesLinkedFrom(path).slice(0, limit);
  if (stories.length === 0) return null;

  return (
    <section className="fd-section-tight">
      <div className="fd-shell">
        <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
          {heading}
        </h2>
        <ul className="fd-list fd-list-2">
          {stories.map((story) => (
            <li key={story.slug}>
              <h3>
                <Link href={fdPath(`/stories/${story.slug}`)}>{story.title}</Link>
              </h3>
              <p>{story.excerpt}</p>
              <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)" }}>
                {storyReadingMinutes(story)} min read
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
