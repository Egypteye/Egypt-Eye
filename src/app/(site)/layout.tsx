import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { JourneySyncBridge } from "@/components/JourneySyncBridge";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { getSiteSettings } from "@/sanity/fetchers";

// Deliberately does NOT resolve the signed-in user here. getCurrentUser()
// reads cookies(), which opts this layout — and therefore every page nested
// under it — out of static generation, so the whole public site was being
// server-rendered per request. Navbar and JourneySyncBridge are both client
// components and now read the session themselves for presentation only
// (see src/lib/auth/useSessionUser.ts); pages that need real authorization
// still call getCurrentUser()/requireAdmin() server-side and stay dynamic.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
      >
        Skip to content
      </a>
      <JourneySyncBridge />
      <Navbar siteSettings={siteSettings} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer siteSettings={siteSettings} />
      <WhatsAppButton whatsappLink={siteSettings.contact.whatsappLink} />
      <NewsletterPopup />
    </div>
  );
}
