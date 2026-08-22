import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import type { StoryBodyBlock } from "@/content/types";
import { urlForImage } from "@/sanity/image";
import { Gallery } from "./Gallery";
import { EventCountdown } from "./EventCountdown";
import { SignatureExperienceCard } from "./SignatureExperienceCard";

const CALLOUT_STYLES: Record<string, string> = {
  Info: "border-gold/30 bg-sand-dim",
  Safety: "border-terracotta/40 bg-terracotta/10",
  Highlight: "border-gold/50 bg-gold/10",
};

function videoEmbedSrc(url: string): string | null {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const src = urlForImage(value)?.width(1400).url();
      if (!src) return null;
      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={value.caption || ""} className="w-full rounded-2xl" />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-ink-soft/55">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
    quoteBlock: ({ value }) => (
      <blockquote className="my-10 border-l-2 border-gold pl-6">
        <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">&ldquo;{value.quote}&rdquo;</p>
        {value.attribution && (
          <cite className="mt-3 block text-sm not-italic text-ink-soft/60">— {value.attribution}</cite>
        )}
      </blockquote>
    ),
    calloutBlock: ({ value }) => (
      <div className={`my-8 rounded-2xl border p-6 ${CALLOUT_STYLES[value.tone] ?? CALLOUT_STYLES.Info}`}>
        {value.title && <p className="font-display text-lg font-semibold text-ink">{value.title}</p>}
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft/80">{value.body}</p>
      </div>
    ),
    galleryBlock: ({ value }) =>
      value.images && value.images.length > 0 ? (
        <div className="my-10">
          <Gallery images={value.images} alt="Gallery" />
        </div>
      ) : null,
    videoEmbedBlock: ({ value }) => {
      const src = videoEmbedSrc(value.url);
      if (!src) return null;
      return (
        <figure className="my-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink">
            <iframe
              src={src}
              title={value.caption || "Embedded video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-ink-soft/55">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
    countdownBlock: ({ value }) =>
      value.event ? (
        <div className="not-prose my-10">
          <EventCountdown event={value.event} />
        </div>
      ) : null,
    experienceCardBlock: ({ value }) =>
      value.experience ? (
        <div className="not-prose my-12 rounded-3xl border border-gold/20 bg-sand-dim p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
            {value.eyebrow || "Want to Experience It?"}
          </p>
          <div className="mt-5 max-w-sm">
            <SignatureExperienceCard experience={value.experience} />
          </div>
        </div>
      ) : null,
    ctaBlock: ({ value }) => (
      <div className="not-prose my-10 rounded-2xl bg-ink px-8 py-10 text-center">
        {value.title && <p className="font-display text-xl font-semibold text-cream">{value.title}</p>}
        {value.body && <p className="mt-2 text-cream/70">{value.body}</p>}
        {value.buttonLabel && value.buttonHref && (
          <Link
            href={value.buttonHref}
            className="mt-5 inline-block rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
          >
            {value.buttonLabel}
          </Link>
        )}
      </div>
    ),
  },
};

export function StoryBody({ body }: { body: StoryBodyBlock[] }) {
  return (
    <div className="prose prose-lg max-w-none text-ink-soft/85 prose-headings:font-display prose-headings:text-ink prose-a:text-gold-dark prose-strong:text-ink">
      <PortableText value={body} components={components} />
    </div>
  );
}
