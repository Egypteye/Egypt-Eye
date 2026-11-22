import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../../NotConfiguredNotice";
import {
  updateCollaborationStatus,
  updateCollaborationNotes,
  saveCreatorAssessment,
  approveAsCreator,
  adjustCreatorScore,
  setAirportPickup,
} from "../actions";
import { scoreCreator, type PlatformAccount } from "@/lib/creatorClub/scoring";
import { CONTENT_QUALITY_MAX, tierIsCurrent } from "@/lib/creatorClub/registry";
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
  media_kit_url: string | null;
  media_kit_path: string | null;
  score_inputs: unknown;
  review_inputs: Record<string, unknown> | null;
  reviewed_by: string | null;
  status: CollaborationStatus;
  admin_notes: string | null;
  created_at: string;
};

export default async function AdminCollaborationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const { id } = await params;
  const actionError = (await searchParams).error;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("collaboration_applications").select("*").eq("id", id).single();

  if (!data) notFound();
  const application = data as Application;
  const updateNotes = updateCollaborationNotes.bind(null, application.id);

  // Minted fresh on every view, and short-lived. The alternative — storing a
  // long-lived URL on the row — would mean a link to an applicant's media kit
  // sitting in the database, still working for anyone who ever saw it, long
  // after the application was declined.
  // Recomputed here from the submitted figures plus whatever the reviewer
  // has supplied — never read from a stored copy, so this screen and the
  // promotion decision cannot disagree about the number.
  const accounts = (Array.isArray(application.score_inputs) ? application.score_inputs : []) as PlatformAccount[];
  const assessed = scoreCreator(accounts, (application.review_inputs ?? {}) as Parameters<typeof scoreCreator>[1]);
  const review = (application.review_inputs ?? {}) as Record<string, number | Record<string, number>>;
  const cq = (review.contentQuality ?? {}) as Record<string, number>;

  const { data: creatorRow } = await supabase
    .from("creators")
    .select("id, final_score, tier, tier_valid_until, airport_pickup_granted, commission_percent")
    .eq("application_id", application.id)
    .maybeSingle();

  const { data: adjustments } = await supabase
    .from("creator_score_adjustments")
    .select("previous_score, new_score, previous_tier, new_tier, reason, actor, created_at")
    .eq("application_id", application.id)
    .order("created_at", { ascending: false })
    .limit(20);

  let mediaKitFileUrl: string | null = null;
  if (application.media_kit_path) {
    const { data: signed } = await supabase.storage
      .from("collaboration-media-kits")
      .createSignedUrl(application.media_kit_path, 60 * 15);
    mediaKitFileUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/collaborations" className="text-xs font-semibold text-ink-soft/85 hover:text-ink">
        ← All applications
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{application.full_name}</h1>
      <p className="mt-1 text-sm text-ink-soft/85">
        Applied {new Date(application.created_at).toLocaleString()} — {application.collaboration_type}
      </p>

      {actionError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Status</p>
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

      {/* ------------------------------------------------------------------
          Assessment. Three of the six categories need a human: nobody can
          compute whether an audience travels to Egypt, or whether the work
          is any good, from submitted numbers. Until they are filled in the
          score stays incomplete and no tier can be assigned.
      ------------------------------------------------------------------- */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Assessment</p>
          <p className="text-sm">
            <span className="font-display text-2xl font-semibold text-ink">{assessed.earned}</span>
            <span className="text-ink-soft/60">/100</span>
            <span className="ml-2 text-xs text-ink-soft/85">
              {assessed.assessedCount}/6 assessed
              {assessed.complete ? "" : ` · ${assessed.pendingPoints} pts pending`}
            </span>
          </p>
        </div>

        <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
          {assessed.categories.map((c) => (
            <li key={c.key} className="flex items-center justify-between gap-2 rounded-lg bg-sand px-3 py-1.5">
              <span className="text-ink-soft/85">{c.key}</span>
              <span className={c.status === "pending" ? "text-amber-700" : "font-semibold text-ink"}>
                {c.status === "pending" ? "pending" : `${c.points}/${c.max}`}
              </span>
            </li>
          ))}
        </ul>

        <form action={saveCreatorAssessment.bind(null, application.id)} className="mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              Tourism audience %
              <input
                name="tourismAudiencePercent"
                inputMode="numeric"
                defaultValue={typeof review.tourismAudiencePercent === "number" ? review.tourismAudiencePercent : ""}
                className="rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              Posts per week
              <input
                name="postsPerWeek"
                inputMode="numeric"
                defaultValue={typeof review.postsPerWeek === "number" ? review.postsPerWeek : ""}
                className="rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm"
              />
            </label>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/85">
            Content quality — all five needed, or the category stays pending
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(Object.keys(CONTENT_QUALITY_MAX) as (keyof typeof CONTENT_QUALITY_MAX)[]).map((field) => (
              <label key={field} className="flex flex-col gap-1 text-[11px] text-ink-soft/85">
                {field} /{CONTENT_QUALITY_MAX[field]}
                <input
                  name={field}
                  inputMode="numeric"
                  defaultValue={typeof cq[field] === "number" ? cq[field] : ""}
                  className="rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm"
                />
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="mt-4 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-cream hover:bg-gold-dark"
          >
            Save assessment
          </button>
          {application.reviewed_by && (
            <span className="ml-3 text-xs text-ink-soft/70">Last reviewed by {application.reviewed_by}</span>
          )}
        </form>
      </div>

      {/* ------------------------------------------------------------------
          Promotion and the creator record.
      ------------------------------------------------------------------- */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Creator Club</p>

        {!creatorRow ? (
          <>
            <p className="mt-3 text-sm text-ink-soft/85">
              {assessed.complete
                ? `Ready to approve at ${assessed.tier}. The tier runs six months from approval.`
                : "All six categories must be assessed before a tier can be assigned. An incomplete assessment cannot earn one."}
            </p>
            {!assessed.eligible && (
              <p className="mt-2 text-xs text-amber-700">
                Under the 10,000-follower minimum — approving records them as a partner, but no complimentary
                package applies. Paid and discounted work is considered separately.
              </p>
            )}
            <form action={approveAsCreator.bind(null, application.id)} className="mt-3">
              <button
                type="submit"
                disabled={!assessed.complete}
                className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-cream hover:bg-gold-dark disabled:opacity-40"
              >
                Approve as creator
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="Tier" value={creatorRow.tier ?? "—"} />
              <Field label="Verified score" value={`${creatorRow.final_score ?? "—"}/100`} />
              <Field
                label="Valid until"
                value={
                  creatorRow.tier_valid_until
                    ? `${new Date(creatorRow.tier_valid_until).toLocaleDateString()}${
                        tierIsCurrent(creatorRow.tier_valid_until) ? "" : " — EXPIRED"
                      }`
                    : "—"
                }
              />
            </div>

            {creatorRow.commission_percent !== null && (
              <p className="mt-3 text-xs text-ink-soft/85">
                Referral commission: {creatorRow.commission_percent}% — Elite only, payable after the trip and a
                30-day cancellation window.
              </p>
            )}

            {/* Granted individually, never earned by reaching a tier. */}
            <form
              action={setAirportPickup.bind(
                null,
                creatorRow.id,
                !creatorRow.airport_pickup_granted,
                application.id,
              )}
              className="mt-4"
            >
              <button
                type="submit"
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  creatorRow.airport_pickup_granted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
                }`}
              >
                Airport pickup: {creatorRow.airport_pickup_granted ? "granted" : "not granted"} — click to
                {creatorRow.airport_pickup_granted ? " withdraw" : " grant"}
              </button>
              <span className="ml-3 text-xs text-ink-soft/70">Granted individually, not by tier.</span>
            </form>

            <form action={adjustCreatorScore.bind(null, creatorRow.id)} className="mt-5 border-t border-black/5 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Adjust score</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-[6rem_1fr_auto]">
                <input
                  name="newScore"
                  inputMode="numeric"
                  placeholder="0-100"
                  className="rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm"
                />
                <input
                  name="reason"
                  required
                  placeholder="Why — recorded against this creator permanently"
                  className="rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-cream hover:bg-gold-dark"
                >
                  Save
                </button>
              </div>
            </form>

            {adjustments && adjustments.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2 border-t border-black/5 pt-4 text-xs">
                {adjustments.map((a, i) => (
                  <li key={i} className="text-ink-soft/85">
                    <span className="font-semibold text-ink">
                      {a.previous_score ?? "—"} → {a.new_score}
                    </span>
                    {a.new_tier ? ` (${a.new_tier})` : ""} — {a.reason}
                    <span className="text-ink-soft/60">
                      {" "}
                      · {a.actor} · {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Media Kit</p>
        {mediaKitFileUrl || application.media_kit_url ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {mediaKitFileUrl && (
              <a
                href={mediaKitFileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-cream transition hover:bg-gold-dark"
              >
                Open uploaded PDF
              </a>
            )}
            {application.media_kit_url && (
              <a
                href={application.media_kit_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-sand-dim px-3.5 py-2 text-xs font-semibold text-ink-soft transition hover:bg-sand-deep"
              >
                Open their link
              </a>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-soft/85">
            {application.media_kit_path
              ? "A PDF is stored but a link could not be created — try reloading."
              : "— (submitted before the media kit field existed)"}
          </p>
        )}
        {application.media_kit_path && mediaKitFileUrl && (
          <p className="mt-2 text-xs text-ink-soft/70">The PDF link expires after 15 minutes; reload this page for a new one.</p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Social Accounts</p>
        <ul className="mt-3 flex flex-col gap-2">
          {application.social_accounts.map((s, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-sand px-4 py-2.5 text-sm">
              <span className="font-semibold text-ink">{s.platform}</span>
              <span className="text-ink-soft">{s.handle}</span>
              <span className="text-ink-soft/85">{s.followers || "—"} followers</span>
            </li>
          ))}
        </ul>
      </div>

      {application.message && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Message</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{application.message}</p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">Internal Notes</p>
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
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/85">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}
