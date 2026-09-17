export function NotConfiguredNotice() {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-cream p-8 text-center text-sm text-ink-soft/60">
      Supabase isn&rsquo;t configured on this deployment yet — add <code>SUPABASE_SERVICE_ROLE_KEY</code> (and the
      other Supabase env vars) to see live data here. See the README.
    </div>
  );
}
