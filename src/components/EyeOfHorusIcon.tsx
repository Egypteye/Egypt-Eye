// Stylized Eye of Horus (Wedjat) mark — the site logo glyph. Hand-drawn as
// SVG rather than a raster image so it stays crisp at any size (navbar,
// footer, favicon). Swap for the finished brand logo file whenever it's
// ready to hand off — see README.
export function EyeOfHorusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 34 C 30 12, 85 10, 112 28"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M10 55 C 30 35, 90 35, 112 52 C 95 66, 70 72, 55 72 C 35 72, 18 66, 10 55 Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="55" cy="53" r="9" fill="currentColor" />
      <path d="M104 56 L120 88 L110 91 L95 60 Z" fill="currentColor" />
      <path
        d="M28 70 C 18 78, 16 90, 26 96 C 34 100, 42 96, 40 88 C 39 83, 33 82, 31 86"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
