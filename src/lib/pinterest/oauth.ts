import { siteUrl } from "@/content/seo";

// Next.js route handlers only allow HTTP-method exports (GET/POST/etc.) plus
// a small set of config constants — anything else has to live outside
// route.ts, hence this tiny shared module for the two OAuth routes.
export const PINTEREST_OAUTH_STATE_COOKIE = "pinterest_oauth_state";

export function pinterestRedirectUri(): string {
  return `${siteUrl}/api/pinterest/oauth/callback`;
}
