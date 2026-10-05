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
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <figure className="panel flex min-w-0 flex-col overflow-hidden">
        <ChartCaption title="First-year cost by category" text="Estimated, with 12 months of monthly costs." />
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <Drawing height={chartHeight(byEstimate.length)}>
            <CategoryChart rows={byEstimate} height={chartHeight(byEstimate.length)} />
          </Drawing>
          <ChartTable rows={byEstimate} />
        </div>
      </figure>

      <figure className="panel flex min-w-0 flex-col overflow-hidden">
        <ChartCaption title="Estimated and actual" text="Categories where you have entered what you paid." />
        <div className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
          {withActual.length === 0 ? (
            <p className="mt-5 grid flex-1 place-items-center rounded-lg border border-dashed border-ink-300 px-5 py-8 text-center text-sm text-muted-foreground sm:mt-6">
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
        </div>
      </figure>
    </div>
  );
}

/** A chart's title and note, as the header row of its panel. */
function ChartCaption({ title, text }) {
  return (
    <figcaption className="border-b px-5 py-4 sm:px-6">
      <span className="block text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">{title}</span>
      <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
    </figcaption>
  );
}

/** Keeps the drawing's space while it loads. Hidden from screen readers, which read the table instead. */
function Drawing({ height, children }) {
  return (
    <div className="mt-5 sm:mt-6" style={{ minHeight: height }} aria-hidden="true">
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
