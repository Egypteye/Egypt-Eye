import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { createHotel } from "./actions";

export const metadata = { title: "Hotels", robots: { index: false, follow: false } };

type HotelRow = { id: string; name: string; location: string; enabled: boolean; display_order: number };

export default async function AdminHotelsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("hotels")
    .select("id, name, location, enabled, display_order")
    .order("display_order", { ascending: true });

  const hotels = (data ?? []) as HotelRow[];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Hotels</h1>
      <p className="mt-2 text-sm text-ink-soft/60">
        Manage the{" "}
        <Link href="/hotel-deals" className="underline">
          Hotel Deals
        </Link>{" "}
        catalog. Only enabled hotels show on the public page.
      </p>

      <div className="mt-8 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Add a Hotel</h2>
        <p className="mt-1 text-sm text-ink-soft/60">
          Starts disabled — add rooms, rates, and photos, then enable it from the editor.
        </p>
        <form action={createHotel} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            name="name"
            required
            placeholder="Hotel name"
            className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
          />
          <input
            name="location"
            required
            placeholder="Location (e.g. Giza, near the Pyramids)"
            className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
          />
          <input
            name="shortDescription"
            required
            placeholder="One-line description for the card"
            className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="sm:col-span-3 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            Create Hotel
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-cream shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-soft/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id} className="border-b border-black/5 last:border-0 hover:bg-sand-dim">
                <td className="px-4 py-3">
                  <Link href={`/admin/hotels/${h.id}`} className="font-medium text-ink hover:text-gold-dark">
                    {h.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft/70">{h.location}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      h.enabled ? "bg-nile/10 text-nile" : "bg-black/5 text-ink-soft/60"
                    }`}
                  >
                    {h.enabled ? "Live" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/hotels/${h.id}`} className="text-xs font-semibold text-gold-dark hover:underline">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft/50">
                  No hotels yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
