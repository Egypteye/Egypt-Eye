import type { StoryFrame } from "@/content/flyingDressStories";
import { UNATTRIBUTED_STORY_SHOOT } from "@/content/flyingDressStories";
import { Scene } from "./Scene";

/**
 * A photograph inside an article.
 *
 * WHY THE CAPTION NAMES THE SESSION. Every frame on this site that shows a
 * person is a real client shoot, and the only way that claim is worth
 * anything is if each frame says which one. The wardrobe pages hold the same
 * contract. A frame nobody could trace back carries UNATTRIBUTED_STORY_SHOOT
 * and says so, rather than borrowing a name that sounds plausible.
 *
 * Native ratio, never cropped to a grid: `ratio="auto"` with the declared
 * width and height, which is also what stops the page shifting as the image
 * loads. The check script holds those numbers to the files.
 */
export function StoryFigure({
  frame,
  priority = false,
}: {
  frame: StoryFrame;
  /** Set on the hero only: it is the LCP element on an article page. */
  priority?: boolean;
}) {
  const src = frame.src.startsWith("/")
    ? frame.src
    : `/photos/flying-dresses/stories/${frame.src}`;
  return (
    <figure className="fd-figure" style={{ margin: "2rem 0 0" }}>
      <Scene
        src={src}
        alt={frame.alt}
        width={frame.w}
        height={frame.h}
        ratio="auto"
        sizes="(min-width: 60rem) 46rem, 92vw"
        priority={priority}
      />
      <figcaption className="fd-note" style={{ marginTop: "0.75rem" }}>
        {frame.shoot === UNATTRIBUTED_STORY_SHOOT
          ? `Photographed at ${UNATTRIBUTED_STORY_SHOOT}.`
          : `Photographed at ${frame.shoot}'s session.`}
      </figcaption>
    </figure>
  );
}
