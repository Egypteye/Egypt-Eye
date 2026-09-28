// Turning an exported review file into importable records.
//
// Reviews arrive two ways. Typed by hand, a block per review separated by
// `---`, which is what the Studio tool originally took. Or exported in bulk
// from a platform as CSV, which is how a real backlog actually shows up — 476
// Tripadvisor reviews are not going to be retyped.
//
// The logic lives here rather than inside the Studio component so it can be
// asserted by scripts/check-reviews.mts. Every rule below is about not
// inventing data: an export's gaps stay gaps, and the only thing that is ever
// transformed is a date format.

export type ParsedReview = {
  name: string;
  quote: string;
  context?: string;
  title?: string;
  source: string;
  url?: string;
  date?: string;
  score?: number;
};

export type ParseIssue = { block: string; reason: string };

export const PLATFORMS = ["direct", "tripadvisor", "airbnb", "google", "viator", "getyourguide"];

/**
 * Values an export uses to mean "we didn't capture this".
 *
 * Treated as absent rather than imported as literal text — otherwise a review
 * ends up dated "Not provided" and linked to nowhere.
 */
const ABSENT = new Set(["", "-", "—", "n/a", "na", "null", "none", "not provided", "not available"]);

export function isAbsent(value: string | undefined): boolean {
  return value === undefined || ABSENT.has(value.trim().toLowerCase());
}

function clean(value: string | undefined): string | undefined {
  if (isAbsent(value)) return undefined;
  return value!.trim();
}

/**
 * RFC 4180 CSV, because the real files need it.
 *
 * Review text routinely contains commas, quotes and — the one that breaks
 * naive line splitting — hard newlines, so a row is not a line. The
 * Tripadvisor export that prompted this has 476 reviews across 558 lines.
 */
export function parseCsv(input: string): string[][] {
  const s = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

const HEADER_ALIASES: Record<string, string> = {
  name: "name",
  reviewer: "name",
  author: "name",
  quote: "quote",
  review: "quote",
  text: "quote",
  body: "quote",
  context: "context",
  tour: "context",
  product: "context",
  experience: "context",
  title: "title",
  headline: "title",
  subject: "title",
  source: "source",
  platform: "source",
  url: "url",
  link: "url",
  date: "date",
  reviewed: "date",
  score: "score",
  rating: "score",
  stars: "score",
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * A review date, normalised to the first of the month it was written in.
 *
 * Platforms give month precision at best ("August 2026") and often only a
 * relative string ("3 weeks ago"). Neither carries a day, so storing one would
 * be inventing it. The site displays a review date as month and year only, so
 * first-of-month renders exactly right while asserting nothing that wasn't in
 * the export.
 *
 * Anything that can't be read confidently returns undefined — a review with no
 * date is honest; a guessed one is not.
 */
export function normalizeReviewDate(raw: string | undefined, now = new Date()): string | undefined {
  const value = clean(raw);
  if (!value) return undefined;

  const firstOfMonth = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;

  // Already a full date — trust it exactly as given.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // Year and month only.
  const ym = value.match(/^(\d{4})-(\d{2})$/);
  if (ym) return `${ym[1]}-${ym[2]}-01`;

  // "August 2026", "Aug 2026".
  const monthYear = value.match(/^([A-Za-z]{3,})\.?\s+(\d{4})$/);
  if (monthYear) {
    const idx = MONTHS.findIndex((m) => m.startsWith(monthYear[1].toLowerCase()));
    if (idx >= 0) return `${monthYear[2]}-${String(idx + 1).padStart(2, "0")}-01`;
  }

  // "3 weeks ago", "yesterday", "today".
  const rel = value.toLowerCase();
  if (rel === "today" || rel === "yesterday") return firstOfMonth(now);
  const ago = rel.match(/^(a|an|\d+)\s+(day|week|month|year)s?\s+ago$/);
  if (ago) {
    const n = ago[1] === "a" || ago[1] === "an" ? 1 : Number(ago[1]);
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (ago[2] === "day") d.setUTCDate(d.getUTCDate() - n);
    else if (ago[2] === "week") d.setUTCDate(d.getUTCDate() - n * 7);
    else if (ago[2] === "month") d.setUTCMonth(d.getUTCMonth() - n);
    else d.setUTCFullYear(d.getUTCFullYear() - n);
    return firstOfMonth(d);
  }

  return undefined;
}

/**
 * A leading apostrophe is Excel's "treat this as text" escape, not part of
 * anyone's name. Stripping it repairs a transport artefact; nothing else about
 * a name is ever touched.
 */
function cleanName(value: string): string {
  return value.trim().replace(/^'+/, "").trim();
}

function validate(
  fields: { [k: string]: string | undefined },
  label: string,
  defaultUrl: string | undefined,
  now: Date
): { review?: ParsedReview; issue?: ParseIssue } {
  const name = fields.name ? cleanName(fields.name) : "";
  const quote = clean(fields.quote);

  if (!name) return { issue: { block: label, reason: "No reviewer name" } };
  if (!quote) return { issue: { block: label, reason: "No review text" } };

  const source = (clean(fields.source) ?? "direct").toLowerCase();
  if (!PLATFORMS.includes(source)) {
    return { issue: { block: label, reason: `Source "${source}" isn't one of: ${PLATFORMS.join(", ")}` } };
  }

  // The rule this importer refuses to bend. A review copied from another
  // platform with no link back is an unverifiable claim about someone else's
  // words, and quoting-with-attribution is the only defensible way to show
  // content that platform owns. `defaultUrl` lets one listing link cover a
  // whole export — the review still points at where it can be read.
  const url = clean(fields.url) ?? (source !== "direct" ? defaultUrl : undefined);
  if (source !== "direct" && !url) {
    return {
      issue: {
        block: label,
        reason: `A ${source} review needs a link to the original. Add a Url, or set the fallback link above.`,
      },
    };
  }

  const rawScore = clean(fields.score);
  let score: number | undefined;
  if (rawScore !== undefined) {
    const n = Number(rawScore);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      return { issue: { block: label, reason: `Score "${rawScore}" isn't a number from 1 to 5` } };
    }
    score = n;
  }

  return {
    review: {
      name,
      quote,
      context: clean(fields.context),
      title: clean(fields.title),
      source,
      url,
      date: normalizeReviewDate(fields.date, now),
      score,
    },
  };
}

function parseCsvReviews(raw: string, defaultUrl: string | undefined, now: Date) {
  const rows = parseCsv(raw);
  const reviews: ParsedReview[] = [];
  const issues: ParseIssue[] = [];
  if (rows.length === 0) return { reviews, issues };

  const header = rows[0].map((h) => HEADER_ALIASES[h.trim().toLowerCase().replace(/[\s_]+/g, "")] ?? "");

  for (let r = 1; r < rows.length; r++) {
    const fields: { [k: string]: string | undefined } = {};
    header.forEach((key, i) => {
      if (key) fields[key] = rows[r][i];
    });
    const label = (fields.name ?? "") + " — " + (fields.quote ?? "").slice(0, 40);
    const { review, issue } = validate(fields, label.trim(), defaultUrl, now);
    if (review) reviews.push(review);
    else if (issue) issues.push(issue);
  }
  return { reviews, issues };
}

function parseBlockReviews(raw: string, defaultUrl: string | undefined, now: Date) {
  const blocks = raw
    .split(/\n\s*---\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const reviews: ParsedReview[] = [];
  const issues: ParseIssue[] = [];

  for (const block of blocks) {
    const fields: { [k: string]: string | undefined } = {};
    let currentKey: string | null = null;

    for (const line of block.split("\n")) {
      const match = line.match(
        /^\s*(name|reviewer|author|quote|review|text|context|tour|product|title|headline|source|platform|url|link|date|score|rating|stars)\s*:\s*(.*)$/i
      );
      if (match) {
        currentKey = HEADER_ALIASES[match[1].toLowerCase()] ?? null;
        if (currentKey) fields[currentKey] = match[2].trim();
      } else if (currentKey && line.trim()) {
        fields[currentKey] = `${fields[currentKey] ?? ""}\n${line.trim()}`.trim();
      }
    }

    const label = block.length > 60 ? block.slice(0, 60) + "…" : block;
    const { review, issue } = validate(fields, label, defaultUrl, now);
    if (review) reviews.push(review);
    else if (issue) issues.push(issue);
  }
  return { reviews, issues };
}

/** True when the text looks like a CSV export rather than typed blocks. */
export function looksLikeCsv(raw: string): boolean {
  const firstLine = raw.trimStart().split("\n")[0] ?? "";
  if (!firstLine.includes(",")) return false;
  const cells = parseCsv(firstLine)[0] ?? [];
  const known = cells.filter((c) => HEADER_ALIASES[c.trim().toLowerCase().replace(/[\s_]+/g, "")]);
  return known.length >= 2;
}

/** Reads either format, picking automatically. */
export function parseReviewInput(
  raw: string,
  options: { defaultUrl?: string; now?: Date } = {}
): { reviews: ParsedReview[]; issues: ParseIssue[]; format: "csv" | "blocks" } {
  const defaultUrl = options.defaultUrl?.trim() || undefined;
  const now = options.now ?? new Date();
  if (looksLikeCsv(raw)) {
    return { ...parseCsvReviews(raw, defaultUrl, now), format: "csv" };
  }
  return { ...parseBlockReviews(raw, defaultUrl, now), format: "blocks" };
}
