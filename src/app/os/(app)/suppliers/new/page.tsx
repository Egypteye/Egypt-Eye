import { getActor, can } from "@/lib/os/actor";
import { osdb } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewSupplierForm } from "./NewSupplierForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Register a supplier" };

export default async function NewSupplierPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "suppliers.create")) return <NoAccess what="registering suppliers" permission="suppliers.create" />;

  const { data: currencies } = await osdb().from("os_currencies").select("code").eq("active", true).order("sort_order");
  const currencyCodes = (currencies ?? []).map((c) => c.code as string);
  if (!currencyCodes.length) currencyCodes.push("EGP", actor.baseCurrency, "EUR", "GBP");

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Register a supplier"
        description="Permits, hotels, camps, cruises, balloons — every partner the operation pays."
      />
      <Card className="max-w-2xl">
        <div className="mb-4">
          <Notice tone="blue" title="One record per partner, permanently">
            Spend, incidents and performance all attach to this record. A second record for the same partner splits that
            history in two, so saving a name that already exists is refused rather than merged later.
          </Notice>
        </div>
        <NewSupplierForm currencies={currencyCodes} canSetRating={can(actor, "suppliers.rates")} />
      </Card>
    </>
  );
}
