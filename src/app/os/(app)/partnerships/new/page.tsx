import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewPartnerForm } from "./NewPartnerForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Register a partner" };

export default async function NewPartnerPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "companies.create")) return <NoAccess what="registering partners" permission="companies.create" />;

  const db = osdb();
  const org = await getOrg();
  const [{ data: owners }, { data: units }, { data: currencies }] = await Promise.all([
    db.from("os_employees").select("id, full_name").eq("org_id", org.id).eq("status", "active").is("archived_at", null).order("full_name"),
    db.from("os_business_units").select("id, name").eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_currencies").select("code").eq("active", true).order("sort_order"),
  ]);

  const currencyCodes = (currencies ?? []).map((c) => c.code as string);
  if (!currencyCodes.length) currencyCodes.push(actor.baseCurrency, "EUR", "GBP", "EGP");

  return (
    <>
      <PageHeader
        eyebrow="Sell · B2B"
        title="Register a partner"
        description="An agency, operator, hotel or corporate that books through somebody rather than travelling themselves."
      />
      <Card className="max-w-2xl">
        <div className="mb-4">
          <Notice tone="blue" title="A company is not a person">
            The people at this company are added afterwards, and each of them is a normal client record — the same table a
            private traveller lives in. That is deliberate: somebody who books a photoshoot personally and runs an agency&apos;s
            Egypt product is one record with two relationships, not two records that will drift apart.
          </Notice>
        </div>
        <NewPartnerForm
          owners={((owners ?? []) as { id: string; full_name: string }[]).map((o) => ({ id: o.id, name: o.full_name }))}
          units={((units ?? []) as { id: string; name: string }[]).map((u) => ({ id: u.id, name: u.name }))}
          currencies={currencyCodes}
          canSetTerms={can(actor, "companies.terms")}
        />
      </Card>
    </>
  );
}
