import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "./NotConfiguredNotice";

export const metadata = { title: "Admin Overview", robots: { index: false, follow: false } };

export default async function AdminOverviewPage() {
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();

  const [{ count: customers }, { count: subscribers }, { count: pendingReservations }, { count: pendingConcierge }, { count: activeCampaigns }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("verified", true).eq("unsubscribed", false),
      supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "requested"),
      supabase.from("concierge_requests").select("id", { count: "exact", head: true }).eq("staff_status", "pending"),
      supabase.from("discount_campaigns").select("id", { count: "exact", head: true }).eq("active", true),
    ]);

  const cards = [
    { label: "Customer Accounts", value: customers ?? 0, href: null },
    { label: "Active Subscribers", value: subscribers ?? 0, href: "/admin/newsletter" },
    { label: "Reservations Awaiting Review", value: pendingReservations ?? 0, href: "/admin/reservations" },
    { label: "Concierge Requests Pending", value: pendingConcierge ?? 0, href: "/admin/concierge" },
    { label: "Active Discount Campaigns", value: activeCampaigns ?? 0, href: "/admin/discounts" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const content = (
            <div className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm transition hover:shadow-md">
              <p className="text-3xl font-bold text-ink">{c.value}</p>
              <p className="mt-1 text-sm text-ink-soft/60">{c.label}</p>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              {content}
            </Link>
          ) : (
            <div key={c.label}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
