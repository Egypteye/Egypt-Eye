import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewLeadForm } from "./NewLeadForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log an enquiry" };

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "leads.create")) return <NoAccess what="logging enquiries" permission="leads.create" />;

  const params = await searchParams;
  const pipelineParam = (Array.isArray(params.pipeline) ? params.pipeline[0] : params.pipeline) ?? "b2c";
  const pipeline = pipelineParam === "b2b" ? "b2b" : "b2c";

  const db = osdb();
  const org = await getOrg();
  const [{ data: types }, { data: units }, { data: currencies }] = await Promise.all([
    db.from("os_trip_types").select("id, name").eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_business_units").select("id, name").eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_currencies").select("code").eq("active", true).order("sort_order"),
  ]);

  const currencyCodes = (currencies ?? []).map((c) => c.code as string);
  if (!currencyCodes.length) currencyCodes.push(actor.baseCurrency, "EUR", "GBP", "EGP");

  return (
    <>
      <PageHeader
        eyebrow="Sell"
        title="Log an enquiry"
        description="Somebody asked. This records that it arrived, where from, and what they wanted."
      />
      <Card className="max-w-2xl">
        <div className="mb-4">
          <Notice tone="blue" title="This is not an inbox">
            Egypt Eye answers people on Instagram, WhatsApp and email, and those tools do it better than anything built
            here would. What the OS keeps is the record that an enquiry happened, how fast it was answered, and what
            became of it — which is what nobody can reconstruct from a DM thread six months later.
          </Notice>
        </div>
        <NewLeadForm
          pipeline={pipeline}
          tripTypes={((types ?? []) as { id: string; name: string }[]).map((t) => ({ id: t.id, name: t.name }))}
          units={((units ?? []) as { id: string; name: string }[]).map((u) => ({ id: u.id, name: u.name }))}
          currencies={currencyCodes}
        />
      </Card>
    </>
  );
}
