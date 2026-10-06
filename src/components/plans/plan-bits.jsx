import { Stamp } from "@/components/stamp";
import { formatAedRange } from "@/lib/format";
import { cn } from "@/lib/utils";

// Small pieces shared by the plan pages.

/** How far the plan is, as a thin green bar. Green means done everywhere in the app. */
export function ProgressBar({ percent, label = "Progress" }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{percent}%</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-ink-200"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill h-full rounded-full bg-done transition-[width] duration-700 ease-(--ease-out)" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/**
 * A cost with its basis: a gold OFFICIAL seal when it comes from a checked fee
 * reference, a grey DEMO FEE stamp when the fee reference is demo data, otherwise "Estimate".
 */
export function Cost({ min, max, basis, className }) {
  if (!min && !max) return <span className={cn("text-sm text-muted-foreground", className)}>No fee</span>;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm", className)}>
      <span className="font-medium tabular-nums">{formatAedRange(min, max)}</span>
      <CostBasis basis={basis} />
    </span>
  );
}

export function CostBasis({ basis }) {
  if (basis === "reference") return <Stamp tone="official">Official</Stamp>;
  if (basis === "demo") return <Stamp tone="quiet">Demo fee</Stamp>;
  return <span className="text-xs text-muted-foreground">Estimate</span>;
}

/** Which fee marks a list of steps or costs uses, for FeeLegend. */
export function feeMarks(rows) {
  const hasFee = (row) => row.costMinAed || row.costMaxAed || row.estimatedAed;
  return {
    official: rows.some((row) => row.costBasis === "reference"),
    demo: rows.some((row) => row.costBasis === "demo"),
    estimate: rows.some((row) => row.costBasis === "estimate" && hasFee(row)),
  };
}

/** The key to the marks on a page of fees. It names only the marks the page shows, in the same form. */
export function FeeLegend({ official = false, demo = false, estimate = false, done = false }) {
  if (!official && !demo && !estimate && !done) return null;
  const item = "inline-flex items-center gap-2";
  return (
    <p className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
      {official && (
        <span className={item}>
          <Stamp tone="official">Official</Stamp> checked against an official page
        </span>
      )}
      {demo && (
        <span className={item}>
          <Stamp tone="quiet">Demo fee</Stamp> sample amount, not checked
        </span>
      )}
      {estimate && (
        <span className={item}>
          <span className="text-xs">Estimate</span> our guess
        </span>
      )}
      {done && (
        <span className={item}>
          <Stamp tone="done">Done</Stamp> finished
        </span>
      )}
    </p>
  );
}

/** "Likelihood: High" style text for risks. High is in red; colour is never the only signal. */
export function LevelBadge({ label, level }) {
  return (
    <span className={cn("text-sm", level === "high" ? "font-bold text-destructive" : level === "medium" ? "font-medium" : "text-muted-foreground")}>
      {label}: {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

/**
 * Facts as rows inside a flush panel: the name on the left, the value on the
 * right, split by thin rules. rows: [{ label, value }]; empty rows are skipped.
 */
export function FactRows({ rows }) {
  return (
    <dl className="divide-y">
      {rows.filter(Boolean).map(({ label, value }) => (
        <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-3 sm:px-6">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="text-right font-medium tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
