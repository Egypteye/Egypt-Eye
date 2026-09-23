import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { LogoutButton } from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { T, trAll } from "@/i18n/T";

// Auth-gated: this segment reads the signed-in user server-side, so it must
// never be statically prerendered. Declared explicitly rather than inferred
// from cookie access, so a build missing the Supabase env vars fails loudly
// instead of silently shipping a cached logged-out page.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const ui = await trAll(["Partner Portal"]);
  return {
    title: ui["Partner Portal"],
    robots: { index: false, follow: true },
  };
}

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

export default async function AgentPortalPage() {
  const ui = await trAll([
    "Contact person",
    "Country",
    "Partner since",
    "Services offered",
    "Website",
    "WhatsApp / Phone",
    "Requested",
    "Confirmed",
    "In Egypt",
    "Completed",
    "Cancelled",
    "Tours",
    "Our full catalog of guided and private tours across Egypt & Jordan.",
    "Signature Experiences",
    "Multi-day flagship journeys built around a single unforgettable theme.",
    "Photoshoots",
    "Professional photography sessions at Egypt's most iconic locations.",
    "Hotel Deals",
    "Preferred-rate hotel bookings to pair with any itinerary.",
    "Transfers",
    "Private airport and inter-city transfers for your clients.",
    "Custom Itinerary",
    "Request a fully bespoke itinerary built around your client's brief.",
    "Partner access paused",
    "Not a partner account yet",
    "Your Travel Agent Partner access is currently paused. Contact us if you believe this is a mistake.",
    "This account isn't linked to an approved Travel Agent Partner application yet. Apply below, or sign in with the email address your application used once it's approved.",
    "+ New booking request",
    "No bookings yet.",
    "for your first client.",
    "Dates to be confirmed",
    "adult",
    "adults",
    "child",
    "children",
    "Edit your personal profile & password →",
  ]);

  const STATUS_LABEL: Record<string, string> = {
    requested: ui["Requested"],
    confirmed: ui["Confirmed"],
    in_trip: ui["In Egypt"],
    completed: ui["Completed"],
    cancelled: ui["Cancelled"],
  };

  // Signature Experiences and Hotel Deals are gone from this list because
  // the sections are withdrawn (content/withdrawnSections.ts). Agents
  // sell from it, so leaving them would have partners quoting clients on
  // something we no longer offer.
  const AVAILABLE_SERVICES = [
    { href: "/tours", title: ui["Tours"], description: ui["Our full catalog of guided and private tours across Egypt & Jordan."] },
    { href: "/photoshoots", title: ui["Photoshoots"], description: ui["Professional photography sessions at Egypt's most iconic locations."] },
    { href: "/transfers", title: ui["Transfers"], description: ui["Private airport and inter-city transfers for your clients."] },
    { href: "/customize", title: ui["Custom Itinerary"], description: ui["Request a fully bespoke itinerary built around your client's brief."] },
  ];

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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark"><T>Partner Portal</T></p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
            {agent?.status === "suspended" ? ui["Partner access paused"] : ui["Not a partner account yet"]}
          </h1>
          <p className="mt-4 text-ink-soft/70">
            {agent?.status === "suspended"
              ? ui["Your Travel Agent Partner access is currently paused. Contact us if you believe this is a mistake."]
              : ui["This account isn't linked to an approved Travel Agent Partner application yet. Apply below, or sign in with the email address your application used once it's approved."]}
          </p>
          {!agent && (
            <Link
              href="/travel-agents"
              className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"><T>Apply to the Partner Program</T></Link>
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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark"><T>Partner Portal</T></p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{agent.company_name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-sm font-semibold text-ink-soft/70 hover:text-ink"><T>My Account</T></Link>
            <LogoutButton className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-terracotta hover:text-terracotta" />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="rounded-3xl border border-gold/25 bg-ink p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-light"><T>Your Partner Rate</T></p>
            <p className="mt-2 font-display text-4xl font-semibold text-cream">{agent.partner_discount_percent}% off</p>
            <p className="mt-3 max-w-xl text-sm text-cream/70"><T>Applies to tours, experiences, and photoshoots booked for your clients. Request a booking below or on WhatsApp and quote your agency name — our team applies your partner rate when we confirm.</T></p>
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink"><T>Available Services</T></h2>
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
              <h2 className="font-display text-lg font-semibold text-ink"><T>Your Bookings</T></h2>
              <Link href="/customize" className="text-sm font-semibold text-gold-dark hover:underline">
                {ui["+ New booking request"]}
              </Link>
            </div>
            {typedReservations.length === 0 ? (
              <p className="rounded-2xl border border-black/5 bg-cream p-6 text-sm text-ink-soft/60">
                {ui["No bookings yet."]}{" "}
                <Link href="/customize" className="font-semibold text-gold-dark underline"><T>Request an itinerary</T></Link>{" "}
                {ui["for your first client."]}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {typedReservations.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
                    <div>
                      <p className="font-mono text-sm font-semibold text-ink">{r.reference}</p>
                      <p className="mt-0.5 text-xs text-ink-soft/60">
                        {r.trip_start_date ? new Date(r.trip_start_date).toLocaleDateString() : ui["Dates to be confirmed"]} ·{" "}
                        {r.travelers_adults} {r.travelers_adults === 1 ? ui["adult"] : ui["adults"]}
                        {r.travelers_children > 0 ? `, ${r.travelers_children} ${r.travelers_children === 1 ? ui["child"] : ui["children"]}` : ""}
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
            <h2 className="mb-4 font-display text-lg font-semibold text-ink"><T>Account Information</T></h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label={ui["Contact person"]} value={agent.contact_name} />
              <InfoField label={ui["Country"]} value={agent.country ?? "—"} />
              <InfoField label={ui["WhatsApp / Phone"]} value={agent.phone ?? "—"} />
              <InfoField
                label={ui["Website"]}
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
              <InfoField label={ui["Services offered"]} value={agent.services.join(", ") || "—"} />
              <InfoField label={ui["Partner since"]} value={new Date(agent.approved_at).toLocaleDateString()} />
            </div>
            <Link href="/account/profile" className="mt-4 inline-block text-sm font-semibold text-gold-dark hover:underline">
              {ui["Edit your personal profile & password →"]}
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
