import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getCurrentUser } from "@/lib/auth/session";

// Auth-gated: this segment reads the signed-in user server-side, so it must
// never be statically prerendered. Declared explicitly rather than inferred
// from cookie access, so a build missing the Supabase env vars fails loudly
// instead of silently shipping a cached logged-out page.
export const dynamic = "force-dynamic";

const FULL_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/concierge", label: "Concierge" },
  { href: "/admin/collaborations", label: "Collaborations" },
  { href: "/admin/travel-agents", label: "Travel Agents" },
  { href: "/admin/affiliates", label: "Affiliates" },
  { href: "/admin/hotels", label: "Hotels" },
  { href: "/admin/hotel-rate-requests", label: "Hotel Rate Requests" },
  { href: "/admin/pharaoh-challenge", label: "Pharaoh's Challenge" },
  { href: "/admin/pinterest", label: "Pinterest" },
];

// The scoped "reservations" role only ever gets these two links — every
// other /admin/* page rejects it via its own requireAdmin() check even if
// someone types the URL directly, but keeping them out of the nav avoids
// dead-end clicks.
const RESERVATIONS_STAFF_NAV = [
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/hotel-rate-requests", label: "Hotel Rate Requests" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/admin");
  if (user.role !== "admin" && user.role !== "reservations") redirect("/account");

  const nav = user.role === "admin" ? FULL_NAV : RESERVATIONS_STAFF_NAV;

  return (
    <div className="min-h-screen bg-sand-dim">
      <div className="border-b border-black/5 bg-ink">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-light">Egypt Eye Admin</p>
          <nav className="flex flex-wrap gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-cream/70 hover:text-cream">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/account" className="ml-auto text-sm font-medium text-cream/50 hover:text-cream">
            ← Back to site
          </Link>
        </Container>
      </div>
      <Container className="py-10">{children}</Container>
    </div>
  );
}
