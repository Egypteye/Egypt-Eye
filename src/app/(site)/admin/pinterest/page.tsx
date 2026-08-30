import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { getPinterestStatus } from "./data";
import { selectBoard } from "./actions";
import { PinRemainingButton } from "./PinRemainingButton";

export const metadata = { title: "Pinterest", robots: { index: false, follow: false } };

// Server Actions on this page (pinRemainingStories in particular, which
// pins up to 25 stories one at a time) run under this same duration budget —
// without it Vercel caps them at the 10s default and kills the loop midway
// with no visible error. Matches the maxDuration already set on
// /api/pinterest/sync/route.ts, which runs the identical routine on cron.
export const maxDuration = 60;

const ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: "That connection attempt looked invalid (state mismatch) — please try connecting again.",
  token_exchange_failed: "Pinterest didn't accept that authorization — please try connecting again.",
};

export default async function AdminPinterestPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;

  const { connected: justConnected, error } = await searchParams;
  const status = await getPinterestStatus();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Pinterest</h1>
        <p className="mt-1 text-sm text-ink-soft/60">
          Every published Story gets pinned automatically, once — a photo, an SEO-friendly caption, and a link
          straight back to the article. New stories are picked up on their own within about an hour of publishing;
          nothing ever gets pinned twice.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {ERROR_MESSAGES[error] ?? "Something went wrong connecting to Pinterest — please try again."}
        </p>
      )}
      {justConnected && !status.boardId && (
        <p className="rounded-2xl border border-nile/20 bg-nile/10 px-4 py-3 text-sm text-nile">
          Connected — now pick which board new Pins should go to below.
        </p>
      )}

      {!status.connected ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-cream p-8 text-center">
          <p className="text-sm text-ink-soft/70">
            Not connected yet. This is a one-time step — click below, sign in to Pinterest, and authorize Egypt Eye
            to pin on your account&rsquo;s behalf.
          </p>
          <a
            href="/api/pinterest/oauth/start"
            className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            Connect Pinterest
          </a>
        </div>
      ) : !status.boardId ? (
        <div className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
          <p className="font-display text-lg font-semibold text-ink">Choose a board</p>
          <p className="mt-1 text-sm text-ink-soft/60">Every auto-pinned Story will be added to this board.</p>
          {status.boards.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft/60">
              No boards found on this Pinterest account — create a board on Pinterest first, then refresh this page.
            </p>
          ) : (
            <form action={selectBoard} className="mt-4 flex flex-wrap items-center gap-3">
              <select name="boardId" required className={inputClass}>
                <option value="">Select a board…</option>
                {status.boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
              >
                Use This Board
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold text-ink">Connected — pinning to “{status.boardName}”</p>
              <p className="mt-1 text-sm text-ink-soft/60">
                Auto-pinning runs on its own every hour. Use the button below to work through the initial backfill of
                existing stories.
              </p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-black/5 pt-5 sm:grid-cols-3">
            <Stat label="Pinned" value={status.pinnedCount} />
            <Stat label="Not yet pinned" value={status.remainingCount} />
            <Stat label="Total published stories" value={status.pinnedCount + status.remainingCount} />
          </dl>

          {status.remainingCount > 0 && (
            <PinRemainingButton remainingCount={status.remainingCount} />
          )}
        </div>
      )}
    </div>
  );
}

const inputClass = "rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm text-ink outline-none focus:border-gold";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-soft/50">{label}</p>
    </div>
  );
}
