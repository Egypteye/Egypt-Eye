import { getActor, can } from "@/lib/os/actor";
import { PageHeader, NoAccess, Card, Notice } from "@/components/os/ui";
import { NewClientForm } from "./NewClientForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New client" };

export default async function NewClientPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "clients.create")) return <NoAccess what="creating clients" permission="clients.create" />;

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="New client"
        description="One record per person or agency. If they have travelled with us before, this will find them rather than creating a duplicate."
      />
      <Card className="max-w-2xl">
        <div className="mb-4">
          <Notice tone="blue" title="Duplicates are prevented, not just discouraged">
            When you save, the system looks for an existing record with the same email or phone number first. If it finds one,
            it opens that record instead — so a guest who books again in six months keeps their whole history.
          </Notice>
        </div>
        <NewClientForm />
      </Card>
    </>
  );
}
