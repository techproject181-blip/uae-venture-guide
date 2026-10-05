import { notFound } from "next/navigation";
import { FeeForm } from "@/components/admin/fee-form";
import { BackLink } from "@/components/back-link";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { FeeReference } from "@/models/FeeReference";

export const metadata = { title: "Edit fee reference" };

export default async function EditFeePage({ params }) {
  await requireUser({ roles: ["admin"] });
  const { id, feeId } = await params;

  await connectDB();
  const fee = await FeeReference.findOne({ _id: feeId, sourceId: id }).lean().catch(() => null);
  if (!fee) notFound();

  return (
    <div className="max-w-3xl">
      <BackLink href={`/admin/sources/${id}`}>Back to the source</BackLink>
      <PageHeader
        title="Edit fee reference"
        description={fee.item}
        actions={
          <DeleteButton
            url={`/api/admin/fees/${feeId}`}
            confirmText="Delete this fee reference?"
            redirectTo={`/admin/sources/${id}`}
            doneText="Fee reference deleted."
          />
        }
      />
      <div className="panel p-5 sm:p-6">
        <FeeForm sourceId={id} fee={toPlain(fee)} />
      </div>
    </div>
  );
}
