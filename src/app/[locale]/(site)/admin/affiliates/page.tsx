import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { STATUSES, type AffiliateStatus } from "./constants";

export const metadata = { title: "Affiliates", robots: { index: false, follow: false } };

type Application = {
  id: string;
  full_name: string;
  email: string;
  website_or_platform: string;
  status: AffiliateStatus;
  created_at: string;
};

const STATUS_STYLES: Record<AffiliateStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminAffiliatesPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("affiliate_applications")
    .select("id, full_name, email, website_or_platform, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const applications = (data ?? []) as Application[];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Affiliate Applications</h1>
      <p className="mt-2 text-sm text-ink-soft/60">
        Referral-partner applications from{" "}
        <Link href="/affiliate" className="underline">
          /affiliate
        </Link>
        . Kept separate from Collaborations (sponsored trips/content deals) and Travel Agents (B2B agency bookings)
        — this is for an ongoing commission relationship. Approving an application here doesn&rsquo;t yet
        auto-generate a code; issue their referral code and rate directly by email once approved.
      </p>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-black/5 bg-cream p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-ink">{applications.filter((a) => a.status === s).length}</p>
            <p className="text-[10px] uppercase tracking-wide text-ink-soft/50">{s}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-cream shadow-sm">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-soft/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b border-black/5 last:border-0 hover:bg-sand-dim">
                <td className="px-4 py-3">
                  <Link href={`/admin/affiliates/${a.id}`} className="font-medium text-ink hover:text-gold-dark">
                    {a.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft/70">{a.email}</td>
                <td className="px-4 py-3 text-ink-soft/60">{a.website_or_platform}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft/60">{new Date(a.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-soft/50">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
