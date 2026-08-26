import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ChatWidget } from "@/components/ChatWidget";
import { JourneySyncBridge } from "@/components/JourneySyncBridge";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { getSiteSettings } from "@/sanity/fetchers";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [siteSettings, currentUser] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
      >
        Skip to content
      </a>
      <JourneySyncBridge userId={currentUser?.id ?? null} />
      <Navbar siteSettings={siteSettings} currentUser={currentUser} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer siteSettings={siteSettings} />
      <WhatsAppButton whatsappLink={siteSettings.contact.whatsappLink} />
      <ChatWidget whatsappLink={siteSettings.contact.whatsappLink} />
      <NewsletterPopup />
    </div>
  );
}
