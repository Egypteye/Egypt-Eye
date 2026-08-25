import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "../../NotConfiguredNotice";
import { updateCollaborationStatus, updateCollaborationNotes } from "../actions";
import { STATUSES, type CollaborationStatus } from "../constants";

export const metadata = { title: "Collaboration Application", robots: { index: false, follow: false } };

type SocialAccount = { platform: string; handle: string; followers: string };

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  social_accounts: SocialAccount[];
  engagement_rate: string | null;
  audience_countries: string | null;
  travel_dates: string | null;
  portfolio_url: string | null;
  collaboration_type: string;
  message: string | null;
  status: CollaborationStatus;
  admin_notes: string | null;
  created_at: string;
};

export default async function AdminCollaborationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const { id } = await params;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("collaboration_applications").select("*").eq("id", id).single();

  if (!data) notFound();
  const application = data as Application;
  const updateNotes = updateCollaborationNotes.bind(null, application.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/collaborations" className="text-xs font-semibold text-ink-soft/50 hover:text-ink">
        ← All applications
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{application.full_name}</h1>
      <p className="mt-1 text-sm text-ink-soft/60">
        Applied {new Date(application.created_at).toLocaleString()} — {application.collaboration_type}
      </p>

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <form key={s} action={updateCollaborationStatus.bind(null, application.id, s)}>
              <button
                type="submit"
                className={`rounded-full px-3.5 py-2 text-xs font-semibold capitalize transition ${
                  application.status === s ? "bg-ink text-cream" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
                }`}
              >
                {s}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Email" value={application.email} />
        <Field label="Phone" value={application.phone ?? "—"} />
        <Field label="Engagement rate" value={application.engagement_rate ?? "—"} />
        <Field label="Audience countries" value={application.audience_countries ?? "—"} />
        <Field label="Preferred travel dates" value={application.travel_dates ?? "—"} />
        <Field
          label="Portfolio"
          value={
            application.portfolio_url ? (
              <a href={application.portfolio_url} target="_blank" rel="noreferrer" className="underline">
                {application.portfolio_url}
              </a>
            ) : (
              "—"
            )
          }
        />
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Social Accounts</p>
        <ul className="mt-3 flex flex-col gap-2">
          {application.social_accounts.map((s, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-sand px-4 py-2.5 text-sm">
              <span className="font-medium text-ink">{s.platform}</span>
              <span className="text-ink-soft/70">{s.handle}</span>
              <span className="text-ink-soft/50">{s.followers || "—"} followers</span>
            </li>
          ))}
        </ul>
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
            placeholder="Notes only your team sees — negotiation details, agreed deliverables, etc."
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
