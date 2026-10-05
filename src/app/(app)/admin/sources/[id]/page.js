import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, ExternalLink } from "lucide-react";
import { FeeForm } from "@/components/admin/fee-form";
import { SourceForm } from "@/components/admin/source-form";
import { BackLink } from "@/components/back-link";
import { DeleteButton } from "@/components/delete-button";
import { Fields, Section } from "@/components/document";
import { PageHeader } from "@/components/page-header";
import { Stamp } from "@/components/stamp";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { EMIRATES, FEE_KINDS, JURISDICTIONS, RECURRENCES, SOURCE_CATEGORIES, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatAedRange, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

export const metadata = { title: "Edit source" };

export default async function EditSourcePage({ params }) {
  await requireUser({ roles: ["admin"] });
  const { id } = await params;

  await connectDB();
  const source = await Source.findById(id).lean().catch(() => null);
  if (!source) notFound();
  const fees = await FeeReference.find({ sourceId: id }).sort({ kind: 1 }).lean();

  return (
    <div className="max-w-4xl">
      <BackLink href="/admin/sources">All sources</BackLink>
      <PageHeader
        title={source.title}
        description={source.publisher}
        actions={
          <>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Open page
              <ExternalLink aria-hidden="true" />
            </a>
            <DeleteButton
              url={`/api/admin/sources/${id}`}
              confirmText="Delete this source and all its fee references?"
              redirectTo="/admin/sources"
              doneText="Source deleted."
            />
          </>
        }
      />

      <Fields
        items={[
          { label: "Emirate", value: source.emirate ? labelOf(EMIRATES, source.emirate) : "Federal" },
          { label: "Categories", value: source.categories.map((c) => labelOf(SOURCE_CATEGORIES, c)).join(", ") || "None" },
          { label: "Last checked", value: formatDate(source.verifiedAt) },
          {
            label: "Status",
            value: (
              <span className="flex flex-wrap gap-1.5">
                <StatusBadge status={source.active ? "active" : "hidden"} label={source.active ? "Shown" : "Hidden"} />
                {source.demo && <Stamp tone="waiting">Demo</Stamp>}
              </span>
            ),
          },
        ]}
      />
      <dl className="mt-6 max-w-2xl">
        <dt className="field-label">Summary</dt>
        <dd className="mt-1">{source.summary}</dd>
      </dl>

      <Section
        title="Fee references"
        description="Roadmaps mark a cost as official only when it comes from one of these."
        className="mt-10"
      >
        {fees.length === 0 ? (
          <p className="text-muted-foreground">No fee references yet. Add the first one below.</p>
        ) : (
          <div className="relative overflow-x-auto panel">
            <table className="doc-table min-w-160">
              <thead>
                <tr>
                  <th scope="col">Fee</th>
                  <th scope="col">Applies to</th>
                  <th scope="col" className="text-right">Amount</th>
                  <th scope="col">Checked</th>
                  <th scope="col" className="text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={String(fee._id)}>
                    <td>
                      <p className="font-medium">{fee.item}</p>
                      {/* The kind is shown only when it says something the description does not. */}
                      {labelOf(FEE_KINDS, fee.kind) !== fee.item && (
                        <p className="text-muted-foreground">{labelOf(FEE_KINDS, fee.kind)}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {!fee.active && <StatusBadge status="hidden" label="Not used" />}
                        {fee.demo && <Stamp tone="waiting">Demo</Stamp>}
                        {fee.active && !fee.demo && <Stamp tone="official">Official</Stamp>}
                      </div>
                    </td>
                    <td>
                      {fee.emirate ? labelOf(EMIRATES, fee.emirate) : "Federal"}
                      <p className="text-muted-foreground">
                        {fee.jurisdiction === "any" ? "Mainland and free zones" : labelOf(JURISDICTIONS, fee.jurisdiction)}
                      </p>
                    </td>
                    <td className="text-right">
                      <p className="whitespace-nowrap">{formatAedRange(fee.amountMinAed, fee.amountMaxAed)}</p>
                      <p className="text-muted-foreground">{labelOf(RECURRENCES, fee.recurrence)}</p>
                    </td>
                    <td className="whitespace-nowrap">{formatDate(fee.verifiedAt)}</td>
                    <td className="text-right">
                      <Link
                        href={`/admin/sources/${id}/fees/${fee._id}`}
                        className="font-medium text-foreground decoration-primary underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Add a fee reference" className="mt-10">
        <div className="panel p-5 sm:p-6">
          <FeeForm sourceId={id} defaultEmirate={source.emirate} />
        </div>
      </Section>

      {/* The source's facts are shown above, so its edit form stays folded until needed. */}
      <details className="group mt-10 panel">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md px-5 py-3 font-medium outline-none group-open:rounded-b-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          Edit source details
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t p-5 sm:p-6">
          <SourceForm source={toPlain(source)} />
        </div>
      </details>
    </div>
  );
}
