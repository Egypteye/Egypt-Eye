import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "../../NotConfiguredNotice";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";
import {
  updateHotel,
  toggleHotelEnabled,
  deleteHotel,
  addRoom,
  updateRoom,
  deleteRoom,
  addRate,
  updateRate,
  deleteRate,
} from "../actions";

export const metadata = { title: "Edit Hotel", robots: { index: false, follow: false } };

const inputClass = "rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-sm text-ink outline-none focus:border-gold";

type Hotel = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string;
  location: string;
  highlights: string[];
  amenities: string[];
  photos: string[];
  special_notes: string | null;
  deal_headline: string | null;
  deal_description: string | null;
  child_family_policy: string | null;
  enabled: boolean;
};

type Room = {
  id: string;
  name: string;
  room_category: "standard" | "suite";
  view: string | null;
  max_occupancy: number;
  description: string | null;
};

type Rate = {
  id: string;
  room_id: string;
  occupancy: "single" | "double";
  meal_plan: string;
  price_per_night: number | null;
  contact_for_rate: boolean;
  valid_until: string | null;
};

export default async function AdminHotelEditPage({ params }: { params: Promise<{ id: string }> }) {
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: hotel } = await supabase.from("hotels").select("*").eq("id", id).single();
  if (!hotel) notFound();
  const typedHotel = hotel as Hotel;

  const { data: roomsData } = await supabase
    .from("hotel_rooms")
    .select("*")
    .eq("hotel_id", id)
    .order("display_order", { ascending: true });
  const rooms = (roomsData ?? []) as Room[];

  const roomIds = rooms.map((r) => r.id);
  const { data: ratesData } =
    roomIds.length > 0
      ? await supabase.from("hotel_rates").select("*").in("room_id", roomIds).order("display_order", { ascending: true })
      : { data: [] };
  const rates = (ratesData ?? []) as Rate[];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/hotels" className="text-xs font-semibold text-ink-soft/50 hover:text-ink">
            ← All hotels
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{typedHotel.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <form action={toggleHotelEnabled.bind(null, typedHotel.id, !typedHotel.enabled)}>
            <button
              type="submit"
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                typedHotel.enabled ? "bg-nile/10 text-nile hover:bg-nile/20" : "bg-black/5 text-ink-soft/60 hover:bg-black/10"
              }`}
            >
              {typedHotel.enabled ? "Live — click to disable" : "Disabled — click to enable"}
            </button>
          </form>
          <form action={deleteHotel.bind(null, typedHotel.id)}>
            <ConfirmSubmitButton
              confirmMessage={`Delete "${typedHotel.name}" and all its rooms/rates? This can't be undone.`}
              className="rounded-full bg-terracotta/10 px-4 py-2 text-xs font-semibold text-terracotta transition hover:bg-terracotta/20"
            >
              Delete Hotel
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      {/* Basic info */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Details</h2>
        <form action={updateHotel.bind(null, typedHotel.id)} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Name
              <input name="name" defaultValue={typedHotel.name} required className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Location
              <input name="location" defaultValue={typedHotel.location} required className={inputClass} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Short description (shown on the hotel card)
            <input name="shortDescription" defaultValue={typedHotel.short_description} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Full description
            <textarea name="fullDescription" defaultValue={typedHotel.full_description} rows={4} className={inputClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Highlights (one per line)
              <textarea name="highlights" defaultValue={typedHotel.highlights.join("\n")} rows={4} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Amenities (one per line)
              <textarea name="amenities" defaultValue={typedHotel.amenities.join("\n")} rows={4} className={inputClass} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Photo URLs (one per line — the first is used as the cover photo)
            <textarea name="photos" defaultValue={typedHotel.photos.join("\n")} rows={3} className={inputClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Deal headline (e.g. &ldquo;15% Off + Free Breakfast&rdquo;)
              <input name="dealHeadline" defaultValue={typedHotel.deal_headline ?? ""} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Deal description
              <input name="dealDescription" defaultValue={typedHotel.deal_description ?? ""} className={inputClass} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Child &amp; family policy
            <textarea name="childFamilyPolicy" defaultValue={typedHotel.child_family_policy ?? ""} rows={2} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Special notes
            <textarea name="specialNotes" defaultValue={typedHotel.special_notes ?? ""} rows={2} className={inputClass} />
          </label>
          <button
            type="submit"
            className="self-start rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            Save Details
          </button>
        </form>
      </div>

      {/* Rooms & rates */}
      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-ink">Room Types &amp; Rates</h2>
        <div className="mt-4 flex flex-col gap-4">
          {rooms.map((room) => (
            <RoomEditor key={room.id} hotelId={typedHotel.id} room={room} rates={rates.filter((r) => r.room_id === room.id)} />
          ))}
        </div>

        <details className="mt-4 rounded-2xl border border-dashed border-black/15 bg-cream p-6">
          <summary className="cursor-pointer text-sm font-semibold text-gold-dark">+ Add a room type</summary>
          <form action={addRoom.bind(null, typedHotel.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Room name
              <input name="name" required placeholder="e.g. Deluxe Room" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Category
              <select name="roomCategory" defaultValue="standard" className={inputClass}>
                <option value="standard">Standard</option>
                <option value="suite">Suite</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              View
              <input name="view" placeholder="e.g. Nile View" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Max occupancy
              <input name="maxOccupancy" type="number" min={1} max={12} defaultValue={2} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft sm:col-span-2">
              Description
              <textarea name="description" rows={2} className={inputClass} />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 self-start rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
            >
              Add Room
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}

function RoomEditor({ hotelId, room, rates }: { hotelId: string; room: Room; rates: Rate[] }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-base font-semibold text-ink">{room.name}</h3>
        <form action={deleteRoom.bind(null, hotelId, room.id)}>
          <ConfirmSubmitButton
            confirmMessage={`Delete room "${room.name}" and all its rates?`}
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            Delete Room
          </ConfirmSubmitButton>
        </form>
      </div>

      <form action={updateRoom.bind(null, hotelId, room.id)} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
          Name
          <input name="name" defaultValue={room.name} required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
          Category
          <select name="roomCategory" defaultValue={room.room_category} className={inputClass}>
            <option value="standard">Standard</option>
            <option value="suite">Suite</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
          View
          <input name="view" defaultValue={room.view ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
          Max occupancy
          <input name="maxOccupancy" type="number" min={1} max={12} defaultValue={room.max_occupancy} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft sm:col-span-2">
          Description
          <textarea name="description" defaultValue={room.description ?? ""} rows={2} className={inputClass} />
        </label>
        <button
          type="submit"
          className="sm:col-span-2 self-start rounded-full bg-sand-dim px-5 py-2 text-xs font-semibold text-ink transition hover:bg-sand-deep"
        >
          Save Room
        </button>
      </form>

      <div className="mt-5 border-t border-black/5 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Rates</p>
        <div className="mt-3 flex flex-col gap-3">
          {rates.map((rate) => (
            <RateEditor key={rate.id} hotelId={hotelId} rate={rate} />
          ))}
        </div>

        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-gold-dark">+ Add a rate</summary>
          <form action={addRate.bind(null, hotelId, room.id)} className="mt-3 grid gap-3 sm:grid-cols-5">
            <RateFields />
            <button
              type="submit"
              className="sm:col-span-5 self-start rounded-full bg-ink px-5 py-2 text-xs font-semibold text-cream transition hover:bg-gold-dark"
            >
              Add Rate
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}

function RateEditor({ hotelId, rate }: { hotelId: string; rate: Rate }) {
  return (
    <form action={updateRate.bind(null, hotelId, rate.id)} className="grid gap-3 rounded-xl bg-sand p-4 sm:grid-cols-5">
      <RateFields defaultValues={rate} />
      <div className="flex items-center gap-3 sm:col-span-5">
        <button type="submit" className="rounded-full bg-sand-dim px-5 py-2 text-xs font-semibold text-ink transition hover:bg-sand-deep">
          Save Rate
        </button>
        <ConfirmSubmitButton
          confirmMessage="Delete this rate?"
          formAction={deleteRate.bind(null, hotelId, rate.id)}
          className="text-xs font-semibold text-terracotta hover:underline"
        >
          Delete
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

// A single rate's fields, shared between the "add rate" and "edit rate"
// forms — `defaultValues` is omitted for the add form (blank fields) and
// the deleteRate action is bound separately by RateEditor's own form so
// the "Delete" button above submits to it via formAction instead.
function RateFields({ defaultValues }: { defaultValues?: Rate }) {
  return (
    <>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
        Occupancy
        <select name="occupancy" defaultValue={defaultValues?.occupancy ?? "double"} className={inputClass}>
          <option value="single">Single</option>
          <option value="double">Double</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
        Meal plan
        <input name="mealPlan" defaultValue={defaultValues?.meal_plan ?? "Bed & Breakfast"} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
        Price / night (USD)
        <input
          name="pricePerNight"
          type="number"
          min={0}
          step="0.01"
          defaultValue={defaultValues?.price_per_night ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
        Rate expires
        <input name="validUntil" type="date" defaultValue={defaultValues?.valid_until ?? ""} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 self-end pb-2.5 text-xs font-medium text-ink-soft">
        <input
          type="checkbox"
          name="contactForRate"
          defaultChecked={defaultValues?.contact_for_rate ?? false}
          className="h-3.5 w-3.5 rounded border-black/20 accent-gold-dark"
        />
        Contact for rate
      </label>
    </>
  );
}
