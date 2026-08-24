// Whether Supabase is configured yet. Every accounts/newsletter/discount/
// reservation feature checks this first and fails gracefully (never crashes
// the page) until real env vars are added — same fallback philosophy as
// src/sanity/fetchers.ts's `sanityConfigured`.
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseAdminConfigured = Boolean(supabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY);
