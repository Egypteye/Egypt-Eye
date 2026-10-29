/**
 * Guards the short vertical videos on the best-selling tour pages.
 *
 * These are 9:16 clips of a guide describing a tour. Four things about them
 * are easy to break silently and expensive to break on a live page:
 *
 *   the files          a renamed asset leaves a dead <video> and a dead poster
 *   the weight         a re-export straight off a phone is 8MB, not 1.5MB
 *   faststart          without it nothing plays until the whole file lands
 *   preload="none"     without it every visitor pays for a video nobody played
 *
 * The first three are checked by reading the actual files rather than
 * trusting that whoever replaced one did it the same way.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { tours } from "../src/content/tours";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const withVideo = tours.filter((t) => t.video);
ok("no tour carries a video any more — the panel is dead code", withVideo.length > 0);

// A 30-second 480x854 clip has no business being larger than this. The
// sources were 4.4-8.3MB straight off the camera roll; re-encoded they are
// 0.9-1.6MB. The budget sits above the largest and well below the smallest
// original, so it catches "someone dropped the raw file in" without being
// tripped by ordinary re-encoding.
const MAX_VIDEO_BYTES = 2_500_000;
const MAX_POSTER_BYTES = 160_000;

for (const tour of withVideo) {
  const v = tour.video!;
  const where = `tours[${tour.slug}].video`;

  for (const [field, path] of [["src", v.src], ["poster", v.poster]] as const) {
    ok(`${where}.${field} must be an absolute path under /public`, path.startsWith("/"));
    const onDisk = `public${path}`;
    ok(`${where}.${field} points at a file that does not exist: ${onDisk}`, existsSync(onDisk));
    if (!existsSync(onDisk)) continue;

    const bytes = statSync(onDisk).size;
    const limit = field === "src" ? MAX_VIDEO_BYTES : MAX_POSTER_BYTES;
    ok(
      `${where}.${field} is ${(bytes / 1_048_576).toFixed(1)}MB, over the ${(limit / 1_048_576).toFixed(1)}MB budget — re-encode it rather than shipping the original`,
      bytes <= limit
    );
  }

  ok(`${where}.src is an .mp4`, v.src.endsWith(".mp4"));
  ok(`${where}.alt describes the video for a screen reader`, (v.alt ?? "").trim().length > 25);
  ok(`${where}.durationSeconds is a real duration`, v.durationSeconds > 0 && v.durationSeconds < 600);

  // faststart: the moov atom (the index) has to come before mdat (the data),
  // or the browser cannot start playing until the whole file has arrived.
  // Checked by reading the head of the file, which is where ffmpeg's
  // `-movflags +faststart` puts moov.
  const file = `public${v.src}`;
  if (existsSync(file)) {
    const head = readFileSync(file).subarray(0, 400_000);
    const moov = head.indexOf("moov");
    const mdat = head.indexOf("mdat");
    ok(`${where}: no moov atom near the start — was it encoded with -movflags +faststart?`, moov !== -1);
    ok(
      `${where}: mdat comes before moov, so playback waits for the whole file — re-encode with -movflags +faststart`,
      moov !== -1 && (mdat === -1 || moov < mdat)
    );
  }
}

// ---------------------------------------------------------------------------
// The player's two load-bearing attributes.
// ---------------------------------------------------------------------------
// Comments stripped first. This file's whole subject is a component whose
// header explains why it sets preload="none" and refuses to autoplay — so a
// naive read finds those strings in the prose and passes however the JSX is
// changed. Turning the attribute to preload="auto" was caught by nothing
// until this was added.
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
const panel = stripComments(readFileSync("src/components/TourVideoPanel.tsx", "utf8"));
ok(
  'TourVideoPanel no longer sets preload="none" — every visitor would fetch a video most never play',
  /preload="none"/.test(panel)
);
ok("TourVideoPanel no longer sets a poster, so the panel is a black box until pressed", /poster=\{/.test(panel));
// These clips are a person speaking. Autoplaying speech on someone's phone in
// public is the reason this is click-to-play, and it is the one change that
// would look harmless in a diff.
ok(
  "TourVideoPanel autoplays — these are speech, and must not start by themselves",
  !/\bautoPlay\b/.test(panel)
);
ok("TourVideoPanel must play inline rather than taking over the screen on iOS", /playsInline/.test(panel));

// ---------------------------------------------------------------------------
// Both placements, and the order that makes the mobile one work.
// ---------------------------------------------------------------------------
const page = readFileSync("src/app/[locale]/(site)/tours/[slug]/page.tsx", "utf8");
const mobile = page.indexOf('lg:hidden">\n                <TourVideoPanel');
const itinerary = page.indexOf('{tour.itinerary && (');
const desktop = page.indexOf('hidden w-full max-w-[15rem] lg:block');

ok("the tour page renders no phone-sized video panel", mobile !== -1);
ok("the tour page renders no desktop video panel", desktop !== -1);
ok(
  "the phone video panel is not before the itinerary — on a narrow screen it has to come first, which is the whole reason it is rendered separately from the sidebar",
  mobile !== -1 && itinerary !== -1 && mobile < itinerary
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-tour-videos: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const total = withVideo.reduce((n, t) => n + statSync(`public${t.video!.src}`).size, 0);
console.log(
  `check-tour-videos: ok — ${withVideo.length} tours carry a vertical video, ` +
    `${(total / 1_048_576).toFixed(1)}MB in total, every one faststart-encoded with a poster; ` +
    `the player preloads nothing and cannot autoplay speech; and the phone copy sits before the itinerary.`
);
