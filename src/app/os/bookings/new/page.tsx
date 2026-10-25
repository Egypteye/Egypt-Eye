import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOsStaff } from "@/lib/auth/session";
import { canManageBookings } from "@/lib/auth/roles";
import { getLead } from "@/lib/os/data";
import { todayInCairo } from "@/lib/os/model";
import { NewBookingForm } from "./NewBookingForm";

// Creating a booking. One screen, one form, no wizard.
//
// It can be opened from a follow-up row (?lead=<id>), which pre-fills the
// guest from what the desk already wrote down and closes that lead out as
// booked on save — so the same guest is never typed in twice.

export const dynamic = "force-dynamic";
export const metadata = { title: "New booking — Egypt Eye OS", robots: { index: false, follow: false } };

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const user = await requireOsStaff();
  if (!canManageBookings(user.role)) redirect("/os/bookings");

  const { lead: leadId } = await searchParams;
  const lead = leadId ? await getLead(leadId).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold text-ink">New booking</h1>
        <Link href="/os/bookings" className="text-sm font-semibold text-gold-dark underline">
          ← All bookings
        </Link>
      </div>

      {lead ? (
        <p className="rounded-xl border border-gold/40 bg-gold-light/15 px-4 py-3 text-sm text-ink">
          Starting from the follow-up for <strong>{lead.guestName}</strong>. Saving this will mark that lead as
          booked.
        </p>
      ) : null}

      <NewBookingForm lead={lead} today={todayInCairo()} owner={user.firstName ?? user.email} />
    </div>
  );
}
