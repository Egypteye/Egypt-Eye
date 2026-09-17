// A small, hand-drawn set of Egyptian-motif glyph icons shared by the
// Hieroglyph Wheels, Scarab Path, and Eye of Ra Threshold puzzles — plain
// inline SVG (no icon font / Unicode hieroglyph block dependency, which has
// patchy cross-device font support) so it renders identically everywhere.

export const GLYPH_COUNT = 6;

export function Glyph({ index, className = "" }: { index: number; className?: string }) {
  const paths = [
    // Eye (Eye of Ra motif, simplified)
    <g key="eye">
      <path d="M4 16c4-6 10-9 12-9s8 3 12 9c-4 6-10 9-12 9s-8-3-12-9Z" />
      <circle cx="16" cy="16" r="4" fill="currentColor" stroke="none" />
      <path d="M12 24l-2 4M20 24l2 4" strokeLinecap="round" />
    </g>,
    // Ankh
    <g key="ankh">
      <circle cx="16" cy="8" r="5" />
      <path d="M16 13v15M9 19h14" strokeLinecap="round" />
    </g>,
    // Sun disc with rays
    <g key="sun">
      <circle cx="16" cy="16" r="6" />
      <path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M25 7l-3 3M10 22l-3 3" strokeLinecap="round" />
    </g>,
    // Scarab (simple beetle silhouette)
    <g key="scarab">
      <ellipse cx="16" cy="18" rx="8" ry="9" />
      <path d="M16 9V6M11 8l-2-3M21 8l2-3M8 18H4M28 18h-4M9 25l-3 3M23 25l3 3" strokeLinecap="round" />
      <path d="M16 9v18" />
    </g>,
    // Water / Nile zigzag
    <g key="water">
      <path d="M4 11c3-3 6 3 9 0s6 3 9 0 6 3 9 0" strokeLinecap="round" />
      <path d="M4 18c3-3 6 3 9 0s6 3 9 0 6 3 9 0" strokeLinecap="round" />
      <path d="M4 25c3-3 6 3 9 0s6 3 9 0 6 3 9 0" strokeLinecap="round" />
    </g>,
    // Falcon / bird (Horus motif, simplified)
    <g key="falcon">
      <path d="M16 6c3 0 5 3 5 6 3 1 7 4 7 4-4 1-6 0-6 0 1 3 0 6-2 8 1 2 1 4 1 4h-10s0-2 1-4c-2-2-3-5-2-8 0 0-2 1-6 0 0 0 4-3 7-4 0-3 2-6 5-6Z" />
    </g>,
  ];

  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      {paths[index % paths.length]}
    </svg>
  );
}
