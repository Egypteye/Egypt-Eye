// Local fallback for the /about page — used until the "About Page" singleton
// in Sanity is filled in, and as the seed data pushed there by the one-time
// migration (src/app/api/migrate/route.ts).
import type { ResolvedAboutPage } from "./types";

export const aboutPage: ResolvedAboutPage = {
  heroEyebrow: "About Us",
  heroHeadline: "More Than a Travel Agency",
  heroImage: {
    tone: "giza",
    image: "/photos/pexels-35549794.jpg",
  },
  storyEyebrow: "Our Story",
  storyTitle: "We turn a trip to Egypt into a personalized, memorable experience",
  whatWeDoEyebrow: "What We Do",
  whatWeDoTitle: "Travel + Photography + Personalization + Hospitality",
  whatWeDoDescription:
    "Four pillars, one team, delivered on every trip — from a two-hour photoshoot to a ten-day private journey.",
};
