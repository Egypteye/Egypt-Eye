// Local fallback for the /about page — used until the "About Page" singleton
// in Sanity is filled in, and as the seed data pushed there by the one-time
// migration (src/app/api/migrate/route.ts).
import type { ResolvedAboutPage } from "./types";

export const aboutPage: ResolvedAboutPage = {
  heroEyebrow: "About Us",
  heroHeadline: "More Than a Travel Agency",
  heroImage: {
    tone: "giza",
    image: "https://images.unsplash.com/photo-1678038592492-d73c063bb9e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
  },
  storyEyebrow: "Our Story",
  storyTitle: "We turn a trip to Egypt into a personalized, memorable experience",
  whatWeDoEyebrow: "What We Do",
  whatWeDoTitle: "Travel + Photography + Personalization + Hospitality",
  whatWeDoDescription:
    "Four pillars, one team, delivered on every trip — from a two-hour photoshoot to a ten-day private journey.",
};
