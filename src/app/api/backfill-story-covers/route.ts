import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { unsplashUrl } from "@/content/unsplash";

// Gives a cover photo to the published stories that live only in Sanity.
//
// /api/image-audit found zero dead image URLs anywhere: nothing was broken.
// The cards showing a flat gradient are stories that have no cover at all —
// documents written in Studio with no counterpart in the content files, so
// withLocalImageFallback has no local photo to lend them and SmartImage
// falls through to its imageTone. That is why fixing the content files and
// redeploying changed nothing for them.
//
// It has to be done here rather than in code for two reasons: the documents
// do not exist in the repository, and Sanity's story `image` is an uploaded
// asset, not a URL, so a link cannot simply be written into it. This route
// fetches each photo, uploads it to Sanity's asset store and references it —
// all of which needs the network access and the write token that only the
// deployment has.
//
//   https://yoursite.com/api/backfill-story-covers?secret=YOUR_MIGRATE_SECRET
//   https://yoursite.com/api/backfill-story-covers?secret=YOUR_MIGRATE_SECRET&apply=1
//
// Without `apply=1` it reports what it would do and uploads nothing.
//
// A story that already has a cover is skipped, always. This only ever fills
// a gap — it can never replace a photo someone uploaded in Studio.
export const maxDuration = 60;

type Cover = { slug: string; photo: string; alt: string; creator: string; sourceUrl: string };

// Sourced from the Unsplash API, one per story, none shared with the 132
// covers in the content files. Chosen to match each story's Egyptian subject
// rather than its technology hook: these pieces pair a 2026 trend with an
// ancient Egyptian parallel, and the Egyptian half is what they illustrate.
const COVERS: Cover[] = [
  { slug: "ai-influencers-2026-pharaoh-propaganda", photo: "photo-1774223146625-9e966cc26fe1", alt: "Four colossal statues of pharaohs at an ancient egyptian temple", creator: "Alessandro Santoro", sourceUrl: "https://unsplash.com/photos/four-colossal-statues-of-pharaohs-at-an-ancient-egyptian-temple-D9_achswER0" },
  { slug: "ai-safety-abu-simbel-lesson-in-moving-fast", photo: "photo-1502250493741-939d1c76eaad", alt: "ancient pharaoh sitting monument", creator: "AussieActive", sourceUrl: "https://unsplash.com/photos/ancient-pharaoh-sitting-monument-GNdp2Q4VZjw" },
  { slug: "apple-ecosystem-2026-rosetta-stone-egypt", photo: "photo-1767938072646-964324e90bf0", alt: "Ancient egyptian columns with hieroglyphs and statues", creator: "Suzi Kim", sourceUrl: "https://unsplash.com/photos/ancient-egyptian-columns-with-hieroglyphs-and-statues-vbDhYgcMe1E" },
  { slug: "brain-computer-interface-2026-egypt-discarded-brain", photo: "photo-1675372803130-3d2ea600a389", alt: "a statue of an egyptian god with his head in his hands", creator: "M abnodey", sourceUrl: "https://unsplash.com/photos/a-statue-of-an-egyptian-god-with-his-head-in-his-hands-FI44ngZ9n9o" },
  { slug: "cinematic-authentic-content-2026-egypt-tomb-art-duality", photo: "photo-1662552445550-a5876903c1ed", alt: "a stone statue of a person", creator: "Jeroen van Nierop", sourceUrl: "https://unsplash.com/photos/a-stone-statue-of-a-person-reL5uhgstxE" },
  { slug: "creator-communities-2026-deir-el-medina-workers-village", photo: "photo-1667070796004-2678a87ddc10", alt: "a stone carving of a man and woman", creator: "M abnodey", sourceUrl: "https://unsplash.com/photos/a-stone-carving-of-a-man-and-woman-lXAfEKBgAr8" },
  { slug: "deepfakes-2026-ancient-egypt-usurped-cartouches", photo: "photo-1761056962596-fe3599f5185b", alt: "Ancient egyptian columns with hieroglyphs", creator: "Fatih Beki", sourceUrl: "https://unsplash.com/photos/ancient-egyptian-columns-with-hieroglyphs-2bgirUct1MU" },
  { slug: "fashion-nostalgia-2026-egyptomania-cycles", photo: "photo-1780838042553-eab8274bcb3d", alt: "Row of ancient egyptian sphinx statues leading to modern city", creator: "Philipp Renner", sourceUrl: "https://unsplash.com/photos/row-of-ancient-egyptian-sphinx-statues-leading-to-modern-city-Z5bzXzZZTVQ" },
  { slug: "functional-drinks-2026-egypt-medicinal-beer", photo: "photo-1778785241914-7f75ca16a92d", alt: "Delicious fish stew with rice on a patterned tablecloth", creator: "PARSI Restaurant", sourceUrl: "https://unsplash.com/photos/delicious-fish-stew-with-rice-on-a-patterned-tablecloth-GUq9lfKcYx4" },
  { slug: "gene-editing-2026-tutankhamun-dna-family-tree", photo: "photo-1710911445342-7f2f06f4ad0f", alt: "a large sphinx statue in front of a large pyramid", creator: "Husha Bilimale", sourceUrl: "https://unsplash.com/photos/a-large-sphinx-statue-in-front-of-a-large-pyramid-yMBIjjOQk08" },
  { slug: "humanoid-robots-2026-ushabti-ancient-labor-figures", photo: "photo-1716639154447-98e6cd8de2e8", alt: "the sphinx and the pyramids of giza, egypt", creator: "Ale", sourceUrl: "https://unsplash.com/photos/the-sphinx-and-the-pyramids-of-giza-egypt-__f2qY5R9tE" },
  { slug: "longevity-fitness-2026-beni-hasan-wrestling-egypt", photo: "photo-1779366243622-2d754e4b5bc1", alt: "Tall ancient egyptian columns with hieroglyphs under a blue sky", creator: "Sandip Roy", sourceUrl: "https://unsplash.com/photos/tall-ancient-egyptian-columns-with-hieroglyphs-under-a-blue-sky-nq9ksLV85LU" },
  { slug: "longevity-technology-2026-egypt-defeat-death-ambition", photo: "photo-1742262379112-eacb2813ca6d", alt: "The great temple of abu simbel in egypt", creator: "Tang wei-chen", sourceUrl: "https://unsplash.com/photos/the-great-temple-of-abu-simbel-in-egypt-oeI15hbgk0g" },
  { slug: "mars-human-spaceflight-2026-hatshepsut-punt-expedition", photo: "photo-1662552445716-bb5cb3331239", alt: "a stone wall with carvings", creator: "Jeroen van Nierop", sourceUrl: "https://unsplash.com/photos/a-stone-wall-with-carvings-B2B808S5VAg" },
  { slug: "next-gen-gaming-2026-senet-oldest-board-game", photo: "photo-1722595053086-eb36d4c3a6f5", alt: "The sphinx and the great pyramids of giza", creator: "Dilip Poddar", sourceUrl: "https://unsplash.com/photos/the-sphinx-and-the-great-pyramids-of-giza-JWlZRI_PvjE" },
  { slug: "photorealistic-video-games-2026-pyramid-laser-scan", photo: "photo-1713116818886-f43d23f1ef73", alt: "a large sphinx statue in the middle of a desert", creator: "Dilip Poddar", sourceUrl: "https://unsplash.com/photos/a-large-sphinx-statue-in-the-middle-of-a-desert--lu6ThTe2g4" },
  { slug: "science-backed-skincare-2026-egyptian-kohl-study", photo: "photo-1662567819554-63b0ca4f0f84", alt: "a building with columns", creator: "2H Media", sourceUrl: "https://unsplash.com/photos/a-building-with-columns-HLiWEucOqg0" },
  { slug: "serialized-short-form-content-2026-tale-of-sinuhe", photo: "photo-1761143487063-c74ad86b5eee", alt: "Ancient egyptian columns with hieroglyphs under sky", creator: "Fatih Beki", sourceUrl: "https://unsplash.com/photos/ancient-egyptian-columns-with-hieroglyphs-under-sky-VMFC7qJheXw" },
  { slug: "space-exploration-2026-egypt-ancient-astronomy", photo: "photo-1476504825079-f50520ac761d", alt: "blue and black skies with stars", creator: "Nathan Anderson", sourceUrl: "https://unsplash.com/photos/blue-and-black-skies-with-stars-1w7vRUndUxY" },
  { slug: "vr-ar-spatial-computing-2026-giza-sound-light-show", photo: "photo-1529135942918-ca55bb398f40", alt: "Pyramid, Egypt", creator: "simon", sourceUrl: "https://unsplash.com/photos/pyramid-egypt-ph4vENj9AQk" },
  { slug: "y2k-nostalgia-2026-jarre-pyramids-millennium-concert", photo: "photo-1718403800110-bd008d361517", alt: "the pyramids of giza are in the desert", creator: "Jade Stewart", sourceUrl: "https://unsplash.com/photos/the-pyramids-of-giza-are-in-the-desert-TlZkxSM5TUk" },
];

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "SANITY_API_WRITE_TOKEN is not set in this deployment's environment variables" },
      { status: 500 }
    );
  }
  const apply = request.nextUrl.searchParams.get("apply") === "1";
  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

  const slugs = COVERS.map((c) => c.slug);
  const docs = await client.fetch<{ _id: string; slug: string; hasImage: boolean; title: string }[]>(
    `*[_type == "story" && slug.current in $slugs]{ _id, "slug": slug.current, "hasImage": defined(image.asset), title }`,
    { slugs }
  );
  const bySlug = new Map(docs.map((d) => [d.slug, d]));

  const plan = COVERS.map((c) => {
    const doc = bySlug.get(c.slug);
    return {
      slug: c.slug,
      status: !doc ? "no such story in Sanity" : doc.hasImage ? "already has a cover — skipped" : "would set",
      alt: c.alt,
      credit: c.creator,
    };
  });
  const todo = COVERS.filter((c) => {
    const d = bySlug.get(c.slug);
    return d && !d.hasImage;
  });

  if (!apply) {
    return NextResponse.json({
      dryRun: true, found: docs.length, wouldSet: todo.length, plan,
      note: "Nothing uploaded. Re-run with &apply=1 to set these covers. Stories that already have one are never touched.",
    });
  }

  const done: string[] = [];
  const failed: { slug: string; error: string }[] = [];
  for (const c of todo) {
    try {
      const res = await fetch(unsplashUrl(c.photo, 1600), { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`photo fetch returned ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const asset = await client.assets.upload("image", buf, { filename: `${c.slug}.jpg` });
      await client
        .patch(bySlug.get(c.slug)!._id)
        .set({
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
            credit: {
              _type: "object",
              source: "Unsplash",
              creator: c.creator,
              sourceUrl: c.sourceUrl,
              license: "Unsplash License",
            },
          },
        })
        .commit();
      done.push(c.slug);
    } catch (err) {
      failed.push({ slug: c.slug, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({
    applied: true, set: done.length, failedCount: failed.length, done, failed,
    note: "Covers uploaded to Sanity's asset store and referenced from each story. Allow the one-hour cache, or redeploy, to see them.",
  });
}
