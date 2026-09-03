import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, EmptyState, Stat } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Knowledge" };

// ---------------------------------------------------------------------------
// THE KNOWLEDGE BASE
// ---------------------------------------------------------------------------
// The point of this section is the one stated goal of the whole product: if a
// person leaves, the company should still know how it works.
//
// So the test for every article is whether it contains something you could
// only learn by doing the job — which gate the van uses, why the wind matters
// at Wadi El Rayan, which tombs cost extra. Anything a web search answers does
// not belong here.
// ---------------------------------------------------------------------------

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "knowledge.view")) return <NoAccess what="the knowledge base" permission="knowledge.view" />;

  const params = await searchParams;
  const q = ((Array.isArray(params.q) ? params.q[0] : params.q) ?? "").trim();

  const db = osdb();
  const org = await getOrg();

  const [articlesResult, { data: sops }] = await Promise.all([
    q
      ? db.rpc("os_search_knowledge", { p_org: org.id, p_query: q, p_limit: 30 })
      : db.from("os_knowledge_articles")
          .select("id, slug, title, category, summary, tags, updated_at")
          .eq("org_id", org.id).eq("status", "published").order("category").order("title"),
    db.from("os_sops")
      .select("id, slug, title, category, summary, version, updated_at, os_trip_types ( name ), os_locations ( name )")
      .eq("org_id", org.id).eq("status", "published").order("title"),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const articles = (articlesResult.data ?? []) as any[];
  const sopRows = (sops ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const categories = Array.from(new Set(articles.map((a) => a.category as string))).sort();

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Knowledge"
        description="How Egypt Eye actually does things. If one person leaves, this is what stops the knowledge leaving with them."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Articles" value={articles.length} />
        <Stat label="Procedures" value={sopRows.length} sub="Runnable as checklists" />
        <Stat label="Destinations covered" value={articles.filter((a) => a.category === "Destinations").length} />
        <Stat label="Last updated" value={articles[0]?.updated_at ? relativeTime(articles[0].updated_at) : "—"} />
      </div>

      <form className="mb-5 flex max-w-md items-center gap-2 rounded-lg border border-os-line-strong bg-white px-2.5 py-2">
        <span className="text-os-faint"><Icon.Search size={16} /></span>
        <input name="q" defaultValue={q} placeholder="Search everything — permits, wind, tickets, pickup rules" className="w-full bg-transparent text-[13.5px] focus:outline-none" />
      </form>

      {q ? (
        <p className="mb-3 text-[12.5px] text-os-muted">
          {articles.length} result{articles.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;.{" "}
          <Link href="/os/knowledge" className="font-medium text-os-gold hover:underline">Clear</Link>
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {articles.length === 0 ? (
            <EmptyState
              title={q ? `Nothing matches “${q}”` : "The knowledge base is empty"}
              description={q ? "Try fewer words, or a different term." : "Start with the things new people always ask: which gate, which permit, what time."}
              icon={<Icon.Book size={26} />}
            />
          ) : q ? (
            <Card padded={false}>
              <ul>
                {articles.map((article) => (
                  <li key={article.id} className="border-b border-os-line/60 last:border-0">
                    <Link href={`/os/knowledge/${article.slug}`} className="block px-4 py-3 transition hover:bg-black/[0.02] sm:px-5">
                      <p className="text-[14px] font-semibold text-os-text">{article.title}</p>
                      {article.summary ? <p className="mt-0.5 text-[12.5px] leading-relaxed text-os-muted">{article.summary}</p> : null}
                      <p className="mt-1"><Badge tone="neutral">{article.category}</Badge></p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category} padded={false}>
                <div className="border-b border-os-line px-4 py-3 sm:px-5">
                  <CardHeader title={category} />
                </div>
                <ul>
                  {articles.filter((a) => a.category === category).map((article) => (
                    <li key={article.id} className="border-b border-os-line/60 last:border-0">
                      <Link href={`/os/knowledge/${article.slug}`} className="block px-4 py-3 transition hover:bg-black/[0.02] sm:px-5">
                        <p className="text-[14px] font-semibold text-os-text">{article.title}</p>
                        {article.summary ? <p className="mt-0.5 text-[12.5px] leading-relaxed text-os-muted">{article.summary}</p> : null}
                        {article.tags?.length ? (
                          <p className="mt-1 flex flex-wrap gap-1">
                            {(article.tags as string[]).map((tag) => (
                              <span key={tag} className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10.5px] text-os-muted">{tag.replace(/_/g, " ")}</span>
                            ))}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3">
              <CardHeader
                title="Standard procedures"
                subtitle="Not documents — each one can be applied to a trip as a real checklist"
              />
            </div>
            {sopRows.length ? (
              <ul>
                {sopRows.map((sop) => (
                  <li key={sop.id} className="border-b border-os-line/60 last:border-0">
                    <Link href={`/os/knowledge/sop/${sop.slug}`} className="block px-4 py-3 transition hover:bg-black/[0.02]">
                      <p className="text-[13.5px] font-semibold text-os-text">{sop.title}</p>
                      {sop.summary ? <p className="mt-0.5 text-[12px] leading-snug text-os-muted">{sop.summary}</p> : null}
                      <p className="mt-1 text-[11px] text-os-faint">
                        {sop.os_trip_types?.name ? `${sop.os_trip_types.name} · ` : ""}
                        {sop.os_locations?.name ? `${sop.os_locations.name} · ` : ""}
                        version {sop.version}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-[12.5px] text-os-muted">No procedures published yet.</p>
            )}
          </Card>

          <Card>
            <CardHeader title="What belongs here" />
            <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
              Things you could only learn by doing the job. Which gate the van uses at Giza. Why a flying dress shoot is
              cancelled above 25 km/h of wind. Which tombs at the Valley of the Kings cost extra.
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
              If a web search answers it, it does not belong here. If a colleague is the only person who knows it, it does.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
