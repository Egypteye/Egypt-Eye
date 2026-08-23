// Local fallback for the /contact page — used until the "Contact Page"
// singleton in Sanity is filled in, and as the seed data pushed there by
// the one-time migration (src/app/api/migrate/route.ts).
import type { ResolvedContactPage } from "./types";

export const contactPage: ResolvedContactPage = {
  heroEyebrow: "Contact",
  heroHeadline: "Let's Plan Your Trip",
  heroImage: {
    tone: "redsea",
    image: "/photos/pexels-15276400.jpg",
  },
  whatsappCardDescription: "Fastest way to reach us",
  emailCardDescription: "For detailed enquiries",
  urgentCardDescription: "Same-day or in-country support",
  policiesEyebrow: "Good to Know",
  policiesTitle: "Booking Policies",
};
