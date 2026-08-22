import Link from "next/link";
import type { SignatureExperience } from "@/content/types";
import { SmartImage } from "./SmartImage";

// Deliberately editorial, not a standard tour-package card: a tall
// full-bleed photo, a "who it's for" eyebrow instead of a price-first
// layout, and a quiet text CTA rather than a button — so a Signature
// Experience reads as curated rather than "one more package to compare."
export function SignatureExperienceCard({ experience }: { experience: SignatureExperience }) {
  const isComingSoon = experience.status === "comingSoon";

  return (
    <Link
      href={`/signature-experiences/${experience.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-cream shadow-sm shadow-black/5 transition hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative">
        <SmartImage
          image={experience.heroImage}
          tone={experience.heroImageTone}
          alt={experience.name}
          className="aspect-[4/5] w-full transition duration-700 ease-out group-hover:scale-[1.03]"
        />
        {isComingSoon && (
          <span className="absolute left-5 top-5 rounded-full bg-cream/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink">
            Coming Soon
          </span>
        )}
        {experience.luxuryLevel && (
          <span className="absolute right-5 top-5 rounded-full bg-ink/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-cream backdrop-blur-sm">
            {experience.luxuryLevel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-2 py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
          {experience.forWhom}
        </p>
        <h3 className="font-display text-2xl font-semibold leading-tight text-ink">
          {experience.name}
        </h3>
        <p className="text-[15px] leading-relaxed text-ink-soft/75">
          {experience.shortDescription}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft/60">
          {experience.duration && <span>{experience.duration}</span>}
          {experience.groupSize && <span>{experience.groupSize}</span>}
        </div>

        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink transition group-hover:gap-3">
          Discover the experience
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
