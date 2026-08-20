// Local fallback for the /about page — used until the "About Page" singleton
// in Sanity is filled in, and as the seed data pushed there by the one-time
// migration (src/app/api/migrate/route.ts).
import type { ResolvedAboutPage } from "./types";

export const aboutPage: ResolvedAboutPage = {
  heroEyebrow: "About Us",
  heroHeadline: "More Than a Travel Agency",
  heroImage: { tone: "giza" },
  storyEyebrow: "Our Story",
  storyTitle: "We turn a trip to Egypt into a personalized, memorable experience",
  whatWeDoEyebrow: "What We Do",
  whatWeDoTitle: "Travel + Photography + Personalization + Hospitality",
  whatWeDoDescription:
    "Four pillars, one team, delivered on every single trip — whether it's a two-hour photoshoot or a ten-day private journey.",
  teamEyebrow: "Meet the Team",
  teamTitle: "The people behind your trip",
  teamDescription:
    "Our travelers consistently mention the team by name — friendly, safe, flexible, and always reachable. Here are a few of the faces you might meet.",
  teamMembers: [
    "Fady",
    "Beshoy",
    "Jonathan",
    "Marco",
    "Yousif",
    "Michael",
    "Mena",
    "Tommy",
    "David",
    "Mark",
    "Bavly",
    "George",
    "Bahi",
  ],
};
