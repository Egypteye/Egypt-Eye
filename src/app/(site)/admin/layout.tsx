import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getCurrentUser } from "@/lib/auth/session";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/concierge", label: "Concierge" },
  { href: "/admin/collaborations", label: "Collaborations" },
  { href: "/admin/hotels", label: "Hotels" },
  { href: "/admin/hotel-rate-requests", label: "Hotel Rate Requests" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/admin");
  if (user.role !== "admin") redirect("/account");

  return (
    <div className="min-h-screen bg-sand-dim">
      <div className="border-b border-black/5 bg-ink">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-light">Egypt Eye Admin</p>
          <nav className="flex flex-wrap gap-4">
            {NAV.map((item) => (
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
