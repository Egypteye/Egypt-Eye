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
// Cairo, Luxor and Aswan are Egypt Eye's own photographs, shot on its own
// trips: the Khan el-Khalili lanes, Hatshepsut's temple, a Nubian village
// above Aswan. They carry no credit because there is nobody to credit — see
// `credit` below. The remaining seven are Unsplash photos picked for that
// specific place, several by photographers based in the city they shot. All
// ten are different photos, and none is reused by the activity heroes in
// ./activities.ts.
//
// A photo uploaded in Studio under Site Settings > Destinations panel photos
// still wins for that destination — see getSiteSettings() in sanity/fetchers.ts,
// which merges name by name rather than replacing the whole list.

export type DestinationPhoto = {
  /** Must match a destination `name` in ./destinations.ts exactly. */
  name: string;
  image: SanityImage;
  /**
   * Required for a stock photo, absent for one of Egypt Eye's own. Attribution
   * is a condition of the Unsplash licence, so an Unsplash entry must carry
   * it; a photograph the business owns has no third party to attribute, and
   * inventing a credit line for it would be worse than having none.
   *
   * Nothing renders this today — `check-destination-photos.mts` is what keeps
   * an Unsplash entry from quietly losing it.
   */
  credit?: UnsplashCredit;
};

// Rendered in a 4:5 tile, so 1200px wide is more than enough.
const TILE_WIDTH = 1200;

export const destinationPhotos: DestinationPhoto[] = [
  {
    name: "Cairo",
    // Egypt Eye's own: a lane in Khan el-Khalili under hanging lanterns.
    image: "/photos/destinations/cairo-khan-el-khalili.jpg",
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
    // Egypt Eye's own: the colonnades of Hatshepsut's temple at Deir el-Bahari.
    image: "/photos/destinations/luxor-hatshepsut.jpg",
  },
  {
    name: "Aswan",
    // Egypt Eye's own: painted stairs in a Nubian village above Aswan.
    image: "/photos/destinations/aswan-nubian-village.jpg",
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
