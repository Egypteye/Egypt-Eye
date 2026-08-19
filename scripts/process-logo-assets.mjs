// Regenerates public/brand/*.png and the app icons from the source files in
// public/brand/originals/. Re-run this (`node scripts/process-logo-assets.mjs`)
// whenever the source logo art changes.
//
// Uses `sharp`, which ships as a transitive dependency of Next.js — no extra
// install needed.
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const originals = join(root, "public/brand/originals");
const brand = join(root, "public/brand");
const app = join(root, "src/app");

async function run() {
  // Trim transparent padding, then resize to a reasonable web width.
  await sharp(join(originals, "egypt-eye-mark-gold-original.png"))
    .trim()
    .resize({ width: 800 })
    .png({ compressionLevel: 9 })
    .toFile(join(brand, "egypt-eye-mark-gold.png"));

  await sharp(join(originals, "egypt-eye-mark-black-original.png"))
    .trim()
    .resize({ width: 800 })
    .png({ compressionLevel: 9 })
    .toFile(join(brand, "egypt-eye-mark-black.png"));

  await sharp(join(originals, "egypt-eye-badge-gold-original.png"))
    .resize({ width: 800 })
    .png({ compressionLevel: 9 })
    .toFile(join(brand, "egypt-eye-badge-gold.png"));

  // App icons: navy rounded-square background + centered gold mark.
  const markTrimmed = await sharp(join(originals, "egypt-eye-mark-gold-original.png"))
    .trim()
    .toBuffer();

  const targets = [
    { size: 512, out: join(app, "icon.png") },
    { size: 192, out: join(app, "apple-icon.png") },
  ];

  for (const { size, out } of targets) {
    const pad = Math.round(size * 0.16);
    const markSize = size - pad * 2;
    const markResized = await sharp(markTrimmed)
      .resize({ width: markSize, height: markSize, fit: "inside" })
      .toBuffer();
    const { width, height } = await sharp(markResized).metadata();

    const bgSvg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
         <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#0b1930"/>
       </svg>`
    );

    await sharp(bgSvg)
      .composite([{ input: markResized, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
      .png()
      .toFile(out);
  }

  console.log("Brand assets regenerated.");
}

run();
