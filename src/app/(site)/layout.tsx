import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ChatWidget } from "@/components/ChatWidget";
import { JourneySyncBridge } from "@/components/JourneySyncBridge";
import { getSiteSettings } from "@/sanity/fetchers";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [siteSettings, currentUser] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  return (
    <div className="flex min-h-full flex-col">
      <JourneySyncBridge userId={currentUser?.id ?? null} />
      <Navbar siteSettings={siteSettings} currentUser={currentUser} />
      <main className="flex-1">{children}</main>
      <Footer siteSettings={siteSettings} />
      <WhatsAppButton whatsappLink={siteSettings.contact.whatsappLink} />
      <ChatWidget whatsappLink={siteSettings.contact.whatsappLink} />
    </div>
  );
}
