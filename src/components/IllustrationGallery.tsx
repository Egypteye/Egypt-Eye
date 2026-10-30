import Image from "next/image";
import type { Illustration } from "@/content/illustrations";

/**
 * A gallery of generated illustrations, labelled on every frame.
 *
 * The label is drawn ON each image rather than once under the group, because
 * a group caption stops being attached to the picture the moment anybody
 * screenshots, shares or right-clicks one — which is most of how images
 * travel. A badge on the frame travels with it.
 *
 * It is deliberately not a faint watermark. The point is that a reader
 * deciding whether to book knows which pictures are photographs of the place
 * and which are not, so it has the same contrast as any other UI label.
 *
 * `sizes` matters here: these render three-up on a desktop grid and one-up on
 * a phone, so without it Next would serve the widest candidate to a 390px
 * screen for all six.
 */
export function IllustrationGallery({
  illustrations,
  heading,
  note,
  label,
}: {
  illustrations: Illustration[];
  heading: string;
  note: string;
  /**
   * The badge text, already translated. Falls back to the registry's own
   * `disclosure` so the label survives even if a caller forgets to pass it —
   * an untranslated badge is a bug, a missing one is a misrepresentation.
   */
  label?: string;
}) {
  if (illustrations.length === 0) return null;

  return (
    <figure className="m-0">
      <figcaption className="mb-6">
        <h3 className="font-display text-2xl text-ink">{heading}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{note}</p>
      </figcaption>

      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {illustrations.map((ill) => (
          <li key={ill.src} className="relative overflow-hidden rounded-2xl">
            <Image
              src={ill.src}
              alt={ill.alt}
              width={900}
              height={1200}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
            <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cream backdrop-blur-sm">
              {label ?? ill.disclosure}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
