import Link from "next/link";
import { notFound } from "next/navigation";
import { FeeForm } from "@/components/admin/fee-form";
import { DeleteButton } from "@/components/delete-button";
import { Fields } from "@/components/document";
import { Panel, Split } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { Stamp } from "@/components/stamp";
import { StatusBadge } from "@/components/status-badge";
import { toPlain } from "@/lib/api";
import { EMIRATES, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

export const metadata = { title: "Edit fee reference" };

export default async function EditFeePage({ params }) {
  await requireUser({ roles: ["admin"] });
  const { id, feeId } = await params;

  await connectDB();
  const [fee, source] = await Promise.all([
    FeeReference.findOne({ _id: feeId, sourceId: id }).lean().catch(() => null),
    Source.findById(id).select("title").lean().catch(() => null),
  ]);
  if (!fee) notFound();
  const where = fee.emirate ? labelOf(EMIRATES, fee.emirate) : "every emirate";

  return (
    <>
      <PageHeader back={{ href: `/admin/sources/${id}`, label: "Back to the source" }} title="Edit fee reference" description={fee.item}>
        <span className="flex flex-wrap gap-1.5">
          {!fee.active && <StatusBadge status="hidden" label="Not used" />}
          {fee.demo && <Stamp tone="waiting">Demo</Stamp>}
          {fee.active && !fee.demo && <Stamp tone="official">Official</Stamp>}
        </span>
      </PageHeader>

      <Split
        aside={
          <>
            <Panel
              title="This fee"
              footer={
                <DeleteButton
                  url={`/api/admin/fees/${feeId}`}
                  confirmText="Delete this fee reference?"
                  redirectTo={`/admin/sources/${id}`}
                  doneText="Fee reference deleted."
                />
              }
            >
              <Fields
                items={[
                  source && {
                    label: "Source",
                    value: (
                      <Link href={`/admin/sources/${id}`} className="text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
                        {source.title}
                      </Link>
                    ),
                  },
                  { label: "Last checked", value: formatDate(fee.verifiedAt) },
                ]}
              />
            </Panel>
            <Panel title="How this is used">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground marker:text-ink-300">
                <li>While “Use this fee in roadmaps” is ticked, new roadmaps for {where} can use it for a step’s cost.</li>
                <li>{fee.demo ? "It is marked demo, so roadmaps show it as “Demo fee”, not official." : "Roadmaps show it with an Official stamp."}</li>
              </ul>
            </Panel>
          </>
        }
      >
        <Panel title="Fee details">
          <FeeForm sourceId={id} fee={toPlain(fee)} />
        </Panel>
      </Split>
    </>
  );
}
