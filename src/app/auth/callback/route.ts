import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Landing point for every Supabase Auth email link — signup confirmation,
// password recovery, and (if ever enabled) magic links all redirect here
// with a `code` param. Exchanging it for a session is what actually
// verifies the email / authorizes the password reset; nothing here trusts
// the request beyond that exchange succeeding.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/account";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account/login?error=auth`);
}
