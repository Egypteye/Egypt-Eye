/**
 * The media kit a creator must send with a collaboration application.
 *
 * The Collaborations team cannot judge reach, engagement or content quality
 * from a handle and a follower count, so the application now asks for a media
 * kit. Creators keep theirs in two different shapes — a PDF on their laptop,
 * or a link to Drive, Dropbox or their own site — and demanding one shape
 * would turn away half of them. So both are accepted and exactly one is
 * required.
 *
 * Pure, and in its own module, for the reason CLAUDE.md gives: the route that
 * uses this imports `server-only` code, which puts it out of reach of the
 * check scripts. The rules below are the part worth testing, so they live
 * where scripts/check-media-kit.mts can execute them rather than grep for
 * them.
 *
 * Nothing here touches the network or the filesystem. It takes the facts
 * about a submission and returns a decision.
 */

/**
 * 10 MB. A media kit is a design-heavy PDF — full-bleed photographs, a
 * case study per page — and the 8 MB used for a single commission photograph
 * rejects real ones. Above this it is a portfolio export, and the link field
 * is the right answer.
 */
export const MEDIA_KIT_MAX_BYTES = 10 * 1024 * 1024;

/** Only PDF. A .docx or .key media kit is not something the team can open reliably. */
export const MEDIA_KIT_MIME = "application/pdf";

/** What the applicant is told the limit is, so the form and the API agree. */
export const MEDIA_KIT_MAX_LABEL = "10 MB";

export type MediaKitInput = {
  /** The chosen file, if one was attached. Size in bytes, type as reported. */
  file?: { type: string; size: number } | null;
  /** The typed link, exactly as entered. */
  link?: string | null;
};

export type MediaKitDecision =
  | { ok: true; mode: "file" | "link" | "both"; link: string | null }
  | { ok: false; error: string };

/**
 * Whether a link is one the team can safely open from the admin page.
 *
 * Deliberately protocol-first. The admin detail page renders this as an
 * `href`, so a `javascript:` or `data:` URL submitted here would be a stored
 * cross-site scripting hole aimed squarely at the one account that can read
 * every application. Only http and https are allowed through; a bare
 * `drive.google.com/...` with no scheme is upgraded rather than rejected,
 * because typing the scheme is not something most people do.
 */
export function normaliseMediaKitLink(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  // A hostname with no dot is a local name, not somewhere the team can reach:
  // "localhost", or a typo like "https://drive" that would otherwise pass.
  if (!url.hostname.includes(".")) return null;
  // Trailing dot is legal DNS but reads as a typo and breaks some clients.
  if (url.hostname.endsWith(".")) return null;

  return url.toString();
}

/**
 * Validates the media kit half of a collaboration application.
 *
 * Returns the normalised link alongside the decision so the caller stores the
 * cleaned value rather than the raw one — the route would otherwise have to
 * repeat the parsing and could disagree with this function about the result.
 */
export function validateMediaKit(input: MediaKitInput): MediaKitDecision {
  const file = input.file ?? null;
  const hasFile = file !== null && file.size > 0;
  const link = normaliseMediaKitLink(input.link ?? "");
  const linkWasTyped = (input.link ?? "").trim() !== "";

  // A typed-but-unusable link is always an error, even when a valid file was
  // also attached. Silently dropping it would leave the applicant believing
  // the team had a link they do not have.
  if (linkWasTyped && link === null) {
    return { ok: false, error: "That media kit link doesn't look like a valid web address." };
  }

  if (!hasFile && link === null) {
    return {
      ok: false,
      error: "A media kit is required — either upload a PDF or paste a link to it.",
    };
  }

  if (hasFile) {
    if (file.type !== MEDIA_KIT_MIME) {
      return { ok: false, error: "The media kit file must be a PDF." };
    }
    if (file.size > MEDIA_KIT_MAX_BYTES) {
      return {
        ok: false,
        error: `That PDF is over ${MEDIA_KIT_MAX_LABEL}. Upload a smaller one, or paste a link to it instead.`,
      };
    }
  }

  return { ok: true, mode: hasFile ? (link ? "both" : "file") : "link", link };
}

/**
 * The bucket a media kit PDF is stored in.
 *
 * Here rather than in the route because three places need to agree on it:
 * the route that mints an upload URL, the route that records the path, and
 * the nightly sweep that deletes the file.
 */
export const MEDIA_KIT_BUCKET = "collaboration-media-kits";

/** Where a newly uploaded kit goes. Year-foldered so the bucket stays listable. */
export function newMediaKitPath(uuid: string, now: Date = new Date()): string {
  return `${now.getUTCFullYear()}/${uuid}.pdf`;
}

/**
 * Whether a path the BROWSER handed back is one we actually minted.
 *
 * The PDF is uploaded straight from the browser to storage — Vercel caps a
 * function's request body at 4.5 MB, far below a real media kit, so the file
 * cannot travel through the API at all. The browser therefore reports its own
 * object path when it submits the application, and a submitted path is
 * attacker-controlled input.
 *
 * Storage itself stops the dangerous half: the bucket is private, accepts
 * only application/pdf, caps size, and the upload token is bound to one
 * path. This guards the rest — a path claiming to be a folder, an escape
 * sequence, or someone else's object. Anything that is not exactly
 * `<4-digit-year>/<uuid>.pdf` is refused, so no submitted string can point
 * outside the shape this code creates.
 */
const MEDIA_KIT_PATH_RE =
  /^[0-9]{4}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/;

export function isMediaKitPath(value: string): boolean {
  return MEDIA_KIT_PATH_RE.test(value);
}
