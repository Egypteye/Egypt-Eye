// Local fallback for the /contact page — used until the "Contact Page"
// singleton in Sanity is filled in, and as the seed data pushed there by
// the one-time migration (src/app/api/migrate/route.ts).
import type { ResolvedContactPage } from "./types";

export const contactPage: ResolvedContactPage = {
  heroEyebrow: "Contact",
  heroHeadline: "Let's Plan Your Trip",
  heroImage: {
    tone: "redsea",
    image: "https://images.unsplash.com/photo-1776679768423-114637549209?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
  },
  whatsappCardDescription: "Fastest way to reach us",
  emailCardDescription: "For detailed enquiries",
  policiesEyebrow: "Good to Know",
  policiesTitle: "Booking Policies",
};
