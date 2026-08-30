import { NextRequest, NextResponse } from "next/server";
import { siteUrl } from "@/content/seo";
import { exchangeCodeForToken } from "@/lib/pinterest/client";
import { PINTEREST_OAUTH_STATE_COOKIE, pinterestRedirectUri } from "@/lib/pinterest/oauth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(PINTEREST_OAUTH_STATE_COOKIE)?.value;

  const failUrl = new URL("/admin/pinterest", siteUrl);

  if (!code || !state || !cookieState || state !== cookieState) {
    failUrl.searchParams.set("error", "state_mismatch");
    return NextResponse.redirect(failUrl);
  }

  try {
    const token = await exchangeCodeForToken(code, pinterestRedirectUri());
    if (!token.refresh_token) {
      throw new Error("Pinterest didn't return a refresh_token on the initial authorization — cannot proceed.");
    }
    const supabase = createAdminSupabaseClient();

    const { data: existing } = await supabase.from("pinterest_connection").select("id").limit(1).maybeSingle();
    const row = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from("pinterest_connection").update(row).eq("id", existing.id);
    } else {
      await supabase.from("pinterest_connection").insert(row);
    }

    const successUrl = new URL("/admin/pinterest", siteUrl);
    successUrl.searchParams.set("connected", "1");
    const response = NextResponse.redirect(successUrl);
    response.cookies.delete(PINTEREST_OAUTH_STATE_COOKIE);
    return response;
  } catch (err) {
    console.error("Pinterest OAuth callback failed:", err);
    failUrl.searchParams.set("error", "token_exchange_failed");
    return NextResponse.redirect(failUrl);
  }
}
