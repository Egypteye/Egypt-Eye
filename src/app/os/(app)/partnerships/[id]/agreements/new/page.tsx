import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getCompany } from "@/lib/os/commercial/companies";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewAgreementForm } from "./NewAgreementForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Draft an agreement" };

export default async function NewAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "agreements.create")) return <NoAccess what="drafting agreements" permission="agreements.create" />;

  const { id } = await params;
  const company = await getCompany(actor, id);
  if (!company) notFound();

  const db = osdb();
  const org = await getOrg();
  const { data: types } = await db
    .from("os_trip_types").select("id, name").eq("org_id", org.id).eq("active", true).order("sort_order");

  return (
    <>
      <PageHeader
        eyebrow={company.name}
        title="Draft an agreement"
        description="What was agreed, what it pays, and from when."
      />
      <Card className="max-w-2xl">
        <div className="mb-5">
          <Notice tone="blue" title="Drafting and signing are different acts">
            An agreement is created as a draft. Putting it into force is separately permissioned, because that is the
            moment Egypt Eye becomes liable for what is in it — and because a contract that activates itself the second
            somebody types it is not a contract anybody reviewed.
          </Notice>
        </div>
        <NewAgreementForm
          companyId={company.id}
          companyName={company.name}
          tripTypes={((types ?? []) as { id: string; name: string }[]).map((t) => ({ id: t.id, name: t.name }))}
          defaultCommission={company.terms?.commissionPct ?? null}
          defaultCurrency={company.terms?.currency ?? actor.baseCurrency}
          canActivate={can(actor, "agreements.activate")}
        />
      </Card>
    </>
  );
}
