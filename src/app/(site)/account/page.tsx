import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { LogoutButton } from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DiscountOfferCard } from "./DiscountOfferCard";
import { JourneyList } from "./JourneyList";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: true },
};

type JourneyRow = {
  id: string;
  name: string;
  notes: string | null;
  updated_at: string;
  journey_items: { id: string; item_type: string; slug: string; title: string; subtitle: string | null }[];
};

type ReservationRow = {
  id: string;
  reference: string;
  status: string;
  trip_start_date: string | null;
  travelers_adults: number;
  travelers_children: number;
  subtotal_estimate: number | null;
  discount_amount: number;
  total_estimate: number | null;
  created_at: string;
};

type DiscountCodeRow = {
  id: string;
  code: string;
  status: "available" | "redeemed" | "expired" | "revoked";
  expires_at: string | null;
  discount_campaigns: { name: string; discount_type: string; value: number } | null;
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  in_trip: "In Egypt",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/account");

  const supabase = await createServerSupabaseClient();
  const [{ data: journeys }, { data: reservations }, { data: discountCodes }] = await Promise.all([
    supabase
      .from("journeys")
      .select("id, name, notes, updated_at, journey_items(id, item_type, slug, title, subtitle)")
      .order("updated_at", { ascending: false }),
    supabase
      .from("reservations")
      .select(
        "id, reference, status, trip_start_date, travelers_adults, travelers_children, subtotal_estimate, discount_amount, total_estimate, created_at"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("discount_codes")
      .select("id, code, status, expires_at, discount_campaigns(name, discount_type, value)")
      .order("created_at", { ascending: false }),
  ]);

  const typedJourneys = (journeys ?? []) as unknown as JourneyRow[];
  const typedReservations = (reservations ?? []) as ReservationRow[];
  const typedCodes = (discountCodes ?? []) as unknown as DiscountCodeRow[];

  return (
    <section className="bg-sand py-14 sm:py-20">
      <Container className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">My Account</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
              Welcome back{user.firstName ? `, ${user.firstName}` : ""}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/account/profile" className="text-sm font-semibold text-ink-soft/70 hover:text-ink">
              Edit Profile
            </Link>
            <LogoutButton className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-terracotta hover:text-terracotta" />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {typedCodes.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold text-ink">Your Egypt Eye Offer</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {typedCodes.map((code) => (
                  <DiscountOfferCard key={code.id} code={code} />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Saved Journeys</h2>
              <Link href="/explore-egypt" className="text-sm font-semibold text-gold-dark hover:underline">
                + Add more
              </Link>
            </div>
            {typedJourneys.length === 0 ? (
              <p className="rounded-2xl border border-black/5 bg-cream p-6 text-sm text-ink-soft/60">
                No saved journeys yet.{" "}
                <Link href="/explore-egypt" className="font-semibold text-gold-dark underline">
                  Start exploring Egypt
                </Link>{" "}
                to build one.
              </p>
            ) : (
              <JourneyList journeys={typedJourneys} />
            )}
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Your Reservations</h2>
            {typedReservations.length === 0 ? (
              <p className="rounded-2xl border border-black/5 bg-cream p-6 text-sm text-ink-soft/60">
                No reservations yet.{" "}
                <Link href="/my-journey" className="font-semibold text-gold-dark underline">
                  Request your journey
                </Link>{" "}
                when you&rsquo;re ready.
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

          {typedReservations.some((r) => r.status === "confirmed" || r.status === "in_trip" || r.status === "completed") && (
            <div className="rounded-3xl border border-gold/20 bg-ink p-6 text-center sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">Your Trip</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-cream">Access your personalized Egypt</h3>
              <Link
                href="/my-egypt"
                className="mt-5 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
              >
                Go to My Egypt
              </Link>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
