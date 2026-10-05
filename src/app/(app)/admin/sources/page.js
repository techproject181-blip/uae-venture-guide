import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Stamp } from "@/components/stamp";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { EMIRATES, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

export const metadata = { title: "Official sources" };

export default async function AdminSourcesPage() {
  await requireUser({ roles: ["admin"] });
  await connectDB();
  const [sources, feeCounts] = await Promise.all([
    Source.find().sort({ emirate: 1, title: 1 }).lean(),
    FeeReference.aggregate([{ $group: { _id: "$sourceId", count: { $sum: 1 } } }]),
  ]);
  const feesBySource = new Map(feeCounts.map((row) => [String(row._id), row.count]));

  return (
    <>
      <PageHeader
        title="Official sources"
        description="The government and free zone pages that roadmaps and chat may cite, and the fees taken from them."
        actions={
          <Link href="/admin/sources/new" className={buttonVariants({ size: "lg" })}>
            Add source
          </Link>
        }
      />

      {sources.length === 0 ? (
        <EmptyState title="No sources yet" text="Add the first official page, then add the fees it lists." />
      ) : (
        <div className="relative overflow-x-auto panel">
          <table className="doc-table">
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col" className="hidden md:table-cell">Emirate</th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden md:table-cell">Last checked</th>
                <th scope="col" className="hidden text-right md:table-cell">Fees</th>
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
                      <Link href={`/admin/sources/${id}`} className="font-medium text-foreground decoration-primary underline-offset-4 hover:underline">
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
        </div>
      )}
    </>
  );
}
