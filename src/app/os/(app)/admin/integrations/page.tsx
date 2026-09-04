import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Notice } from "@/components/os/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrations" };

// ---------------------------------------------------------------------------
// INTEGRATIONS
// ---------------------------------------------------------------------------
// Egypt Eye OS is deliberately not a closed system. The tools that already do
// their jobs well keep doing them — Meta and WhatsApp for customer
// conversation, Google Drive for media, the payment providers for collection,
// the accountant's software for the books. The OS is the operational layer
// that connects and orchestrates them.
//
// This page is honest about which of those connections actually exist. A
// connection that is designed but not configured says so, with the exact
// credential it is waiting on.
// ---------------------------------------------------------------------------

type Integration = {
  name: string;
  purpose: string;
  status: "live" | "ready" | "designed";
  detail: string;
  requires?: string;
};

export default async function IntegrationsPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.integrations")) return <NoAccess what="integrations" permission="admin.integrations" />;

  const org = await getOrg();
  const { data: automations } = await osdb()
    .from("os_automations").select("name, implemented, requires_integration").eq("org_id", org.id).eq("implemented", false);

  // What is actually wired, established by looking at the environment rather
  // than by asserting it.
  const supabaseLive = Boolean(process.env.NEXT_PUBLIC_OS_SUPABASE_URL && process.env.OS_SUPABASE_SERVICE_ROLE_KEY);
  const emailLive = Boolean(process.env.RESEND_API_KEY);
  const cronLive = Boolean(process.env.CRON_SECRET);

  const integrations: Integration[] = [
    {
      name: "Supabase",
      purpose: "Identity, sessions and the entire operational database.",
      status: supabaseLive ? "live" : "designed",
      detail: supabaseLive
        ? "Connected. Auth owns credentials and sessions; every os_ table has row-level security enabled with no client policy, so only server code reaches them."
        : "Not configured. The OS cannot run without it.",
      requires: supabaseLive ? undefined : "NEXT_PUBLIC_OS_SUPABASE_URL, NEXT_PUBLIC_OS_SUPABASE_ANON_KEY and OS_SUPABASE_SERVICE_ROLE_KEY",
    },
    {
      name: "Scheduled sweep",
      purpose: "The scheduled readiness check, media chasing and approval escalation.",
      status: cronLive ? "live" : "ready",
      detail: cronLive
        ? "CRON_SECRET is set. Point a scheduler at /api/os/cron once an hour — on Vercel, a cron entry in vercel.json."
        : "Built and waiting. The endpoint refuses to run without CRON_SECRET rather than defaulting to open, because an unauthenticated endpoint that writes notifications to every manager is a denial-of-service waiting to be found.",
      requires: cronLive ? undefined : "CRON_SECRET",
    },
    {
      name: "Google Drive",
      purpose: "Where every photograph and video actually lives.",
      status: "ready",
      detail:
        "Working today as links: the OS stores the folder URL, who may see it, and whether anybody has verified it opens — the parts Drive cannot answer. Automatic folder creation on trip confirmation is designed and registered as an automation, switched off until a service account exists.",
      requires: "Google service account with access to a shared drive",
    },
    {
      name: "Email (Resend)",
      purpose: "Client delivery emails and password reset.",
      status: emailLive ? "ready" : "designed",
      detail: emailLive
        ? "Configured for the public website's forms. The OS's client-delivery email is registered as an automation and not switched on."
        : "Not configured. Password reset still works because Supabase Auth sends it.",
      requires: emailLive ? undefined : "RESEND_API_KEY and a verified sending domain",
    },
    {
      name: "WhatsApp Business",
      purpose: "Pushing the crew brief to a driver's phone the evening before.",
      status: "designed",
      detail:
        "Registered as an automation. Deliberately one-way and internal: customer conversation stays in the tools the reservation desk already uses, and this product does not try to become an inbox.",
      requires: "WhatsApp Business Platform (Meta) with approved message templates",
    },
    {
      name: "Google Calendar",
      purpose: "Mirroring confirmed trips into crew members' own calendars.",
      status: "designed",
      detail: "Registered as an automation. One-way publish only — the OS stays the source of truth for the schedule.",
      requires: "Google service account with calendar scope",
    },
    {
      name: "Accounting",
      purpose: "The books.",
      status: "designed",
      detail:
        "Intentionally out of scope. The OS records what a trip earned and cost so operations can act on it; the accountant's software stays where it is, and an export is the right seam between them.",
      requires: "A CSV export exists today under Finance",
    },
    {
      name: "AI assistant",
      purpose: "Natural-language questions, morning briefings and assignment suggestions.",
      status: "designed",
      detail:
        "The architecture is in place: os_ai_actions records the actor, the permission snapshot each request ran under, the data it was allowed to see and what it produced, so an AI answer can be audited exactly like a human action. No model is connected, and the OS does not pretend one is.",
      requires: "An AI provider key, plus a decision about which model",
    },
  ];

  const live = integrations.filter((i) => i.status === "live");

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Integrations"
        description="What Egypt Eye OS is connected to, and — honestly — what it is not."
      />

      <div className="mb-5">
        <Notice tone="blue" title="Not a closed system, by design">
          The tools that already do their jobs well keep doing them. Meta and WhatsApp stay the customer inbox, Drive stays the
          media store, the payment providers keep collecting, the accountant keeps the books. The OS is the operational layer
          that connects them — which is why nothing here claims to replace any of them.
        </Notice>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className={integration.status === "designed" ? "border-dashed" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-[14px] font-semibold text-os-text">{integration.name}</p>
                  <Badge tone={integration.status === "live" ? "green" : integration.status === "ready" ? "amber" : "neutral"}>
                    {integration.status === "live" ? "Connected" : integration.status === "ready" ? "Built, needs configuring" : "Designed"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[12.5px] text-os-muted">{integration.purpose}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-os-text">{integration.detail}</p>
                {integration.requires ? (
                  <p className="mt-1.5 text-[11.5px] font-medium text-os-amber">Needs: {integration.requires}</p>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {automations?.length ? (
        <Card className="mt-5">
          <CardHeader
            title="Automations waiting on these"
            subtitle="Each is specified and registered; none is pretending to run."
          />
          <ul className="mt-2.5 space-y-1.5">
            {automations.map((automation) => (
              <li key={automation.name as string} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="text-os-text">{automation.name as string}</span>
                <span className="shrink-0 text-[11.5px] text-os-faint">{automation.requires_integration as string}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <p className="mt-5 max-w-2xl text-[12px] leading-relaxed text-os-faint">
        {live.length} of {integrations.length} connections are live. The rest are architecture rather than promises — no switch
        on this page turns on something that would silently do nothing.
      </p>
    </>
  );
}
