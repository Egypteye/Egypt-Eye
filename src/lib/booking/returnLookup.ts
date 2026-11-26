import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { shapeReturnView, type ReturnRow, type ReturnView } from "./returnView";

/**
 * The booking behind a return URL, read once for both brands.
 *
 * Read with the service role because the customer may well be a guest with no
 * account, and the row's RLS policy only admits its owner. The exposure that
 * buys is small and deliberately bounded: a reference is eight random hex
 * characters, and the view shows what was booked and what state it is in —
 * never the guest's email, phone or anything else that would make a guessed
 * reference worth guessing.
 *
 * The shaping, including whether anything may be called confirmed or charged,
 * is returnView.ts. This file only fetches.
 */
export async function loadReturnView(rawReference: string | undefined): Promise<ReturnView | null> {
  const reference = typeof rawReference === "string" ? rawReference.trim().toUpperCase() : "";
  if (!reference || !supabaseAdminConfigured) return null;

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reservations")
    .select("reference, status, deposit_status, deposit_amount, starts_at, slot_label, journey_snapshot")
    .eq("reference", reference)
    .maybeSingle();
  if (!data) return null;

  return shapeReturnView(data as ReturnRow);
}

/** The reference as the page should echo it back, uppercased and trimmed. */
export function normaliseReference(raw: string | undefined): string {
  return typeof raw === "string" ? raw.trim().toUpperCase() : "";
}
