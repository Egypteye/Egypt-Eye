import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

// One-click unsubscribe, authenticated by the unguessable token in the
// link itself (standard for email unsubscribe links) rather than requiring
// login — required by CAN-SPAM/GDPR-style "clear unsubscribe mechanism".
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !supabaseAdminConfigured) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribed?status=invalid`);
  }

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("id")
    .maybeSingle();

  return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribed?status=${data ? "ok" : "invalid"}`);
}
