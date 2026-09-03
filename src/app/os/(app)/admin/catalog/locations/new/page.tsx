import { getActor, can } from "@/lib/os/actor";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewLocationForm } from "./NewLocationForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Add a location" };

export default async function NewLocationPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.catalog")) return <NoAccess what="the catalog" permission="admin.catalog" />;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Add a location"
        description="Not an address — the operational knowledge that usually lives in one veteran's head."
      />
      <Card className="max-w-2xl">
        <div className="mb-4">
          <Notice tone="blue" title="Write it for the person who has never been">
            Access, permits, tickets and the best hour are printed on the trip brief the crew reads that morning. Filling
            these in is what stops a site being a single point of failure.
          </Notice>
        </div>
        <NewLocationForm />
      </Card>
    </>
  );
}
