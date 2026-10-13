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
