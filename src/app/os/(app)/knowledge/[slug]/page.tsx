import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { NoAccess, Card, Badge } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await osdb().from("os_knowledge_articles").select("title").eq("slug", slug).maybeSingle();
  return { title: (data?.title as string) ?? "Article" };
}

// Articles are written in a light markdown — headings, bold, lists — and
// rendered here rather than stored as HTML, so nothing an author types can
// inject markup into the page.
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "knowledge.view")) return <NoAccess what="the knowledge base" permission="knowledge.view" />;

  const org = await getOrg();
  const { data: article } = await osdb()
    .from("os_knowledge_articles")
    .select("*, os_employees ( full_name ), os_locations ( name )")
    .eq("org_id", org.id).eq("slug", slug).maybeSingle();
  if (!article) notFound();

  // Visibility on top of the module permission.
  const visibility = article.visibility as string;
  if (visibility === "management" && !can(actor, "analytics.financial")) {
    return <NoAccess what="this article" />;
  }
  if (visibility === "finance" && !can(actor, "finance.view")) {
    return <NoAccess what="this article" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <Link href="/os/knowledge" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          <Icon.ArrowLeft size={14} />Knowledge
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{article.category as string}</Badge>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(article as any).os_locations?.name ? <Badge tone="gold">{(article as any).os_locations.name}</Badge> : null}
          {(article.tags as string[])?.map((tag) => (
            <span key={tag} className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10.5px] text-os-muted">{tag.replace(/_/g, " ")}</span>
          ))}
        </div>

        <h1 className="mt-2 text-[24px] font-semibold leading-tight text-os-text">{article.title as string}</h1>
        {article.summary ? <p className="mt-1.5 text-[14px] leading-relaxed text-os-muted">{article.summary as string}</p> : null}
        <p className="mt-2 text-[11.5px] text-os-faint">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(article as any).os_employees?.full_name ? `Written by ${(article as any).os_employees.full_name} · ` : ""}
          updated {relativeTime(article.updated_at as string)} · version {article.version}
        </p>

        <div className="mt-5 border-t border-os-line pt-5">
          <Markdown body={article.body as string} />
        </div>
      </Card>

      <p className="mt-4 text-[12px] leading-relaxed text-os-faint">
        Something here out of date, or missing what you just learned the hard way? Tell whoever owns this article. Knowledge
        that nobody corrects is knowledge people stop trusting.
      </p>
    </div>
  );
}

/**
 * A deliberately small markdown renderer: headings, bold, bullets, numbered
 * lists and paragraphs. Everything is rendered as React elements from parsed
 * text, so an article can never inject markup into the page — which matters
 * because anyone with knowledge.edit can write one.
 */
function Markdown({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/);
  return (
    <div className="space-y-3.5">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("## ")) {
          return <h2 key={index} className="mt-5 text-[16px] font-semibold text-os-text">{inline(trimmed.slice(3))}</h2>;
        }
        if (trimmed.startsWith("# ")) {
          return <h2 key={index} className="mt-5 text-[18px] font-semibold text-os-text">{inline(trimmed.slice(2))}</h2>;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <ul key={index} className="ml-4 list-disc space-y-1.5">
              {trimmed.split("\n").map((line, i) => (
                <li key={i} className="text-[13.5px] leading-relaxed text-os-text">{inline(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <ol key={index} className="ml-4 list-decimal space-y-1.5">
              {trimmed.split("\n").map((line, i) => (
                <li key={i} className="text-[13.5px] leading-relaxed text-os-text">{inline(line.replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        return <p key={index} className="text-[13.5px] leading-relaxed text-os-text">{inline(trimmed)}</p>;
      })}
    </div>
  );
}

function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>,
  );
}
