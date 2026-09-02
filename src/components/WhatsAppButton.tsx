"use client";

import { usePathname } from "next/navigation";
import { whatsappHref } from "@/lib/whatsapp";

// The floating chat bubble lives in the shared site layout, so it has no
// page-specific data to work with — just the URL. That's enough to tell the
// reservations team roughly where someone was on the site when they reached
// for it, even though it can't name a specific tour/experience/photoshoot
// the way each page's own "Book on WhatsApp" button can.
const EXACT_PAGE_LABELS: Record<string, string> = {
  "/": "the homepage",
  "/tours": "the tours page",
  "/experiences": "the experiences page",
  "/photoshoots": "the photoshoots page",
  "/signature-experiences": "the Signature Experiences page",
  "/customize": "the Customize Your Tour page",
  "/about": "the About page",
  "/hotel-deals": "the Hotel Deals page",
  "/stories": "the Stories page",
  "/testimonials": "the Testimonials page",
  "/explore-egypt": "the Explore Egypt page",
  "/transfers": "the Transfers page",
  "/travel-agents": "the Travel Agents page",
  "/affiliate": "the Affiliate page",
  "/collaborate": "the Collaborate page",
  "/partners": "the Partners page",
  "/my-journey": "the My Journey page",
  "/my-egypt": "the My Egypt page",
  "/pharaoh-challenge": "the Pharaoh's Challenge page",
};

// For a detail page (e.g. /tours/8-day-essential-egypt-nile-cruise) we don't
// know the item's real title here, so this names the section instead of
// guessing one from the slug.
const SECTION_LABELS: Record<string, string> = {
  tours: "a tour page",
  experiences: "an experience page",
  photoshoots: "a photoshoot page",
  "signature-experiences": "a Signature Experience page",
  stories: "a story page",
  "explore-egypt": "a destination page",
  "hotel-deals": "a hotel page",
};

function labelForPath(pathname: string): string {
  if (EXACT_PAGE_LABELS[pathname]) return EXACT_PAGE_LABELS[pathname];
  const [root] = pathname.split("/").filter(Boolean);
  return (root && SECTION_LABELS[root]) || (root && EXACT_PAGE_LABELS[`/${root}`]) || "the website";
}

export function WhatsAppButton({ whatsappLink }: { whatsappLink: string }) {
  const pathname = usePathname();
  const href = whatsappHref(whatsappLink, {
    page: labelForPath(pathname ?? "/"),
    intro: "Hi, I have a question.",
  });

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.05c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.56.8 1.96.87 2.1.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12.99 2.05 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.72-.83.91-1.11.19-.29.38-.24.63-.14.26.1 1.64.77 1.92.91.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
      </svg>
    </a>
  );
}
