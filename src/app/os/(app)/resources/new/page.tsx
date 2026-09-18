import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewResourceForm } from "./NewResourceForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Register a resource" };

export default async function NewResourcePage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "resources.create")) return <NoAccess what="registering resources" permission="resources.create" />;

  const db = osdb();
  const org = await getOrg();
  const [{ data: units }, { data: currencies }] = await Promise.all([
    db.from("os_business_units").select("id, name").eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_currencies").select("code").eq("active", true).order("sort_order"),
  ]);

  // The currency list is configuration; if it has not been seeded yet, offer
  // the ones the company actually trades in rather than an empty dropdown.
  const currencyCodes = (currencies ?? []).map((c) => c.code as string);
  if (!currencyCodes.length) currencyCodes.push(actor.baseCurrency, "EGP", "EUR", "GBP");

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Register a resource"
        description="A van, a dress, a camera — anything the operation books that is not a person."
      />
      <Card className="max-w-2xl">
        <div className="mb-4">
          <Notice tone="blue" title="Registering it makes it bookable, and blockable">
            From the moment it is saved it appears in assignment, in the conflict engine and on the calendar. Two trips cannot
            confirm the same resource in overlapping hours — the database refuses it, not a warning dialog.
          </Notice>
        </div>
        <NewResourceForm
          units={(units ?? []).map((u) => ({ id: u.id as string, name: u.name as string }))}
          currencies={currencyCodes}
          canSetCost={can(actor, "resources.costs")}
        />
      </Card>
    </>
  );
}
