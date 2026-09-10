import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewPersonForm } from "./NewPersonForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Add a person" };

export default async function NewPersonPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "team.create")) return <NoAccess what="adding people" permission="team.create" />;

  const db = osdb();
  const org = await getOrg();
  const [{ data: units }, { data: currencies }] = await Promise.all([
    db.from("os_business_units").select("id, name").eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_currencies").select("code").eq("active", true).order("sort_order"),
  ]);

  const currencyCodes = (currencies ?? []).map((c) => c.code as string);
  if (!currencyCodes.length) currencyCodes.push(actor.baseCurrency, "EGP", "EUR", "GBP");

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Add a person"
        description="A staff member, a freelance photographer, a driver you call twice a month — all of them belong here."
      />
      <Card className="max-w-2xl">
        <div className="mb-4">
          <Notice tone="blue" title="This creates a record, not a login">
            Freelance crew are scheduled for years without ever having an account. Giving somebody a sign-in is a separate
            act under Admin, Users and access — it links an existing authentication account to this record and grants a role.
          </Notice>
        </div>
        <NewPersonForm
          units={(units ?? []).map((u) => ({ id: u.id as string, name: u.name as string }))}
          currencies={currencyCodes}
          canSetRate={can(actor, "team.rates")}
        />
      </Card>
    </>
  );
}
