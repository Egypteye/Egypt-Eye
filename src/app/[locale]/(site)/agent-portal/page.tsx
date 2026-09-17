import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { LogoutButton } from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Auth-gated: this segment reads the signed-in user server-side, so it must
// never be statically prerendered. Declared explicitly rather than inferred
// from cookie access, so a build missing the Supabase env vars fails loudly
// instead of silently shipping a cached logged-out page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner Portal",
  robots: { index: false, follow: true },
};

type Agent = {
  company_name: string;
  contact_name: string;
  country: string | null;
  website: string | null;
  phone: string | null;
  services: string[];
  partner_discount_percent: number;
  status: "active" | "suspended";
  approved_at: string;
};

type ReservationRow = {
  id: string;
  reference: string;
  status: string;
  trip_start_date: string | null;
  travelers_adults: number;
  travelers_children: number;
  total_estimate: number | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  in_trip: "In Egypt",
  completed: "Completed",
  cancelled: "Cancelled",
};

const AVAILABLE_SERVICES = [
  { href: "/tours", title: "Tours", description: "Our full catalog of guided and private tours across Egypt & Jordan." },
  { href: "/signature-experiences", title: "Signature Experiences", description: "Multi-day flagship journeys built around a single unforgettable theme." },
  { href: "/photoshoots", title: "Photoshoots", description: "Professional photography sessions at Egypt's most iconic locations." },
  { href: "/hotel-deals", title: "Hotel Deals", description: "Preferred-rate hotel bookings to pair with any itinerary." },
  { href: "/transfers", title: "Transfers", description: "Private airport and inter-city transfers for your clients." },
  { href: "/customize", title: "Custom Itinerary", description: "Request a fully bespoke itinerary built around your client's brief." },
];

export default async function AgentPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/agent-portal");

  const supabase = await createServerSupabaseClient();
  const { data: agentData } = await supabase
    .from("travel_agents")
    .select("company_name, contact_name, country, website, phone, services, partner_discount_percent, status, approved_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const agent = agentData as Agent | null;

  if (!agent || agent.status !== "active") {
    return (
      <section className="bg-sand py-24">
        <Container className="mx-auto max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">Partner Portal</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
            {agent?.status === "suspended" ? "Partner access paused" : "Not a partner account yet"}
          </h1>
          <p className="mt-4 text-ink-soft/70">
            {agent?.status === "suspended"
              ? "Your Travel Agent Partner access is currently paused. Contact us if you believe this is a mistake."
              : "This account isn't linked to an approved Travel Agent Partner application yet. Apply below, or sign in with the email address your application used once it's approved."}
          </p>
          {!agent && (
            <Link
              href="/travel-agents"
              className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
            >
              Apply to the Partner Program
            </Link>
          )}
        </Container>
      </section>
    );
  }

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, reference, status, trip_start_date, travelers_adults, travelers_children, total_estimate, created_at")
    .order("created_at", { ascending: false });
  const typedReservations = (reservations ?? []) as ReservationRow[];

  return (
    <section className="bg-sand py-14 sm:py-20">
      <Container className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">Partner Portal</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{agent.company_name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-sm font-semibold text-ink-soft/70 hover:text-ink">
              My Account
            </Link>
            <LogoutButton className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-terracotta hover:text-terracotta" />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="rounded-3xl border border-gold/25 bg-ink p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">Your Partner Rate</p>
            <p className="mt-2 font-display text-4xl font-semibold text-cream">{agent.partner_discount_percent}% off</p>
            <p className="mt-3 max-w-xl text-sm text-cream/70">
              Applies to tours, experiences, and photoshoots booked for your clients. Request a booking below or on
              WhatsApp and quote your agency name — our team applies your partner rate when we confirm.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Available Services</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {AVAILABLE_SERVICES.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm transition hover:border-gold/40 hover:shadow-md"
                >
                  <p className="font-display text-base font-semibold text-ink">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft/70">{s.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Your Bookings</h2>
              <Link href="/customize" className="text-sm font-semibold text-gold-dark hover:underline">
                + New booking request
              </Link>
            </div>
            {typedReservations.length === 0 ? (
              <p className="rounded-2xl border border-black/5 bg-cream p-6 text-sm text-ink-soft/60">
                No bookings yet.{" "}
                <Link href="/customize" className="font-semibold text-gold-dark underline">
                  Request an itinerary
                </Link>{" "}
                for your first client.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {typedReservations.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
                    <div>
                      <p className="font-mono text-sm font-semibold text-ink">{r.reference}</p>
                      <p className="mt-0.5 text-xs text-ink-soft/60">
                        {r.trip_start_date ? new Date(r.trip_start_date).toLocaleDateString() : "Dates to be confirmed"} ·{" "}
                        {r.travelers_adults} adult{r.travelers_adults === 1 ? "" : "s"}
                        {r.travelers_children > 0 ? `, ${r.travelers_children} child${r.travelers_children === 1 ? "" : "ren"}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {r.total_estimate !== null && (
                        <span className="text-sm font-semibold text-ink">${r.total_estimate.toLocaleString()}</span>
                      )}
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark">
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Account Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Contact person" value={agent.contact_name} />
              <InfoField label="Country" value={agent.country ?? "—"} />
              <InfoField label="WhatsApp / Phone" value={agent.phone ?? "—"} />
              <InfoField
                label="Website"
                value={
                  agent.website ? (
                    <a href={agent.website} target="_blank" rel="noreferrer" className="underline">
                      {agent.website}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoField label="Services offered" value={agent.services.join(", ") || "—"} />
              <InfoField label="Partner since" value={new Date(agent.approved_at).toLocaleDateString()} />
            </div>
            <Link href="/account/profile" className="mt-4 inline-block text-sm font-semibold text-gold-dark hover:underline">
              Edit your personal profile & password →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}
