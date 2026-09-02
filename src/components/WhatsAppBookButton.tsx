import type { WhatsAppMessageContext } from "@/lib/whatsapp";
import { whatsappHref } from "@/lib/whatsapp";

// The one reusable "open WhatsApp with useful context already typed in"
// button — every fixed-position "Book on WhatsApp" / "Message Us on
// WhatsApp" link on the site should render through this rather than a bare
// `<a href={site.contact.whatsappLink}>`, so the reservations team always
// knows what the customer was looking at. See src/lib/whatsapp.ts for what
// gets said and why; the customer can still edit or clear it in WhatsApp
// before sending, same as any other pre-filled field.
export function WhatsAppBookButton({
  whatsappLink,
  context,
  children = "Book on WhatsApp",
  className = "",
}: {
  whatsappLink: string;
  context: WhatsAppMessageContext;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={whatsappHref(whatsappLink, context)} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}
