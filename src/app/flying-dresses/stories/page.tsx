import type { Metadata } from "next";
import Link from "next/link";
import {
  liveStories,
  storiesInCluster,
  storyClusters,
  storyReadingMinutes,
} from "@/content/flyingDressStories";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";

/**
 * The stories index.
 *
 * NOT reverse-chronological. A date ordering is right for a publication, where
 * the newest thing is the most interesting thing; it is wrong for a small set
 * of reference articles that answer different questions and do not expire.
 * Somebody arriving here wants the one that matches their worry, not the one
 * written most recently. So the order is by cluster, and the cluster is a
 * label on the card.
 *
 * ONE GRID, NOT A GRID PER CLUSTER. The first version gave each cluster its
 * own heading and its own card grid, which read well in the source and badly
 * in Chromium: the first batch is three articles about the dress and one each
 * about the session, the place and the occasion, so three of the four grids
 * rendered a single card beside two columns of empty page. Grouping headings
 * earn their keep at twenty articles. At six they are a layout with holes in
 * it, and the cluster name on each card carries the same information.
 */

export const metadata: Metadata = fdMetadata({
  title: "Stories",
  description:
    "How a flying dress actually flies, choosing a colour against limestone and sand, and what a rooftop with a view of the pyramids is and is not.",
  path: "/stories",
});

export default function StoriesIndexPage() {
  // Ordered by cluster, so the three dress articles sit together, without the
  // cluster becoming a heading. storyClusters is the order.
  const ordered = storyClusters.flatMap((cluster) =>
    storiesInCluster(cluster.id).map((story) => ({ story, cluster }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "Stories", path: "/stories" },
            ])
          ),
        }}
      />

      <section className="fd-section-tight fd-section-lede">
        <div className="fd-shell">
          <nav
            aria-label="Breadcrumb"
            className="fd-eyebrow fd-eyebrow-crumbs"
            style={{ marginBottom: "2rem" }}
          >
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Stories</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h2">Stories</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              {/* The claim this section is built on, stated at the top so a
                  reader can check it against what follows. */}
              Everything here is written from running these sessions: what the
              assistant does, what the wind does, what a colour does against
              limestone, and what you are actually standing on when you
              photograph the pyramids from a roof. Nothing here is a guide to
              Egypt. There are plenty of those.
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight">
        <div className="fd-shell">
          <div className="fd-card-grid fd-reveal-group">
            {ordered.map(({ story, cluster }) => (
              <Link
                key={story.slug}
                className="fd-tile fd-experience-card"
                href={fdPath(`/stories/${story.slug}`)}
              >
                <span className="fd-tile-body">
                  <span className="fd-eyebrow" style={{ display: "block", marginBottom: "0.75rem" }}>
                    {cluster.name}
                  </span>
                  <span className="fd-tile-title fd-display">{story.title}</span>
                  <span className="fd-tile-meta">{story.excerpt}</span>
                  <span className="fd-arrow-link" aria-hidden="true">
                    Read · {storyReadingMinutes(story)} min
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell" style={{ maxWidth: "46rem" }}>
          <h2 className="fd-display fd-h3">Something not answered here?</h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            {liveStories().length} articles will not cover everything. The
            questions page is longer and blunter, and a message gets you a
            person.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.75rem" }}>
            <Link className="fd-btn" href={fdPath("/enquire")}>
              Enquire
            </Link>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/faq")}>
              All the questions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
