import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "../../_components/FaqList";
import {
  liveStories,
  liveStoryBySlug,
  relatedStories,
  storyClusters,
  storyReadingMinutes,
} from "@/content/flyingDressStories";
import { StoryProse } from "../../_components/StoryProse";
import { StoryCta } from "../../_components/StoryCta";
import { StoryToc, headingId } from "../../_components/StoryToc";
import {
  fdArticleJsonLd,
  fdBreadcrumbJsonLd,
  fdFaqJsonLd,
  fdJsonLd,
  fdMetadata,
  fdPath,
} from "../../_lib/seo";

export function generateStaticParams() {
  // liveStories, not every entry: a draft must not get a URL. See StoryStatus.
  return liveStories().map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = liveStoryBySlug(slug);
  if (!story) return fdMetadata({ title: "Not found", description: "", noindex: true });

  return fdMetadata({
    // `seoTitle`, not `title`. fdMetadata appends the brand name, which costs
    // 23 of the ~60 characters a result list renders, so the editorial h1 and
    // the <title> are separate fields. See content/flyingDressStories.ts.
    title: story.seoTitle,
    description: story.metaDescription,
    path: `/stories/${story.slug}`,
  });
}

/** 19 October 2026, rather than a locale-dependent numeric date. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = liveStoryBySlug(slug);
  if (!story) notFound();

  const cluster = storyClusters.find((c) => c.id === story.cluster);
  // Scored, not sliced. The previous version took the first three articles in
  // file order and handed the same rail to every page on the site; see
  // relatedStories() for what replaced it and why.
  const siblings = relatedStories(story);

  return (
    <>
      {/* Three entities, one top-level array — which is what Google's own
          examples use for a page carrying more than one, and the shape the
          celebration routes settled on after fdJsonLd's single argument
          silently swallowed a second one. fdFaqJsonLd returns null with no
          questions, and that null is filtered rather than emitted. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            [
              fdArticleJsonLd({
                title: story.title,
                description: story.metaDescription,
                path: `/stories/${story.slug}`,
                publishedAt: story.publishedAt,
                updatedAt: story.updatedAt,
                citations: (story.sources ?? []).map((s) => s.url),
              }),
              fdBreadcrumbJsonLd([
                { name: "Home", path: "" },
                { name: "Stories", path: "/stories" },
                { name: story.title, path: `/stories/${story.slug}` },
              ]),
              fdFaqJsonLd(story.faqs),
            ].filter(Boolean)
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
            <Link href={fdPath("/stories")} style={{ color: "inherit" }}>
              Stories
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{cluster?.name ?? "Article"}</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h2">{story.title}</h1>
            <p className="fd-eyebrow fd-muted" style={{ marginTop: "1.5rem" }}>
              <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
              {story.updatedAt ? (
                <>
                  <span aria-hidden="true"> · </span>
                  updated <time dateTime={story.updatedAt}>{formatDate(story.updatedAt)}</time>
                </>
              ) : null}
              <span aria-hidden="true"> · </span>
              {storyReadingMinutes(story)} min read
            </p>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              {story.excerpt}
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight">
        <div className="fd-shell">
          <StoryToc headings={story.sections.map((section) => section.heading)} />
          <article className="fd-prose">
            {story.sections.map((section) => (
              <div
                key={section.heading}
                id={headingId(section.heading)}
                style={{ marginBottom: "2.75rem", scrollMarginTop: "6rem" }}
              >
                <h2 className="fd-display fd-h4" style={{ marginBottom: "1.25rem" }}>
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>
                    <StoryProse text={paragraph} />
                  </p>
                ))}
                {section.list ? (
                  <ul className="fd-list" style={{ marginTop: "1.25rem" }}>
                    {section.list.map((item) => (
                      <li key={item.slice(0, 48)}>
                        <StoryProse text={item} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </article>
        </div>
      </section>

      {story.faqs.length > 0 ? (
        <section className="fd-section-tight fd-sand">
          <div className="fd-shell">
            <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
              Questions
            </h2>
            <FaqList faqs={story.faqs} headingLevel={3} />
          </div>
        </section>
      ) : null}

      {/* SOURCES ARE ON THE PAGE, NOT IN A COMMENT.
          `basis: "cited"` means this article leans on something outside the
          business, and the useful half of a citation is what it did NOT
          establish — the Giza ticket article exists precisely because public
          sources disagree, and a reader can only weigh that if they can see
          the disagreement. The check script fails a cited article with no
          sources, so this block cannot quietly go missing. */}
      {story.sources && story.sources.length > 0 ? (
        <section className="fd-section-tight">
          <div className="fd-shell">
            <h2 className="fd-display fd-h4" style={{ marginBottom: "1.5rem" }}>
              Where this came from
            </h2>
            <ul className="fd-list" style={{ maxWidth: "46rem" }}>
              {story.sources.map((source) => (
                <li key={source.url}>
                  <a className="fd-inline-link" href={source.url} target="_blank" rel="nofollow noopener noreferrer">
                    {source.label}
                  </a>
                  <span className="fd-muted"> Read {source.accessed}. </span>
                  <span className="fd-muted">Supports: {source.supports}</span>
                  {source.doesNotSupport ? (
                    <span className="fd-muted"> Does not support: {source.doesNotSupport}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* THE ONE NEXT STEP, BEFORE THE READING LIST.
          These used to be a single undifferentiated <ul>: three product links
          and three article links, same size, same weight, no indication which
          was which. A reader who finished convinced had to pick their own way
          out of six options, and the commercial page — the only one of the
          six the business is paid for — had no more prominence than a
          sideways link to another article.

          So the destination is its own block, it carries the sentence that
          earns the click, and it is the single measured event in this
          section. See StoryCta. */}
      {story.destination ? (
        <section className="fd-section-tight fd-sand">
          <div className="fd-shell" style={{ maxWidth: "46rem" }}>
            <StoryCta
              storySlug={story.slug}
              label={story.destination.label}
              path={story.destination.path}
              note={story.destination.note}
            />
          </div>
        </section>
      ) : null}

      <section className="fd-section-tight">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Keep reading
          </h2>
          <ul className="fd-list fd-list-2">
            {siblings.map((other) => (
              <li key={other.slug}>
                <h3>
                  <Link href={fdPath(`/stories/${other.slug}`)}>{other.title}</Link>
                </h3>
                <p>{other.excerpt}</p>
              </li>
            ))}
            {story.related
              // The destination is rendered above as the next step. Repeating
              // it here is the "three identical calls to action" pattern that
              // makes a page read like a funnel instead of an article.
              .filter((link) => link.path !== story.destination?.path)
              .map((link) => (
                <li key={link.path}>
                  <h3>
                    <Link href={fdPath(link.path)}>{link.label}</Link>
                  </h3>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </>
  );
}
