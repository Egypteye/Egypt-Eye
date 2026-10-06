// Next bundles its own copy of path-to-regexp and compiles redirect `source`
// patterns with it. scripts/check-redirects.mts matches URLs against the real
// rules using that same copy, so the check cannot drift from the behaviour it
// is asserting — an approximation of the matcher would be a second opinion,
// and a second opinion is what the check exists to rule out.
//
// The bundled file ships no types AND is CommonJS, so it is imported as a
// default and destructured — a named ESM import type-checks and then fails at
// runtime with "does not provide an export named 'compile'". Hence the default
// export declared below alongside the named ones.
// Types taken from path-to-regexp v6, which is the version Next vendors; if a
// Next upgrade changes that, check-redirects fails loudly rather than silently
// matching nothing, which is the behaviour worth having.
declare module "next/dist/compiled/path-to-regexp/index.js" {
  export type Key = {
    name: string | number;
    prefix: string;
    suffix: string;
    pattern: string;
    /** "" for a single segment, "*" or "+" when it may span several. */
    modifier: string;
  };

  /** Compiles a source pattern, pushing its parameters into `keys`. */
  export function pathToRegexp(path: string, keys?: Key[]): RegExp;

  /** Builds a destination URL from a pattern and the matched parameters. */
  export function compile(
    path: string,
    options?: { validate?: boolean }
  ): (params: Record<string, string | string[]>) => string;

  const pathToRegexpModule: {
    pathToRegexp: typeof pathToRegexp;
    compile: typeof compile;
  };
  export default pathToRegexpModule;
}
