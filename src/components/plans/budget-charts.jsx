"use client";

import dynamic from "next/dynamic";
import { formatAed } from "@/lib/format";

// Recharts is a large library, so the drawings load after the page is shown
// (Recharts needs the page width to draw, so they could not be part of the
// server's page anyway). The captions and the tables screen readers use do not
// wait for it, and each drawing's space is kept free so nothing jumps.
const loadDrawings = () => import("@/components/plans/budget-chart-drawings");
/** Grey shimmering bars in the chart's place while its drawing code loads. */
function ChartPlaceholder() {
  return (
    <div aria-hidden="true" className="space-y-3 py-2">
      <div className="skeleton h-5 w-4/5" />
      <div className="skeleton h-5 w-3/5" />
      <div className="skeleton h-5 w-2/5" />
    </div>
  );
}

const CategoryChart = dynamic(() => loadDrawings().then((drawings) => drawings.CategoryChart), { ssr: false, loading: ChartPlaceholder });
const ActualChart = dynamic(() => loadDrawings().then((drawings) => drawings.ActualChart), { ssr: false, loading: ChartPlaceholder });

const chartHeight = (bars) => Math.max(140, bars * 44 + 32);

/**
 * rows: [{ label, estimated, actual }] per category, first-year amounts.
 * The first chart compares categories; the second compares estimates with what was paid.
 */
export function BudgetCharts({ rows }) {
  const byEstimate = [...rows].sort((a, b) => b.estimated - a.estimated);
  const withActual = byEstimate.filter((row) => row.actual > 0);

  return (
    <div className="grid gap-x-10 gap-y-10 border-t pt-6 lg:grid-cols-2">
      <figure className="min-w-0">
        <figcaption className="text-xl font-bold">First-year cost by category</figcaption>
        <p className="mt-1 text-muted-foreground">Estimated, with 12 months of monthly costs.</p>
        <Drawing height={chartHeight(byEstimate.length)}>
          <CategoryChart rows={byEstimate} height={chartHeight(byEstimate.length)} />
        </Drawing>
        <ChartTable rows={byEstimate} />
      </figure>

      <figure className="min-w-0 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
        <figcaption className="text-xl font-bold">Estimated and actual</figcaption>
        <p className="mt-1 text-muted-foreground">Categories where you have entered what you paid.</p>
        {withActual.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-card/60 px-5 py-8 text-center text-sm text-muted-foreground">
            Add what you actually paid to your costs below to compare it with the estimates.
          </p>
        ) : (
          <>
            <Drawing height={chartHeight(withActual.length * 1.6)}>
              <ActualChart rows={withActual} height={chartHeight(withActual.length * 1.6)} />
            </Drawing>
            <ChartTable rows={withActual} showActual />
          </>
        )}
      </figure>
    </div>
  );
}

/** Keeps the drawing's space while it loads. Hidden from screen readers, which read the table instead. */
function Drawing({ height, children }) {
  return (
    <div className="mt-4" style={{ minHeight: height }} aria-hidden="true">
      {children}
    </div>
  );
}

/**
 * The chart's numbers as a table for screen readers, which cannot read the drawing.
 * The wrapper is the hidden part: a table never shrinks below its content, so a
 * hidden table on its own would still make a phone page scroll sideways.
 */
function ChartTable({ rows, showActual = false }) {
  return (
    <div className="sr-only">
      <table>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Estimated first-year cost</th>
            {showActual && <th scope="col">Actual first-year cost</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{formatAed(row.estimated)}</td>
              {showActual && <td>{formatAed(row.actual)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
