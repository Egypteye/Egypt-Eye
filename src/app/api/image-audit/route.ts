import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { tours } from "@/content/tours";
import { stories } from "@/content/stories";
import { experiences } from "@/content/experiences";
import { photoshoots } from "@/content/photoshoots";
import { destinationHubs } from "@/content/destinationHubs";
import { signatureExperiences } from "@/content/signatureExperiences";

// Reports which image URLs on the site are actually dead.
//
// Every card that shows a flat colour gradient instead of a photo is
// SmartImage falling back to its `imageTone` because the image behind it
// failed to load. Which ones those are cannot be determined from the
// codebase: the URLs have to be requested, and a development sandbox is
// blocked from images.unsplash.com. This deployment is not, so the check
// belongs here — run it and it answers the question with facts instead of
// inference.
//
//   https://yoursite.com/api/image-audit?secret=YOUR_MIGRATE_SECRET
//
// Strictly read-only: it requests images and reports. It changes nothing.
//
// It covers both sides, because they fail for different reasons and need
// different fixes:
//
//   - LOCAL: a URL in src/content/*.ts. Dead ones are fixed by editing the
//     content file and deploying.
//   - SANITY: a URL on a Sanity document. Sanity wins over local content
//     wholesale, so a dead image there keeps showing even after the content
//     file is fixed. Those are cleared or replaced in Studio.
//
// `onlyInSanity` is the case that no code change can reach: a document that
// exists in Sanity with no counterpart in the content files, so there is no
// local photo to fall back to.
export const maxDuration = 60;

type Row = { kind: string; slug: string; url: string; where: "local" | "sanity" };

function urlOf(image: unknown): string | null {
  if (typeof image === "string" && image.startsWith("http")) return image;
  return null;
}

function localRows(): Row[] {
  const out: Row[] = [];
  const add = (kind: string, items: readonly { slug: string; image?: unknown }[]) => {
    for (const it of items) {
      const u = urlOf(it.image);
      if (u) out.push({ kind, slug: it.slug, url: u, where: "local" });
    }
  };
  add("tour", tours);
  add("story", stories);
  add("experience", experiences);
  add("photoshoot", photoshoots);
  add("destinationHub", destinationHubs);
  add("signatureExperience", signatureExperiences as readonly { slug: string; image?: unknown }[]);
  return out;
}

async function sanityRows(token?: string): Promise<{ rows: Row[]; slugs: Record<string, string[]> }> {
  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  const docs = await client.fetch<{ _type: string; slug: string | null; image: unknown; heroImage: unknown }[]>(
    `*[_type in ["tour","story","experience","photoshoot","destinationHub","signatureExperience"]]{
       _type, "slug": slug.current, image, heroImage }`
  );
  const rows: Row[] = [];
  const slugs: Record<string, string[]> = {};
  for (const d of docs) {
    if (!d.slug) continue;
    (slugs[d._type] ??= []).push(d.slug);
    const u = urlOf(d.image) ?? urlOf(d.heroImage);
    if (u) rows.push({ kind: d._type, slug: d.slug, url: u, where: "sanity" });
  }
  return { rows, slugs };
}

// Ranged GET rather than HEAD: some CDNs answer HEAD differently from the
// request a browser actually makes, and one byte is enough to prove the
// object is served.
async function probe(url: string): Promise<number> {
  try {
    const res = await fetch(url, {
      headers: { Range: "bytes=0-0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return res.status;
  } catch {
    return 0;
  }
}

async function probeAll(urls: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  const queue = [...urls];
  const workers = Array.from({ length: 8 }, async () => {
    for (;;) {
      const u = queue.shift();
      if (!u) return;
      result.set(u, await probe(u));
    }
  });
  await Promise.all(workers);
  return result;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const local = localRows();
  let sanity: Row[] = [];
  let sanitySlugs: Record<string, string[]> = {};
  let sanityError: string | null = null;
  try {
    const r = await sanityRows(process.env.SANITY_API_WRITE_TOKEN);
    sanity = r.rows;
    sanitySlugs = r.slugs;
  } catch (err) {
    sanityError = err instanceof Error ? err.message : String(err);
  }

  const rows = [...local, ...sanity];
  const statuses = await probeAll([...new Set(rows.map((r) => r.url))]);
  const dead = rows.filter((r) => {
    const s = statuses.get(r.url) ?? 0;
    return s === 0 || s >= 400;
  });

  // Sanity documents with no content-file counterpart — nothing in the repo
  // can give these a photo.
  const localSlugs: Record<string, Set<string>> = {
    tour: new Set(tours.map((t) => t.slug)),
    story: new Set(stories.map((s) => s.slug)),
    experience: new Set(experiences.map((e) => e.slug)),
    photoshoot: new Set(photoshoots.map((p) => p.slug)),
    destinationHub: new Set(destinationHubs.map((d) => d.slug)),
    signatureExperience: new Set(signatureExperiences.map((s) => s.slug)),
  };
  const onlyInSanity: { kind: string; slug: string }[] = [];
  for (const [kind, list] of Object.entries(sanitySlugs)) {
    for (const slug of list) {
      if (!localSlugs[kind]?.has(slug)) onlyInSanity.push({ kind, slug });
    }
  }

  const tally = (rs: Row[]) =>
    rs.reduce<Record<string, number>>((m, r) => ({ ...m, [`${r.where}:${r.kind}`]: (m[`${r.where}:${r.kind}`] ?? 0) + 1 }), {});

  return NextResponse.json({
    checked: rows.length,
    distinctUrls: statuses.size,
    deadCount: dead.length,
    deadByKind: tally(dead),
    checkedByKind: tally(rows),
    sanityError,
    onlyInSanityCount: onlyInSanity.length,
    onlyInSanity: onlyInSanity.slice(0, 60),
    dead: dead.slice(0, 200).map((d) => ({
      kind: d.kind, slug: d.slug, where: d.where,
      status: statuses.get(d.url) ?? 0,
      url: d.url.slice(0, 96),
    })),
    note:
      "Read-only. `where: local` is fixed in the content files; `where: sanity` " +
      "must be cleared or replaced in Studio, because Sanity overrides local content. " +
      "`onlyInSanity` documents have no content-file counterpart, so no code change can give them a photo.",
  });
}
