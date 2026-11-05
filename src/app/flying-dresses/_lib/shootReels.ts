import type { ReelClip } from "../_components/ProductionReel";

/**
 * The moving footage for each shoot page.
 *
 * TWO KINDS, AND THEY ARE NOT MIXED IN ONE STRIP.
 *
 * `shootReels` are vertical clips the owner supplied on 5 November 2026. Every
 * one of them carries a C2PA manifest reading `c2pa.created` with
 * digitalsourcetype/trainedAlgorithmicMedia and the generator "Runway" — the
 * yacht files still have "Gen-4 Turbo … Runway (Photo to Video)" in their
 * original filenames. They are generated motion, so they live under
 * /video/flying-dresses/shoots/generated/ and every caption says so.
 *
 * `shootAerial` is the opposite and is kept apart for that reason: a real DJI
 * drone pass over Fayoum, 4K HEVC in the original, no C2PA and no generator
 * anywhere in its bytes. It is the only genuine video this brand has, and
 * putting it in the same strip as the generated clips would blur exactly the
 * line the captions are there to hold.
 *
 * All of it is silent. None of the sources carried an audio stream, which is
 * what makes muted autoplay honest here rather than a workaround: there is no
 * soundtrack being withheld, and no third party's music to clear.
 */

const G = "/video/flying-dresses/shoots/generated";
const P = "/photos/flying-dresses/shoots/generated";

/** The caption every generated clip carries. Not optional, not shortened. */
const GENERATED_CAPTION = "Generated motion, art-directed by the owner";

function reel(slug: string, n: number, alt: string): ReelClip {
  const id = `${slug}-reel-${n}`;
  return {
    id,
    mp4: `${G}/${id}.mp4`,
    webm: `${G}/${id}.webm`,
    poster: `${P}/poster-${id}.jpg`,
    width: 720,
    height: 1280,
    alt,
    caption: GENERATED_CAPTION,
  };
}

export const shootReels: Record<string, ReelClip[]> = {
  "white-desert": [1, 2, 3, 4].map((n) =>
    reel("white-desert", n, "A flying dress moving among the white chalk formations")
  ),
  fayoum: [1, 2, 3, 4, 5, 6].map((n) =>
    reel("fayoum", n, "A flying dress moving on the pale dunes of Fayoum")
  ),
  "red-sea-yacht": [1, 2, 3, 4].map((n) =>
    reel("red-sea-yacht", n, "A flying dress moving on the deck of a yacht at sea")
  ),
};

export type AerialPlate = {
  mp4: string;
  poster: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export const shootAerial: Record<string, AerialPlate> = {
  fayoum: {
    mp4: "/video/flying-dresses/shoots/photo/fayoum-aerial.mp4",
    poster: "/photos/flying-dresses/shoots/photo/poster-fayoum-aerial.jpg",
    width: 1280,
    height: 720,
    alt: "An aerial pass over the pale dunes and lakes of Fayoum",
    caption: "Filmed over Fayoum from a drone",
  },
};
