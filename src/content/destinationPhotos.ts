import type { SanityImage } from "./types";
import { unsplashCredit, unsplashUrl, type UnsplashCredit } from "./unsplash";

// The photos behind the homepage Destinations grid.
//
// WHY THIS FILE EXISTS: the grid used to fall back to the linked tour's photo
// whenever Site Settings had no override, and Red Sea, Sharm El Sheikh and
// Hurghada all link to the same tour (`red-sea-relaxation`) — so all three
// tiles showed the identical picture. Giving every destination its own photo
// here fixes that at the source rather than by re-pointing the tours.
//
// Each entry is an Unsplash photo picked for that specific place: the Cairo
// Tower over the Nile, the Sphinx, Qaitbay's citadel in Alexandria, Karnak in
// Luxor, the Treasury at Petra. Several are by photographers based in the city
// they shot. All ten are different photos, and none of them is reused by the
// activity heroes in ./activities.ts.
//
// A photo uploaded in Studio under Site Settings > Destinations panel photos
// still wins for that destination — see getSiteSettings() in sanity/fetchers.ts,
// which merges name by name rather than replacing the whole list.

export type DestinationPhoto = {
  /** Must match a destination `name` in ./destinations.ts exactly. */
  name: string;
  image: SanityImage;
  credit: UnsplashCredit;
};

// Rendered in a 4:5 tile, so 1200px wide is more than enough.
const TILE_WIDTH = 1200;

export const destinationPhotos: DestinationPhoto[] = [
  {
    name: "Cairo",
    // A felucca on the Nile with the Cairo Tower behind it.
    image: unsplashUrl("photo-1719659018185-8a239c35fb4a", TILE_WIDTH),
    credit: unsplashCredit(
      "Hatem Ramadan",
      "https://unsplash.com/photos/felucca-on-nile-river-in-cairo-59RY-ykUIAg"
    ),
  },
  {
    name: "Giza",
    // The Great Sphinx with the Great Pyramid behind it.
    image: unsplashUrl("photo-1568322445389-f64ac2515020", TILE_WIDTH),
    credit: unsplashCredit(
      "Alex Azabache",
      "https://unsplash.com/photos/great-sphinx-and-great-pyramid-giza-MoonoldXeqs"
    ),
  },
  {
    name: "Alexandria",
    // The Citadel of Qaitbay, built on the ruins of the Pharos lighthouse.
    image: unsplashUrl("photo-1682090471391-413a38705abe", TILE_WIDTH),
    credit: unsplashCredit(
      "Ali Desouky",
      "https://unsplash.com/photos/a-stone-castle-with-a-flag-on-top-of-it-QgTO9IxG9DQ"
    ),
  },
  {
    name: "Red Sea",
    // Coral and a sea fan on Elphinstone reef.
    image: unsplashUrl("photo-1633205719979-e47958ff6d93", TILE_WIDTH),
    credit: unsplashCredit(
      "Pascal van de Vendel",
      "https://unsplash.com/photos/an-underwater-view-of-a-coral-reef-and-a-sea-fan-CNdMGaVEozQ"
    ),
  },
  {
    name: "Luxor",
    // Karnak Temple.
    image: unsplashUrl("photo-1678640982613-70150a406d0a", TILE_WIDTH),
    credit: unsplashCredit(
      "Nemanja Raca",
      "https://unsplash.com/photos/a-statue-of-an-egyptian-god-next-to-a-pillar-1FsIxaKwCuY"
    ),
  },
  {
    name: "Aswan",
    // The Nile at Aswan, shot by a photographer based there.
    image: unsplashUrl("photo-1603756997808-3e38bf152283", TILE_WIDTH),
    credit: unsplashCredit(
      "Abdullah Omar",
      "https://unsplash.com/photos/white-boat-on-water-near-bridge-during-daytime-wU6S5-pMlns"
    ),
  },
  {
    name: "Siwa Oasis",
    // Palms against dunes — the oasis-in-the-sand-sea look.
    image: unsplashUrl("photo-1770557386874-739c55a381f3", TILE_WIDTH),
    credit: unsplashCredit(
      "bader Abdullah",
      "https://unsplash.com/photos/palm-trees-grow-in-a-desert-oasis-with-sand-dunes-_aD2TglKSf0"
    ),
  },
  {
    name: "Sharm El Sheikh",
    // Palms and shallow water on the South Sinai coast.
    image: unsplashUrl("photo-1665643956022-ee053e925743", TILE_WIDTH),
    credit: unsplashCredit(
      "Omar Elsharawy",
      "https://unsplash.com/photos/a-beach-with-palm-trees-and-a-body-of-water-Figb0H3ExRw"
    ),
  },
  {
    name: "Hurghada",
    // The bay with the town behind it.
    image: unsplashUrl("photo-1730111105840-1b856b5dce60", TILE_WIDTH),
    credit: unsplashCredit(
      "Jayde Keroi",
      "https://unsplash.com/photos/a-large-body-of-water-with-a-city-in-the-background-lpWl7cc5ag4"
    ),
  },
  {
    name: "Jordan",
    // The Treasury at Petra.
    image: unsplashUrl("photo-1579606032821-4e6161c81bd3", TILE_WIDTH),
    credit: unsplashCredit(
      "Juanma Clemente-Alloza",
      "https://unsplash.com/photos/brown-camel-in-front-of-brown-rock-formation-during-daytime-py8omnp-hko"
    ),
  },
];
