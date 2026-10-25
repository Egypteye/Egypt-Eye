"use client";

import Link from "next/link";
import { track } from "../_lib/analytics";
import { fdPath } from "../_lib/seo";

/**
 * The one commercial next step at the end of an article, and the only place
 * the Stories section measures itself.
 *
 * =========================================================================
 * WHY THIS IS THE MEASUREMENT POINT
 * =========================================================================
 * "Did the blog work?" is usually answered with pageviews, which answers a
 * different question: whether anybody arrived. The question the business has
 * is whether the people who arrived went on to look at something they could
 * book, and which articles send them.
 *
 * So this fires one event carrying the article it came from and the product
 * it points at. That is enough to rank the library by the thing that pays for
 * it, and it is the whole of what is collected — see _lib/analytics.ts, which
 * sends slugs and never text a visitor typed. No name, no email, no scroll
 * trace, no session recording.
 *
 * It is a real <Link> with a real href. The tracking rides on the click; it
 * does not create it, so the link works with JavaScript disabled, with the
 * analytics env var unset, and with the request blocked by an ad blocker.
 * A call to action that needs a script to navigate is a call to action that
 * silently fails for the most privacy-conscious slice of the audience.
 */
export function StoryCta({
  storySlug,
  label,
  path,
  note,
}: {
  storySlug: string;
  label: string;
  path: string;
  note?: string;
}) {
  return (
    <div className="fd-story-cta">
      {note ? <p className="fd-story-cta-note">{note}</p> : null}
      <Link
        className="fd-btn"
        href={fdPath(path)}
        onClick={() => track("story_cta_click", { item: storySlug, destination: path })}
      >
        {label}
      </Link>
    </div>
  );
}
