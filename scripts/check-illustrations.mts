/**
 * Guards the generated illustrations.
 *
 * The site's whole claim about its imagery is that it is real. Six AI renders
 * of the Grand Egyptian Museum are published on one page, by the owner's
 * explicit decision, and the thing that keeps that honest is a label — which
 * is one careless edit away from being gone, on a page nobody re-reads.
 *
 * Three failures are worth more than the rest, because each is silent:
 *
 *   the label disappears      a render becomes indistinguishable from a
 *                             photograph, which is the exact outcome the
 *                             flying-dresses registry was built to prevent
 *   a path leaks              a generated image gets used as a product photo
 *                             in some other content file
 *   the gallery stops         the images are still in the repo, the section
 *   rendering                 renders nothing, and nobody notices
 *
 * Note what is NOT available to this check: provenance. These files carry no
 * c2pa, openai, gpt-image or trainedAlgorithmicMedia marker, unlike the
 * generated frames in the flying-dresses library, so nothing in the bytes can
 * confirm what they are. The declaration in the registry is the only record,
 * which is why its integrity is checked this hard.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { illustrationGalleries } from "../src/content/illustrations";
import { signatureExperiences } from "../src/content/signatureExperiences";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const MAX_BYTES = 320_000;
const entries = Object.entries(illustrationGalleries);
const all = entries.flatMap(([, list]) => list);

ok("the illustration registry is empty — the gallery renders nothing", all.length > 0);

for (const [slug, list] of entries) {
  ok(
    `illustrationGalleries["${slug}"] matches no signature experience, so these images render on no page`,
    signatureExperiences.some((e) => e.slug === slug)
  );
  ok(`illustrationGalleries["${slug}"] is empty`, list.length > 0);

  for (const ill of list) {
    const where = `${slug} / ${ill.src.split("/").pop()}`;

    // The label. A generated image without one is the failure this file exists
    // for, so it is checked as a non-empty string AND as actually saying what
    // the image is — "" and " " both satisfy a truthiness test.
    ok(`${where} has no disclosure`, ill.disclosure.trim().length > 0);
    ok(
      `${where}'s disclosure does not say the image is AI — a label that does not disclose is decoration`,
      /\bAI\b|generated/i.test(ill.disclosure)
    );
    ok(
      `${where}'s alt text does not disclose — a screen-reader user would be told this is a photograph`,
      /\bAI\b|generated|illustration/i.test(ill.alt)
    );
    ok(`${where} names no real subject`, ill.subject.trim().length > 10);

    ok(`${where} must live under /photos/illustrations/`, ill.src.startsWith("/photos/illustrations/"));
    const onDisk = `public${ill.src}`;
    ok(`${where} points at a file that does not exist: ${onDisk}`, existsSync(onDisk));
    if (!existsSync(onDisk)) continue;
    const bytes = statSync(onDisk).size;
    ok(
      `${where} is ${Math.round(bytes / 1024)}KB, over the ${Math.round(MAX_BYTES / 1024)}KB budget`,
      bytes <= MAX_BYTES
    );
  }
}

// ---------------------------------------------------------------------------
// THE LEAK. A generated image used anywhere a real photograph is expected.
//
// The type system blocks the obvious route — an Illustration is not a
// SanityImage — but `image` also accepts a plain string, so a path copied by
// hand into a content file would compile and ship as a photograph of a place.
// ---------------------------------------------------------------------------
const contentDir = "src/content";
for (const file of readdirSync(contentDir)) {
  if (!file.endsWith(".ts") || file === "illustrations.ts") continue;
  const body = readFileSync(`${contentDir}/${file}`, "utf8");
  ok(
    `src/content/${file} references /photos/illustrations/ — a generated image is being used as a real photograph`,
    !body.includes("/photos/illustrations/")
  );
}

// Nothing may sit in the illustrations folder unreferenced either: an orphan
// is a file that has lost its declaration, and its declaration is the only
// thing that records what it is.
const declared = new Set(all.map((i) => i.src));
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`]
  );
if (existsSync("public/photos/illustrations")) {
  for (const f of walk("public/photos/illustrations")) {
    const web = f.replace(/^public/, "");
    ok(
      `${web} is in the illustrations folder but declared nowhere — nothing records that it is generated`,
      declared.has(web)
    );
  }
}

// ---------------------------------------------------------------------------
// The component actually renders the label, and the page actually renders the
// component. Comments stripped first: this file's subject is a component whose
// header explains at length why the badge exists, so a naive search finds the
// word in the prose and passes however the JSX is changed.
// ---------------------------------------------------------------------------
const panel = stripComments(readFileSync("src/components/IllustrationGallery.tsx", "utf8"));
ok(
  "IllustrationGallery no longer renders a label on each image — the renders become indistinguishable from photographs",
  /\{label \?\? ill\.disclosure\}/.test(panel)
);
ok(
  "IllustrationGallery renders the label outside the per-image loop, so only one frame carries it",
  panel.indexOf("{label ?? ill.disclosure}") > panel.indexOf("illustrations.map")
);
ok("IllustrationGallery no longer renders its disclosure note", /\{note\}/.test(panel));

const page = stripComments(
  readFileSync("src/app/[locale]/(site)/signature-experiences/[slug]/page.tsx", "utf8")
);
// Anchored on the tag boundary: a bare /<IllustrationGallery/ also matches
// <IllustrationGalleryOld or a typo'd rename, so it would pass while the real
// component had been swapped out.
ok(
  "the signature-experience page no longer renders the gallery",
  /<IllustrationGallery[\s/>]/.test(page)
);
ok(
  "the gallery is rendered without a disclosure note",
  /note=\{/.test(page.slice(page.indexOf("<IllustrationGallery")))
);
ok(
  "the gallery's label is not passed through the translator, so a non-English reader gets an English badge or none",
  /label=\{ui\["AI illustration"\]\}/.test(page)
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-illustrations: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-illustrations: ok — ${all.length} generated illustrations on ${entries.length} page(s), ` +
    `every one declared with a disclosure and disclosing alt text, labelled on the frame rather than under the group, ` +
    `translated with the rest of the page, absent from every other content file, and with no undeclared file beside them.`
);
