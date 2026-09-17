import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { APPLICATION_STATUSES, type ApplicationStatus } from "./constants";

export const metadata = { title: "Travel Agents", robots: { index: false, follow: false } };

type Application = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  country: string;
  status: ApplicationStatus;
  created_at: string;
};

type Agent = {
  application_id: string | null;
  company_name: string;
  email: string;
  user_id: string | null;
  partner_discount_percent: number;
  status: "active" | "suspended";
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminTravelAgentsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();

  const [{ data: applicationsData }, { data: agentsData }] = await Promise.all([
    supabase
      .from("travel_agent_applications")
      .select("id, company_name, contact_name, email, country, status, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("travel_agents")
      .select("application_id, company_name, email, user_id, partner_discount_percent, status")
      .order("company_name", { ascending: true }),
  ]);

  const applications = (applicationsData ?? []) as Application[];
  const agents = (agentsData ?? []) as Agent[];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Travel Agent Partner Program</h1>
      <p className="mt-2 text-sm text-ink-soft/60">
        Applications from{" "}
        <Link href="/travel-agents" className="underline">
          /travel-agents
        </Link>
        . Approving one creates the agency&rsquo;s partner account — they sign in at the same login every customer
        uses, and their portal appears at <span className="font-mono text-xs">/agent-portal</span> once linked.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {APPLICATION_STATUSES.map((s) => (
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
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b border-black/5 last:border-0 hover:bg-sand-dim">
                <td className="px-4 py-3">
                  <Link href={`/admin/travel-agents/${a.id}`} className="font-medium text-ink hover:text-gold-dark">
                    {a.company_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft/70">
                  {a.contact_name} · {a.email}
                </td>
                <td className="px-4 py-3 text-ink-soft/60">{a.country}</td>
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

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">Active Partner Accounts</h2>
      <p className="mt-1 text-sm text-ink-soft/60">Approved agencies, their partner rate, and whether they&rsquo;ve signed in yet.</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/5 bg-cream shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-soft/50">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Partner Rate</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.email} className="border-b border-black/5 last:border-0 hover:bg-sand-dim">
                <td className="px-4 py-3">
                  {agent.application_id ? (
                    <Link href={`/admin/travel-agents/${agent.application_id}`} className="font-medium text-ink hover:text-gold-dark">
                      {agent.company_name}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink">{agent.company_name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft/70">{agent.partner_discount_percent}%</td>
                <td className="px-4 py-3 text-ink-soft/60">
                  {agent.user_id ? "Linked" : "Awaiting sign-up"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      agent.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft/50">
                  No approved partners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
