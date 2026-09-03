import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader } from "@/components/os/ui";
import { SettingRow } from "./SettingRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "System settings" };

// The numbers the engines read. Changing the readiness thresholds here changes
// what "Ready" means everywhere, immediately — these are not decorative.
export default async function SettingsPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.settings")) return <NoAccess what="system settings" permission="admin.settings" />;

  const db = osdb();
  const org = await getOrg();

  const [{ data: settings }, { data: currencies }] = await Promise.all([
    db.from("os_settings").select("key, value, description, updated_at, os_employees ( full_name )").eq("org_id", org.id).order("key"),
    db.from("os_currencies").select("code, name, symbol, active").order("sort_order"),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (settings ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const groups = [
    { prefix: "readiness.", label: "Readiness", description: "What counts as ready, at risk, and critical." },
    { prefix: "approvals.", label: "Approvals", description: "The thresholds that force a decision." },
    { prefix: "operations.", label: "Operations", description: "The shape of the working day." },
    { prefix: "finance.", label: "Finance", description: "Reporting currency." },
    { prefix: "content.", label: "Content", description: "Delivery promises." },
    { prefix: "trips.", label: "Trips", description: "References and naming." },
    { prefix: "privacy.", label: "Privacy", description: "How long personal data is kept." },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="System settings"
        description="The numbers the engines actually read. Changing a readiness threshold here changes what Ready means everywhere, immediately."
      />

      <div className="max-w-3xl space-y-5">
        {groups.map((group) => {
          const groupRows = rows.filter((r) => String(r.key).startsWith(group.prefix));
          if (!groupRows.length) return null;
          return (
            <Card key={group.prefix} padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title={group.label} subtitle={group.description} />
              </div>
              <ul>
                {groupRows.map((setting) => (
                  <li key={setting.key} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                    <SettingRow
                      settingKey={setting.key}
                      value={JSON.stringify(setting.value)}
                      description={setting.description}
                      updatedBy={setting.os_employees?.full_name ?? null}
                      updatedAt={setting.updated_at ? relativeTime(setting.updated_at) : null}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}

        <Card>
          <CardHeader title="Currencies" subtitle="What the OS can record. Exchange rates are dated and added separately." />
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {(currencies ?? []).map((currency) => (
              <li key={currency.code as string} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="text-os-text">
                  <span className="os-nums font-medium">{currency.code as string}</span>
                  <span className="ml-2 text-os-muted">{currency.name as string}</span>
                </span>
                <span className="text-os-faint">{currency.symbol as string}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] leading-relaxed text-os-faint">
            The OS refuses to record a cost in a currency it has no dated exchange rate for, rather than assuming 1.0 — a
            guessed rate silently corrupts every report that touches the trip.
          </p>
        </Card>
      </div>
    </>
  );
}
