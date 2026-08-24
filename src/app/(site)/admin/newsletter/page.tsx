import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "../NotConfiguredNotice";

export const metadata = { title: "Newsletter", robots: { index: false, follow: false } };

type Subscriber = {
  id: string;
  email: string;
  first_name: string | null;
  verified: boolean;
  unsubscribed: boolean;
  source: string;
  created_at: string;
};

export default async function AdminNewsletterPage() {
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, first_name, verified, unsubscribed, source, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const subscribers = (data ?? []) as Subscriber[];
  const verified = subscribers.filter((s) => s.verified && !s.unsubscribed).length;
  const unverified = subscribers.filter((s) => !s.verified && !s.unsubscribed).length;
  const unsubscribed = subscribers.filter((s) => s.unsubscribed).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Newsletter Subscribers</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Verified" value={verified} />
        <Stat label="Unverified" value={unverified} />
        <Stat label="Unsubscribed" value={unsubscribed} />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-cream shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-soft/50">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Signed Up</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 text-ink">{s.email}</td>
                <td className="px-4 py-3 text-ink-soft/70">{s.first_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      s.unsubscribed ? "bg-terracotta/10 text-terracotta" : s.verified ? "bg-nile/10 text-nile" : "bg-gold/15 text-gold-dark"
                    }`}
                  >
                    {s.unsubscribed ? "Unsubscribed" : s.verified ? "Verified" : "Pending Verification"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft/60">{s.source}</td>
                <td className="px-4 py-3 text-ink-soft/60">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-soft/50">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-5 text-center shadow-sm">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-soft/50">{label}</p>
    </div>
  );
}
