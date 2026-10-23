import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "../../_components/FaqList";
import {
  flyingDressStories,
  storyBySlug,
  storyClusters,
  storyReadingMinutes,
} from "@/content/flyingDressStories";
import {
  fdArticleJsonLd,
  fdBreadcrumbJsonLd,
  fdFaqJsonLd,
  fdJsonLd,
  fdMetadata,
  fdPath,
} from "../../_lib/seo";

export function generateStaticParams() {
  return flyingDressStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = storyBySlug(slug);
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
  const story = storyBySlug(slug);
  if (!story) notFound();

  const cluster = storyClusters.find((c) => c.id === story.cluster);
  const siblings = flyingDressStories.filter((s) => s.slug !== story.slug).slice(0, 3);

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
          <article className="fd-prose">
            {story.sections.map((section) => (
              <div key={section.heading} style={{ marginBottom: "2.75rem" }}>
                <h2 className="fd-display fd-h4" style={{ marginBottom: "1.25rem" }}>
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
                {section.list ? (
                  <ul className="fd-list" style={{ marginTop: "1.25rem" }}>
                    {section.list.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
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

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell">
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            Next
          </h2>
          <ul className="fd-list fd-list-2">
            {story.related.map((link) => (
              <li key={link.path}>
                <h3>
                  <Link href={fdPath(link.path)}>{link.label}</Link>
                </h3>
              </li>
            ))}
            {siblings.map((other) => (
              <li key={other.slug}>
                <h3>
                  <Link href={fdPath(`/stories/${other.slug}`)}>{other.title}</Link>
                </h3>
                <p>{other.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
