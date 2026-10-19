/**
 * THE SERVICE AND EXPERIENCE PAGE AUDIT.
 *
 * Every other check in this repository reads source files. This one reads
 * RENDERED PAGES over HTTP, because the faults it exists to catch are ones the
 * source looks innocent for:
 *
 *   - the home page owned twelve dress photographs and rendered colour swatches
 *   - the celebration routes carried FAQ content and emitted no FAQPage markup
 *   - the brand shipped a favicon set in a font almost nobody has installed
 *
 * In all three the files were present, valid and simply never reached the
 * browser. A source-reading check passes every one of them.
 *
 * WHAT THIS IS NOT. It cannot tell you a page is EDITORIALLY complete. It
 * counts words, it does not read them: a page of fluent nonsense scores the
 * same as a page that answers a customer's actual question. Thresholds here
 * mark pages worth a human's attention, not pages that are wrong. Treat a
 * warning as "look at this", never as "this failed".
 *
 * Run against a dev or preview server:
 *   npm run dev
 *   npm run audit:services
 *   BASE=https://flyingdressesegypt.com npm run audit:services
 */
import { flyingDressExperiences, experienceCategories } from "../src/content/flyingDressExperiences.js";
import { packages, rentalServices } from "../src/content/flyingDresses.js";

const BASE = process.env.BASE ?? "http://localhost:3000/flying-dresses";

/** Google truncates around these. Outside the band is a presentation loss. */
const TITLE_MAX = 60;
const DESC_MIN = 110;
const DESC_MAX = 160;
/** Under this, a service page is unlikely to answer a buying question. */
const THIN_WORDS = 350;

type Finding = { path: string; level: "error" | "warn"; note: string };
const findings: Finding[] = [];

/** Every service and experience URL, derived from the data rather than typed. */
function inventory(): string[] {
  const out = ["", "/experiences", "/celebrations", "/creative", "/rentals", "/packages", "/wardrobe"];
  for (const p of packages) out.push(`/experiences/${p.slug}`);
  for (const c of experienceCategories) out.push(`/${c.section}/${c.slug}`);
  for (const r of rentalServices) out.push(`/rentals/${r.slug}`);
  return out;
}

const strip = (html: string) =>
  html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ");

function one(re: RegExp, html: string): string {
  return html.match(re)?.[1]?.trim() ?? "";
}

const titles = new Map<string, string[]>();
const descs = new Map<string, string[]>();

async function audit(path: string) {
  let html: string;
  try {
    const res = await fetch(BASE + path);
    if (!res.ok) {
      findings.push({ path, level: "error", note: `HTTP ${res.status}` });
      return;
    }
    html = await res.text();
  } catch (err) {
    findings.push({ path, level: "error", note: `unreachable: ${String(err).slice(0, 60)}` });
    return;
  }

  const title = one(/<title>([\s\S]*?)<\/title>/, html);
  const desc = one(/name="description" content="([\s\S]*?)"/, html);
  const canonical = one(/rel="canonical" href="([\s\S]*?)"/, html);
  const h1s = html.match(/<h1[^>]*>/g) ?? [];
  const words = strip(html).replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

  titles.set(title, [...(titles.get(title) ?? []), path]);
  descs.set(desc, [...(descs.get(desc) ?? []), path]);

  // Errors: things that are simply wrong, not matters of judgement.
  if (h1s.length !== 1) findings.push({ path, level: "error", note: `${h1s.length} h1 elements, expected 1` });
  if (!canonical) findings.push({ path, level: "error", note: "no canonical" });
  if (!title) findings.push({ path, level: "error", note: "no title" });
  if (!desc) findings.push({ path, level: "error", note: "no meta description" });

  // An image with no alt attribute at all. alt="" is legitimate for decoration,
  // so only a MISSING attribute counts here.
  const noAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length;
  if (noAlt) findings.push({ path, level: "error", note: `${noAlt} img without an alt attribute` });

  // Warnings: worth a look.
  if (title.length > TITLE_MAX)
    findings.push({ path, level: "warn", note: `title ${title.length} chars, truncates past ~${TITLE_MAX}` });
  if (desc && (desc.length < DESC_MIN || desc.length > DESC_MAX))
    findings.push({ path, level: "warn", note: `description ${desc.length} chars, outside ${DESC_MIN}-${DESC_MAX}` });
  if (words < THIN_WORDS)
    findings.push({ path, level: "warn", note: `${words} words rendered, thin for a service page` });

  // Structured data must parse. Invalid JSON-LD is worse than none: it is a
  // silent failure that no visitor and no log will ever show you.
  const blocks = [...html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const types: string[] = [];
  for (const [, raw] of blocks) {
    try {
      const parsed: unknown = JSON.parse(raw);
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        const t = (node as { "@type"?: unknown })?.["@type"];
        if (typeof t === "string") types.push(t);
      }
    } catch {
      findings.push({ path, level: "error", note: "a JSON-LD block does not parse" });
    }
  }

  // A page that renders questions should mark them up. This is the exact fault
  // the celebration routes had: content present, markup absent.
  const rendersFaq = /fd-faq|<summary/i.test(html);
  if (rendersFaq && !types.includes("FAQPage"))
    findings.push({ path, level: "warn", note: "renders questions but emits no FAQPage" });

  if (path !== "" && !types.includes("BreadcrumbList"))
    findings.push({ path, level: "warn", note: "no BreadcrumbList" });
}

const paths = inventory();
for (const p of paths) await audit(p);

// Duplicate metadata across different URLs is cannibalisation, not a style note.
for (const [t, where] of titles) {
  if (t && where.length > 1) findings.push({ path: where.join(", "), level: "error", note: `duplicate title: "${t.slice(0, 50)}"` });
}
for (const [d, where] of descs) {
  if (d && where.length > 1) findings.push({ path: where.join(", "), level: "error", note: "duplicate meta description" });
}

const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");

for (const f of errors) console.log(`  ✗ ${f.path}  ${f.note}`);
for (const f of warns) console.log(`  · ${f.path}  ${f.note}`);

console.log(
  `\naudit-service-pages: ${paths.length} pages, ${errors.length} error(s), ${warns.length} note(s). ` +
    `${flyingDressExperiences.length} experiences, ${packages.length} packages, ${rentalServices.length} rentals.`
);
console.log(
  "Notes are for a human to judge. This script counts words; it cannot tell you whether they are the right ones."
);

if (errors.length) process.exit(1);
