import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { siteUrl } from "@/content/seo";
import { stories as localStories } from "@/content/stories";
import type { SanityImage } from "@/content/types";
import { getPinterestConnection, createPin } from "./client";
import { resolvePinImageUrl } from "./image";
import { buildPinCopy } from "./caption";

const localImageBySlug = new Map(localStories.map((s) => [s.slug, s.image]));

type UnpinnedStoryRow = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  image?: SanityImage;
  category?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
};

const UNPINNED_QUERY = `*[_type == "story" && status == "published" && !defined(pinterestPinId)] | order(publishedAt asc) [0...$limit] {
  _id, "slug": slug.current, title, excerpt, image, category, primaryKeyword, secondaryKeywords
}`;

const REMAINING_COUNT_QUERY = `count(*[_type == "story" && status == "published" && !defined(pinterestPinId)])`;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The one routine that actually pins stories — called both by the admin
// "Pin Remaining Stories" button (the one-time backfill) and by the hourly
// cron (src/app/api/pinterest/sync/route.ts), which is what makes new posts
// get auto-pinned with zero extra code path to keep in sync. Idempotent and
// resumable: the query only ever selects stories missing pinterestPinId, and
// that field is set immediately after each successful pin, so re-running
// this (on a timeout, a retry, the next cron tick, whatever) can never
// create a duplicate Pin.
export async function pinUnpinnedStories({ limit = 25 }: { limit?: number } = {}): Promise<{
  pinned: number;
  remaining: number;
  errors: string[];
}> {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    return { pinned: 0, remaining: 0, errors: ["SANITY_API_WRITE_TOKEN is not configured on this deployment."] };
  }

  const connection = await getPinterestConnection();
  if (!connection) {
    return { pinned: 0, remaining: 0, errors: ["Pinterest isn't connected yet — visit /admin/pinterest to connect."] };
  }
  if (!connection.boardId) {
    return { pinned: 0, remaining: 0, errors: ["No Pinterest board selected yet — visit /admin/pinterest to pick one."] };
  }

  const sanity = createClient({ projectId, dataset, apiVersion, token: writeToken, useCdn: false });
  const stories = await sanity.fetch<UnpinnedStoryRow[]>(UNPINNED_QUERY, { limit });

  let pinned = 0;
  const errors: string[] = [];

  for (const story of stories) {
    try {
      // Mirrors the fallback in src/sanity/fetchers.ts: /api/migrate never
      // wrote an `image` onto story documents in Sanity, so this fills the
      // gap from the same local content the rest of the site falls back to,
      // rather than leaving newer stories permanently unpinnable.
      const imageUrl = resolvePinImageUrl(story.image ?? localImageBySlug.get(story.slug));
      if (!imageUrl) {
        errors.push(`${story.slug}: no image to pin.`);
        continue;
      }

      const { title, description } = buildPinCopy(story);
      const link = `${siteUrl}/stories/${story.slug}`;

      const pin = await createPin({
        accessToken: connection.accessToken,
        boardId: connection.boardId,
        title,
        description,
        link,
        imageUrl,
      });

      await sanity
        .patch(story._id)
        .set({ pinterestPinId: pin.id, pinterestPinnedAt: new Date().toISOString() })
        .commit();

      pinned++;
      // A small courtesy delay between calls — nowhere near Pinterest's
      // actual rate limit, just avoids bursting the API.
      await delay(400);
    } catch (err) {
      errors.push(`${story.slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const remaining = await sanity.fetch<number>(REMAINING_COUNT_QUERY);
  return { pinned, remaining, errors };
}
