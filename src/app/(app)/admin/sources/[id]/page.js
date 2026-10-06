import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, ExternalLink } from "lucide-react";
import { FeeForm } from "@/components/admin/fee-form";
import { SourceForm } from "@/components/admin/source-form";
import { tableEdges } from "@/components/admin/table-edges";
import { DeleteButton } from "@/components/delete-button";
import { Fields } from "@/components/document";
import { Panel, Split, TablePanel } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { Stamp } from "@/components/stamp";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { EMIRATES, FEE_KINDS, JURISDICTIONS, RECURRENCES, SOURCE_CATEGORIES, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatAedRange, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

export const metadata = { title: "Edit source" };

export default async function EditSourcePage({ params }) {
  await requireUser({ roles: ["admin"] });
  const { id } = await params;

  await connectDB();
  const source = await Source.findById(id)
    .lean()
    .catch(() => null);
  if (!source) notFound();
  const fees = await FeeReference.find({ sourceId: id }).sort({ kind: 1 }).lean();

  const emirate = source.emirate ? labelOf(EMIRATES, source.emirate) : "Federal";

  return (
    <>
      <PageHeader back={{ href: "/admin/sources", label: "All sources" }} title={source.title} description={source.publisher}>
        <span className="flex flex-wrap gap-1.5">
          <StatusBadge status={source.active ? "active" : "hidden"} label={source.active ? "Shown" : "Hidden"} />
          {source.demo && <Stamp tone="waiting">Demo</Stamp>}
        </span>
      </PageHeader>

      <Split
        aside={
          <>
            <Panel
              title="Official page"
              footer={
                <>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
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
            >
              <Fields
                items={[
                  { label: "Last checked", value: formatDate(source.verifiedAt) },
                  { label: "Fee references", value: fees.length },
                ]}
              />
              <p className="mt-5 text-sm wrap-anywhere text-muted-foreground">{source.url}</p>
            </Panel>
            <Panel title="How this is used">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground marker:text-ink-300">
                <li>
                  While it is shown, new roadmaps and chat answers for {source.emirate ? emirate : "every emirate"} may cite it, and it is
                  listed on the public sources page.
                </li>
                <li>Roadmaps mark a cost as official only when it comes from one of its fee references.</li>
                <li>Fees marked demo appear in roadmaps as “Demo fee”, not official.</li>
                <li>Deleting the source deletes its fee references too.</li>
              </ul>
            </Panel>
          </>
        }
      >
        <Panel title="Summary">
          <p className="max-w-prose">{source.summary}</p>
          <Fields
            className="mt-5"
            items={[
              { label: "Emirate", value: emirate },
              { label: "Categories", value: source.categories.map((c) => labelOf(SOURCE_CATEGORIES, c)).join(", ") || "None" },
            ]}
          />
        </Panel>

        {fees.length === 0 ? (
          <Panel title="Fee references" description="Roadmaps mark a cost as official only when it comes from one of these.">
            <p className="text-muted-foreground">No fee references yet. Add the first one below.</p>
          </Panel>
        ) : (
          <TablePanel title="Fee references" description="Roadmaps mark a cost as official only when it comes from one of these.">
            <table className={cn("doc-table min-w-160", tableEdges)}>
              <thead>
                <tr>
                  <th scope="col">Fee</th>
                  <th scope="col">Applies to</th>
                  <th scope="col" className="text-right">
                    Amount
                  </th>
                  <th scope="col">Checked</th>
                  <th scope="col" className="text-right">
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={String(fee._id)}>
                    <td>
                      <p className="font-medium">{fee.item}</p>
                      {/* The kind is shown only when it says something the description does not. */}
                      {labelOf(FEE_KINDS, fee.kind) !== fee.item && <p className="text-muted-foreground">{labelOf(FEE_KINDS, fee.kind)}</p>}
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
                        className="inline-flex min-h-11 items-center rounded-xs font-medium text-foreground decoration-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablePanel>
        )}

        <Panel title="Add a fee reference" description="Add each fee this page lists, one at a time.">
          <FeeForm sourceId={id} defaultEmirate={source.emirate} />
        </Panel>

        {/* The source's facts are shown above, so its edit form stays folded until needed. */}
        <details className="group panel overflow-hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em] outline-none hover:bg-ink-50/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-6 [&::-webkit-details-marker]:hidden">
            Edit source details
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="border-t p-5 sm:p-6">
            <SourceForm source={toPlain(source)} />
          </div>
        </details>
      </Split>
    </>
  );
}
