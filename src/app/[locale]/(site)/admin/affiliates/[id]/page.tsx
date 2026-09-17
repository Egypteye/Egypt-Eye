import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../../NotConfiguredNotice";
import { updateAffiliateStatus, updateAffiliateNotes } from "../actions";
import { STATUSES, type AffiliateStatus } from "../constants";

export const metadata = { title: "Affiliate Application", robots: { index: false, follow: false } };

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  website_or_platform: string;
  audience_size: string | null;
  promotion_methods: string[];
  payout_method: string | null;
  message: string | null;
  status: AffiliateStatus;
  admin_notes: string | null;
  created_at: string;
};

export default async function AdminAffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const { id } = await params;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("affiliate_applications").select("*").eq("id", id).single();

  if (!data) notFound();
  const application = data as Application;
  const updateNotes = updateAffiliateNotes.bind(null, application.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/affiliates" className="text-xs font-semibold text-ink-soft/50 hover:text-ink">
        ← All applications
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{application.full_name}</h1>
      <p className="mt-1 text-sm text-ink-soft/60">
        Applied {new Date(application.created_at).toLocaleString()} — {application.website_or_platform}
      </p>

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <form key={s} action={updateAffiliateStatus.bind(null, application.id, s)}>
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
        {application.status === "approved" && (
          <p className="mt-3 text-xs text-ink-soft/50">
            Marking approved doesn&rsquo;t send anything automatically — email {application.email} their referral
            code and commission rate directly.
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Email" value={application.email} />
        <Field label="Phone" value={application.phone ?? "—"} />
        <Field label="Website / platform" value={application.website_or_platform} />
        <Field label="Audience size" value={application.audience_size ?? "—"} />
        <Field label="Preferred payout method" value={application.payout_method ?? "—"} />
        <Field label="Promotion methods" value={application.promotion_methods.join(", ") || "—"} />
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
            placeholder="Notes only your team sees — agreed commission rate, referral code issued, payout details, etc."
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
