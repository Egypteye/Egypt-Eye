import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { PINTEREST_OAUTH_STATE_COOKIE, pinterestRedirectUri } from "@/lib/pinterest/oauth";

// Kicks off the Pinterest OAuth flow — admin-only, links from
// /admin/pinterest's "Connect Pinterest" button. Pinterest requires an
// account owner to explicitly authorize posting on their behalf; there's no
// way around this one manual click.
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin");

  const appId = process.env.PINTEREST_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "PINTEREST_APP_ID is not configured on this deployment." }, { status: 500 });
  }

  const state = crypto.randomBytes(24).toString("hex");

  const authorizeUrl = new URL("https://www.pinterest.com/oauth/");
  authorizeUrl.searchParams.set("client_id", appId);
  authorizeUrl.searchParams.set("redirect_uri", pinterestRedirectUri());
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "boards:read,pins:read,pins:write");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(PINTEREST_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
