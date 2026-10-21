import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/sanity/fetchers";
import { missingLegalIdentity } from "@/lib/privacy/policy";
import { previewDataRetention } from "@/lib/privacy/retention";
import { deleteExpiredCommissionPhotos } from "@/lib/privacy/photoRetention";
import { NotConfiguredNotice } from "./NotConfiguredNotice";

export const metadata = { title: "Admin Overview", robots: { index: false, follow: false } };

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
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

  // Who the customer is actually contracting with. Egypt Eye holds no
  // tourism licence of its own and operates under a larger licensed agency,
  // so the legal pages need THAT agency's name and licence number. They are
  // left out while blank rather than printed as placeholders, so without
  // this notice nobody would ever find out they are missing: a console
  // warning does not reach somebody working from a browser, Sanity Studio
  // and the Vercel dashboard.
  const site = await getSiteSettings();
  const missingLegal = missingLegalIdentity(site.legal);

  // What tonight's retention sweep would clear. A dry run, so opening this
  // page changes nothing. It is here because a nightly job that deletes
  // customer records and reports only into a log is a job nobody can check:
  // the privacy policy promises these deletions in writing, and this is
  // where that promise is visible to the person who made it.
  const retention = await previewDataRetention();

  // Not a sweep, a health check: if the photo store is missing, every papyrus
  // commission is losing the customer's photograph silently. Listing an empty
  // or absent bucket deletes nothing, so running it here is safe.
  const photoStore = await deleteExpiredCommissionPhotos();
  const pending = Object.entries(retention.report ?? {})
    .filter(([key, value]) => typeof value === "number" && value > 0 && key !== "dry_run")
    .map(([key, value]) => ({ key: key.replace(/_/g, " "), value: value as number }));

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

      {missingLegal.length > 0 && (
        <div className="mt-6 rounded-2xl border border-terracotta/40 bg-terracotta/5 p-5">
          <p className="font-semibold text-terracotta">
            The site does not say who the licensed operator is
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            We hold no tourism licence of our own, so the tours are operated under the licence of the
            agency we work under — which is a normal arrangement, but only while we say so. Right now
            the site does not name them, which leaves a customer, a card provider or the Ministry to
            assume the licence is ours. That assumption is the risk, not the arrangement.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Nothing has been guessed. The sentence naming them is simply left out of the Privacy
            Policy and the Terms until these are filled in, and no page claims a licence number.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink">
            {missingLegal.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-soft">
            Ask the agency for these in writing, then add them in Sanity Studio under{" "}
            <strong>Site Settings → Operator of record</strong>. They appear on the site within a
            minute; no deployment is needed. Never type a licence number you have not been given —
            a wrong one is far worse than a blank field.
          </p>
        </div>
      )}
      {photoStore.bucketMissing && (
        <div className="mt-6 rounded-2xl border border-terracotta/40 bg-terracotta/5 p-5">
          <p className="font-semibold text-terracotta">
            Papyrus photographs are not being saved
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            The private store for commission photographs does not exist, so every photograph a
            customer attaches to a papyrus request is lost on arrival. The customer believes they
            sent it. You get an email saying &ldquo;ask the customer to reply with it&rdquo;, which
            is easy to miss among the rest of the request.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Nothing is broken in the website code — the storage bucket was never created in
            Supabase. Ask for <strong>migration 0019</strong> to be applied, or create a private
            bucket named <strong>treasure-uploads</strong> in the Supabase dashboard under Storage
            (private, 8&nbsp;MB limit, JPEG/PNG/WebP only).
          </p>
        </div>
      )}

      {retention.ok && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-5">
          <p className="font-semibold text-ink">Data retention</p>
          {pending.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              Nothing is due to be removed. Every record we hold is still within the periods the
              Privacy Policy states — contact details are cleared 12 months after the last contact or
              the travel date, and an unconfirmed newsletter sign-up is deleted after 30 days.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink-soft">
                Tonight&apos;s sweep will clear the following, as the Privacy Policy says it will:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-ink">
                {pending.map((row) => (
                  <li key={row.key}>
                    <span className="font-semibold tabular-nums">{row.value}</span> &mdash; {row.key}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-3 text-xs text-ink-soft/80">
            Runs nightly at 04:00 with the payment reconciliation. The booking, the amount and the
            reference are always kept; only the person is removed.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const content = (
            <div className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm transition hover:shadow-md">
              <p className="text-3xl font-bold text-ink">{c.value}</p>
              <p className="mt-1 text-sm text-ink-soft/85">{c.label}</p>
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
