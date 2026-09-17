import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../../NotConfiguredNotice";
import {
  approveApplication,
  rejectApplication,
  updateAgentRate,
  setAgentStatus,
  updateApplicationNotes,
} from "../actions";
import type { ApplicationStatus } from "../constants";

export const metadata = { title: "Travel Agent Application", robots: { index: false, follow: false } };

type Application = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string | null;
  country: string;
  services: string[];
  estimated_bookings: string;
  message: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
};

type Agent = {
  user_id: string | null;
  partner_discount_percent: number;
  status: "active" | "suspended";
  approved_at: string;
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminTravelAgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: applicationData }, { data: agentData }] = await Promise.all([
    supabase.from("travel_agent_applications").select("*").eq("id", id).single(),
    supabase
      .from("travel_agents")
      .select("user_id, partner_discount_percent, status, approved_at")
      .eq("application_id", id)
      .maybeSingle(),
  ]);

  if (!applicationData) notFound();
  const application = applicationData as Application;
  const agent = agentData as Agent | null;

  const approve = approveApplication.bind(null, application.id);
  const reject = rejectApplication.bind(null, application.id);
  const updateRate = updateAgentRate.bind(null, application.id);
  const updateNotes = updateApplicationNotes.bind(null, application.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/travel-agents" className="text-xs font-semibold text-ink-soft/50 hover:text-ink">
        ← All applications
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">{application.company_name}</h1>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[application.status]}`}>
          {application.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-soft/60">
        Applied {new Date(application.created_at).toLocaleString()} — {application.estimated_bookings}
      </p>

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Review</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          {application.status !== "approved" && (
            <form action={approve} className="flex items-end gap-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                Partner discount %
                <input
                  type="number"
                  name="discountPercent"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={agent?.partner_discount_percent ?? 10}
                  className="w-24 rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-cream transition hover:bg-gold-dark"
              >
                Approve &amp; Create Partner Account
              </button>
            </form>
          )}
          {application.status !== "rejected" && (
            <form action={reject}>
              <button
                type="submit"
                className="rounded-full border border-terracotta/40 px-4 py-2.5 text-xs font-semibold text-terracotta transition hover:bg-terracotta/10"
              >
                Reject
              </button>
            </form>
          )}
        </div>
      </div>

      {agent && (
        <div className="mt-6 rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Partner Account</p>
          <p className="mt-2 text-sm text-ink">
            Approved {new Date(agent.approved_at).toLocaleDateString()} ·{" "}
            {agent.user_id ? (
              <span className="font-semibold text-emerald-700">Linked to account — can sign in at /agent-portal</span>
            ) : (
              <span className="font-semibold text-amber-700">Awaiting sign-up with {application.email}</span>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <form action={updateRate} className="flex items-end gap-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                Partner discount %
                <input
                  type="number"
                  name="discountPercent"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={agent.partner_discount_percent}
                  className="w-24 rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-sand-deep px-4 py-2.5 text-xs font-semibold text-ink transition hover:bg-gold/30"
              >
                Update Rate
              </button>
            </form>

            <form action={setAgentStatus.bind(null, application.id, agent.status === "active" ? "suspended" : "active")}>
              <button
                type="submit"
                className={`rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                  agent.status === "active"
                    ? "border border-terracotta/40 text-terracotta hover:bg-terracotta/10"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {agent.status === "active" ? "Suspend Partner" : "Reactivate Partner"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Contact person" value={application.contact_name} />
        <Field label="Email" value={application.email} />
        <Field label="WhatsApp / Phone" value={application.phone} />
        <Field label="Country" value={application.country} />
        <Field
          label="Website"
          value={
            application.website ? (
              <a href={application.website} target="_blank" rel="noreferrer" className="underline">
                {application.website}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Field label="Estimated bookings / year" value={application.estimated_bookings} />
        <Field label="Services offered" value={application.services.join(", ")} />
      </div>

      {application.message && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Message</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft/80">{application.message}</p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Internal Notes</p>
        <form action={updateNotes} className="mt-3 flex flex-col gap-3">
          <textarea
            name="adminNotes"
            defaultValue={application.admin_notes ?? ""}
            rows={4}
            placeholder="Notes only your team sees."
            className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-sm text-ink outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="self-start rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-cream transition hover:bg-gold-dark"
          >
            Save Notes
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}
