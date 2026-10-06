import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { tableEdges } from "@/components/admin/table-edges";
import { TablePanel } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Stamp } from "@/components/stamp";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { EMIRATES, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

export const metadata = { title: "Official sources" };

// The tabs above the table. The list is short, so it is filtered here rather than in the query.
const FILTERS = [
  { value: "all", label: "All", test: () => true, empty: "No sources yet" },
  { value: "shown", label: "Shown", test: (source) => source.active, empty: "No source is shown to users" },
  { value: "hidden", label: "Hidden", test: (source) => !source.active, empty: "No hidden sources" },
  { value: "demo", label: "Demo data", test: (source) => source.demo, empty: "No demo sources" },
];

export default async function AdminSourcesPage({ searchParams }) {
  await requireUser({ roles: ["admin"] });
  const params = await searchParams;
  const filter = FILTERS.find((f) => f.value === params.show) ?? FILTERS[0];

  await connectDB();
  const [all, feeCounts] = await Promise.all([
    Source.find().sort({ emirate: 1, title: 1 }).lean(),
    FeeReference.aggregate([{ $group: { _id: "$sourceId", count: { $sum: 1 } } }]),
  ]);
  const feesBySource = new Map(feeCounts.map((row) => [String(row._id), row.count]));
  const sources = all.filter(filter.test);

  const addButton = (
    <Link href="/admin/sources/new" className={cn(buttonVariants(), "h-9 px-3.5")}>
      <Plus aria-hidden="true" />
      Add source
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Official sources"
        description="The government and free zone pages that roadmaps and chat may cite, and the fees taken from them."
        actions={all.length === 0 && addButton}
      />

      {all.length > 0 && (
        <AdminTabs
          label="Filter sources"
          tabs={FILTERS.map((f) => ({
            href: f.value === "all" ? "/admin/sources" : `/admin/sources?show=${f.value}`,
            label: f.label,
            count: all.filter(f.test).length,
            current: f === filter,
          }))}
        >
          {addButton}
        </AdminTabs>
      )}

      {sources.length === 0 ? (
        <EmptyState title={filter.empty} text={all.length === 0 ? "Add the first official page, then add the fees it lists." : undefined} />
      ) : (
        <TablePanel
          title={filter.value === "all" ? "All sources" : filter.label}
          description={`${sources.length === 1 ? "1 source" : `${sources.length} sources`}, by emirate. Only shown sources reach roadmaps, chat and the public sources page.`}
        >
          <table className={cn("doc-table", tableEdges)}>
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col" className="hidden md:table-cell">
                  Emirate
                </th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden md:table-cell">
                  Last checked
                </th>
                <th scope="col" className="hidden text-right md:table-cell">
                  Fees
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => {
                const id = String(source._id);
                const emirate = source.emirate ? labelOf(EMIRATES, source.emirate) : "Federal";
                const fees = feesBySource.get(id) ?? 0;
                return (
                  <tr key={id}>
                    <td>
                      <Link
                        href={`/admin/sources/${id}`}
                        className="font-medium text-foreground decoration-primary underline-offset-4 hover:underline"
                      >
                        {source.title}
                      </Link>
                      <p className="text-muted-foreground">{source.publisher}</p>
                      {/* Phones hide the emirate, date and fee columns, so those facts sit under the title. */}
                      <p className="mt-1 md:hidden">
                        {emirate} · {fees === 1 ? "1 fee" : `${fees} fees`} ·{" "}
                        <span className="whitespace-nowrap">checked {formatDate(source.verifiedAt)}</span>
                      </p>
                    </td>
                    <td className="hidden md:table-cell">{emirate}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        <StatusBadge status={source.active ? "active" : "hidden"} label={source.active ? "Shown" : "Hidden"} />
                        {source.demo && <Stamp tone="waiting">Demo</Stamp>}
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap md:table-cell">{formatDate(source.verifiedAt)}</td>
                    <td className="hidden text-right md:table-cell">{fees}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TablePanel>
      )}
    </>
  );
}
