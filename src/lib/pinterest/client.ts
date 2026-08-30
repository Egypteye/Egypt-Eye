import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// Thin fetch()-based wrapper around the Pinterest API v5 — same style as
// src/lib/email/resend.ts (no SDK, just typed helpers around plain HTTP
// calls). Handles the OAuth token exchange/refresh and the one Pinterest
// endpoint this integration actually needs (creating a Pin).

// Trial-access Pinterest apps can only create Pins against the sandbox API,
// not production — set PINTEREST_API_BASE_URL to
// "https://api-sandbox.pinterest.com/v5" temporarily to record the Standard
// Access application's required demo video, then remove the env var (or set
// it back to the default) once Standard Access is approved.
const API_BASE = process.env.PINTEREST_API_BASE_URL || "https://api.pinterest.com/v5";
const OAUTH_TOKEN_URL = `${API_BASE}/oauth/token`;

// Refresh a bit before actual expiry so a slow request never straddles the
// boundary and gets a 401 mid-call.
const REFRESH_BUFFER_MS = 24 * 60 * 60 * 1000;

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
};

function basicAuthHeader(): string {
  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("PINTEREST_APP_ID / PINTEREST_APP_SECRET are not configured on this deployment.");
  }
  return `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`;
}

async function requestToken(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinterest token request failed (${res.status}): ${text}`);
  }
  return res.json();
}

export function exchangeCodeForToken(code: string, redirectUri: string) {
  return requestToken({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
}

function refreshAccessToken(refreshToken: string) {
  return requestToken({ grant_type: "refresh_token", refresh_token: refreshToken });
}

// Reads the stored connection, refreshing (and re-persisting) the access
// token first if it's near expiry. Returns null if Pinterest has never been
// connected — every caller treats that as "nothing to do" rather than an error,
// since the sync job runs unattended and shouldn't ever throw just because
// setup isn't finished yet.
export async function getPinterestConnection(): Promise<{
  accessToken: string;
  boardId: string | null;
  boardName: string | null;
} | null> {
  const supabase = createAdminSupabaseClient();
  const { data: connection } = await supabase
    .from("pinterest_connection")
    .select("id, access_token, refresh_token, token_expires_at, board_id, board_name")
    .order("connected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!connection) return null;

  const expiresAt = new Date(connection.token_expires_at).getTime();
  if (expiresAt - Date.now() > REFRESH_BUFFER_MS) {
    return { accessToken: connection.access_token as string, boardId: connection.board_id, boardName: connection.board_name };
  }

  const refreshed = await refreshAccessToken(connection.refresh_token as string);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await supabase
    .from("pinterest_connection")
    .update({
      access_token: refreshed.access_token,
      // Pinterest doesn't always return a new refresh_token on refresh — keep
      // the existing one unless a new one is actually issued.
      refresh_token: refreshed.refresh_token || connection.refresh_token,
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  return { accessToken: refreshed.access_token, boardId: connection.board_id, boardName: connection.board_name };
}

export async function listBoards(accessToken: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE}/boards?page_size=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinterest list boards failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return (data.items ?? []).map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }));
}

export async function createPin({
  accessToken,
  boardId,
  title,
  description,
  link,
  imageUrl,
}: {
  accessToken: string;
  boardId: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: boardId,
      title,
      description,
      link,
      media_source: { source_type: "image_url", url: imageUrl },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinterest create pin failed (${res.status}): ${text}`);
  }
  return res.json();
}
