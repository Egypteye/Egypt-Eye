/**
 * Asserts the vertical tour videos are OFF.
 *
 * This file used to guard the feature working. It now guards it being
 * switched off, at the owner's request, with the possibility of coming back.
 * The inversion is deliberate: a parked feature with no check is one careless
 * edit from a half-revival, and every half-revival is silent.
 *
 * The three ways back on are all worth failing:
 *
 *   data without a render    a `video` returns to a tour, nothing renders it,
 *                            and the only symptom is a field nobody reads
 *   render without data      the panel returns to the page, renders nothing,
 *                            and leaves a dead import and an empty column
 *   render without files     both return but the media is still deleted, so
 *                            every tour page ships a broken <video> and a
 *                            broken poster — which is the loudest failure and
 *                            still invisible until someone opens a tour page
 *
 * Reviving the feature properly means turning all three on together AND
 * restoring this file's on-state assertions, which are in its git history.
 * TourVideoPanel.tsx's header has the full sequence.
 */
import { existsSync, readFileSync } from "node:fs";
import { tours } from "../src/content/tours";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

// ---------------------------------------------------------------------------
// 1. No tour carries a video.
// ---------------------------------------------------------------------------
const withVideo = tours.filter((t) => t.video);
ok(
  `the vertical video feature is off, but ${withVideo.length} tour(s) still carry one (${withVideo
    .map((t) => t.slug)
    .join(", ")}) — it would not render, so this is data nothing reads`,
  withVideo.length === 0
);

// ---------------------------------------------------------------------------
// 2. The tour page renders no panel, at either breakpoint.
// ---------------------------------------------------------------------------
const page = stripComments(
  readFileSync("src/app/[locale]/(site)/tours/[slug]/page.tsx", "utf8")
);
ok(
  "the tour page renders TourVideoPanel again — the feature is supposed to be off",
  !/<TourVideoPanel[\s/>]/.test(page)
);
ok(
  "the tour page still imports TourVideoPanel, which is a dead import",
  !/TourVideoPanel/.test(page)
);
ok("the tour page still reads tour.video", !/tour\.video/.test(page));

// ---------------------------------------------------------------------------
// 3. No media is left serving.
//
// An unreferenced file in public/ is still fetchable by anyone who knows the
// URL, and 9.8MB of it was deployed on every build. Deleting it is part of
// being off rather than tidiness.
// ---------------------------------------------------------------------------
ok(
  "public/videos still exists — the tour video media should be deleted while the feature is off (it is recoverable from git)",
  !existsSync("public/videos")
);

// ---------------------------------------------------------------------------
// 4. The revival path is intact.
//
// Not housekeeping. The gap-fill is the fix for a failure that already
// happened once: the videos shipped, the files deployed and served, and not
// one <video> rendered on the live site, because a tour with a Studio
// document loses any field the content file supplies unless it is filled back
// in here. Deleting the line while the feature is parked would mean
// rediscovering that the same expensive way.
// ---------------------------------------------------------------------------
const shape = readFileSync("src/lib/sanityShape.ts", "utf8");
ok(
  "the hardenTour video gap-fill was deleted — reviving the feature would silently render nothing on any tour with a Studio document, which is exactly what happened last time",
  /video:\s*tour\.video\s*\?\?\s*local\?\.video/.test(shape)
);
ok(
  "TourVideoPanel.tsx is gone, so reviving the feature means rebuilding the player",
  existsSync("src/components/TourVideoPanel.tsx")
);
ok(
  "the TourVideo type is gone, so the shape to restore is no longer written down",
  /export type TourVideo = \{/.test(readFileSync("src/content/types.ts", "utf8"))
);
ok(
  "TourVideoPanel.tsx no longer says it is parked — the next person to open it will think it is live",
  /PARKED/.test(readFileSync("src/components/TourVideoPanel.tsx", "utf8"))
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-tour-videos: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "check-tour-videos: ok — the vertical video feature is off: no tour carries one, the tour page renders " +
    "and imports nothing, and no media is left serving. The player, the type and the Sanity gap-fill are " +
    "kept so it can be switched back on without relearning why it broke the first time."
);
