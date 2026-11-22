import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { STATUSES, type CollaborationStatus } from "./constants";

export const metadata = { title: "Collaborations", robots: { index: false, follow: false } };

type Application = {
  id: string;
  full_name: string;
  email: string;
  collaboration_type: string;
  status: CollaborationStatus;
  created_at: string;
  preliminary_score: number | null;
  preliminary_tier: string | null;
  eligible: boolean | null;
  country: string | null;
  is_test: boolean;
};

const STATUS_STYLES: Record<CollaborationStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  negotiating: "bg-purple-100 text-purple-700",
  confirmed: "bg-teal-100 text-teal-700",
  completed: "bg-gray-200 text-gray-600",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminCollaborationsPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();

  // Test submissions are hidden by default and reachable on their own view,
  // never deleted. They must not reach the status counts either: a developer
  // exercising the form should not move the numbers the team reads.
  const showTest = (await searchParams).test === "1";
  const { data } = await supabase
    .from("collaboration_applications")
    .select(
      "id, full_name, email, collaboration_type, status, created_at, preliminary_score, preliminary_tier, eligible, country, is_test",
    )
    .eq("is_test", showTest)
    .order("created_at", { ascending: false })
    .limit(500);

  const applications = (data ?? []) as Application[];

  const { count: testCount } = await supabase
    .from("collaboration_applications")
    .select("id", { count: "exact", head: true })
    .eq("is_test", true);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Collaboration Applications</h1>
      <p className="mt-2 text-sm text-ink-soft/85">
        Creator &amp; influencer applications from{" "}
        <Link href="/collaborate" className="underline">
          /collaborate
        </Link>
        . Kept separate from any affiliate/referral program — these may involve free experiences or custom
        agreements.
      </p>

      <div className="mt-4">
        {showTest ? (
          <Link href="/admin/collaborations" className="text-sm font-semibold text-gold-dark underline">
            ← Back to real applications
          </Link>
        ) : (
          testCount !== null &&
          testCount > 0 && (
            <Link href="/admin/collaborations?test=1" className="text-sm text-ink-soft/70 underline">
              {testCount} test submission{testCount === 1 ? "" : "s"} hidden — view them
            </Link>
          )
        )}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-7">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-black/5 bg-cream p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-ink">{applications.filter((a) => a.status === s).length}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">{s}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-cream shadow-sm">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs font-semibold uppercase tracking-wide text-ink-soft/85">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b border-black/5 last:border-0 hover:bg-sand-dim">
                <td className="px-4 py-3">
                  <Link href={`/admin/collaborations/${a.id}`} className="font-semibold text-ink hover:text-gold-dark">
                    {a.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{a.email}</td>
                <td className="px-4 py-3 text-ink-soft/85">{a.collaboration_type}</td>
                {/* The preliminary score out of the full 100-point model,
                    never a figure normalised over the categories that happen
                    to be filled in. A tier is shown only once all six have
                    been assessed; until then it is deliberately absent. */}
                <td className="px-4 py-3">
                  {a.preliminary_score === null ? (
                    <span className="text-ink-soft/50">—</span>
                  ) : (
                    <span className="flex items-baseline gap-1.5">
                      <span className="font-semibold text-ink">{a.preliminary_score}</span>
                      <span className="text-xs text-ink-soft/60">/100</span>
                      {a.eligible === false && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          under 10k
                        </span>
                      )}
                      {a.preliminary_tier && (
                        <span className="text-xs text-ink-soft/85">{a.preliminary_tier}</span>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft/85">{new Date(a.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft/85">
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
