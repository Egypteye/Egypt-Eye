import Link from "next/link";
import { parseStoryText } from "@/content/flyingDressStories";
import { fdPath } from "../_lib/seo";

/**
 * A paragraph of article prose, with its contextual links resolved.
 *
 * =========================================================================
 * WHY A COMPONENT AND NOT `dangerouslySetInnerHTML`
 * =========================================================================
 * The obvious way to get links into editorial body text is to let the content
 * file hold HTML and inject it. That is one line of code and a standing
 * invitation: every future editor, every CMS field, and every pasted
 * paragraph becomes a place where a `<script>` can arrive on a page this
 * business asks people to trust with a booking.
 *
 * So the content file holds `[text](/path)` and nothing else, the parse is a
 * single regular expression in content/flyingDressStories.ts, and both halves
 * come out of it as React children — the label as text, the path as `href`.
 * There is no code path here that turns a string into markup, which means
 * there is nothing to sanitise and nothing to get wrong later.
 *
 * Links are BRAND-RELATIVE and go through fdPath, so the same article renders
 * correctly on flyingdressesegypt.com and under /flying-dresses on the review
 * deployment. A path that resolves to neither fails npm run check: see
 * content/flyingDressRoutes.ts.
 */
export function StoryProse({ text }: { text: string }) {
  return (
    <>
      {parseStoryText(text).map((node, index) =>
        node.kind === "link" ? (
          <Link key={index} href={fdPath(node.path)} className="fd-inline-link">
            {node.text}
          </Link>
        ) : (
          <span key={index}>{node.text}</span>
        )
      )}
    </>
  );
}
