"use client";

import { createClient } from "@/lib/supabase/client";
import { getJourneyItems } from "@/lib/journey";

// Merges the guest, localStorage-only "My Journey" shortlist into the
// signed-in visitor's account the first time we see both a session and a
// non-empty local journey — so creating an account never means starting
// over. Safe to call repeatedly: journey_items has a unique
// (journey_id, item_type, slug) constraint, so re-adding an already-synced
// item is a no-op rather than a duplicate.
export async function syncLocalJourneyToAccount(userId: string): Promise<void> {
  const items = getJourneyItems();
  if (items.length === 0) return;

  const supabase = createClient();

  const { data: existing } = await supabase
    .from("journeys")
    .select("id")
    .eq("customer_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let journeyId: string | undefined = existing?.id;

  if (!journeyId) {
    const { data: created, error } = await supabase
      .from("journeys")
      .insert({ customer_id: userId, name: "My Egypt Journey" })
      .select("id")
      .single();
    if (error || !created) return;
    journeyId = created.id;
  }

  await supabase.from("journey_items").upsert(
    items.map((item) => ({
      journey_id: journeyId,
      item_type: item.type,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle ?? null,
    })),
    { onConflict: "journey_id,item_type,slug", ignoreDuplicates: true }
  );
}
