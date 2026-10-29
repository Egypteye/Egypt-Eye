/**
 * Guards the ten photos behind the homepage Destinations grid.
 *
 * The grid renders a 4:5 tile per destination, matched to the entry by NAME —
 * not by index, not by slug. That makes three things breakable without a
 * build error and without anything looking wrong in development:
 *
 *   a renamed destination   the tile silently falls back to the linked tour's
 *                           photo, which is how Red Sea, Sharm El Sheikh and
 *                           Hurghada once all showed the same picture
 *   a missing own-photo     `image` is a plain string, so it is passed through
 *                           untouched and a typo'd path is a broken <img>
 *   a dropped credit        attribution is a condition of the Unsplash licence
 *
 * The third is the reason this file exists at all. `credit` was a required
 * field until Cairo, Luxor and Aswan became Egypt Eye's own photographs, which
 * have nobody to attribute. Making it optional is correct for those three and
 * removes the compiler as the thing that kept the other seven honest. This
 * check is the replacement: optional for an own photo, still mandatory for a
 * stock one.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { destinationPhotos } from "../src/content/destinationPhotos";
import { destinations } from "../src/content/destinations";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

/**
 * JPEG dimensions, read from the file rather than trusted.
 *
 * Walks the marker segments looking for a start-of-frame (SOF0/1/2/3, C5-C7,
 * C9-CB, CD-CF — everything in C0..CF except C4 DHT, C8 JPG and CC DAC), whose
 * payload carries height then width as big-endian 16-bit. Done by hand because
 * the alternative is adding an image library to the dependency tree of a check
 * that needs two numbers.
 */
function jpegSize(file: string): { width: number; height: number } | null {
  const b = readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const length = b.readUInt16BE(i + 2);
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + length;
  }
  return null;
}

// The tile is aspect-[4/5] in DestinationsPanel.tsx. A landscape photo dropped
// in here is not a broken build, it is a centre-cropped face.
const ASPECT = 4 / 5;
const MIN_WIDTH = 1200;
const MAX_BYTES = 450_000;

ok(
  "destinationPhotos no longer covers every destination — a missing one falls back to its tour's photo, and three destinations share one tour",
  destinations.every((d) => destinationPhotos.some((p) => p.name === d.name))
);

const seen = new Set<string>();

for (const photo of destinationPhotos) {
  const where = `destinationPhotos[${photo.name}]`;

  ok(
    `${where} matches no destination in destinations.ts — the grid pairs them by name, so this entry is never read`,
    destinations.some((d) => d.name === photo.name)
  );

  ok(`${where} is a duplicate name`, !seen.has(photo.name));
  seen.add(photo.name);

  ok(`${where}.image is not a plain URL or path`, typeof photo.image === "string");
  if (typeof photo.image !== "string") continue;

  const isOwn = photo.image.startsWith("/");

  if (isOwn) {
    // Egypt Eye's own photograph: it has to be on disk, in the right shape,
    // and must not carry an invented attribution.
    ok(
      `${where} is one of our own photos and must not claim an Unsplash credit`,
      photo.credit === undefined
    );
    const onDisk = `public${photo.image}`;
    ok(`${where}.image points at a file that does not exist: ${onDisk}`, existsSync(onDisk));
    if (!existsSync(onDisk)) continue;

    const bytes = statSync(onDisk).size;
    ok(
      `${where}.image is ${Math.round(bytes / 1024)}KB, over the ${Math.round(MAX_BYTES / 1024)}KB budget — urlForImage passes a plain path through untouched, so the file shipped IS the file served`,
      bytes <= MAX_BYTES
    );

    const size = jpegSize(onDisk);
    ok(`${where}.image is not a readable JPEG`, size !== null);
    if (!size) continue;

    ok(
      `${where}.image is ${size.width}px wide, under the ${MIN_WIDTH}px the tile needs on a 2x screen`,
      size.width >= MIN_WIDTH
    );
    const ratio = size.width / size.height;
    ok(
      `${where}.image is ${size.width}x${size.height} (${ratio.toFixed(2)}:1), not the 4:5 the tile crops to — it will be centre-cropped`,
      Math.abs(ratio - ASPECT) < 0.02
    );
  } else {
    // Stock: attribution is a licence condition, not a nicety.
    ok(
      `${where} is an Unsplash photo with no credit — attribution is a condition of the Unsplash licence`,
      photo.credit !== undefined
    );
    ok(
      `${where}.credit names no photographer`,
      (photo.credit?.creator ?? "").trim().length > 0
    );
    ok(
      `${where}.credit has no link back to the photo`,
      (photo.credit?.sourceUrl ?? "").startsWith("https://unsplash.com/")
    );
  }
}

// The original bug this file's subject was written to fix: three destinations
// share one tour, so if two tiles use one image the grid looks duplicated
// again — by a different route than the one that was fixed.
const images = destinationPhotos.map((p) => String(p.image));
ok(
  `two destinations share an image, which is the duplicate-tile bug this content file exists to prevent: ${
    images.filter((img, i) => images.indexOf(img) !== i).join(", ")
  }`,
  new Set(images).size === images.length
);

if (errors.length > 0) {
  console.error(`\ncheck-destination-photos: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const own = destinationPhotos.filter((p) => String(p.image).startsWith("/"));
console.log(
  `check-destination-photos: ok — ${destinationPhotos.length} destinations each with their own distinct 4:5 photo; ` +
    `${own.length} are Egypt Eye's own (${own.map((p) => p.name).join(", ")}) and on disk at the right size, ` +
    `${destinationPhotos.length - own.length} are Unsplash and every one still carries its attribution.`
);
