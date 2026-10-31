import { getGoogleReviews } from "@/lib/google/reviews";

/**
 * Whether the Google review sync is working, in words the owner can act on.
 *
 * It exists because of CLAUDE.md #2: the owner works from a browser and has
 * no terminal. A failed token refresh that only ever appears in a Vercel log
 * is a failure nobody will see — the /review page degrades silently and
 * correctly, which is right for the traveller and useless for the person who
 * needs to fix it. This is the channel that reaches them.
 *
 * The three states are genuinely different jobs:
 *   not-configured  a setup step still owed. Nothing is broken.
 *   error           it was working and has stopped. Usually the refresh
 *                   token: Google expires them on password change, on
 *                   revoked access, and after six months unused.
 *   ok              the counts, so a wrong location id is visible as a
 *                   number that does not match the Business Profile.
 */
export async function GoogleIntegrationStatus() {
  const state = await getGoogleReviews();

  const tone =
    state.status === "ok"
      ? "border-black/5 bg-cream"
      : "border-gold/40 bg-gold/10";

  return (
    <section className={`mt-10 rounded-2xl border p-5 ${tone}`}>
      <h2 className="font-display text-lg font-semibold text-ink">Google reviews sync</h2>

      {state.status === "not-configured" && (
        <div className="mt-2 text-sm leading-relaxed text-ink-soft">
          <p>
            <strong>Not connected yet.</strong> The review page at{" "}
            <code className="rounded bg-black/5 px-1">/review</code> works and sends travellers to
            Google — it just cannot show the reviews back here until this is connected.
          </p>
          <p className="mt-2">
            Five values are needed in the Vercel project&rsquo;s environment variables:{" "}
            <code className="rounded bg-black/5 px-1">GOOGLE_BUSINESS_CLIENT_ID</code>,{" "}
            <code className="rounded bg-black/5 px-1">GOOGLE_BUSINESS_CLIENT_SECRET</code>,{" "}
            <code className="rounded bg-black/5 px-1">GOOGLE_BUSINESS_REFRESH_TOKEN</code>,{" "}
            <code className="rounded bg-black/5 px-1">GOOGLE_BUSINESS_ACCOUNT_ID</code> and{" "}
            <code className="rounded bg-black/5 px-1">GOOGLE_BUSINESS_LOCATION_ID</code>.
          </p>
          <p className="mt-2">
            Google has to approve access to the Business Profile API first, which is a form and a
            wait rather than a switch. See <code className="rounded bg-black/5 px-1">docs/google-reviews-setup.md</code>.
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-2 text-sm leading-relaxed text-ink-soft">
          <p>
            <strong>Connected, but the last attempt failed.</strong> The review page is still fine
            for travellers — it hides the reviews panel rather than breaking.
          </p>
          <p className="mt-2 break-words rounded-xl bg-black/5 px-3 py-2 font-mono text-xs text-ink">
            {state.message}
          </p>
          <p className="mt-2">
            If that mentions <code className="rounded bg-black/5 px-1">invalid_grant</code>, the
            refresh token has expired or been revoked and needs generating again. Google does this
            on a password change, when access is withdrawn, and after six months unused.
          </p>
        </div>
      )}

      {state.status === "ok" && (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Reviews on Google" value={state.data.totalCount.toLocaleString()} />
            <Stat
              label="Average rating"
              value={state.data.averageRating?.toFixed(1) ?? "—"}
            />
            <Stat
              label="With text to show"
              value={state.data.reviews.filter((r) => r.text.length > 0).length.toLocaleString()}
            />
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Last read from Google {new Date(state.data.fetchedAt).toLocaleString("en-GB")}. Refreshed
            nightly; ratings left with no words count in the total but have nothing to display.
          </p>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
      <p className="font-display text-xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft/85">{label}</p>
    </div>
  );
}
