import type { ReactNode } from "react";

// Tone-based gradient placeholders standing in for real photography.
// Swap these out for actual photos later — see README for how images are wired.

const TONES: Record<string, string> = {
  giza: "from-[#8a6a2e] via-[#c8973f] to-[#e6cf9a]",
  nile: "from-[#062f31] via-[#0f4a4d] to-[#16686c]",
  desert: "from-[#7a3f1d] via-[#b5502b] to-[#e0a15c]",
  luxor: "from-[#3a2a12] via-[#9c7229] to-[#e0b768]",
  jordan: "from-[#5c1f14] via-[#b5502b] to-[#dba05c]",
  redsea: "from-[#04262c] via-[#0f4a4d] to-[#2fa3a8]",
};

export function PlaceholderImage({
  tone,
  label,
  className = "",
  children,
}: {
  tone: keyof typeof TONES | string;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const gradient = TONES[tone] ?? TONES.giza;
  // Only fall back to `relative` when the caller hasn't set their own
  // position utility (e.g. `absolute inset-0` for full-bleed backgrounds) —
  // Tailwind gives same-property utilities equal specificity, so having both
  // `relative` and `absolute` in the class list silently drops one of them.
  const hasPositionOverride = /\b(absolute|fixed|sticky|static)\b/.test(className);
  return (
    <div
      className={`${hasPositionOverride ? "" : "relative"} overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      <div className="absolute inset-0 bg-hieroglyph-pattern opacity-[0.07]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
