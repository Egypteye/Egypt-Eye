import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSiteSettings } from "@/sanity/fetchers";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <div className="flex min-h-full flex-col">
      <Navbar siteSettings={siteSettings} />
      <main className="flex-1">{children}</main>
      <Footer siteSettings={siteSettings} />
      <WhatsAppButton whatsappLink={siteSettings.contact.whatsappLink} />
    </div>
  );
}
