// Stylized Eye of Horus (Wedjat) mark — the site logo glyph. Hand-traced as
// SVG rather than a raster image so it stays crisp at any size (navbar,
// footer, favicon). This session can only *see* images pasted into chat, not
// save them as files, so the real brand artwork couldn't be extracted —
// swap this for the finished logo file whenever it's ready; see README.
export function EyeOfHorusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Eyebrow — tapered ribbon */}
      <path
        d="M18 46
           C 42 20, 82 6, 118 10
           C 144 13, 165 22, 180 34
           C 166 29, 148 25, 128 27
           C 96 30, 58 43, 32 58
           Z"
        fill="currentColor"
      />

      {/* Eye lid band — outer + inner almond outlines combined with evenodd
          to punch a true transparent hole (works on any background) */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 64
           C 36 44, 76 34, 108 35
           C 136 36, 160 44, 178 56
           L 194 48
           L 198 60
           L 182 66
           C 162 76, 134 84, 104 84
           C 70 84, 38 76, 18 64
           Z
           M30 63
           C 46 50, 78 43, 105 44
           C 130 45, 150 51, 165 59
           C 150 66, 128 72, 104 73
           C 76 73, 48 68, 30 63
           Z"
      />

      {/* Pupil */}
      <circle cx="103" cy="60" r="15" fill="currentColor" />

      {/* Falcon cheek marking */}
      <path d="M178 64 L200 122 L186 126 L166 70 Z" fill="currentColor" />

      {/* Teardrop sweep into the spiral */}
      <path
        d="M62 78
           C 46 88, 34 100, 34 114
           C 34 128, 45 139, 59 139
           C 71 139, 79 130, 76 119
           C 74 111, 65 107, 58 111
           C 53 114, 52 120, 55 124"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
