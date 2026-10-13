import { existsSync } from "node:fs";
import path from "node:path";

/**
 * The brand logo, if its files have been added.
 *
 * SERVER ONLY — it touches the filesystem, so it is resolved in the layout
 * (a Server Component) and the result is passed down to the header and footer
 * as plain props. Importing this from a client component would break the
 * bundle.
 *
 * WHY A FILESYSTEM CHECK RATHER THAN A HARDCODED PATH
 *
 * The owner supplied the logo as images in conversation, which does not put
 * them in the repository. Referencing the paths unconditionally would ship two
 * broken images across every page; leaving the logo out entirely would mean
 * another code change later. So the paths are checked once at render: present
 * and they are used, absent and the typeset wordmark is used instead.
 *
 * Dropping the two files in is therefore the whole task — no code change, no
 * deploy configuration, nothing to remember.
 */

export type BrandLogo = {
  /** For light backgrounds — the header. */
  dark: string | null;
  /** For dark backgrounds — the footer. */
  light: string | null;
};

const DARK = "/brand/flying-dresses-logo.png";
const LIGHT = "/brand/flying-dresses-logo-light.png";

function has(publicPath: string): boolean {
  try {
    return existsSync(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")));
  } catch {
    return false;
  }
}

export function brandLogo(): BrandLogo {
  return {
    dark: has(DARK) ? DARK : null,
    // A light version is only useful if it exists; otherwise the dark one is
    // NOT substituted, because a dark logo on an ink footer is invisible.
    light: has(LIGHT) ? LIGHT : null,
  };
}

export const LOGO_PATHS = { dark: DARK, light: LIGHT };

/**
 * The social share image (og:image), if it has been added.
 *
 * The owner has brand covers — flowing silk on a warm brown, with the name
 * set over it — which is exactly what a share card should be: it is the image
 * that represents the brand when a link is pasted into WhatsApp, Instagram,
 * Facebook or a message. Without one, every shared link to this site renders
 * as a bare grey rectangle with a URL under it, which is a conversion loss on
 * the channel this business actually sells through.
 *
 * Same file-drop pattern as the logo, and the same reasoning: referencing a
 * path that is not there would advertise a broken image in every link preview,
 * which is worse than advertising none.
 *
 * 1200x630 is the size to export at. A square cover will be centre-cropped by
 * most platforms; exporting at the right ratio keeps the name off the crop.
 */
const COVER = "/brand/flying-dresses-cover.jpg";

export function brandCover(): string | null {
  return has(COVER) ? COVER : null;
}

export const COVER_PATH = COVER;
